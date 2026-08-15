import {
  AccessAuditAction,
  Prisma,
} from "@prisma/client";

import {
  NextResponse,
} from "next/server";

import prisma from "@/lib/prisma";

import {
  canActorAssignRole,
  canActorManageTarget,
  canActorRemoveRole,
  getCurrentAccessActor,
  getRoleTrustLevel,
  requireReverificationIfNeeded,
} from "@/lib/access-control";

import {
  resolveLegacyAccessRole,
} from "@/lib/access-control/legacy-role-map";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

type AssignRoleBody = {
  roleId?: unknown;
  reason?: unknown;
};

type RemoveRoleBody = {
  roleId?: unknown;
  reason?: unknown;
};

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function normalizeRoleId(
  value: unknown,
) {
  const roleId =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(
            value,
            10,
          )
        : Number.NaN;

  return Number.isInteger(
    roleId,
  ) &&
    roleId > 0
    ? roleId
    : null;
}

function normalizeReason(
  value: unknown,
) {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  return (
    value
      .trim()
      .slice(
        0,
        500,
      ) || null
  );
}

/* ========================================================================== */
/* ASSIGN ROLE                                                                */
/* ========================================================================== */

export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    const {
      userId:
        targetUserId,
    } =
      await params;

    const body =
      (await request.json()) as AssignRoleBody;

    const roleId =
      normalizeRoleId(
        body.roleId,
      );

    const reason =
      normalizeReason(
        body.reason,
      );

    if (!roleId) {
      return NextResponse.json(
        {
          error:
            "A valid access role is required.",
        },
        {
          status: 400,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* ACTOR                                                                  */
    /* ---------------------------------------------------------------------- */

    const accessActor =
      await getCurrentAccessActor();

    if (!accessActor) {
      return NextResponse.json(
        {
          error:
            "You must be signed in to assign roles.",
        },
        {
          status: 401,
        },
      );
    }

    if (
      !accessActor.can(
        "roles.assign",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to assign access roles.",
        },
        {
          status: 403,
        },
      );
    }

    const actorAccount =
      accessActor.actor;

    /* ---------------------------------------------------------------------- */
    /* TARGET                                                                 */
    /* ---------------------------------------------------------------------- */

    const targetUser =
      await prisma.userAccount.findUnique({
        where: {
          id:
            targetUserId,
        },

        include: {
          roles: {
            include: {
              role:
                true,
            },
          },
        },
      });

    if (!targetUser) {
      return NextResponse.json(
        {
          error:
            "The target user account could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* TARGET HIERARCHY                                                       */
    /* ---------------------------------------------------------------------- */

    const targetHierarchy =
      canActorManageTarget({
        actor:
          actorAccount,

        target:
          targetUser,

        /*
         * Role management is a sensitive management operation.
         * EDIT_USER gives us self-safe hierarchy semantics here,
         * while the role hierarchy below provides the second gate.
         */
        action:
          "MANAGE_ROLES",
      });

    if (
      !targetHierarchy.allowed
    ) {
      return NextResponse.json(
        {
          error:
            targetHierarchy.reason,

          code:
            targetHierarchy.code,
        },
        {
          status: 403,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* ROLE                                                                   */
    /* ---------------------------------------------------------------------- */

    const role =
      await prisma.accessRole.findUnique({
        where: {
          id:
            roleId,
        },

        include: {
          permissions: {
            include: {
              permission:
                true,
            },
          },
        },
      });

    if (!role) {
      return NextResponse.json(
        {
          error:
            "The selected access role could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* ROLE HIERARCHY                                                         */
    /* ---------------------------------------------------------------------- */

    const roleAuthority =
      canActorAssignRole({
        actor:
          actorAccount,

        role,
      });

    if (
      !roleAuthority.allowed
    ) {
      return NextResponse.json(
        {
          error:
            roleAuthority.reason,

          code:
            roleAuthority.code,
        },
        {
          status: 403,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* DUPLICATE                                                              */
    /* ---------------------------------------------------------------------- */

    const existing =
      targetUser.roles.find(
        (
          assignment,
        ) =>
          assignment.roleId ===
          role.id,
      );

    if (existing) {
      return NextResponse.json(
        {
          error:
            "This role is already assigned to the user.",
        },
        {
          status: 409,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* REVERIFICATION                                                         */
    /* ---------------------------------------------------------------------- */

    const roleTrust =
      getRoleTrustLevel(
        role,
      );

    /*
     * Admin-level and higher grants require fresh identity
     * verification before the authority is changed.
     */
    const reverificationResponse =
      await requireReverificationIfNeeded({
        required:
          roleTrust >= 800,

        preset:
          "strict",
      });

    if (
      reverificationResponse
    ) {
      return reverificationResponse;
    }

    /* ---------------------------------------------------------------------- */
    /* MUTATION + AUDIT                                                       */
    /* ---------------------------------------------------------------------- */

    const assignment =
      await prisma.$transaction(
        async (
          tx,
        ) => {
          const created =
            await tx.userRoleAssignment.create({
              data: {
                userId:
                  targetUser.id,

                roleId:
                  role.id,

                assignedBy:
                  actorAccount.id,

                source:
                  "ADMIN",
              },
            });

          await tx.accessAuditLog.create({
            data: {
              action:
                AccessAuditAction.ROLE_ASSIGNED,

              targetUserId:
                targetUser.id,

              actorId:
                actorAccount.id,

              actorName:
                actorAccount.displayName ??
                actorAccount.username ??
                actorAccount.email ??
                "Administrator",

              actorRole:
                actorAccount.legacyRole,

              roleId:
                role.id,

              reason,

              metadata: {
                source:
                  "USER_DETAIL_ROLE_ASSIGNMENT",

                operation:
                  "ASSIGN",

                role: {
                  id:
                    role.id,

                  key:
                    role.key,

                  name:
                    role.name,

                  type:
                    role.type,

                  trustLevel:
                    roleTrust,
                },

                permissionCount:
                  role.permissions.length,

                targetTrustBefore:
                  targetHierarchy.targetTrust,

                actorTrust:
                  targetHierarchy.actorTrust,

                reverificationRequired:
                  roleTrust >=
                  800,
              } satisfies Prisma.InputJsonValue,
            },
          });

          return created;
        },
      );

    return NextResponse.json({
      success:
        true,

      message:
        `${role.name} was assigned successfully.`,

      assignment: {
        id:
          assignment.id,

        roleId:
          role.id,

        roleKey:
          role.key,
      },
    });
  } catch (
    error
  ) {
    console.error(
      "[USER_ROLE_ASSIGN_POST]",
      error,
    );

    return NextResponse.json(
      {
        error:
          "The access role could not be assigned.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ========================================================================== */
/* REMOVE ROLE                                                                */
/* ========================================================================== */

export async function DELETE(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    const {
      userId:
        targetUserId,
    } =
      await params;

    const body =
      (await request.json()) as RemoveRoleBody;

    const roleId =
      normalizeRoleId(
        body.roleId,
      );

    const reason =
      normalizeReason(
        body.reason,
      );

    if (!roleId) {
      return NextResponse.json(
        {
          error:
            "A valid access role is required.",
        },
        {
          status: 400,
        },
      );
    }

    const accessActor =
      await getCurrentAccessActor();

    if (!accessActor) {
      return NextResponse.json(
        {
          error:
            "You must be signed in to remove roles.",
        },
        {
          status: 401,
        },
      );
    }

    if (
      !accessActor.can(
        "roles.remove",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to remove access roles.",
        },
        {
          status: 403,
        },
      );
    }

    const actorAccount =
      accessActor.actor;

    /* ---------------------------------------------------------------------- */
    /* TARGET                                                                 */
    /* ---------------------------------------------------------------------- */

    const targetUser =
      await prisma.userAccount.findUnique({
        where: {
          id:
            targetUserId,
        },

        include: {
          roles: {
            include: {
              role:
                true,
            },
          },
        },
      });

    if (!targetUser) {
      return NextResponse.json(
        {
          error:
            "The target user account could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    const hierarchy =
      canActorManageTarget({
        actor:
          actorAccount,

        target:
          targetUser,

        action:
          "MANAGE_ROLES",
      });

    if (!hierarchy.allowed) {
      return NextResponse.json(
        {
          error:
            hierarchy.reason,

          code:
            hierarchy.code,
        },
        {
          status: 403,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* ASSIGNMENT                                                             */
    /* ---------------------------------------------------------------------- */

    const assignment =
      targetUser.roles.find(
        (
          item,
        ) =>
          item.roleId ===
          roleId,
      );

    if (!assignment) {
      return NextResponse.json(
        {
          error:
            "This role is not assigned to the user.",
        },
        {
          status: 404,
        },
      );
    }

    const role =
      assignment.role;

    /* ---------------------------------------------------------------------- */
    /* REQUIRED LEGACY-LINKED ROLE                                            */
    /* ---------------------------------------------------------------------- */

    const requiredRoleKey =
      resolveLegacyAccessRole(
        targetUser.legacyRole,
      );

    if (
      requiredRoleKey &&
      role.key ===
        requiredRoleKey
    ) {
      return NextResponse.json(
        {
          error:
            "The user's primary application role is required for identity synchronization and cannot be removed here.",

          code:
            "REQUIRED_PRIMARY_ROLE",
        },
        {
          status: 409,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* ROLE HIERARCHY                                                         */
    /* ---------------------------------------------------------------------- */

    const roleAuthority =
      canActorRemoveRole({
        actor:
          actorAccount,

        role,
      });

    if (
      !roleAuthority.allowed
    ) {
      return NextResponse.json(
        {
          error:
            roleAuthority.reason,

          code:
            roleAuthority.code,
        },
        {
          status: 403,
        },
      );
    }

    const roleTrust =
      getRoleTrustLevel(
        role,
      );

    /* ---------------------------------------------------------------------- */
    /* LAST SUPER ADMIN PROTECTION                                            */
    /* ---------------------------------------------------------------------- */

    if (
      role.key ===
      "super_admin"
    ) {
      const otherSuperAdmins =
        await prisma.userRoleAssignment.count({
          where: {
            roleId:
              role.id,

            userId: {
              not:
                targetUser.id,
            },

            user: {
              status:
                "ACTIVE",
            },

            role: {
              isActive:
                true,
            },

            OR: [
              {
                expiresAt:
                  null,
              },

              {
                expiresAt: {
                  gt:
                    new Date(),
                },
              },
            ],
          },
        });

      if (
        otherSuperAdmins ===
        0
      ) {
        return NextResponse.json(
          {
            error:
              "The final active Super Admin assignment cannot be removed.",

            code:
              "LAST_SUPER_ADMIN",
          },
          {
            status: 409,
          },
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* REVERIFICATION                                                         */
    /* ---------------------------------------------------------------------- */

    const reverificationResponse =
      await requireReverificationIfNeeded({
        required:
          roleTrust >= 800,

        preset:
          "strict",
      });

    if (
      reverificationResponse
    ) {
      return reverificationResponse;
    }

    /* ---------------------------------------------------------------------- */
    /* DELETE + AUDIT                                                         */
    /* ---------------------------------------------------------------------- */

    await prisma.$transaction(
      async (
        tx,
      ) => {
        await tx.userRoleAssignment.delete({
          where: {
            id:
              assignment.id,
          },
        });

        await tx.accessAuditLog.create({
          data: {
            action:
              AccessAuditAction.ROLE_REMOVED,

            targetUserId:
              targetUser.id,

            actorId:
              actorAccount.id,

            actorName:
              actorAccount.displayName ??
              actorAccount.username ??
              actorAccount.email ??
              "Administrator",

            actorRole:
              actorAccount.legacyRole,

            roleId:
              role.id,

            reason,

            metadata: {
              source:
                "USER_DETAIL_ROLE_ASSIGNMENT",

              operation:
                "REMOVE",

              role: {
                id:
                  role.id,

                key:
                  role.key,

                name:
                  role.name,

                type:
                  role.type,

                trustLevel:
                  roleTrust,
              },

              actorTrust:
                hierarchy.actorTrust,

              targetTrustBefore:
                hierarchy.targetTrust,

              assignment: {
                id:
                  assignment.id,

                source:
                  assignment.source,

                assignedBy:
                  assignment.assignedBy,

                assignedAt:
                  assignment.assignedAt.toISOString(),
              },

              reverificationRequired:
                roleTrust >=
                800,
            } satisfies Prisma.InputJsonValue,
          },
        });
      },
    );

    return NextResponse.json({
      success:
        true,

      message:
        `${role.name} was removed successfully.`,
    });
  } catch (
    error
  ) {
    console.error(
      "[USER_ROLE_ASSIGN_DELETE]",
      error,
    );

    return NextResponse.json(
      {
        error:
          "The access role could not be removed.",
      },
      {
        status: 500,
      },
    );
  }
}