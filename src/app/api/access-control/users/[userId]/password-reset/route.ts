// src/app/api/access-control/users/[userId]/password-reset/route.ts
import { clerkClient } from "@clerk/nextjs/server";

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

type ResetPasswordBody = {
  revokeAllSessions?: unknown;
  reason?: unknown;
};

export async function POST(request: Request, { params }: RouteContext) {
  let auditLogId: number | null = null;

  try {
    /* ---------------------------------------------------------------------- */
    /* TARGET ID                                                              */
    /* ---------------------------------------------------------------------- */

    const { userId: targetUserId } = await params;

    /* ---------------------------------------------------------------------- */
    /* BODY                                                                   */
    /* ---------------------------------------------------------------------- */

    const body = (await request.json()) as ResetPasswordBody;

    const revokeAllSessions =
      typeof body.revokeAllSessions === "boolean"
        ? body.revokeAllSessions
        : true;

    const reason =
      typeof body.reason === "string"
        ? body.reason.trim().slice(0, 500) || null
        : null;

    /* ---------------------------------------------------------------------- */
    /* ACTOR AUTHORIZATION                                                    */
    /* ---------------------------------------------------------------------- */

    const accessActor = await getCurrentAccessActor();

    if (!accessActor) {
      return NextResponse.json(
        {
          error: "You must be signed in to require a password reset.",
        },
        {
          status: 401,
        },
      );
    }

    if (!accessActor.can("users.reset_password")) {
      return NextResponse.json(
        {
          error: "You do not have permission to require password resets.",
        },
        {
          status: 403,
        },
      );
    }

    const actorAccount = accessActor.actor;


    /* ---------------------------------------------------------------------- */
    /* TARGET LOCAL IDENTITY                                                  */
    /* ---------------------------------------------------------------------- */

    const targetUser =
  await prisma.userAccount.findUnique({
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
          error: "The target user could not be found.",
        },
        {
          status: 404,
        },
      );
    }



    /* ---------------------------------------------------------------------- */
/* PROTECTED ACCOUNT HIERARCHY                                            */
/* ---------------------------------------------------------------------- */

const hierarchy =
  canActorManageTarget({
    actor:
      actorAccount,

    target:
      targetUser,

    action:
      "RESET_PASSWORD",
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
    /* CLERK ACCOUNT                                                          */
    /* ---------------------------------------------------------------------- */

    const client = await clerkClient();

    let clerkUser;

    try {
      clerkUser = await client.users.getUser(targetUserId);
    } catch {
      return NextResponse.json(
        {
          error:
            "The matching Clerk authentication account could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * Clerk's backend User exposes passwordEnabled.
     *
     * Passwordless-only accounts should not be put into a
     * password-reset flow.
     */
    if (!clerkUser.passwordEnabled) {
      return NextResponse.json(
        {
          error:
            "This Clerk account does not currently use password authentication.",
        },
        {
          status: 409,
        },
      );
    }


    
/* ---------------------------------------------------------------------- */
/* SENSITIVE-ACTION REVERIFICATION                                        */
/* ---------------------------------------------------------------------- */

const requiresReverification =
  shouldRequireSensitiveReverification({
    target:
      targetUser,

    action:
      "RESET_PASSWORD",
  });

const reverificationResponse =
  await requireReverificationIfNeeded({
    required:
      requiresReverification,

    preset:
      "strict",
  });

if (
  reverificationResponse
) {
  return reverificationResponse;
}


    /* ---------------------------------------------------------------------- */
    /* PRE-ACTION AUDIT                                                       */
    /* ---------------------------------------------------------------------- */

    const auditEntry = await prisma.accessAuditLog.create({
      data: {
        action: AccessAuditAction.PASSWORD_RESET_REQUIRED,

        actorId: actorAccount.id,

        actorName:
          actorAccount.displayName ??
          actorAccount.username ??
          actorAccount.email ??
          "Administrator",

        actorRole: actorAccount.legacyRole,

        targetUserId: targetUser.id,

        reason,

        metadata: {
          source: "USER_DETAIL_RESET_PASSWORD",

          state: "REQUESTED",

          revokeAllSessions,

          authenticationProvider: "CLERK",

          passwordStoredLocally: false,

          target: {
            id: targetUser.id,

            displayName: targetUser.displayName,

            username: targetUser.username,

            legacyRole: targetUser.legacyRole,

            localAccountStatus: targetUser.status,
          },
        },
      },
    });

    auditLogId = auditEntry.id;

    /* ---------------------------------------------------------------------- */
    /* CLERK PASSWORD RESET REQUIREMENT                                       */
    /* ---------------------------------------------------------------------- */

    await client.users.setPasswordCompromised(targetUserId, {
      revokeAllSessions,
    });

    /*
     * We intentionally do NOT:
     *
     * - create a password
     * - receive a password
     * - write a password to Prisma
     * - return a password
     */

    /* ---------------------------------------------------------------------- */
    /* FINALIZE AUDIT                                                         */
    /* ---------------------------------------------------------------------- */

    await prisma.accessAuditLog.update({
      where: {
        id: auditEntry.id,
      },

      data: {
        metadata: {
          source: "USER_DETAIL_RESET_PASSWORD",

          state: "COMPLETED",

          revokeAllSessions,

          authenticationProvider: "CLERK",

          passwordStoredLocally: false,

          passwordResetRequired: true,

          completedAt: new Date().toISOString(),

          target: {
            id: targetUser.id,

            displayName: targetUser.displayName,

            username: targetUser.username,

            legacyRole: targetUser.legacyRole,

            localAccountStatus: targetUser.status,
          },
        },
      },
    });

    /* ---------------------------------------------------------------------- */
    /* RESPONSE                                                               */
    /* ---------------------------------------------------------------------- */

    return NextResponse.json({
      success: true,

      message: revokeAllSessions
        ? `${
            targetUser.displayName ?? "User"
          } must reset their password. Existing sessions were revoked.`
        : `${
            targetUser.displayName ?? "User"
          } must reset their password on their next authentication.`,

      authentication: {
        passwordEnabled: true,

        sessionsRevoked: revokeAllSessions,
      },
    });
  } catch (error) {
    console.error("[PASSWORD_RESET_REQUIRED]", error);

    /*
     * If an audit event was created before Clerk failed,
     * preserve that failure for investigation.
     */
    if (auditLogId) {
      try {
        await prisma.accessAuditLog.update({
          where: {
            id: auditLogId,
          },

          data: {
            metadata: {
              source: "USER_DETAIL_RESET_PASSWORD",

              state: "FAILED",

              passwordStoredLocally: false,

              failedAt: new Date().toISOString(),

              error: "Clerk password reset requirement could not be completed.",
            },
          },
        });
      } catch (auditError) {
        console.error("[PASSWORD_RESET_AUDIT_FAILURE]", auditError);
      }
    }

    /*
     * Clerk's errors are intentionally not forwarded verbatim to
     * the browser because they can expose unnecessary provider detail.
     */
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          error: "The password-reset audit record could not be completed.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        error: "The password reset requirement could not be completed.",
      },
      {
        status: 500,
      },
    );
  }
}
