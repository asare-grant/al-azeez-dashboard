// src/app/api/access-control/reviews/reports/route.ts

import {
  AccessAuditAction,
  Prisma,
} from "@prisma/client";

import {
  NextResponse,
} from "next/server";

import prisma from "@/lib/prisma";

import {
  generateAccessReviewComplianceReport,
  getAccountTrustLevel,
  getCurrentAccessActor,
} from "@/lib/access-control";

/* ========================================================================== */
/* RUNTIME                                                                    */
/* ========================================================================== */

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type ReportBody = {
  mode?:
    unknown;

  campaignId?:
    unknown;

  academicYear?:
    unknown;

  term?:
    unknown;
};

/* ========================================================================== */
/* POST                                                                       */
/* ========================================================================== */

export async function POST(
  request:
    Request,
) {
  try {
    /* ---------------------------------------------------------------------- */
    /* ACTOR                                                                  */
    /* ---------------------------------------------------------------------- */

    const accessActor =
      await getCurrentAccessActor();

    if (!accessActor) {
      return NextResponse.json(
        {
          error:
            "You must be signed in to export compliance reports.",
        },
        {
          status: 401,
        },
      );
    }

    if (
      !accessActor.can(
        "access_reviews.export",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to export Access Review compliance reports.",
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

    /*
     * Access Review reports contain privileged
     * governance information.
     */
    if (
      actorTrust <
      800
    ) {
      return NextResponse.json(
        {
          error:
            "Compliance report export requires administrative security authority.",

          code:
            "INSUFFICIENT_TRUST",
        },
        {
          status: 403,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* BODY                                                                   */
    /* ---------------------------------------------------------------------- */

    const body =
      (await request.json()) as ReportBody;

    const mode =
      body.mode ===
        "CAMPAIGN" ||
      body.mode ===
        "PERIOD"
        ? body.mode
        : null;

    if (!mode) {
      return NextResponse.json(
        {
          error:
            "Select a valid compliance report type.",
        },
        {
          status: 400,
        },
      );
    }

    let campaignId:
      number | undefined;

    if (
      mode ===
      "CAMPAIGN"
    ) {
      const parsed =
        typeof body.campaignId ===
        "number"
          ? body.campaignId
          : Number(
              body.campaignId,
            );

      if (
        !Number.isInteger(
          parsed,
        ) ||
        parsed <=
          0
      ) {
        return NextResponse.json(
          {
            error:
              "A valid campaign is required for this report.",
          },
          {
            status: 400,
          },
        );
      }

      campaignId =
        parsed;
    }

    const academicYear =
      typeof body.academicYear ===
        "string"
        ? body.academicYear
            .trim()
            .slice(
              0,
              100,
            ) ||
          null
        : null;

    const term =
      typeof body.term ===
        "string"
        ? body.term
            .trim()
            .slice(
              0,
              100,
            ) ||
          null
        : null;

    /* ---------------------------------------------------------------------- */
    /* GENERATE                                                               */
    /* ---------------------------------------------------------------------- */

    const actorName =
      actor.displayName ??
      actor.username ??
      actor.email ??
      "Administrator";

    const report =
      await generateAccessReviewComplianceReport({
        mode,

        campaignId,

        academicYear,

        term,

        generatedBy: {
          id:
            actor.id,

          name:
            actorName,

          role:
            actor.legacyRole,
        },
      });

    /* ---------------------------------------------------------------------- */
    /* AUDIT EXPORT                                                           */
    /* ---------------------------------------------------------------------- */

    await prisma.accessAuditLog.create({
      data: {
        action:
          AccessAuditAction.ACCESS_REVIEW_REPORT_EXPORTED,

        actorId:
          actor.id,

        actorName,

        actorRole:
          actor.legacyRole,

        reason:
          "Access Review compliance report exported.",

        metadata: {
          source:
            "ACCESS_REVIEW_COMPLIANCE_EXPORT",

          mode,

          campaignIds:
            report.campaignIds,

          filters: {
            academicYear,

            term,
          },

          reportSummary:
            report.summary,

          filename:
            report.filename,

          actorTrust,

          generatedAt:
            new Date().toISOString(),
        } satisfies Prisma.InputJsonValue,
      },
    });

    /* ---------------------------------------------------------------------- */
    /* PDF RESPONSE                                                           */
    /* ---------------------------------------------------------------------- */

    return new Response(
      Buffer.from(
        report.bytes,
      ),
      {
        status:
          200,

        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="${report.filename}"`,

          "Cache-Control":
            "private, no-store, max-age=0",

          "X-Content-Type-Options":
            "nosniff",
        },
      },
    );
  } catch (
    error
  ) {
    console.error(
      "[ACCESS_REVIEW_COMPLIANCE_REPORT]",
      error,
    );

    if (
      error instanceof
        Error &&
      error.message ===
        "NO_REPORT_DATA"
    ) {
      return NextResponse.json(
        {
          error:
            "There is no Access Review data matching the selected report scope.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          "The compliance report could not be generated.",
      },
      {
        status: 500,
      },
    );
  }
}