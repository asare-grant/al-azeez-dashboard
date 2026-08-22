// src/lib/access-control/access-review-compliance-report.ts

import "server-only";

import {
  AccessAuditAction,
  AccessReviewCampaignStatus,
  AccessReviewDecision,
  Prisma,
} from "@prisma/client";

import {
  PDFDocument,
  PDFFont,
  PDFPage,
  StandardFonts,
  rgb,
} from "pdf-lib";

import prisma from "@/lib/prisma";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type AccessReviewComplianceReportMode =
  | "CAMPAIGN"
  | "PERIOD";

export type AccessReviewComplianceReportInput = {
  mode:
    AccessReviewComplianceReportMode;

  campaignId?:
    number;

  academicYear?:
    string | null;

  term?:
    string | null;

  generatedBy: {
    id:
      string;

    name:
      string;

    role:
      string | null;
  };
};

type ReportCampaign =
  Awaited<
    ReturnType<
      typeof loadReportCampaigns
    >
  >[number];

type ReviewerSummary = {
  id:
    string;

  name:
    string;

  reviewed:
    number;

  certified:
    number;

  modified:
    number;

  revoked:
    number;
};

type ReportAudit = {
  id:
    number;

  action:
    string;

  actorName:
    string;

  actorRole:
    string | null;

  reason:
    string | null;

  createdAt:
    Date;

  campaignId:
    number | null;
};

/* ========================================================================== */
/* CONSTANTS                                                                  */
/* ========================================================================== */

const SCHOOL_NAME =
  "Al-Azeez International School";

const REPORT_TITLE =
  "Access Review Compliance & Executive Governance Report";

const HIGH_TRUST_ROLE_KEYS =
  new Set([
    "super_admin",
    "admin",
  ]);

const PAGE_WIDTH =
  595.28;

const PAGE_HEIGHT =
  841.89;

const MARGIN =
  46;

const CONTENT_WIDTH =
  PAGE_WIDTH -
  MARGIN *
    2;

/* ========================================================================== */
/* DATA                                                                       */
/* ========================================================================== */

async function loadReportCampaigns(
  input:
    AccessReviewComplianceReportInput,
) {
  if (
    input.mode ===
    "CAMPAIGN"
  ) {
    if (
      !input.campaignId
    ) {
      throw new Error(
        "CAMPAIGN_ID_REQUIRED",
      );
    }

    return prisma.accessReviewCampaign.findMany({
      where: {
        id:
          input.campaignId,
      },

      include: {
        items: {
          orderBy: [
            {
              roleName:
                "asc",
            },

            {
              userDisplayName:
                "asc",
            },
          ],
        },
      },

      orderBy: {
        createdAt:
          "desc",
      },
    });
  }

  return prisma.accessReviewCampaign.findMany({
    where: {
      ...(input.academicYear
        ? {
            academicYearSnapshot:
              input.academicYear,
          }
        : {}),

      ...(input.term
        ? {
            termSnapshot:
              input.term,
          }
        : {}),
    },

    include: {
      items: {
        orderBy: [
          {
            roleName:
              "asc",
          },

          {
            userDisplayName:
              "asc",
          },
        ],
      },
    },

    orderBy: {
      createdAt:
        "desc",
    },
  });
}

/* ========================================================================== */
/* METADATA CAMPAIGN ID                                                       */
/* ========================================================================== */

function extractCampaignId(
  metadata:
    Prisma.JsonValue | null,
) {
  if (
    !metadata ||
    typeof metadata !==
      "object" ||
    Array.isArray(
      metadata,
    )
  ) {
    return null;
  }

  const record =
    metadata as Record<
      string,
      unknown
    >;

  if (
    typeof record.campaignId ===
      "number"
  ) {
    return record.campaignId;
  }

  const campaign =
    record.campaign;

  if (
    campaign &&
    typeof campaign ===
      "object" &&
    !Array.isArray(
      campaign,
    )
  ) {
    const campaignRecord =
      campaign as Record<
        string,
        unknown
      >;

    if (
      typeof campaignRecord.id ===
        "number"
    ) {
      return campaignRecord.id;
    }
  }

  return null;
}

/* ========================================================================== */
/* AUDIT EVIDENCE                                                             */
/* ========================================================================== */

