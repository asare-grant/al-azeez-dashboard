import {
  AccessReviewScope,
} from "@prisma/client";

import {
  NextResponse,
} from "next/server";

import {
  AccessReviewCampaignError,
  createAccessReviewCampaign,
} from "@/lib/access-control";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type CreateCampaignBody = {
  name?:
    unknown;

  description?:
    unknown;

  scope?:
    unknown;

  dueAt?:
    unknown;
};

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function parseScope(
  value:
    unknown,
) {
  if (
    value ===
      AccessReviewScope.PRIVILEGED ||
    value ===
      AccessReviewScope.TEMPORARY ||
    value ===
      AccessReviewScope.PRIVILEGED_AND_TEMPORARY ||
    value ===
      AccessReviewScope.ALL_ASSIGNMENTS
  ) {
    return value;
  }

  return null;
}

/* ========================================================================== */
/* POST                                                                       */
/* ========================================================================== */

export async function POST(
  request:
    Request,
) {
  try {
    const body =
      (await request.json()) as CreateCampaignBody;

    const name =
      typeof body.name ===
      "string"
        ? body.name
        : "";

    const description =
      typeof body.description ===
      "string"
        ? body.description
        : null;

    const scope =
      parseScope(
        body.scope,
      );

    if (!scope) {
      return NextResponse.json(
        {
          error:
            "Select a valid access review scope.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof body.dueAt !==
      "string"
    ) {
      return NextResponse.json(
        {
          error:
            "A valid campaign due date is required.",
        },
        {
          status: 400,
        },
      );
    }

    const dueAt =
      new Date(
        body.dueAt,
      );

    if (
      Number.isNaN(
        dueAt.getTime(),
      )
    ) {
      return NextResponse.json(
        {
          error:
            "The selected campaign due date is invalid.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await createAccessReviewCampaign({
        name,

        description,

        scope,

        dueAt,
      });

    return NextResponse.json(
      {
        success:
          true,

        message:
          `Access review campaign created with ${result.itemCount} assignment${
            result.itemCount ===
            1
              ? ""
              : "s"
          } ready for certification.`,

        campaign: {
          id:
            result.campaignId,

          itemCount:
            result.itemCount,

          privilegedCount:
            result.privilegedCount,

          temporaryCount:
            result.temporaryCount,

          highTrustCount:
            result.highTrustCount,
        },
      },
      {
        status:
          201,
      },
    );
  } catch (
    error
  ) {
    if (
      error instanceof
      AccessReviewCampaignError
    ) {
      return NextResponse.json(
        {
          error:
            error.message,

          code:
            error.code,
        },
        {
          status:
            error.status,
        },
      );
    }

    console.error(
      "[ACCESS_REVIEW_CAMPAIGN_CREATE]",
      error,
    );

    return NextResponse.json(
      {
        error:
          "The access review campaign could not be created.",
      },
      {
        status: 500,
      },
    );
  }
}