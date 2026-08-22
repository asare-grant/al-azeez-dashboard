import {
  AccessAuditAction,
  AccessReviewCampaignStatus,
  Prisma,
} from "@prisma/client";

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import {
  getAccountTrustLevel,
  getCurrentAccessActor,
} from "@/lib/access-control";

import { notifyAccessReviewCampaignStarted } from "@/lib/notifications";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type RouteContext = {
  params: Promise<{
    campaignId: string;
  }>;
};

/* ========================================================================== */
/* POST                                                                       */
/* ========================================================================== */

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const { campaignId: campaignIdParam } = await params;

    const campaignId = Number.parseInt(campaignIdParam, 10);

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
      return NextResponse.json(
        {
          error: "A valid access review campaign is required.",
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
          error: "You must be signed in to start an access review campaign.",
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
            "Starting a certification campaign requires Super Admin authority.",

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
        _count: {
          select: {
            items: true,
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

    if (campaign.status !== AccessReviewCampaignStatus.DRAFT) {
      return NextResponse.json(
        {
          error: "Only draft campaigns can be started.",

          code: "CAMPAIGN_NOT_DRAFT",
        },
        {
          status: 409,
        },
      );
    }

    if (campaign._count.items === 0) {
      return NextResponse.json(
        {
          error: "This campaign has no assignments to review.",

          code: "EMPTY_CAMPAIGN",
        },
        {
          status: 409,
        },
      );
    }

    if (campaign.dueAt <= new Date()) {
      return NextResponse.json(
        {
          error:
            "The campaign due date has already passed. Create a new campaign or update the due date before starting.",

          code: "CAMPAIGN_DUE_DATE_PASSED",
        },
        {
          status: 409,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* START + AUDIT                                                          */
    /* ---------------------------------------------------------------------- */

    const startedAt = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.accessReviewCampaign.update({
        where: {
          id: campaign.id,
        },

        data: {
          status: AccessReviewCampaignStatus.ACTIVE,

          startedAt,
        },
      });

      await tx.accessAuditLog.create({
        data: {
          action: AccessAuditAction.ACCESS_REVIEW_CAMPAIGN_STARTED,

          actorId: actor.id,

          actorName:
            actor.displayName ??
            actor.username ??
            actor.email ??
            "Super Administrator",

          actorRole: actor.legacyRole,

          metadata: {
            source: "ACCESS_REVIEW_CAMPAIGN_WORKSPACE",

            campaign: {
              id: campaign.id,

              name: campaign.name,

              scope: campaign.scope,

              dueAt: campaign.dueAt.toISOString(),

              itemCount: campaign._count.items,

              startedAt: startedAt.toISOString(),
            },

            actorTrust,
          } satisfies Prisma.InputJsonValue,
        },
      });

      await notifyAccessReviewCampaignStarted({
        campaignId: campaign.id,

        campaignName: campaign.name,

        dueAt: campaign.dueAt,

        itemCount: campaign._count.items,

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

      message: `${campaign.name} is now active and ready for certification.`,
    });
  } catch (error) {
    console.error("[ACCESS_REVIEW_CAMPAIGN_START]", error);

    return NextResponse.json(
      {
        error: "The access review campaign could not be started.",
      },
      {
        status: 500,
      },
    );
  }
}
