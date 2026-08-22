import {
  AccessAuditAction,
  AccessReviewCampaignStatus,
  AccessReviewDecision,
  Prisma,
} from "@prisma/client";

import {
  NextResponse,
} from "next/server";

import prisma from "@/lib/prisma";

import {
  canActorManageTarget,
  canActorRemoveRole,
  getAccountTrustLevel,
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
    campaignId: string;

    itemId: string;
  }>;
};

type ReviewDecisionBody = {
  decision?: unknown;

  note?: unknown;

  expiresAt?: unknown;
};

type SupportedDecision =
  | "CERTIFIED"
  | "MODIFIED"
  | "REVOKED";

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function normalizeId(
  value:
    string,
) {
  const id =
    Number.parseInt(
      value,
      10,
    );

  return Number.isInteger(
    id,
  ) &&
    id > 0
    ? id
    : null;
}

function normalizeDecision(
  value:
    unknown,
): SupportedDecision | null {
  return value ===
      "CERTIFIED" ||
    value ===
      "MODIFIED" ||
    value ===
      "REVOKED"
    ? value
    : null;
}

function normalizeNote(
  value:
    unknown,
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
        1000,
      ) ||
    null
  );
}

function normalizeModifiedExpiry(
  value:
    unknown,
):
  | {
      value:
        Date | null;

      error:
        null;
    }
  | {
      value:
        null;

      error:
        string;
    } {
  /*
   * null means:
   *
   * Convert the assignment to permanent.
   */
  if (
    value === null
  ) {
    return {
      value:
        null,

      error:
        null,
    };
  }

  if (
    typeof value !==
      "string" ||
    !value.trim()
  ) {
    return {
      value:
        null,

      error:
        "Choose a valid modified expiry date or select permanent access.",
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
      value:
        null,

      error:
        "The modified expiry date is invalid.",
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
    parsed <=
    minimum
  ) {
    return {
      value:
        null,

      error:
        "The modified expiry must be at least five minutes from now.",
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
    parsed >
    maximum
  ) {
    return {
      value:
        null,

      error:
        "Temporary access cannot extend beyond one year.",
    };
  }

  return {
    value:
      parsed,

    error:
      null,
  };
}

/* ========================================================================== */
/* PATCH                                                                      */
/* ========================================================================== */

export async function PATCH(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    const resolvedParams =
      await params;

    const campaignId =
      normalizeId(
        resolvedParams.campaignId,
      );

    const itemId =
      normalizeId(
        resolvedParams.itemId,
      );

    if (
      !campaignId ||
      !itemId
    ) {
      return NextResponse.json(
        {
          error:
            "A valid campaign and review item are required.",
        },
        {
          status: 400,
        },
      );
    }

    const body =
      (await request.json()) as ReviewDecisionBody;

    const decision =
      normalizeDecision(
        body.decision,
      );

    const note =
      normalizeNote(
        body.note,
      );

    if (!decision) {
      return NextResponse.json(
        {
          error:
            "Select a valid certification decision.",
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
            "You must be signed in to review access assignments.",
        },
        {
          status: 401,
        },
      );
    }

    if (
      !accessActor.can(
        "access_reviews.decide",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to certify access assignments.",
        },
        {
          status: 403,
        },
      );
    }

    const actor =
      accessActor.actor;

    const actorTrust =
      getAccountTrustLevel(
        actor,
      );

    if (
      actorTrust < 1000
    ) {
      return NextResponse.json(
        {
          error:
            "Certification decisions require Super Admin authority.",

          code:
            "SUPER_ADMIN_REQUIRED",
        },
        {
          status: 403,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* REVIEW ITEM                                                            */
    /* ---------------------------------------------------------------------- */

    const item =
      await prisma.accessReviewItem.findFirst({
        where: {
          id:
            itemId,

          campaignId,
        },

        include: {
          campaign:
            true,

          assignment: {
            include: {
              user: {
                include: {
                  roles: {
                    include: {
                      role:
                        true,
                    },
                  },
                },
              },

              role:
                true,
            },
          },
        },
      });

    if (!item) {
      return NextResponse.json(
        {
          error:
            "The access review item could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      item.campaign.status !==
      AccessReviewCampaignStatus.ACTIVE
    ) {
      return NextResponse.json(
        {
          error:
            "Certification decisions can only be made while the campaign is active.",

          code:
            "CAMPAIGN_NOT_ACTIVE",
        },
        {
          status: 409,
        },
      );
    }

    if (
      item.decision !==
      AccessReviewDecision.PENDING
    ) {
      return NextResponse.json(
        {
          error:
            `This assignment has already been reviewed as ${item.decision.toLowerCase()}.`,

          code:
            "ITEM_ALREADY_REVIEWED",
        },
        {
          status: 409,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* CERTIFY                                                                */
    /* ---------------------------------------------------------------------- */

    if (
      decision ===
      "CERTIFIED"
    ) {
      const reviewedAt =
        new Date();

      await prisma.$transaction(
        async (
          tx,
        ) => {
          await tx.accessReviewItem.update({
            where: {
              id:
                item.id,
            },

            data: {
              decision:
                AccessReviewDecision.CERTIFIED,

              reviewedBy:
                actor.id,

              reviewedByName:
                actor.displayName ??
                actor.username ??
                actor.email ??
                "Super Administrator",

              reviewedAt,

              reviewNote:
                note,

              decisionMetadata: {
                operation:
                  "CERTIFY",

                assignmentStillExists:
                  Boolean(
                    item.assignment,
                  ),

                certifiedAt:
                  reviewedAt.toISOString(),
              } satisfies Prisma.InputJsonValue,
            },
          });

          await tx.accessAuditLog.create({
            data: {
              action:
                AccessAuditAction.ACCESS_REVIEW_CERTIFIED,

              actorId:
                actor.id,

              actorName:
                actor.displayName ??
                actor.username ??
                actor.email ??
                "Super Administrator",

              actorRole:
                actor.legacyRole,

              targetUserId:
                item.userId,

              roleId:
                item.roleId,

              reason:
                note,

              metadata: {
                source:
                  "ACCESS_REVIEW_CERTIFICATION_WORKSPACE",

                campaignId:
                  item.campaignId,

                reviewItemId:
                  item.id,

                decision:
                  "CERTIFIED",

                assignmentId:
                  item.assignmentId,

                role: {
                  id:
                    item.roleId,

                  key:
                    item.roleKey,

                  name:
                    item.roleName,
                },

                actorTrust,
              } satisfies Prisma.InputJsonValue,
            },
          });
        },
      );

      return NextResponse.json({
        success:
          true,

        message:
          `${item.roleName} access for ${
            item.userDisplayName ??
            item.username ??
            "the user"
          } has been certified.`,
      });
    }

    /* ---------------------------------------------------------------------- */
    /* MODIFY / REVOKE REQUIRE LIVE ASSIGNMENT                                */
    /* ---------------------------------------------------------------------- */

    const assignment =
      item.assignment;

    if (!assignment) {
      /*
       * If the access has already disappeared since the
       * campaign snapshot, a REVOKE decision can still
       * reconcile the review record.
       */
      if (
        decision ===
        "REVOKED"
      ) {
        const reviewedAt =
          new Date();

        await prisma.$transaction(
          async (
            tx,
          ) => {
            await tx.accessReviewItem.update({
              where: {
                id:
                  item.id,
              },

              data: {
                decision:
                  AccessReviewDecision.REVOKED,

                reviewedBy:
                  actor.id,

                reviewedByName:
                  actor.displayName ??
                  actor.username ??
                  actor.email ??
                  "Super Administrator",

                reviewedAt,

                reviewNote:
                  note,

                decisionMetadata: {
                  operation:
                    "REVOKE",

                  assignmentAlreadyMissing:
                    true,

                  reconciledAt:
                    reviewedAt.toISOString(),
                } satisfies Prisma.InputJsonValue,
              },
            });

            await tx.accessAuditLog.create({
              data: {
                action:
                  AccessAuditAction.ACCESS_REVIEW_REVOKED,

                actorId:
                  actor.id,

                actorName:
                  actor.displayName ??
                  actor.username ??
                  actor.email ??
                  "Super Administrator",

                actorRole:
                  actor.legacyRole,

                targetUserId:
                  item.userId,

                roleId:
                  item.roleId,

                reason:
                  note,

                metadata: {
                  source:
                    "ACCESS_REVIEW_CERTIFICATION_WORKSPACE",

                  campaignId:
                    item.campaignId,

                  reviewItemId:
                    item.id,

                  decision:
                    "REVOKED",

                  assignmentAlreadyMissing:
                    true,
                } satisfies Prisma.InputJsonValue,
              },
            });
          },
        );

        return NextResponse.json({
          success:
            true,

          message:
            "The review item was reconciled as revoked because the live assignment no longer exists.",
        });
      }

      return NextResponse.json(
        {
          error:
            "The live role assignment no longer exists and cannot be modified.",

          code:
            "ASSIGNMENT_NO_LONGER_EXISTS",
        },
        {
          status: 409,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* LIVE TARGET HIERARCHY                                                  */
    /* ---------------------------------------------------------------------- */

    const targetHierarchy =
      canActorManageTarget({
        actor,

        target:
          assignment.user,

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

    const roleAuthority =
      canActorRemoveRole({
        actor,

        role:
          assignment.role,
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
    /* REQUIRED PRIMARY ROLE                                                  */
    /* ---------------------------------------------------------------------- */

    const requiredRoleKey =
      resolveLegacyAccessRole(
        assignment.user
          .legacyRole,
      );

    const requiredRole =
      Boolean(
        requiredRoleKey &&
          requiredRoleKey ===
            assignment.role.key,
      );

    if (
      decision ===
        "REVOKED" &&
      requiredRole
    ) {
      return NextResponse.json(
        {
          error:
            "The user's required primary application role cannot be revoked through an access review.",

          code:
            "REQUIRED_PRIMARY_ROLE",
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
        assignment.role,
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
    /* REVOKE                                                                 */
    /* ---------------------------------------------------------------------- */

    if (
      decision ===
      "REVOKED"
    ) {
      const reviewedAt =
        new Date();

      const assignmentSnapshot = {
        id:
          assignment.id,

        expiresAt:
          assignment.expiresAt
            ?.toISOString() ??
          null,

        assignedAt:
          assignment.assignedAt.toISOString(),

        source:
          assignment.source,
      };

      await prisma.$transaction(
        async (
          tx,
        ) => {
          /*
           * AccessReviewItem.assignment uses onDelete: SetNull,
           * so the review history remains after revocation.
           */
          await tx.userRoleAssignment.delete({
            where: {
              id:
                assignment.id,
            },
          });

          await tx.accessReviewItem.update({
            where: {
              id:
                item.id,
            },

            data: {
              decision:
                AccessReviewDecision.REVOKED,

              reviewedBy:
                actor.id,

              reviewedByName:
                actor.displayName ??
                actor.username ??
                actor.email ??
                "Super Administrator",

              reviewedAt,

              reviewNote:
                note,

              decisionMetadata: {
                operation:
                  "REVOKE",

                assignment:
                  assignmentSnapshot,

                roleTrust,

                revokedAt:
                  reviewedAt.toISOString(),
              } satisfies Prisma.InputJsonValue,
            },
          });

          /*
           * Existing RBAC audit event.
           */
          await tx.accessAuditLog.create({
            data: {
              action:
                AccessAuditAction.ROLE_REMOVED,

              actorId:
                actor.id,

              actorName:
                actor.displayName ??
                actor.username ??
                actor.email ??
                "Super Administrator",

              actorRole:
                actor.legacyRole,

              targetUserId:
                item.userId,

              roleId:
                item.roleId,

              reason:
                note,

              metadata: {
                source:
                  "ACCESS_REVIEW_CERTIFICATION_WORKSPACE",

                campaignId:
                  item.campaignId,

                reviewItemId:
                  item.id,

                role: {
                  id:
                    item.roleId,

                  key:
                    item.roleKey,

                  name:
                    item.roleName,
                },

                assignment:
                  assignmentSnapshot,
              } satisfies Prisma.InputJsonValue,
            },
          });

          /*
           * Formal review decision audit event.
           */
          await tx.accessAuditLog.create({
            data: {
              action:
                AccessAuditAction.ACCESS_REVIEW_REVOKED,

              actorId:
                actor.id,

              actorName:
                actor.displayName ??
                actor.username ??
                actor.email ??
                "Super Administrator",

              actorRole:
                actor.legacyRole,

              targetUserId:
                item.userId,

              roleId:
                item.roleId,

              reason:
                note,

              metadata: {
                source:
                  "ACCESS_REVIEW_CERTIFICATION_WORKSPACE",

                campaignId:
                  item.campaignId,

                reviewItemId:
                  item.id,

                decision:
                  "REVOKED",

                roleTrust,

                revokedAssignmentId:
                  assignment.id,
              } satisfies Prisma.InputJsonValue,
            },
          });
        },
      );

      return NextResponse.json({
        success:
          true,

        message:
          `${item.roleName} access has been revoked and the review decision recorded.`,
      });
    }

    /* ---------------------------------------------------------------------- */
    /* MODIFY                                                                 */
    /* ---------------------------------------------------------------------- */

    const modifiedExpiry =
      normalizeModifiedExpiry(
        body.expiresAt,
      );

    if (
      modifiedExpiry.error
    ) {
      return NextResponse.json(
        {
          error:
            modifiedExpiry.error,
        },
        {
          status: 400,
        },
      );
    }

    const nextExpiresAt =
      modifiedExpiry.value;

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
            "The selected duration is already applied to this assignment.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * Required primary roles must remain permanent.
     */
    if (
      requiredRole &&
      nextExpiresAt
    ) {
      return NextResponse.json(
        {
          error:
            "The user's required primary role must remain permanent.",

          code:
            "PRIMARY_ROLE_MUST_BE_PERMANENT",
        },
        {
          status: 409,
        },
      );
    }

    const reviewedAt =
      new Date();

    const modification =
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

    await prisma.$transaction(
      async (
        tx,
      ) => {
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

        await tx.accessReviewItem.update({
          where: {
            id:
              item.id,
          },

          data: {
            decision:
              AccessReviewDecision.MODIFIED,

            reviewedBy:
              actor.id,

            reviewedByName:
              actor.displayName ??
              actor.username ??
              actor.email ??
              "Super Administrator",

            reviewedAt,

            reviewNote:
              note,

            decisionMetadata: {
              operation:
                "MODIFY",

              modification,

              before: {
                expiresAt:
                  previousExpiresAt
                    ?.toISOString() ??
                  null,
              },

              after: {
                expiresAt:
                  nextExpiresAt
                    ?.toISOString() ??
                  null,
              },

              roleTrust,

              modifiedAt:
                reviewedAt.toISOString(),
            } satisfies Prisma.InputJsonValue,
          },
        });

        /*
         * Existing assignment change audit.
         */
        await tx.accessAuditLog.create({
          data: {
            action:
              AccessAuditAction.ROLE_ASSIGNMENT_UPDATED,

            actorId:
              actor.id,

            actorName:
              actor.displayName ??
              actor.username ??
              actor.email ??
              "Super Administrator",

            actorRole:
              actor.legacyRole,

            targetUserId:
              item.userId,

            roleId:
              item.roleId,

            reason:
              note,

            metadata: {
              source:
                "ACCESS_REVIEW_CERTIFICATION_WORKSPACE",

              campaignId:
                item.campaignId,

              reviewItemId:
                item.id,

              modification,

              before: {
                expiresAt:
                  previousExpiresAt
                    ?.toISOString() ??
                  null,
              },

              after: {
                expiresAt:
                  nextExpiresAt
                    ?.toISOString() ??
                  null,
              },
            } satisfies Prisma.InputJsonValue,
          },
        });

        await tx.accessAuditLog.create({
          data: {
            action:
              AccessAuditAction.ACCESS_REVIEW_MODIFIED,

            actorId:
              actor.id,

            actorName:
              actor.displayName ??
              actor.username ??
              actor.email ??
              "Super Administrator",

            actorRole:
              actor.legacyRole,

            targetUserId:
              item.userId,

            roleId:
              item.roleId,

            reason:
              note,

            metadata: {
              source:
                "ACCESS_REVIEW_CERTIFICATION_WORKSPACE",

              campaignId:
                item.campaignId,

              reviewItemId:
                item.id,

              decision:
                "MODIFIED",

              modification,

              roleTrust,
            } satisfies Prisma.InputJsonValue,
          },
        });
      },
    );

    return NextResponse.json({
      success:
        true,

      message:
        `${item.roleName} access was modified and certified as changed.`,
    });
  } catch (
    error
  ) {
    console.error(
      "[ACCESS_REVIEW_ITEM_DECISION]",
      error,
    );

    return NextResponse.json(
      {
        error:
          "The certification decision could not be completed.",
      },
      {
        status: 500,
      },
    );
  }
}