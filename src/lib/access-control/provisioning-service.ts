// src/lib/access-control/provisioning-service.ts
import "server-only";

import {
  clerkClient,
} from "@clerk/nextjs/server";

import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

import {
  canActorAssignRole,
  shouldRequireRoleAssignmentReverification,
} from "./account-hierarchy";

import {
  requireServerActionReverificationIfNeeded,
} from "@/lib/access-control";

import { createUserProvisioningSchema } from "./provisioning-validation";

import { getRequiredAccessRoleKey } from "./primary-role-policy";

import { createProvisionedSchoolProfile } from "./profile-adapters";

/* -------------------------------------------------------------------------- */
/*                            ADMIN ACTOR                                     */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                         PROVISIONING ACTOR                                 */
/* -------------------------------------------------------------------------- */

async function requireProvisioningActor() {
  const accessActor =
    await getCurrentAccessActor();

  if (
    !accessActor
  ) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  /*
   * Provisioning creates the school identity itself.
   */
  if (
    !accessActor.can(
      "users.create",
    )
  ) {
    throw new Error(
      "USER_CREATE_FORBIDDEN",
    );
  }

  /*
   * Provisioning also creates one or more
   * UserRoleAssignment records.
   *
   * Someone allowed to create an identity should not
   * automatically be allowed to grant RBAC authority.
   */
  if (
    !accessActor.can(
      "roles.assign",
    )
  ) {
    throw new Error(
      "ROLE_ASSIGN_FORBIDDEN",
    );
  }

  const actorAccount =
    accessActor.actor;

  const actorRole =
    actorAccount.legacyRole
      ?.trim()
      .toLowerCase() ??
    accessActor.activeAssignments[0]
      ?.role.key
      ?.trim()
      .toLowerCase() ??
    null;

  const actorName =
    actorAccount.displayName
      ?.trim() ||
    actorAccount.username
      ?.trim() ||
    actorAccount.email
      ?.trim() ||
    "Access Administrator";

  return {
    userId:
      actorAccount.id,

    role:
      actorRole,

    actorName,

    accessActor,
  };
}

/* -------------------------------------------------------------------------- */
/*                           CREATE USER                                      */
/* -------------------------------------------------------------------------- */

