// src/app/api/access-control/users/[userId]/lifecycle/route.ts
import {
  clerkClient,
} from "@clerk/nextjs/server";

import { AccessAuditAction, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import {
  canActorManageTarget,
  getCurrentAccessActor,
  requireReverificationIfNeeded,
  shouldRequireSensitiveReverification,
} from "@/lib/access-control";

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

const allowedActions: LifecycleAction[] = ["SUSPEND", "ACTIVATE", "DISABLE"];

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { userId: targetUserId } = await params;

    /* ---------------------------------------------------------------------- */
    /* BODY                                                                   */
    /* ---------------------------------------------------------------------- */

    const body = (await request.json()) as LifecycleBody;

    const action = body.action;

    const reason =
      typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : null;

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
    /* ACTOR AUTHORIZATION                                                    */
    /* ---------------------------------------------------------------------- */

    const accessActor = await getCurrentAccessActor();

    if (!accessActor) {
      return NextResponse.json(
        {
          error: "You must be signed in to manage account status.",
        },
        {
          status: 401,
        },
      );
    }

    if (!accessActor.can("users.manage_status")) {
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

    const actorAccount = accessActor.actor;


    /* ---------------------------------------------------------------------- */
    /* TARGET ACCOUNT                                                         */
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
    /* PROTECTED ACCOUNT HIERARCHY                                            */
    /* ---------------------------------------------------------------------- */

    const hierarchy = canActorManageTarget({
      actor: actorAccount,

      target: targetUser,

      action: "MANAGE_STATUS",
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
    /* RESOLVE SENSITIVE ACTION                                               */
    /* ---------------------------------------------------------------------- */

    const sensitiveAction =
      action === "SUSPEND"
        ? "SUSPEND_ACCOUNT"
        : action === "DISABLE"
          ? "DISABLE_ACCOUNT"
          : "ACTIVATE_ACCOUNT";

    /* ---------------------------------------------------------------------- */
    /* SENSITIVE-ACTION REVERIFICATION                                        */
    /* ---------------------------------------------------------------------- */

    const requiresReverification = shouldRequireSensitiveReverification({
      target: targetUser,

      action: sensitiveAction,
    });

    const reverificationResponse = await requireReverificationIfNeeded({
      required: requiresReverification,

      preset: "strict",
    });

    if (reverificationResponse) {
      return reverificationResponse;
    }


    /* ---------------------------------------------------------------------- */
/* CLERK AUTHENTICATION STATE                                             */
/* ---------------------------------------------------------------------- */

const client =
  await clerkClient();

let clerkStateChanged =
  false;

try {
  if (
    action === "SUSPEND" ||
    action === "DISABLE"
  ) {
    /*
     * Prevent future sign-ins and revoke existing
     * Clerk sessions.
     */
    await client.users.banUser(
      targetUserId,
    );

    clerkStateChanged =
      true;
  }

  if (
    action === "ACTIVATE"
  ) {
    /*
     * Restore Clerk sign-in capability.
     */
    await client.users.unbanUser(
      targetUserId,
    );

    clerkStateChanged =
      true;
  }
} catch (clerkError) {
  console.error(
    "[USER_LIFECYCLE_CLERK]",
    clerkError,
  );

  return NextResponse.json(
    {
      error:
        action === "ACTIVATE"
          ? "The authentication account could not be reactivated."
          : "The authentication account could not be restricted.",
    },
    {
      status: 502,
    },
  );
}

    /* ---------------------------------------------------------------------- */
    /* TRANSACTION: STATUS + AUDIT                                            */
    /* ---------------------------------------------------------------------- */

    let updatedUser;

try {
  updatedUser =
    await prisma.$transaction(
      async (tx) => {
        const updated =
          await tx.userAccount.update({
            where: {
              id:
                targetUserId,
            },

            data: {
              status:
                nextStatus,
            },
          });

        await tx.accessAuditLog.create({
          data: {
            action:
              auditAction,

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

            metadata: {
              source:
                "USER_DETAIL_MORE_ACTIONS",

              lifecycleAction:
                action,

              previousStatus,

              newStatus:
                nextStatus,

              reason:
                reason || null,

              authenticationProvider:
                "CLERK",

              clerkAccessState:
                action === "ACTIVATE"
                  ? "UNBANNED"
                  : "BANNED",

              target: {
                id:
                  targetUser.id,

                displayName:
                  targetUser.displayName,

                username:
                  targetUser.username,

                legacyRole:
                  targetUser.legacyRole,
              },
            },
          },
        });

        return updated;
      },
    );
} catch (databaseError) {
  console.error(
    "[USER_LIFECYCLE_DATABASE]",
    databaseError,
  );

  /*
   * Clerk succeeded but Prisma failed.
   *
   * Attempt to restore Clerk to the authentication
   * state that corresponds to the previous local state.
   */
  if (
    clerkStateChanged
  ) {
    try {
      if (
        previousStatus ===
          "SUSPENDED" ||
        previousStatus ===
          "DISABLED"
      ) {
        await client.users.banUser(
          targetUserId,
        );
      } else {
        await client.users.unbanUser(
          targetUserId,
        );
      }
    } catch (
      compensationError
    ) {
      console.error(
        "[USER_LIFECYCLE_COMPENSATION_FAILURE]",
        compensationError,
      );
    }
  }

  throw databaseError;
}


    // const updatedUser = await prisma.$transaction(async (tx) => {
    //   const updated = await tx.userAccount.update({
    //     where: {
    //       id: targetUserId,
    //     },

    //     data: {
    //       status: nextStatus,
    //     },
    //   });

    //   await tx.accessAuditLog.create({
    //     data: {
    //       action: auditAction,

    //       targetUserId: targetUser.id,

    //       actorId: actorAccount.id,

    //       actorName:
    //         actorAccount.displayName ??
    //         actorAccount.username ??
    //         actorAccount.email ??
    //         "Administrator",

    //       actorRole: actorAccount.legacyRole,

    //       metadata: {
    //         source: "USER_DETAIL_MORE_ACTIONS",

    //         lifecycleAction: action,

    //         previousStatus,

    //         newStatus: nextStatus,

    //         reason: reason || null,

    //         target: {
    //           id: targetUser.id,
    //           displayName: targetUser.displayName,
    //           username: targetUser.username,
    //           legacyRole: targetUser.legacyRole,
    //         },
    //       },
    //     },
    //   });

    //   return updated;
    // });

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
        error: "The account lifecycle action could not be completed.",
      },
      {
        status: 500,
      },
    );
  }
}
