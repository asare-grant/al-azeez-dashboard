import { AccessAuditAction, Prisma } from "@prisma/client";

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import {
  canActorAssignRole,
  canActorManageTarget,
  canActorRemoveRole,
  getCurrentAccessActor,
  getRoleTrustLevel,
  requireReverificationIfNeeded,
} from "@/lib/access-control";

import { resolveLegacyAccessRole } from "@/lib/access-control/legacy-role-map";

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
  expiresAt?: unknown;
};

type RemoveRoleBody = {
  roleId?: unknown;
  reason?: unknown;
};

type UpdateRoleExpiryBody = {
  roleId?: unknown;
  expiresAt?: unknown;
  reason?: unknown;
};

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function normalizeRoleId(value: unknown) {
  const roleId =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  return Number.isInteger(roleId) && roleId > 0 ? roleId : null;
}

function normalizeReason(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  return value.trim().slice(0, 500) || null;
}

function normalizeExpiry(value: unknown):
  | {
      expiresAt: Date | null;
      error: null;
    }
  | {
      expiresAt: null;
      error: string;
    } {
  /*
   * null / empty means a permanent assignment.
   */
  if (value === null || value === undefined || value === "") {
    return {
      expiresAt: null,
      error: null,
    };
  }

  if (typeof value !== "string") {
    return {
      expiresAt: null,
      error: "The role expiry value is invalid.",
    };
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return {
      expiresAt: null,
      error: "The role expiry date is invalid.",
    };
  }

  const now = new Date();

  /*
   * Avoid assignments that expire immediately because of
   * clock drift or accidental selection.
   */
  const minimumExpiry = new Date(now.getTime() + 5 * 60 * 1000);

  if (parsed <= minimumExpiry) {
    return {
      expiresAt: null,
      error: "Temporary access must expire at least five minutes from now.",
    };
  }

  /*
   * Temporary delegated assignments may last up to one year.
   *
   * Longer-term access should normally be reviewed and granted
   * as a permanent role instead.
   */
  const maximumExpiry = new Date(now.getTime() + 366 * 24 * 60 * 60 * 1000);

  if (parsed > maximumExpiry) {
    return {
      expiresAt: null,
      error: "Temporary role assignments cannot exceed one year.",
    };
  }

  return {
    expiresAt: parsed,
    error: null,
  };
}


function normalizeManagedExpiry(
  value: unknown,
):
  | {
      expiresAt: Date | null;
      error: null;
    }
  | {
      expiresAt: null;
      error: string;
    } {
  /*
   * null means convert the assignment to permanent.
   */
  if (
    value === null
  ) {
    return {
      expiresAt: null,
      error: null,
    };
  }

  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return {
      expiresAt: null,
      error:
        "A valid expiry date or permanent assignment is required.",
    };
  }

  const parsed =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return {
      expiresAt: null,
      error:
        "The selected expiry date is invalid.",
    };
  }

  const minimum =
    new Date(
      Date.now() +
        5 *
          60 *
          1000,
    );

  if (
    parsed <= minimum
  ) {
    return {
      expiresAt: null,
      error:
        "The new expiry must be at least five minutes from now.",
    };
  }

  const maximum =
    new Date(
      Date.now() +
        366 *
          24 *
          60 *
          60 *
          1000,
    );

  if (
    parsed > maximum
  ) {
    return {
      expiresAt: null,
      error:
        "Temporary delegated access cannot extend beyond one year.",
    };
  }

  return {
    expiresAt:
      parsed,

    error:
      null,
  };
}

