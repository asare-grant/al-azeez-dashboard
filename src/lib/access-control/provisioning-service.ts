import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";

import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

import { createUserProvisioningSchema } from "./provisioning-validation";

import { getRequiredAccessRoleKey } from "./primary-role-policy";

import { createProvisionedSchoolProfile } from "./profile-adapters";

/* -------------------------------------------------------------------------- */
/*                            ADMIN ACTOR                                     */
/* -------------------------------------------------------------------------- */

async function requireProvisioningAdmin() {
  const {
    userId,
    sessionClaims,
  } =
    await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  /*
   * During the RBAC migration phase, the
   * existing Clerk role remains the enforcement
   * boundary for user provisioning.
   */
  if (
    !userId ||
    role !== "admin"
  ) {
    throw new Error(
      "Unauthorized",
    );
  }

  /*
   * Do NOT call currentUser() merely to obtain
   * an audit display name.
   *
   * currentUser() performs an additional Clerk
   * Backend API request. Provisioning should not
   * fail just because an optional actor-name
   * lookup against Clerk fails.
   *
   * Prefer our own local identity records.
   */
  const [
    userAccount,
    adminProfile,
  ] =
    await Promise.all([
      prisma.userAccount.findUnique({
        where: {
          id:
            userId,
        },

        select: {
          displayName:
            true,

          username:
            true,
        },
      }),

      prisma.admin.findUnique({
        where: {
          id:
            userId,
        },

        select: {
          username:
            true,
        },
      }),
    ]);

  const actorName =
    userAccount?.displayName
      ?.trim() ||
    userAccount?.username
      ?.trim() ||
    adminProfile?.username
      ?.trim() ||
    "Administrator";

  return {
    userId,

    role,

    actorName,
  };
}

/* -------------------------------------------------------------------------- */
/*                           CREATE USER                                      */
/* -------------------------------------------------------------------------- */

export async function provisionUser(input: unknown) {
  const actor = await requireProvisioningAdmin();

  const parsed = createUserProvisioningSchema.safeParse(input);

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

  const roles = await prisma.accessRole.findMany({
    where: {
      id: {
        in: requestedRoleIds,
      },

      isActive: true,
    },

    select: {
      id: true,

      key: true,

      name: true,
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