async function loadAuditEvidence(
  campaigns:
    ReportCampaign[],
) {
  if (
    campaigns.length ===
    0
  ) {
    return [] satisfies ReportAudit[];
  }

  const campaignIds =
    new Set(
      campaigns.map(
        (
          campaign,
        ) =>
          campaign.id,
      ),
    );

  const earliest =
    campaigns.reduce(
      (
        earliestDate,
        campaign,
      ) =>
        campaign.createdAt <
        earliestDate
          ? campaign.createdAt
          : earliestDate,
      campaigns[0]
        .createdAt,
    );

  const auditActions = [
    AccessAuditAction.ACCESS_REVIEW_CAMPAIGN_CREATED,

    AccessAuditAction.ACCESS_REVIEW_CAMPAIGN_STARTED,

    AccessAuditAction.ACCESS_REVIEW_CAMPAIGN_COMPLETED,

    AccessAuditAction.ACCESS_REVIEW_CAMPAIGN_CANCELLED,

    AccessAuditAction.ACCESS_REVIEW_CERTIFIED,

    AccessAuditAction.ACCESS_REVIEW_MODIFIED,

    AccessAuditAction.ACCESS_REVIEW_REVOKED,

    AccessAuditAction.ROLE_ASSIGNMENT_UPDATED,

    AccessAuditAction.ROLE_REMOVED,
  ];

  const logs =
    await prisma.accessAuditLog.findMany({
      where: {
        action: {
          in:
            auditActions,
        },

        createdAt: {
          gte:
            earliest,
        },
      },

      select: {
        id:
          true,

        action:
          true,

        actorName:
          true,

        actorRole:
          true,

        reason:
          true,

        metadata:
          true,

        createdAt:
          true,
      },

      orderBy: {
        createdAt:
          "asc",
      },
    });

  return logs
    .map(
      (
        log,
      ) => ({
        id:
          log.id,

        action:
          log.action,

        actorName:
          log.actorName,

        actorRole:
          log.actorRole,

        reason:
          log.reason,

        createdAt:
          log.createdAt,

        campaignId:
          extractCampaignId(
            log.metadata,
          ),
      }),
    )
    .filter(
      (
        log,
      ) =>
        log.campaignId !==
          null &&
        campaignIds.has(
          log.campaignId,
        ),
    );
}

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function percentage(
  part:
    number,

  total:
    number,
) {
  if (
    total <=
    0
  ) {
    return 0;
  }

  return Math.round(
    (
      part /
      total
    ) *
      100,
  );
}

function safeText(
  value:
    string | null | undefined,
) {
  return (
    value ??
    ""
  )
    .normalize(
      "NFKD",
    )
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .replace(
      /[\u2018\u2019]/g,
      "'",
    )
    .replace(
      /[\u201C\u201D]/g,
      '"',
    )
    .replace(
      /[\u2013\u2014]/g,
      "-",
    )
    .replace(
      /[^\x20-\x7E]/g,
      "",
    );
}

function readableEnum(
  value:
    string,
) {
  return value
    .toLowerCase()
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (
        letter,
      ) =>
        letter.toUpperCase(),
    );
}

function formatDate(
  value:
    Date | null,
) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle:
        "medium",
    },
  ).format(
    value,
  );
}

function formatDateTime(
  value:
    Date | null,
) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    },
  ).format(
    value,
  );
}

function isHighTrustItem(
  item:
    ReportCampaign["items"][number],
) {
  return (
    item.roleProtected ||
    HIGH_TRUST_ROLE_KEYS.has(
      item.roleKey,
    )
  );
}

/* ========================================================================== */
/* REVIEWERS                                                                  */
/* ========================================================================== */