/* ========================================================================== */
/* ASSIGN ROLE                                                                */
/* ========================================================================== */

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { userId: targetUserId } = await params;

    const body = (await request.json()) as AssignRoleBody;

    const roleId = normalizeRoleId(body.roleId);

    const reason = normalizeReason(body.reason);

    const expiry = normalizeExpiry(body.expiresAt);

    if (expiry.error) {
      return NextResponse.json(
        {
          error: expiry.error,
        },
        {
          status: 400,
        },
      );
    }

    const expiresAt = expiry.expiresAt;

    if (!roleId) {
      return NextResponse.json(
        {
          error: "A valid access role is required.",
        },
        {
          status: 400,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* ACTOR                                                                  */
    /* ---------------------------------------------------------------------- */

    const accessActor = await getCurrentAccessActor();

    if (!accessActor) {
      return NextResponse.json(
        {
          error: "You must be signed in to assign roles.",
        },
        {
          status: 401,
        },
      );
    }

    if (!accessActor.can("roles.assign")) {
      return NextResponse.json(
        {
          error: "You do not have permission to assign access roles.",
        },
        {
          status: 403,
        },
      );
    }

    const actorAccount = accessActor.actor;

    /* ---------------------------------------------------------------------- */
    /* TARGET                                                                 */
    /* ---------------------------------------------------------------------- */

    const targetUser = await prisma.userAccount.findUnique({
      where: {
        id: targetUserId,
      },

      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          error: "The target user account could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* TARGET HIERARCHY                                                       */
    /* ---------------------------------------------------------------------- */

    const targetHierarchy = canActorManageTarget({
      actor: actorAccount,

      target: targetUser,

      /*
       * Role management is a sensitive management operation.
       * EDIT_USER gives us self-safe hierarchy semantics here,
       * while the role hierarchy below provides the second gate.
       */
      action: "MANAGE_ROLES",
    });

    if (!targetHierarchy.allowed) {
      return NextResponse.json(
        {
          error: targetHierarchy.reason,

          code: targetHierarchy.code,
        },
        {
          status: 403,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* ROLE                                                                   */
    /* ---------------------------------------------------------------------- */

    const role = await prisma.accessRole.findUnique({
      where: {
        id: roleId,
      },

      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        {
          error: "The selected access role could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* ROLE HIERARCHY                                                         */
    /* ---------------------------------------------------------------------- */

    const roleAuthority = canActorAssignRole({
      actor: actorAccount,

      role,
    });

    if (!roleAuthority.allowed) {
      return NextResponse.json(
        {
          error: roleAuthority.reason,

          code: roleAuthority.code,
        },
        {
          status: 403,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* DUPLICATE                                                              */
    /* ---------------------------------------------------------------------- */

    const existing = targetUser.roles.find(
      (assignment) => assignment.roleId === role.id,
    );

    const now = new Date();

    const existingIsActive = Boolean(
      existing && (!existing.expiresAt || existing.expiresAt > now),
    );

    if (existingIsActive) {
      return NextResponse.json(
        {
          error: "This role is already actively assigned to the user.",
        },
        {
          status: 409,
        },
      );
    }

    const renewingExpiredAssignment = Boolean(
      existing && existing.expiresAt && existing.expiresAt <= now,
    );

    /* ---------------------------------------------------------------------- */
    /* REVERIFICATION                                                         */
    /* ---------------------------------------------------------------------- */

    const roleTrust = getRoleTrustLevel(role);

    /*
     * Admin-level and higher grants require fresh identity
     * verification before the authority is changed.
     */
    const reverificationResponse = await requireReverificationIfNeeded({
      required: roleTrust >= 800,

      preset: "strict",
    });

    if (reverificationResponse) {
      return reverificationResponse;
    }

    /* ---------------------------------------------------------------------- */
    /* MUTATION + AUDIT                                                       */
    /* ---------------------------------------------------------------------- */

    const assignment = await prisma.$transaction(async (tx) => {
      const created =
        renewingExpiredAssignment && existing
          ? await tx.userRoleAssignment.update({
              where: {
                id: existing.id,
              },

              data: {
                assignedBy: actorAccount.id,

                source: "ADMIN",

                assignedAt: new Date(),

                expiresAt,
              },
            })
          : await tx.userRoleAssignment.create({
              data: {
                userId: targetUser.id,

                roleId: role.id,

                assignedBy: actorAccount.id,

                source: "ADMIN",

                expiresAt,
              },
            });

      await tx.accessAuditLog.create({
        data: {
          action: AccessAuditAction.ROLE_ASSIGNED,

          targetUserId: targetUser.id,

          actorId: actorAccount.id,

          actorName:
            actorAccount.displayName ??
            actorAccount.username ??
            actorAccount.email ??
            "Administrator",

          actorRole: actorAccount.legacyRole,

          roleId: role.id,

          reason,

          metadata: {
            source: "USER_DETAIL_ROLE_ASSIGNMENT",

            operation: "ASSIGN",

            role: {
              id: role.id,

              key: role.key,

              name: role.name,

              type: role.type,

              trustLevel: roleTrust,
            },

            assignment: {
              mode: expiresAt ? "TEMPORARY" : "PERMANENT",

              expiresAt: expiresAt ? expiresAt.toISOString() : null,

              renewed: renewingExpiredAssignment,
            },

            permissionCount: role.permissions.length,

            targetTrustBefore: targetHierarchy.targetTrust,

            actorTrust: targetHierarchy.actorTrust,

            reverificationRequired: roleTrust >= 800,
          } satisfies Prisma.InputJsonValue,
        },
      });

      return created;
    });

    return NextResponse.json({
      success: true,

      message: `${role.name} was assigned successfully.`,

      assignment: {
        id: assignment.id,

        roleId: role.id,

        roleKey: role.key,
      },
    });
  } catch (error) {
    console.error("[USER_ROLE_ASSIGN_POST]", error);

    return NextResponse.json(
      {
        error: "The access role could not be assigned.",
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

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { userId: targetUserId } = await params;

    const body = (await request.json()) as RemoveRoleBody;

    const roleId = normalizeRoleId(body.roleId);

    const reason = normalizeReason(body.reason);

    if (!roleId) {
      return NextResponse.json(
        {
          error: "A valid access role is required.",
        },
        {
          status: 400,
        },
      );
    }

    const accessActor = await getCurrentAccessActor();

    if (!accessActor) {
      return NextResponse.json(
        {
          error: "You must be signed in to remove roles.",
        },
        {
          status: 401,
        },
      );
    }

    if (!accessActor.can("roles.remove")) {
      return NextResponse.json(
        {
          error: "You do not have permission to remove access roles.",
        },
        {
          status: 403,
        },
      );
    }

    const actorAccount = accessActor.actor;

    /* ---------------------------------------------------------------------- */
    /* TARGET                                                                 */
    /* ---------------------------------------------------------------------- */

    const targetUser = await prisma.userAccount.findUnique({
      where: {
        id: targetUserId,
      },

      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          error: "The target user account could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    const hierarchy = canActorManageTarget({
      actor: actorAccount,

      target: targetUser,

      action: "MANAGE_ROLES",
    });

    if (!hierarchy.allowed) {
      return NextResponse.json(
        {
          error: hierarchy.reason,

          code: hierarchy.code,
        },
        {
          status: 403,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* ASSIGNMENT                                                             */
    /* ---------------------------------------------------------------------- */

    const assignment = targetUser.roles.find((item) => item.roleId === roleId);

    if (!assignment) {
      return NextResponse.json(
        {
          error: "This role is not assigned to the user.",
        },
        {
          status: 404,
        },
      );
    }

    const role = assignment.role;

    /* ---------------------------------------------------------------------- */
    /* REQUIRED LEGACY-LINKED ROLE                                            */
    /* ---------------------------------------------------------------------- */

    const requiredRoleKey = resolveLegacyAccessRole(targetUser.legacyRole);

    if (requiredRoleKey && role.key === requiredRoleKey) {
      return NextResponse.json(
        {
          error:
            "The user's primary application role is required for identity synchronization and cannot be removed here.",

          code: "REQUIRED_PRIMARY_ROLE",
        },
        {
          status: 409,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* ROLE HIERARCHY                                                         */
    /* ---------------------------------------------------------------------- */

    const roleAuthority = canActorRemoveRole({
      actor: actorAccount,

      role,
    });

    if (!roleAuthority.allowed) {
      return NextResponse.json(
        {
          error: roleAuthority.reason,

          code: roleAuthority.code,
        },
        {
          status: 403,
        },
      );
    }

    const roleTrust = getRoleTrustLevel(role);

    /* ---------------------------------------------------------------------- */
    /* LAST SUPER ADMIN PROTECTION                                            */
    /* ---------------------------------------------------------------------- */

    if (role.key === "super_admin") {
      const otherSuperAdmins = await prisma.userRoleAssignment.count({
        where: {
          roleId: role.id,

          userId: {
            not: targetUser.id,
          },

          user: {
            status: "ACTIVE",
          },

          role: {
            isActive: true,
          },

          OR: [
            {
              expiresAt: null,
            },

            {
              expiresAt: {
                gt: new Date(),
              },
            },
          ],
        },
      });

      if (otherSuperAdmins === 0) {
        return NextResponse.json(
          {
            error: "The final active Super Admin assignment cannot be removed.",

            code: "LAST_SUPER_ADMIN",
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

    const reverificationResponse = await requireReverificationIfNeeded({
      required: roleTrust >= 800,

      preset: "strict",
    });

    if (reverificationResponse) {
      return reverificationResponse;
    }

    /* ---------------------------------------------------------------------- */
    /* DELETE + AUDIT                                                         */
    /* ---------------------------------------------------------------------- */

    await prisma.$transaction(async (tx) => {
      await tx.userRoleAssignment.delete({
        where: {
          id: assignment.id,
        },
      });

      await tx.accessAuditLog.create({
        data: {
          action: AccessAuditAction.ROLE_REMOVED,

          targetUserId: targetUser.id,

          actorId: actorAccount.id,

          actorName:
            actorAccount.displayName ??
            actorAccount.username ??
            actorAccount.email ??
            "Administrator",

          actorRole: actorAccount.legacyRole,

          roleId: role.id,

          reason,

          metadata: {
            source: "USER_DETAIL_ROLE_ASSIGNMENT",

            operation: "REMOVE",

            role: {
              id: role.id,

              key: role.key,

              name: role.name,

              type: role.type,

              trustLevel: roleTrust,
            },

            actorTrust: hierarchy.actorTrust,

            targetTrustBefore: hierarchy.targetTrust,

            assignment: {
              id: assignment.id,

              source: assignment.source,

              assignedBy: assignment.assignedBy,

              assignedAt: assignment.assignedAt.toISOString(),
            },

            reverificationRequired: roleTrust >= 800,
          } satisfies Prisma.InputJsonValue,
        },
      });
    });

    return NextResponse.json({
      success: true,

      message: `${role.name} was removed successfully.`,
    });
  } catch (error) {
    console.error("[USER_ROLE_ASSIGN_DELETE]", error);

    return NextResponse.json(
      {
        error: "The access role could not be removed.",
      },
      {
        status: 500,
      },
    );
  }
}



/* ========================================================================== */
/* UPDATE ROLE ASSIGNMENT EXPIRY                                              */
/* ========================================================================== */

export async function PATCH(
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

    /* ---------------------------------------------------------------------- */
    /* BODY                                                                   */
    /* ---------------------------------------------------------------------- */

    const body =
      (await request.json()) as UpdateRoleExpiryBody;

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
            "A valid role assignment is required.",
        },
        {
          status: 400,
        },
      );
    }

    const expiry =
      normalizeManagedExpiry(
        body.expiresAt,
      );

    if (
      expiry.error
    ) {
      return NextResponse.json(
        {
          error:
            expiry.error,
        },
        {
          status: 400,
        },
      );
    }

    const nextExpiresAt =
      expiry.expiresAt;

    /* ---------------------------------------------------------------------- */
    /* ACTOR                                                                  */
    /* ---------------------------------------------------------------------- */

    const accessActor =
      await getCurrentAccessActor();

    if (!accessActor) {
      return NextResponse.json(
        {
          error:
            "You must be signed in to manage delegated access.",
        },
        {
          status: 401,
        },
      );
    }

    if (
      !accessActor.can(
        "roles.manage_expiry",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to manage role assignment expiry.",
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

    const hierarchy =
      canActorManageTarget({
        actor:
          actorAccount,

        target:
          targetUser,

        action:
          "MANAGE_ROLES",
      });

    if (
      !hierarchy.allowed
    ) {
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
    /* REQUIRED PRIMARY ROLE                                                  */
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
            "The user's required primary RBAC role must remain permanent.",

          code:
            "PRIMARY_ROLE_MUST_BE_PERMANENT",
        },
        {
          status: 409,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* ROLE AUTHORITY                                                         */
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

    /* ---------------------------------------------------------------------- */
    /* NO-OP                                                                  */
    /* ---------------------------------------------------------------------- */

    const previousExpiresAt =
      assignment.expiresAt;

    const previousTimestamp =
      previousExpiresAt
        ?.getTime() ??
      null;

    const nextTimestamp =
      nextExpiresAt
        ?.getTime() ??
      null;

    if (
      previousTimestamp ===
      nextTimestamp
    ) {
      return NextResponse.json(
        {
          error:
            "The selected expiry is already applied to this assignment.",
        },
        {
          status: 409,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* FINAL SUPER ADMIN PROTECTION                                           */
    /* ---------------------------------------------------------------------- */

    if (
      role.key ===
        "super_admin" &&
      nextExpiresAt
    ) {
      const otherPermanentOrLaterSuperAdmins =
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
                    nextExpiresAt,
                },
              },
            ],
          },
        });

      if (
        otherPermanentOrLaterSuperAdmins ===
        0
      ) {
        return NextResponse.json(
          {
            error:
              "This change could leave the system without an active Super Admin after the selected expiry.",

            code:
              "LAST_SUPER_ADMIN_EXPIRY",
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

    const roleTrust =
      getRoleTrustLevel(
        role,
      );

    const reverificationResponse =
      await requireReverificationIfNeeded({
        required:
          roleTrust >=
          800,

        preset:
          "strict",
      });

    if (
      reverificationResponse
    ) {
      return reverificationResponse;
    }

    /* ---------------------------------------------------------------------- */
    /* CLASSIFY CHANGE                                                        */
    /* ---------------------------------------------------------------------- */

    const operation =
      previousExpiresAt ===
        null &&
      nextExpiresAt !==
        null
        ? "MAKE_TEMPORARY"
        : previousExpiresAt !==
              null &&
            nextExpiresAt ===
              null
          ? "MAKE_PERMANENT"
          : previousExpiresAt &&
              nextExpiresAt &&
              nextExpiresAt >
                previousExpiresAt
            ? "EXTEND"
            : "SHORTEN";

    /* ---------------------------------------------------------------------- */
    /* UPDATE + AUDIT                                                         */
    /* ---------------------------------------------------------------------- */

    const updatedAssignment =
      await prisma.$transaction(
        async (
          tx,
        ) => {
          const updated =
            await tx.userRoleAssignment.update({
              where: {
                id:
                  assignment.id,
              },

              data: {
                expiresAt:
                  nextExpiresAt,
              },
            });

          await tx.accessAuditLog.create({
            data: {
              action:
                AccessAuditAction.ROLE_ASSIGNMENT_UPDATED,

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
                  "USER_DETAIL_EXPIRY_MANAGEMENT",

                operation,

                role: {
                  id:
                    role.id,

                  key:
                    role.key,

                  name:
                    role.name,

                  trustLevel:
                    roleTrust,
                },

                before: {
                  expiresAt:
                    previousExpiresAt
                      ?.toISOString() ??
                    null,

                  mode:
                    previousExpiresAt
                      ? "TEMPORARY"
                      : "PERMANENT",
                },

                after: {
                  expiresAt:
                    nextExpiresAt
                      ?.toISOString() ??
                    null,

                  mode:
                    nextExpiresAt
                      ? "TEMPORARY"
                      : "PERMANENT",
                },

                actorTrust:
                  hierarchy.actorTrust,

                targetTrust:
                  hierarchy.targetTrust,

                reverificationRequired:
                  roleTrust >=
                  800,
              } satisfies Prisma.InputJsonValue,
            },
          });

          return updated;
        },
      );

    /* ---------------------------------------------------------------------- */
    /* RESPONSE                                                               */
    /* ---------------------------------------------------------------------- */

    const message =
      operation ===
      "MAKE_PERMANENT"
        ? `${role.name} is now a permanent assignment.`
        : operation ===
            "EXTEND"
          ? `${role.name} temporary access was extended successfully.`
          : operation ===
              "SHORTEN"
            ? `${role.name} temporary access was shortened successfully.`
            : `${role.name} is now a temporary assignment.`;

    return NextResponse.json({
      success:
        true,

      message,

      assignment: {
        id:
          updatedAssignment.id,

        roleId:
          updatedAssignment.roleId,

        expiresAt:
          updatedAssignment.expiresAt
            ?.toISOString() ??
          null,
      },
    });
  } catch (
    error
  ) {
    console.error(
      "[USER_ROLE_EXPIRY_PATCH]",
      error,
    );

    return NextResponse.json(
      {
        error:
          "The assignment duration could not be updated.",
      },
      {
        status: 500,
      },
    );
  }
}