export async function provisionUser(
  input:
    unknown,
) {
  let actor:
    Awaited<
      ReturnType<
        typeof requireProvisioningActor
      >
    >;

  try {
    actor =
      await requireProvisioningActor();
  } catch (
    error
  ) {
    const code =
      error instanceof Error
        ? error.message
        : "";

    return {
      success:
        false as const,

      message:
        code ===
        "UNAUTHENTICATED"
          ? "You must be signed in to provision users."
          : code ===
              "USER_CREATE_FORBIDDEN"
            ? "You do not have permission to create user accounts."
            : code ===
                "ROLE_ASSIGN_FORBIDDEN"
              ? "You do not have permission to assign access roles."
              : "You are not authorized to provision users.",
    };
  }

  const parsed =
    createUserProvisioningSchema.safeParse(
      input,
    );

  if (!parsed.success) {
    return {
      success: false as const,

      message: parsed.error.issues[0]?.message ?? "Invalid user information.",
    };
  }

  const { identity, access, account, profile } = parsed.data;

  const requestedRoleIds = Array.from(new Set(access.roleIds));

  /* ---------------------------------------------------------------------- */
  /*                  VALIDATE ROLE SELECTION FIRST                         */
  /* ---------------------------------------------------------------------- */

  const roles =
  await prisma.accessRole.findMany({
    where: {
      id: {
        in:
          requestedRoleIds,
      },

      isActive:
        true,
    },

    select: {
      id:
        true,

      key:
        true,

      name:
        true,

      isActive:
        true,

      isProtected:
        true,
    },
  });

  if (roles.length !== requestedRoleIds.length) {
    return {
      success: false as const,

      message: "One or more selected roles are invalid or inactive.",
    };
  }

  const requiredRoleKey = getRequiredAccessRoleKey(access.primaryRole);

  const hasRequiredRole = roles.some((role) => role.key === requiredRoleKey);

  if (!hasRequiredRole) {
    return {
      success: false as const,

      message: `The ${requiredRoleKey} access role is required for this account type.`,
    };
  }

  /* ---------------------------------------------------------------------- */
/*                 ROLE ASSIGNMENT HIERARCHY                             */
/* ---------------------------------------------------------------------- */

for (
  const role of
  roles
) {
  const hierarchy =
    canActorAssignRole({
      actor:
        actor.accessActor.actor,

      role,
    });

  if (
    !hierarchy.allowed
  ) {
    return {
      success:
        false as const,

      message:
        hierarchy.reason ??
        `You are not allowed to assign the ${role.name} role.`,
    };
  }
}


/* ---------------------------------------------------------------------- */
/*                 SENSITIVE ROLE REVERIFICATION                          */
/* ---------------------------------------------------------------------- */

/*
 * Provisioning an ordinary lower-trust identity can
 * proceed normally.
 *
 * Assigning a protected or high-trust role requires
 * the current administrator to prove their Clerk
 * identity again before we create the external user.
 */
const requiresReverification =
  roles.some(
    (
      role,
    ) =>
      shouldRequireRoleAssignmentReverification(
        role,
      ),
  );

const reverification =
  await requireServerActionReverificationIfNeeded({
    required:
      requiresReverification,

    preset:
      "strict",
  });

if (
  reverification
) {
  return reverification;
}


  /* ---------------------------------------------------------------------- */
  /*                 LOCAL DUPLICATE CHECK BEFORE CLERK                     */
  /* ---------------------------------------------------------------------- */

  const localDuplicate = await prisma.userAccount.findFirst({
    where: {
      OR: [
        {
          email: {
            equals: identity.email,

            mode: "insensitive",
          },
        },

         {
           username:
                identity.username,
        },
      ],
    },

    select: {
      id: true,
    },
  });

  if (localDuplicate) {
    return {
      success: false as const,

      message: "An account with this email or username already exists.",
    };
  }

  /* ---------------------------------------------------------------------- */
  /*                         CREATE CLERK USER                               */
  /* ---------------------------------------------------------------------- */

  const client = await clerkClient();

  let clerkUserId: string | null = null;

  try {
    const clerkUser = await client.users.createUser({
      firstName: identity.firstName,

      lastName: identity.lastName,

      emailAddress: [identity.email],

      username: identity.username,

      password: account.password,

      /*
       * Existing application compatibility.
       */
      publicMetadata: {
        role: access.primaryRole,
      },
    });

    clerkUserId = clerkUser.id;

    /* -------------------------------------------------------------------- */
    /*                        LOCAL TRANSACTION                             */
    /* -------------------------------------------------------------------- */

    await prisma.$transaction(async (tx) => {
      const displayName = `${identity.firstName} ${identity.lastName}`.trim();

      /* USER ACCOUNT */

      await tx.userAccount.create({
        data: {
          id: clerkUser.id,

          username: identity.username,

          email: identity.email,

          phone: identity.phone,

          displayName,

          /*
           * If you're already storing school photos
           * somewhere else, this can be supplied by
           * the profile adapter instead.
           */
          imageUrl: identity.imageUrl,

          status: "ACTIVE",

          legacyRole: access.primaryRole,
        },
      });

      /* SCHOOL PROFILE */

      await createProvisionedSchoolProfile({
        role: access.primaryRole,

        userId: clerkUser.id,

        identity: {
          username: identity.username,

          firstName: identity.firstName,

          lastName: identity.lastName,

          email: identity.email,

          phone: identity.phone,

          imageUrl: identity.imageUrl,
        },

        profile,

        tx,
      });

      /* ROLE ASSIGNMENTS */

      await tx.userRoleAssignment.createMany({
        data: roles.map((role) => ({
          userId: clerkUser.id,

          roleId: role.id,

          assignedBy: actor.userId,

          source: "ADMIN",
        })),

        skipDuplicates: true,
      });

      /* USER CREATED AUDIT */

      await tx.accessAuditLog.create({
        data: {
          action: "USER_CREATED",

          actorId: actor.userId,

          actorRole: actor.role,

          actorName: actor.actorName,

          targetUserId: clerkUser.id,

          metadata: {
            primaryRole: access.primaryRole,

            roleIds: roles.map((role) => role.id),

            roleKeys: roles.map((role) => role.key),
          } satisfies Prisma.InputJsonValue,
        },
      });

      /* ROLE ASSIGNMENT AUDITS */

      if (roles.length > 0) {
        await tx.accessAuditLog.createMany({
          data: roles.map((role) => ({
            action: "ROLE_ASSIGNED" as const,

            actorId: actor.userId,

            actorRole: actor.role,

            actorName: actor.actorName,

            targetUserId: clerkUser.id,

            roleId: role.id,
          })),
        });
      }
    });

    return {
      success: true as const,

      userId: clerkUser.id,

      message: "User account created successfully.",
    };
  } catch (error) {
  console.error(
    "USER PROVISIONING ERROR:",
    error,
  );

  /*
   * Clerk errors usually contain the exact
   * validation reason inside `errors`.
   *
   * Log the complete array while we are testing
   * the provisioning flow so PowerShell/Next.js
   * does not collapse it to `[Array]`.
   */
  if (
    typeof error ===
      "object" &&
    error !==
      null &&
    "errors" in error
  ) {
    console.error(
      "CLERK VALIDATION ERRORS:",
      JSON.stringify(
        (
          error as {
            errors?:
              unknown;
          }
        ).errors,
        null,
        2,
      ),
    );
  }

  /*
   * If Clerk succeeded and a later local operation
   * failed, remove the external identity.
   *
   * In the current 422 case clerkUserId is still
   * null, so no deletion will be attempted.
   */
  if (
    clerkUserId
  ) {
    try {
      await client.users.deleteUser(
        clerkUserId,
      );
    } catch (
      rollbackError
    ) {
      console.error(
        "CLERK PROVISIONING ROLLBACK ERROR:",
        rollbackError,
      );
    }
  }

  return {
    success:
      false as const,

    message:
      "The user account could not be provisioned.",
  };
}
}