function buildReviewerSummary(
  campaigns:
    ReportCampaign[],
) {
  const map =
    new Map<
      string,
      ReviewerSummary
    >();

  for (
    const campaign of
    campaigns
  ) {
    for (
      const item of
      campaign.items
    ) {
      if (
        !item.reviewedBy ||
        item.decision ===
          AccessReviewDecision.PENDING
      ) {
        continue;
      }

      const current =
        map.get(
          item.reviewedBy,
        ) ?? {
          id:
            item.reviewedBy,

          name:
            item.reviewedByName ??
            "Administrator",

          reviewed:
            0,

          certified:
            0,

          modified:
            0,

          revoked:
            0,
        };

      current.reviewed +=
        1;

      if (
        item.decision ===
        AccessReviewDecision.CERTIFIED
      ) {
        current.certified +=
          1;
      }

      if (
        item.decision ===
        AccessReviewDecision.MODIFIED
      ) {
        current.modified +=
          1;
      }

      if (
        item.decision ===
        AccessReviewDecision.REVOKED
      ) {
        current.revoked +=
          1;
      }

      map.set(
        item.reviewedBy,
        current,
      );
    }
  }

  return Array.from(
    map.values(),
  ).sort(
    (
      a,
      b,
    ) =>
      b.reviewed -
      a.reviewed,
  );
}

/* ========================================================================== */
/* PDF WRITER                                                                 */
/* ========================================================================== */

class CompliancePdfWriter {
  private pdf:
    PDFDocument;

  private regular:
    PDFFont;

  private bold:
    PDFFont;

  private page:
    PDFPage;

  private y:
    number;

  private pageNumber =
    1;

  constructor({
    pdf,
    regular,
    bold,
  }: {
    pdf:
      PDFDocument;

    regular:
      PDFFont;

    bold:
      PDFFont;
  }) {
    this.pdf =
      pdf;

    this.regular =
      regular;

    this.bold =
      bold;

    this.page =
      this.pdf.addPage([
        PAGE_WIDTH,
        PAGE_HEIGHT,
      ]);

    this.y =
      PAGE_HEIGHT -
      MARGIN;

    this.drawPageHeader();
  }

  private drawPageHeader() {
    this.page.drawText(
      safeText(
        SCHOOL_NAME,
      ),
      {
        x:
          MARGIN,

        y:
          PAGE_HEIGHT -
          28,

        size:
          8,

        font:
          this.bold,

        color:
          rgb(
            0.39,
            0.45,
            0.55,
          ),
      },
    );

    this.page.drawText(
      `Page ${this.pageNumber}`,
      {
        x:
          PAGE_WIDTH -
          MARGIN -
          42,

        y:
          PAGE_HEIGHT -
          28,

        size:
          8,

        font:
          this.regular,

        color:
          rgb(
            0.55,
            0.60,
            0.68,
          ),
      },
    );

    this.y =
      PAGE_HEIGHT -
      50;
  }

  private addPage() {
    this.page =
      this.pdf.addPage([
        PAGE_WIDTH,
        PAGE_HEIGHT,
      ]);

    this.pageNumber +=
      1;

    this.drawPageHeader();
  }

  private ensureSpace(
    required:
      number,
  ) {
    if (
      this.y -
        required <
      52
    ) {
      this.addPage();
    }
  }

  private wrap(
    text:
      string,

    font:
      PDFFont,

    size:
      number,

    maxWidth:
      number,
  ) {
    const words =
      safeText(
        text,
      )
        .split(
          /\s+/,
        )
        .filter(
          Boolean,
        );

    const lines:
      string[] =
      [];

    let current =
      "";

    for (
      const word of
      words
    ) {
      const candidate =
        current
          ? `${current} ${word}`
          : word;

      const width =
        font.widthOfTextAtSize(
          candidate,
          size,
        );

      if (
        width <=
          maxWidth ||
        !current
      ) {
        current =
          candidate;

        continue;
      }

      lines.push(
        current,
      );

      current =
        word;
    }

    if (current) {
      lines.push(
        current,
      );
    }

    return lines.length
      ? lines
      : [""];
  }

  title(
    value:
      string,
  ) {
    this.ensureSpace(
      60,
    );

    const lines =
      this.wrap(
        value,
        this.bold,
        21,
        CONTENT_WIDTH,
      );

    for (
      const line of
      lines
    ) {
      this.page.drawText(
        line,
        {
          x:
            MARGIN,

          y:
            this.y,

          size:
            21,

          font:
            this.bold,

          color:
            rgb(
              0.06,
              0.09,
              0.16,
            ),
        },
      );

      this.y -=
        26;
    }

    this.y -=
      5;
  }

