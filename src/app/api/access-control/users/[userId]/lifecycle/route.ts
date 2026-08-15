import { auth } from "@clerk/nextjs/server";
import {
  AccessAuditAction,
  Prisma,
} from "@prisma/client";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

type LifecycleAction = "SUSPEND" | "ACTIVATE" | "DISABLE";

type LifecycleBody = {
  action?: LifecycleAction;
  reason?: string | null;
};

const allowedActions: LifecycleAction[] = [
  "SUSPEND",
  "ACTIVATE",
  "DISABLE",
];

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHENTICATION                                                         */
    /* ---------------------------------------------------------------------- */

    const { userId: actorId } = await auth();

    if (!actorId) {
      return NextResponse.json(
        {
          error: "You must be signed in to perform this action.",
        },
        {
          status: 401,
        },
      );
    }

    const { userId: targetUserId } = await params;

    /* ---------------------------------------------------------------------- */
    /* BODY                                                                   */
    /* ---------------------------------------------------------------------- */

    const body = (await request.json()) as LifecycleBody;

    const action = body.action;

    const reason =
      typeof body.reason === "string"
        ? body.reason.trim().slice(0, 500)
        : null;

    if (!action || !allowedActions.includes(action)) {
      return NextResponse.json(
        {
          error: "Invalid account lifecycle action.",
        },
        {
          status: 400,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* ACTOR ACCOUNT + AUTHORIZATION                                          */
    /* ---------------------------------------------------------------------- */

    const actorAccount = await prisma.userAccount.findUnique({
      where: {
        id: actorId,
      },

      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!actorAccount) {
      return NextResponse.json(
        {
          error:
            "Your authenticated identity does not have a local UserAccount record.",
        },
        {
          status: 403,
        },
      );
    }

    const actorPermissions = new Set(
      actorAccount.roles.flatMap((assignment) =>
        assignment.role.permissions.map(
          (rolePermission) => rolePermission.permission.key,
        ),
      ),
    );

    /*
     * Administrators remain authorized during the transition to full
     * permission-level lifecycle management.
     *
     * "users.manage_status" becomes the delegated RBAC permission for
     * non-admin administrative roles.
     */
    const canManageLifecycle =
      actorAccount.legacyRole?.toLowerCase() === "admin" ||
      actorPermissions.has("users.manage_status");

    if (!canManageLifecycle) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to manage user account lifecycle states.",
        },
        {
          status: 403,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* TARGET ACCOUNT                                                         */
    /* ---------------------------------------------------------------------- */

    const targetUser = await prisma.userAccount.findUnique({
      where: {
        id: targetUserId,
      },

      select: {
        id: true,
        displayName: true,
        username: true,
        email: true,
        legacyRole: true,
        status: true,
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
    /* SELF-PROTECTION                                                        */
    /* ---------------------------------------------------------------------- */

    if (
      actorId === targetUserId &&
      (action === "SUSPEND" || action === "DISABLE")
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot suspend or disable your own administrative account.",
        },
        {
          status: 409,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* RESOLVE NEXT STATUS                                                    */
    /* ---------------------------------------------------------------------- */

    const nextStatus: Prisma.UserAccountUpdateInput["status"] =
      action === "SUSPEND"
        ? "SUSPENDED"
        : action === "DISABLE"
          ? "DISABLED"
          : "ACTIVE";

    const auditAction =
      action === "SUSPEND"
        ? AccessAuditAction.USER_SUSPENDED
        : action === "DISABLE"
          ? AccessAuditAction.USER_DISABLED
          : AccessAuditAction.USER_ACTIVATED;

    /* ---------------------------------------------------------------------- */
    /* NO-OP PROTECTION                                                       */
    /* ---------------------------------------------------------------------- */

    if (targetUser.status === nextStatus) {
      return NextResponse.json(
        {
          error: `This account is already ${String(nextStatus).toLowerCase()}.`,
        },
        {
          status: 409,
        },
      );
    }

    const previousStatus = targetUser.status;

    /* ---------------------------------------------------------------------- */
    /* TRANSACTION: STATUS + AUDIT                                            */
    /* ---------------------------------------------------------------------- */

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.userAccount.update({
        where: {
          id: targetUserId,
        },

        data: {
          status: nextStatus,
        },
      });

      await tx.accessAuditLog.create({
        data: {
          action: auditAction,

          targetUserId: targetUser.id,

          actorId: actorAccount.id,

          actorName:
            actorAccount.displayName ??
            actorAccount.username ??
            actorAccount.email ??
            "Administrator",

          actorRole: actorAccount.legacyRole,

          metadata: {
            source: "USER_DETAIL_MORE_ACTIONS",

            lifecycleAction: action,

            previousStatus,

            newStatus: nextStatus,

            reason: reason || null,

            target: {
              id: targetUser.id,
              displayName: targetUser.displayName,
              username: targetUser.username,
              legacyRole: targetUser.legacyRole,
            },
          },
        },
      });

      return updated;
    });

    /* ---------------------------------------------------------------------- */
    /* RESPONSE                                                               */
    /* ---------------------------------------------------------------------- */

    const message =
      action === "SUSPEND"
        ? `${targetUser.displayName ?? "User"} has been suspended.`
        : action === "DISABLE"
          ? `${targetUser.displayName ?? "User"} has been disabled.`
          : `${targetUser.displayName ?? "User"} has been reactivated.`;

    return NextResponse.json({
      success: true,

      message,

      user: {
        id: updatedUser.id,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error("[USER_LIFECYCLE_PATCH]", error);

    return NextResponse.json(
      {
        error:
          "The account lifecycle action could not be completed.",
      },
      {
        status: 500,
      },
    );
  }
}