import {
  AccessAuditAction,
  AccessReviewCampaignStatus,
  AccessReviewDecision,
  Prisma,
} from "@prisma/client";

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import {
  getAccountTrustLevel,
  getCurrentAccessActor,
} from "@/lib/access-control";

import {
  notifyAccessReviewCampaignCancelled,
  notifyAccessReviewCampaignCompleted,
} from "@/lib/notifications";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type RouteContext = {
  params: Promise<{
    campaignId: string;
  }>;
};

type CampaignLifecycleAction = "COMPLETE" | "CANCEL";

type LifecycleBody = {
  action?: unknown;

  reason?: unknown;
};

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function normalizeCampaignId(value: string) {
  const parsed = Number.parseInt(value, 10);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeAction(value: unknown): CampaignLifecycleAction | null {
  return value === "COMPLETE" || value === "CANCEL" ? value : null;
}

function normalizeReason(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  return value.trim().slice(0, 1000) || null;
}

/* ========================================================================== */
/* PATCH                                                                      */
/* ========================================================================== */

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { campaignId: campaignIdParam } = await params;

    const campaignId = normalizeCampaignId(campaignIdParam);

    if (!campaignId) {
      return NextResponse.json(
        {
          error: "A valid access review campaign is required.",
        },
        {
          status: 400,
        },
      );
    }

    const body = (await request.json()) as LifecycleBody;

    const action = normalizeAction(body.action);

    const reason = normalizeReason(body.reason);

    if (!action) {
      return NextResponse.json(
        {
          error: "Select a valid campaign lifecycle action.",
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
          error: "You must be signed in to manage access review campaigns.",
        },
        {
          status: 401,
        },
      );
    }

    if (!accessActor.can("access_reviews.manage")) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to manage access review campaigns.",
        },
        {
          status: 403,
        },
      );
    }

    const actor = accessActor.actor;

    const actorTrust = getAccountTrustLevel(actor);

    if (actorTrust < 1000) {
      return NextResponse.json(
        {
          error:
            "Campaign completion and cancellation require Super Admin authority.",

          code: "SUPER_ADMIN_REQUIRED",
        },
        {
          status: 403,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* CAMPAIGN                                                               */
    /* ---------------------------------------------------------------------- */

    const campaign = await prisma.accessReviewCampaign.findUnique({
      where: {
        id: campaignId,
      },

      include: {
        items: {
          select: {
            decision: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        {
          error: "The access review campaign could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* TERMINAL STATE PROTECTION                                              */
    /* ---------------------------------------------------------------------- */

    if (
      campaign.status === AccessReviewCampaignStatus.COMPLETED ||
      campaign.status === AccessReviewCampaignStatus.CANCELLED
    ) {
      return NextResponse.json(
        {
          error: `This campaign is already ${campaign.status.toLowerCase()} and can no longer be changed.`,

          code: "CAMPAIGN_TERMINAL_STATE",
        },
        {
          status: 409,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* METRICS                                                                */
    /* ---------------------------------------------------------------------- */

    const pendingCount = campaign.items.filter(
      (item) => item.decision === AccessReviewDecision.PENDING,
    ).length;

    const certifiedCount = campaign.items.filter(
      (item) => item.decision === AccessReviewDecision.CERTIFIED,
    ).length;

    const modifiedCount = campaign.items.filter(
      (item) => item.decision === AccessReviewDecision.MODIFIED,
    ).length;

    const revokedCount = campaign.items.filter(
      (item) => item.decision === AccessReviewDecision.REVOKED,
    ).length;

    const reviewedCount = certifiedCount + modifiedCount + revokedCount;

    const totalCount = campaign.items.length;

    /* ---------------------------------------------------------------------- */
    /* COMPLETE                                                               */
    /* ---------------------------------------------------------------------- */

    if (action === "COMPLETE") {
      if (campaign.status !== AccessReviewCampaignStatus.ACTIVE) {
        return NextResponse.json(
          {
            error: "Only active access review campaigns can be completed.",

            code: "CAMPAIGN_NOT_ACTIVE",
          },
          {
            status: 409,
          },
        );
      }

      if (pendingCount > 0) {
        return NextResponse.json(
          {
            error: `${pendingCount} review item${
              pendingCount === 1 ? "" : "s"
            } still ${
              pendingCount === 1 ? "requires" : "require"
            } a certification decision before this campaign can be completed.`,

            code: "PENDING_REVIEWS_REMAIN",

            pendingCount,
          },
          {
            status: 409,
          },
        );
      }

      const completedAt = new Date();

      await prisma.$transaction(async (tx) => {
        await tx.accessReviewCampaign.update({
          where: {
            id: campaign.id,
          },

          data: {
            status: AccessReviewCampaignStatus.COMPLETED,

            completedAt,
          },
        });

        await tx.accessAuditLog.create({
          data: {
            action: AccessAuditAction.ACCESS_REVIEW_CAMPAIGN_COMPLETED,

            actorId: actor.id,

            actorName:
              actor.displayName ??
              actor.username ??
              actor.email ??
              "Super Administrator",

            actorRole: actor.legacyRole,

            reason,

            metadata: {
              source: "ACCESS_REVIEW_CERTIFICATION_WORKSPACE",

              campaign: {
                id: campaign.id,

                name: campaign.name,

                scope: campaign.scope,

                dueAt: campaign.dueAt.toISOString(),

                startedAt: campaign.startedAt?.toISOString() ?? null,

                completedAt: completedAt.toISOString(),
              },

              certificationSummary: {
                total: totalCount,

                reviewed: reviewedCount,

                pending: pendingCount,

                certified: certifiedCount,

                modified: modifiedCount,

                revoked: revokedCount,
              },

              actorTrust,
            } satisfies Prisma.InputJsonValue,
          },
        });

        await notifyAccessReviewCampaignCompleted({
          campaignId: campaign.id,

          campaignName: campaign.name,

          dueAt: campaign.dueAt,

          itemCount: totalCount,

          certifiedCount,

          modifiedCount,

          revokedCount,

          actor: {
            id: actor.id,

            role: actor.legacyRole,

            name:
              actor.displayName ??
              actor.username ??
              actor.email ??
              "Super Administrator",
          },

          tx,
        });
      });

      return NextResponse.json({
        success: true,

        message: `${campaign.name} has been formally completed.`,

        campaign: {
          id: campaign.id,

          status: "COMPLETED",

          completedAt: completedAt.toISOString(),
        },
      });
    }

    /* ---------------------------------------------------------------------- */
    /* CANCEL                                                                 */
    /* ---------------------------------------------------------------------- */

    if (!reason) {
      return NextResponse.json(
        {
          error:
            "A cancellation reason is required so the governance record explains why this review was terminated.",

          code: "CANCELLATION_REASON_REQUIRED",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Cancellation is allowed from:
     *
     * DRAFT
     * ACTIVE
     *
     * Existing decisions remain untouched.
     */
    if (
      campaign.status !== AccessReviewCampaignStatus.DRAFT &&
      campaign.status !== AccessReviewCampaignStatus.ACTIVE
    ) {
      return NextResponse.json(
        {
          error: "Only draft or active campaigns can be cancelled.",

          code: "CAMPAIGN_NOT_CANCELLABLE",
        },
        {
          status: 409,
        },
      );
    }

    const cancelledAt = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.accessReviewCampaign.update({
        where: {
          id: campaign.id,
        },

        data: {
          status: AccessReviewCampaignStatus.CANCELLED,

          cancelledAt,
        },
      });

      await tx.accessAuditLog.create({
        data: {
          action: AccessAuditAction.ACCESS_REVIEW_CAMPAIGN_CANCELLED,

          actorId: actor.id,

          actorName:
            actor.displayName ??
            actor.username ??
            actor.email ??
            "Super Administrator",

          actorRole: actor.legacyRole,

          reason,

          metadata: {
            source: "ACCESS_REVIEW_CERTIFICATION_WORKSPACE",

            campaign: {
              id: campaign.id,

              name: campaign.name,

              previousStatus: campaign.status,

              scope: campaign.scope,

              dueAt: campaign.dueAt.toISOString(),

              startedAt: campaign.startedAt?.toISOString() ?? null,

              cancelledAt: cancelledAt.toISOString(),
            },

            preservedReviewState: {
              total: totalCount,

              reviewed: reviewedCount,

              pending: pendingCount,

              certified: certifiedCount,

              modified: modifiedCount,

              revoked: revokedCount,
            },

            actorTrust,
          } satisfies Prisma.InputJsonValue,
        },
      });

      await notifyAccessReviewCampaignCancelled({
        campaignId: campaign.id,

        campaignName: campaign.name,

        dueAt: campaign.dueAt,

        itemCount: totalCount,

        reviewedCount,

        pendingCount,

        reason,

        actor: {
          id: actor.id,

          role: actor.legacyRole,

          name:
            actor.displayName ??
            actor.username ??
            actor.email ??
            "Super Administrator",
        },

        tx,
      });
    });

    return NextResponse.json({
      success: true,

      message: `${campaign.name} has been cancelled. Existing certification decisions remain preserved.`,

      campaign: {
        id: campaign.id,

        status: "CANCELLED",

        cancelledAt: cancelledAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[ACCESS_REVIEW_CAMPAIGN_LIFECYCLE]", error);

    return NextResponse.json(
      {
        error: "The campaign lifecycle action could not be completed.",
      },
      {
        status: 500,
      },
    );
  }
}