  section(
    value:
      string,
  ) {
    this.ensureSpace(
      34,
    );

    this.y -=
      8;

    this.page.drawRectangle({
      x:
        MARGIN,

      y:
        this.y -
        3,

      width:
        4,

      height:
        17,

      color:
        rgb(
          0.15,
          0.39,
          0.92,
        ),
    });

    this.page.drawText(
      safeText(
        value,
      ),
      {
        x:
          MARGIN +
          12,

        y:
          this.y,

        size:
          13,

        font:
          this.bold,

        color:
          rgb(
            0.06,
            0.09,
            0.16,
          ),
      },
    );

    this.y -=
      28;
  }

  paragraph(
    value:
      string,

    options?: {
      bold?:
        boolean;

      size?:
        number;

      indent?:
        number;
    },
  ) {
    const font =
      options?.bold
        ? this.bold
        : this.regular;

    const size =
      options?.size ??
      9.5;

    const indent =
      options?.indent ??
      0;

    const width =
      CONTENT_WIDTH -
      indent;

    const lines =
      this.wrap(
        value,
        font,
        size,
        width,
      );

    this.ensureSpace(
      lines.length *
        14 +
        8,
    );

    for (
      const line of
      lines
    ) {
      this.page.drawText(
        line,
        {
          x:
            MARGIN +
            indent,

          y:
            this.y,

          size,

          font,

          color:
            rgb(
              0.24,
              0.29,
              0.37,
            ),
        },
      );

      this.y -=
        14;
    }

    this.y -=
      4;
  }

  labelValue(
    label:
      string,

    value:
      string,
  ) {
    this.ensureSpace(
      18,
    );

    this.page.drawText(
      `${safeText(
        label,
      )}:`,
      {
        x:
          MARGIN,

        y:
          this.y,

        size:
          8.5,

        font:
          this.bold,

        color:
          rgb(
            0.30,
            0.35,
            0.43,
          ),
      },
    );

    const labelWidth =
      this.bold.widthOfTextAtSize(
        `${safeText(
          label,
        )}: `,
        8.5,
      );

    this.page.drawText(
      safeText(
        value,
      ),
      {
        x:
          MARGIN +
          labelWidth,

        y:
          this.y,

        size:
          8.5,

        font:
          this.regular,

        color:
          rgb(
            0.18,
            0.22,
            0.29,
          ),
      },
    );

    this.y -=
      15;
  }

  divider() {
    this.ensureSpace(
      12,
    );

    this.page.drawLine({
      start: {
        x:
          MARGIN,

        y:
          this.y,
      },

      end: {
        x:
          PAGE_WIDTH -
          MARGIN,

        y:
          this.y,
      },

      thickness:
        0.6,

      color:
        rgb(
          0.88,
          0.90,
          0.93,
        ),
    });

    this.y -=
      14;
  }

  metricRow(
    items:
      {
        label:
          string;

        value:
          string;
      }[],
  ) {
    this.ensureSpace(
      50,
    );

    const gap =
      8;

    const width =
      (
        CONTENT_WIDTH -
        gap *
          (
            items.length -
            1
          )
      ) /
      items.length;

    items.forEach(
      (
        item,
        index,
      ) => {
        const x =
          MARGIN +
          index *
            (
              width +
              gap
            );

        this.page.drawRectangle({
          x,

          y:
            this.y -
            34,

          width,

          height:
            42,

          color:
            rgb(
              0.96,
              0.97,
              0.98,
            ),

          borderColor:
            rgb(
              0.88,
              0.90,
              0.93,
            ),

          borderWidth:
            0.6,
        });

        this.page.drawText(
          safeText(
            item.value,
          ),
          {
            x:
              x +
              9,

            y:
              this.y -
              8,

            size:
              14,

            font:
              this.bold,

            color:
              rgb(
                0.06,
                0.09,
                0.16,
              ),
          },
        );

        this.page.drawText(
          safeText(
            item.label,
          ),
          {
            x:
              x +
              9,

            y:
              this.y -
              24,

            size:
              7,

            font:
              this.bold,

            color:
              rgb(
                0.45,
                0.50,
                0.58,
              ),
          },
        );
      },
    );

    this.y -=
      52;
  }

  listItem(
    title:
      string,

    details:
      string,
  ) {
    const titleLines =
      this.wrap(
        title,
        this.bold,
        9,
        CONTENT_WIDTH -
          18,
      );

    const detailLines =
      this.wrap(
        details,
        this.regular,
        8,
        CONTENT_WIDTH -
          18,
      );

    const required =
      titleLines.length *
        12 +
      detailLines.length *
        11 +
      16;

    this.ensureSpace(
      required,
    );

    this.page.drawCircle({
      x:
        MARGIN +
        3,

      y:
        this.y +
        3,

      size:
        2.2,

      color:
        rgb(
          0.15,
          0.39,
          0.92,
        ),
    });

    for (
      const line of
      titleLines
    ) {
      this.page.drawText(
        line,
        {
          x:
            MARGIN +
            14,

          y:
            this.y,

          size:
            9,

          font:
            this.bold,

          color:
            rgb(
              0.10,
              0.14,
              0.20,
            ),
        },
      );

      this.y -=
        12;
    }

    for (
      const line of
      detailLines
    ) {
      this.page.drawText(
        line,
        {
          x:
            MARGIN +
            14,

          y:
            this.y,

          size:
            8,

          font:
            this.regular,

          color:
            rgb(
              0.42,
              0.47,
              0.55,
            ),
        },
      );

      this.y -=
        11;
    }

    this.y -=
      7;
  }
}

/* ========================================================================== */
/* GENERATE REPORT                                                            */
/* ========================================================================== */

export async function generateAccessReviewComplianceReport(
  input:
    AccessReviewComplianceReportInput,
) {
  const campaigns =
    await loadReportCampaigns(
      input,
    );

  if (
    campaigns.length ===
    0
  ) {
    throw new Error(
      "NO_REPORT_DATA",
    );
  }

  const audits =
    await loadAuditEvidence(
      campaigns,
    );

  const allItems =
    campaigns.flatMap(
      (
        campaign,
      ) =>
        campaign.items,
    );

  const pending =
    allItems.filter(
      (
        item,
      ) =>
        item.decision ===
        AccessReviewDecision.PENDING,
    );

  const certified =
    allItems.filter(
      (
        item,
      ) =>
        item.decision ===
        AccessReviewDecision.CERTIFIED,
    );

  const modified =
    allItems.filter(
      (
        item,
      ) =>
        item.decision ===
        AccessReviewDecision.MODIFIED,
    );

  const revoked =
    allItems.filter(
      (
        item,
      ) =>
        item.decision ===
        AccessReviewDecision.REVOKED,
    );

  const reviewedCount =
    certified.length +
    modified.length +
    revoked.length;

  const highTrust =
    allItems.filter(
      isHighTrustItem,
    );

  const protectedItems =
    allItems.filter(
      (
        item,
      ) =>
        item.roleProtected,
    );

  const now =
    new Date();

  const overdueCampaigns =
    campaigns.filter(
      (
        campaign,
      ) =>
        campaign.status ===
          AccessReviewCampaignStatus.ACTIVE &&
        campaign.dueAt <
          now,
    );

  const reviewers =
    buildReviewerSummary(
      campaigns,
    );

  /* ------------------------------------------------------------------------ */
  /* DOCUMENT                                                                 */
  /* ------------------------------------------------------------------------ */

  const pdf =
    await PDFDocument.create();

  const regular =
    await pdf.embedFont(
      StandardFonts.Helvetica,
    );

  const bold =
    await pdf.embedFont(
      StandardFonts.HelveticaBold,
    );

  pdf.setTitle(
    safeText(
      REPORT_TITLE,
    ),
  );

  pdf.setAuthor(
    safeText(
      SCHOOL_NAME,
    ),
  );

  pdf.setSubject(
    "Access review certification governance and compliance evidence",
  );

  pdf.setCreator(
    "Al-Azeez School Management Dashboard",
  );

  const writer =
    new CompliancePdfWriter({
      pdf,

      regular,

      bold,
    });

  /* ------------------------------------------------------------------------ */
  /* COVER / EXECUTIVE SUMMARY                                                */
  /* ------------------------------------------------------------------------ */

  writer.title(
    REPORT_TITLE,
  );

  writer.paragraph(
    input.mode ===
      "CAMPAIGN"
      ? `Formal certification evidence for the selected access review campaign.`
      : `Executive governance summary covering ${
          input.academicYear ??
          "all academic years"
        }${
          input.term
            ? ` / ${readableEnum(
                input.term,
              )}`
            : ""
        }.`,
  );

  writer.divider();

  writer.labelValue(
    "School",
    SCHOOL_NAME,
  );

  writer.labelValue(
    "Report scope",
    input.mode ===
      "CAMPAIGN"
      ? "Single certification campaign"
      : "Academic-period governance history",
  );

  writer.labelValue(
    "Academic year",
    input.mode ===
      "PERIOD"
      ? input.academicYear ??
        "All"
      : campaigns[0]
          .academicYearSnapshot ??
        "Unassigned",
  );

  writer.labelValue(
    "Term",
    input.mode ===
      "PERIOD"
      ? input.term
        ? readableEnum(
            input.term,
          )
        : "All"
      : campaigns[0]
          .termSnapshot
        ? readableEnum(
            campaigns[0]
              .termSnapshot!,
          )
        : "Unassigned",
  );

  writer.labelValue(
    "Generated",
    formatDateTime(
      now,
    ),
  );

  writer.labelValue(
    "Generated by",
    `${input.generatedBy.name}${
      input.generatedBy.role
        ? ` (${readableEnum(
            input.generatedBy
              .role,
          )})`
        : ""
    }`,
  );

  writer.section(
    "Executive Summary",
  );

  writer.metricRow([
    {
      label:
        "Campaigns",

      value:
        String(
          campaigns.length,
        ),
    },

    {
      label:
        "Assignments",

      value:
        String(
          allItems.length,
        ),
    },

    {
      label:
        "Reviewed",

      value:
        `${percentage(
          reviewedCount,
          allItems.length,
        )}%`,
    },

    {
      label:
        "Revoked",

      value:
        String(
          revoked.length,
        ),
    },
  ]);

  writer.paragraph(
    `The report contains ${campaigns.length} certification campaign${
      campaigns.length ===
      1
        ? ""
        : "s"
    }, ${allItems.length} captured role assignment${
      allItems.length ===
      1
        ? ""
        : "s"
    }, and ${reviewedCount} completed certification decision${
      reviewedCount ===
      1
        ? ""
        : "s"
    }.`,
  );

  /* ------------------------------------------------------------------------ */
  /* OUTCOMES                                                                 */
  /* ------------------------------------------------------------------------ */

  writer.section(
    "Certification Outcomes",
  );

  writer.metricRow([
    {
      label:
        "Certified",

      value:
        String(
          certified.length,
        ),
    },

    {
      label:
        "Modified",

      value:
        String(
          modified.length,
        ),
    },

    {
      label:
        "Revoked",

      value:
        String(
          revoked.length,
        ),
    },

    {
      label:
        "Pending",

      value:
        String(
          pending.length,
        ),
    },
  ]);

  writer.paragraph(
    `Of ${reviewedCount} completed decisions, ${percentage(
      certified.length,
      reviewedCount,
    )}% were certified without change, ${percentage(
      modified.length,
      reviewedCount,
    )}% required modification, and ${percentage(
      revoked.length,
      reviewedCount,
    )}% resulted in access revocation.`,
  );

  /* ------------------------------------------------------------------------ */
  /* CAMPAIGNS                                                                */
  /* ------------------------------------------------------------------------ */

  writer.section(
    "Campaign Compliance History",
  );

  for (
    const campaign of
    campaigns
  ) {
    const campaignPending =
      campaign.items.filter(
        (
          item,
        ) =>
          item.decision ===
          AccessReviewDecision.PENDING,
      ).length;

    const campaignReviewed =
      campaign.items.length -
      campaignPending;

    writer.listItem(
      `${campaign.name} - ${readableEnum(
        campaign.status,
      )}`,
      [
        `Scope: ${readableEnum(
          campaign.scope,
        )}.`,

        `Period: ${
          campaign.academicYearSnapshot ??
          "Unassigned year"
        } / ${
          campaign.termSnapshot
            ? readableEnum(
                campaign.termSnapshot,
              )
            : "Unassigned term"
        }.`,

        `Due: ${formatDate(
          campaign.dueAt,
        )}.`,

        `Progress: ${campaignReviewed}/${campaign.items.length} (${percentage(
          campaignReviewed,
          campaign.items.length,
        )}%).`,
      ].join(
        " ",
      ),
    );
  }

  /* ------------------------------------------------------------------------ */
  /* HIGH TRUST                                                               */
  /* ------------------------------------------------------------------------ */

  writer.section(
    "High-Trust & Protected Access Findings",
  );

  writer.metricRow([
    {
      label:
        "High Trust",

      value:
        String(
          highTrust.length,
        ),
    },

    {
      label:
        "Protected",

      value:
        String(
          protectedItems.length,
        ),
    },

    {
      label:
        "High-Trust Pending",

      value:
        String(
          highTrust.filter(
            (
              item,
            ) =>
              item.decision ===
              AccessReviewDecision.PENDING,
          ).length,
        ),
    },
  ]);

  if (
    highTrust.length ===
    0
  ) {
    writer.paragraph(
      "No high-trust or protected role assignments were captured in the selected report scope.",
    );
  } else {
    for (
      const item of
      highTrust
    ) {
      writer.listItem(
        `${
          item.userDisplayName ??
          item.username ??
          "Unknown user"
        } - ${item.roleName}`,
        `Role key: ${item.roleKey}. Decision: ${readableEnum(
          item.decision,
        )}. Expiry: ${
          item.expiresAt
            ? formatDateTime(
                item.expiresAt,
              )
            : "Permanent"
        }.`,
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* REVOCATIONS                                                              */
  /* ------------------------------------------------------------------------ */

  writer.section(
    "Revoked Access",
  );

  if (
    revoked.length ===
    0
  ) {
    writer.paragraph(
      "No access assignments were revoked during the selected certification scope.",
    );
  } else {
    for (
      const item of
      revoked
    ) {
      writer.listItem(
        `${
          item.userDisplayName ??
          item.username ??
          "Unknown user"
        } - ${item.roleName}`,
        `Reviewed by ${
          item.reviewedByName ??
          "Administrator"
        } on ${formatDateTime(
          item.reviewedAt,
        )}. ${
          item.reviewNote
            ? `Reason: ${item.reviewNote}`
            : "No review note was recorded."
        }`,
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* MODIFICATIONS                                                            */
  /* ------------------------------------------------------------------------ */

  writer.section(
    "Modified Access",
  );

  if (
    modified.length ===
    0
  ) {
    writer.paragraph(
      "No role assignments required modification during the selected certification scope.",
    );
  } else {
    for (
      const item of
      modified
    ) {
      writer.listItem(
        `${
          item.userDisplayName ??
          item.username ??
          "Unknown user"
        } - ${item.roleName}`,
        `Reviewed by ${
          item.reviewedByName ??
          "Administrator"
        } on ${formatDateTime(
          item.reviewedAt,
        )}. ${
          item.reviewNote
            ? `Review note: ${item.reviewNote}`
            : ""
        }`,
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* OVERDUE                                                                  */
  /* ------------------------------------------------------------------------ */

  writer.section(
    "Overdue & Open Exceptions",
  );

  if (
    overdueCampaigns.length ===
      0 &&
    pending.length ===
      0
  ) {
    writer.paragraph(
      "No overdue campaigns or unresolved certification items were identified in the selected report scope.",
    );
  }

  for (
    const campaign of
    overdueCampaigns
  ) {
    writer.listItem(
      `OVERDUE - ${campaign.name}`,
      `Due ${formatDateTime(
        campaign.dueAt,
      )}. The campaign remains ACTIVE.`,
    );
  }

  if (
    pending.length >
    0
  ) {
    writer.paragraph(
      `${pending.length} certification item${
        pending.length ===
        1
          ? ""
          : "s"
      } remain pending.`,
      {
        bold:
          true,
      },
    );
  }

  /* ------------------------------------------------------------------------ */
  /* REVIEWERS                                                                */
  /* ------------------------------------------------------------------------ */

  writer.section(
    "Reviewer Activity",
  );

  if (
    reviewers.length ===
    0
  ) {
    writer.paragraph(
      "No completed reviewer activity is recorded in this report scope.",
    );
  } else {
    for (
      const reviewer of
      reviewers
    ) {
      writer.listItem(
        reviewer.name,
        `${reviewer.reviewed} decision${
          reviewer.reviewed ===
          1
            ? ""
            : "s"
        }: ${reviewer.certified} certified, ${reviewer.modified} modified, ${reviewer.revoked} revoked.`,
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* DETAILED CERTIFICATION EVIDENCE                                          */
  /* ------------------------------------------------------------------------ */

  writer.section(
    "Detailed Certification Evidence",
  );

  for (
    const campaign of
    campaigns
  ) {
    writer.paragraph(
      campaign.name,
      {
        bold:
          true,

        size:
          11,
      },
    );

    for (
      const item of
      campaign.items
    ) {
      writer.listItem(
        `${
          item.userDisplayName ??
          item.username ??
          "Unknown user"
        } - ${item.roleName}`,
        [
          `Decision: ${readableEnum(
            item.decision,
          )}.`,

          `Source: ${readableEnum(
            item.source,
          )}.`,

          `Assigned: ${formatDateTime(
            item.assignedAt,
          )}.`,

          `Snapshot expiry: ${
            item.expiresAt
              ? formatDateTime(
                  item.expiresAt,
                )
              : "Permanent"
          }.`,

          item.reviewedAt
            ? `Reviewed ${formatDateTime(
                item.reviewedAt,
              )} by ${
                item.reviewedByName ??
                "Administrator"
              }.`
            : "Not yet reviewed.",

          item.reviewNote
            ? `Note: ${item.reviewNote}`
            : "",
        ]
          .filter(
            Boolean,
          )
          .join(
            " ",
          ),
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* AUDIT TRAIL                                                              */
  /* ------------------------------------------------------------------------ */

  writer.section(
    "Access Control Audit Evidence",
  );

  if (
    audits.length ===
    0
  ) {
    writer.paragraph(
      "No matching Access Review audit entries were found for the selected campaigns.",
    );
  } else {
    for (
      const audit of
      audits
    ) {
      writer.listItem(
        `${readableEnum(
          audit.action,
        )} - ${formatDateTime(
          audit.createdAt,
        )}`,
        `Actor: ${audit.actorName}${
          audit.actorRole
            ? ` (${readableEnum(
                audit.actorRole,
              )})`
            : ""
        }.${
          audit.reason
            ? ` Reason: ${audit.reason}`
            : ""
        }`,
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* DECLARATION                                                              */
  /* ------------------------------------------------------------------------ */

  writer.section(
    "Compliance Statement",
  );

  writer.paragraph(
    "This report is generated from the Access Review, role-assignment and Access Control audit records retained by the school management system. It represents the recorded governance state at the time of export.",
  );

  writer.paragraph(
    `Generated by ${input.generatedBy.name} on ${formatDateTime(
      now,
    )}.`,
    {
      bold:
        true,
    },
  );

  const bytes =
    await pdf.save();

  const suggestedName =
    input.mode ===
    "CAMPAIGN"
      ? `access-review-campaign-${campaigns[0].id}.pdf`
      : `access-review-compliance-${
          safeText(
            input.academicYear ??
            "all-years",
          )
            .replace(
              /\s+/g,
              "-",
            )
            .toLowerCase()
        }${
          input.term
            ? `-${safeText(
                input.term,
              )
                .replace(
                  /\s+/g,
                  "-",
                )
                .toLowerCase()}`
            : ""
        }.pdf`;

  return {
    bytes,

    filename:
      suggestedName,

    campaignIds:
      campaigns.map(
        (
          campaign,
        ) =>
          campaign.id,
      ),

    summary: {
      campaignCount:
        campaigns.length,

      assignmentCount:
        allItems.length,

      reviewedCount,

      certifiedCount:
        certified.length,

      modifiedCount:
        modified.length,

      revokedCount:
        revoked.length,

      pendingCount:
        pending.length,

      highTrustCount:
        highTrust.length,

      overdueCampaignCount:
        overdueCampaigns.length,

      auditEvidenceCount:
        audits.length,
    },
  };
}