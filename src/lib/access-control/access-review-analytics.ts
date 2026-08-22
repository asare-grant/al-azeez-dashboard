// src/lib/access-control/access-review-analytics.ts

import "server-only";

import {
  AccessReviewCampaignStatus,
  AccessReviewDecision,
} from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  getCurrentAccessActor,
} from "./current-actor";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type AccessReviewAnalyticsFilters = {
  academicYear?:
    string | null;

  term?:
    string | null;

  months?:
    number;
};

export type AccessReviewGovernanceAnalytics = {
  overview: {
    totalCampaigns:
      number;

    activeCampaigns:
      number;

    completedCampaigns:
      number;

    cancelledCampaigns:
      number;

    overdueCampaigns:
      number;

    completionRate:
      number;

    averageCompletionHours:
      number | null;

    totalAssignmentsReviewed:
      number;

    pendingAssignments:
      number;
  };

  decisions: {
    certified:
      number;

    modified:
      number;

    revoked:
      number;

    pending:
      number;

    reviewed:
      number;

    total:
      number;

    certifiedRate:
      number;

    modifiedRate:
      number;

    revokedRate:
      number;
  };

  exposure: {
    highTrustItems:
      number;

    protectedItems:
      number;

    temporaryItems:
      number;

    currentlyPendingHighTrust:
      number;
  };

  reviewers: {
    reviewerId:
      string;

    reviewerName:
      string;

    totalReviews:
      number;

    certified:
      number;

    modified:
      number;

    revoked:
      number;

    averageDecisionHours:
      number | null;
  }[];

  periods: {
    key:
      string;

    academicYear:
      string;

    term:
      string;

    campaigns:
      number;

    completed:
      number;

    cancelled:
      number;

    overdue:
      number;

    reviewed:
      number;

    certified:
      number;

    modified:
      number;

    revoked:
      number;

    completionRate:
      number;
  }[];

  recentCampaigns: {
    id:
      number;

    name:
      string;

    status:
      AccessReviewCampaignStatus;

    scope:
      string;

    academicYear:
      string | null;

    term:
      string | null;

    dueAt:
      Date;

    startedAt:
      Date | null;

    completedAt:
      Date | null;

    cancelledAt:
      Date | null;

    total:
      number;

    pending:
      number;

    certified:
      number;

    modified:
      number;

    revoked:
      number;

    progress:
      number;

    overdue:
      boolean;
  }[];

  filterOptions: {
    academicYears:
      string[];

    terms:
      string[];
  };
};

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
    total <= 0
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

function average(
  values:
    number[],
) {
  if (
    values.length ===
    0
  ) {
    return null;
  }

  return (
    values.reduce(
      (
        total,
        value,
      ) =>
        total +
        value,
      0,
    ) /
    values.length
  );
}

function roundOne(
  value:
    number | null,
) {
  return value ===
    null
    ? null
    : Math.round(
        value *
          10,
      ) /
      10;
}

function readableTerm(
  value:
    string | null,
) {
  if (!value) {
    return "Unassigned Term";
  }

  return value
    .toLowerCase()
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (
        character,
      ) =>
        character.toUpperCase(),
    );
}

/* ========================================================================== */
/* MAIN QUERY                                                                 */
/* ========================================================================== */

export async function getAccessReviewGovernanceAnalytics(
  filters:
    AccessReviewAnalyticsFilters = {},
): Promise<AccessReviewGovernanceAnalytics> {
  const accessActor =
    await getCurrentAccessActor();

  if (
    !accessActor ||
    !accessActor.can(
      "access_reviews.view",
    )
  ) {
    throw new Error(
      "ACCESS_REVIEW_ANALYTICS_FORBIDDEN",
    );
  }

  const now =
    new Date();

  const months =
    Math.min(
      Math.max(
        filters.months ??
          24,
        1,
      ),
      120,
    );

  const historyStart =
    new Date(
      now,
    );

  historyStart.setMonth(
    historyStart.getMonth() -
      months,
  );

  /* ------------------------------------------------------------------------ */
  /* FILTER OPTIONS                                                           */
  /* ------------------------------------------------------------------------ */

  const periodRows =
    await prisma.accessReviewCampaign.findMany({
      select: {
        academicYearSnapshot:
          true,

        termSnapshot:
          true,
      },

      distinct: [
        "academicYearSnapshot",
        "termSnapshot",
      ],
    });

  const academicYears =
    Array.from(
      new Set(
        periodRows
          .map(
            (
              row,
            ) =>
              row.academicYearSnapshot,
          )
          .filter(
            (
              value,
            ): value is string =>
              Boolean(
                value,
              ),
          ),
      ),
    ).sort(
      (
        a,
        b,
      ) =>
        b.localeCompare(
          a,
        ),
    );

  const terms =
    Array.from(
      new Set(
        periodRows
          .map(
            (
              row,
            ) =>
              row.termSnapshot,
          )
          .filter(
            (
              value,
            ): value is string =>
              Boolean(
                value,
              ),
          ),
      ),
    );

  /* ------------------------------------------------------------------------ */
  /* CAMPAIGN DATA                                                            */
  /* ------------------------------------------------------------------------ */

  const campaigns =
    await prisma.accessReviewCampaign.findMany({
      where: {
        createdAt: {
          gte:
            historyStart,
        },

        ...(filters.academicYear
          ? {
              academicYearSnapshot:
                filters.academicYear,
            }
          : {}),

        ...(filters.term
          ? {
              termSnapshot:
                filters.term,
            }
          : {}),
      },

      include: {
        items: {
          select: {
            id:
              true,

            decision:
              true,

            assignedAt:
              true,

            expiresAt:
              true,

            roleProtected:
              true,

            roleKey:
              true,

            reviewedBy:
              true,

            reviewedByName:
              true,

            reviewedAt:
              true,
          },
        },
      },

      orderBy: {
        createdAt:
          "desc",
      },
    });

  /* ------------------------------------------------------------------------ */
  /* CAMPAIGN METRICS                                                         */
  /* ------------------------------------------------------------------------ */

  const totalCampaigns =
    campaigns.length;

  const activeCampaigns =
    campaigns.filter(
      (
        campaign,
      ) =>
        campaign.status ===
        AccessReviewCampaignStatus.ACTIVE,
    ).length;

  const completedCampaigns =
    campaigns.filter(
      (
        campaign,
      ) =>
        campaign.status ===
        AccessReviewCampaignStatus.COMPLETED,
    ).length;

  const cancelledCampaigns =
    campaigns.filter(
      (
        campaign,
      ) =>
        campaign.status ===
        AccessReviewCampaignStatus.CANCELLED,
    ).length;

  const overdueCampaigns =
    campaigns.filter(
      (
        campaign,
      ) =>
        campaign.status ===
          AccessReviewCampaignStatus.ACTIVE &&
        campaign.dueAt <
          now,
    ).length;

  /*
   * Completion rate excludes DRAFT campaigns.
   *
   * DRAFT has not entered the formal review process yet.
   *
   * Cancelled campaigns count as an initiated campaign
   * that was not completed.
   */
  const initiatedCampaigns =
    campaigns.filter(
      (
        campaign,
      ) =>
        campaign.status !==
        AccessReviewCampaignStatus.DRAFT,
    ).length;

  const completionRate =
    percentage(
      completedCampaigns,
      initiatedCampaigns,
    );

  const completionDurations =
    campaigns
      .filter(
        (
          campaign,
        ) =>
          campaign.startedAt &&
          campaign.completedAt,
      )
      .map(
        (
          campaign,
        ) =>
          (
            campaign.completedAt!
              .getTime() -
            campaign.startedAt!
              .getTime()
          ) /
          (
            1000 *
            60 *
            60
          ),
      )
      .filter(
        (
          duration,
        ) =>
          duration >= 0,
      );

  const averageCompletionHours =
    roundOne(
      average(
        completionDurations,
      ),
    );

  /* ------------------------------------------------------------------------ */
  /* DECISION METRICS                                                         */
  /* ------------------------------------------------------------------------ */

  const allItems =
    campaigns.flatMap(
      (
        campaign,
      ) =>
        campaign.items,
    );

  const certified =
    allItems.filter(
      (
        item,
      ) =>
        item.decision ===
        AccessReviewDecision.CERTIFIED,
    ).length;

  const modified =
    allItems.filter(
      (
        item,
      ) =>
        item.decision ===
        AccessReviewDecision.MODIFIED,
    ).length;

  const revoked =
    allItems.filter(
      (
        item,
      ) =>
        item.decision ===
        AccessReviewDecision.REVOKED,
    ).length;

  const pending =
    allItems.filter(
      (
        item,
      ) =>
        item.decision ===
        AccessReviewDecision.PENDING,
    ).length;

  const reviewed =
    certified +
    modified +
    revoked;

  const totalItems =
    allItems.length;

  /* ------------------------------------------------------------------------ */
  /* HIGH-TRUST EXPOSURE                                                      */
  /* ------------------------------------------------------------------------ */

  /*
   * Keep this list aligned with your hierarchy policy.
   *
   * Protected assignments are also considered sensitive
   * even if their key is not in this list.
   */
  const highTrustRoleKeys =
    new Set([
      "super_admin",
      "admin",
    ]);

  const highTrustItems =
    allItems.filter(
      (
        item,
      ) =>
        item.roleProtected ||
        highTrustRoleKeys.has(
          item.roleKey,
        ),
    ).length;

  const protectedItems =
    allItems.filter(
      (
        item,
      ) =>
        item.roleProtected,
    ).length;

  const temporaryItems =
    allItems.filter(
      (
        item,
      ) =>
        item.expiresAt !==
        null,
    ).length;

  const currentlyPendingHighTrust =
    allItems.filter(
      (
        item,
      ) =>
        item.decision ===
          AccessReviewDecision.PENDING &&
        (
          item.roleProtected ||
          highTrustRoleKeys.has(
            item.roleKey,
          )
        ),
    ).length;

  /* ------------------------------------------------------------------------ */
  /* REVIEWER ANALYTICS                                                       */
  /* ------------------------------------------------------------------------ */

  const reviewerMap =
    new Map<
      string,
      {
        reviewerId:
          string;

        reviewerName:
          string;

        totalReviews:
          number;

        certified:
          number;

        modified:
          number;

        revoked:
          number;

        decisionHours:
          number[];
      }
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
        !item.reviewedAt ||
        item.decision ===
          AccessReviewDecision.PENDING
      ) {
        continue;
      }

      const current =
        reviewerMap.get(
          item.reviewedBy,
        ) ?? {
          reviewerId:
            item.reviewedBy,

          reviewerName:
            item.reviewedByName ??
            "Administrator",

          totalReviews:
            0,

          certified:
            0,

          modified:
            0,

          revoked:
            0,

          decisionHours:
            [],
        };

      current.totalReviews +=
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

      /*
       * Campaign start is a better clock than assignment
       * creation for certification response time.
       */
      if (
        campaign.startedAt &&
        item.reviewedAt >=
          campaign.startedAt
      ) {
        current.decisionHours.push(
          (
            item.reviewedAt.getTime() -
            campaign.startedAt.getTime()
          ) /
            (
              1000 *
              60 *
              60
            ),
        );
      }

      reviewerMap.set(
        item.reviewedBy,
        current,
      );
    }
  }

  const reviewers =
    Array.from(
      reviewerMap.values(),
    )
      .map(
        (
          reviewer,
        ) => ({
          reviewerId:
            reviewer.reviewerId,

          reviewerName:
            reviewer.reviewerName,

          totalReviews:
            reviewer.totalReviews,

          certified:
            reviewer.certified,

          modified:
            reviewer.modified,

          revoked:
            reviewer.revoked,

          averageDecisionHours:
            roundOne(
              average(
                reviewer.decisionHours,
              ),
            ),
        }),
      )
      .sort(
        (
          a,
          b,
        ) =>
          b.totalReviews -
          a.totalReviews,
      );

  /* ------------------------------------------------------------------------ */
  /* PERIOD HISTORY                                                           */
  /* ------------------------------------------------------------------------ */

  type PeriodBucket = {
    key:
      string;

    academicYear:
      string;

    term:
      string;

    campaigns:
      number;

    completed:
      number;

    cancelled:
      number;

    overdue:
      number;

    reviewed:
      number;

    certified:
      number;

    modified:
      number;

    revoked:
      number;

    initiated:
      number;
  };

  const periodMap =
    new Map<
      string,
      PeriodBucket
    >();

  for (
    const campaign of
    campaigns
  ) {
    const academicYear =
      campaign.academicYearSnapshot ??
      "Unassigned Academic Year";

    const term =
      readableTerm(
        campaign.termSnapshot,
      );

    const key =
      `${academicYear}::${term}`;

    const current =
      periodMap.get(
        key,
      ) ?? {
        key,

        academicYear,

        term,

        campaigns:
          0,

        completed:
          0,

        cancelled:
          0,

        overdue:
          0,

        reviewed:
          0,

        certified:
          0,

        modified:
          0,

        revoked:
          0,

        initiated:
          0,
      };

    current.campaigns +=
      1;

    if (
      campaign.status !==
      AccessReviewCampaignStatus.DRAFT
    ) {
      current.initiated +=
        1;
    }

    if (
      campaign.status ===
      AccessReviewCampaignStatus.COMPLETED
    ) {
      current.completed +=
        1;
    }

    if (
      campaign.status ===
      AccessReviewCampaignStatus.CANCELLED
    ) {
      current.cancelled +=
        1;
    }

    if (
      campaign.status ===
        AccessReviewCampaignStatus.ACTIVE &&
      campaign.dueAt <
        now
    ) {
      current.overdue +=
        1;
    }

    for (
      const item of
      campaign.items
    ) {
      if (
        item.decision ===
        AccessReviewDecision.CERTIFIED
      ) {
        current.certified +=
          1;

        current.reviewed +=
          1;
      }

      if (
        item.decision ===
        AccessReviewDecision.MODIFIED
      ) {
        current.modified +=
          1;

        current.reviewed +=
          1;
      }

      if (
        item.decision ===
        AccessReviewDecision.REVOKED
      ) {
        current.revoked +=
          1;

        current.reviewed +=
          1;
      }
    }

    periodMap.set(
      key,
      current,
    );
  }

  const periods =
    Array.from(
      periodMap.values(),
    ).map(
      (
        period,
      ) => ({
        key:
          period.key,

        academicYear:
          period.academicYear,

        term:
          period.term,

        campaigns:
          period.campaigns,

        completed:
          period.completed,

        cancelled:
          period.cancelled,

        overdue:
          period.overdue,

        reviewed:
          period.reviewed,

        certified:
          period.certified,

        modified:
          period.modified,

        revoked:
          period.revoked,

        completionRate:
          percentage(
            period.completed,
            period.initiated,
          ),
      }),
    );

  /* ------------------------------------------------------------------------ */
  /* RECENT CAMPAIGNS                                                         */
  /* ------------------------------------------------------------------------ */

  const recentCampaigns =
    campaigns
      .slice(
        0,
        12,
      )
      .map(
        (
          campaign,
        ) => {
          const campaignCertified =
            campaign.items.filter(
              (
                item,
              ) =>
                item.decision ===
                AccessReviewDecision.CERTIFIED,
            ).length;

          const campaignModified =
            campaign.items.filter(
              (
                item,
              ) =>
                item.decision ===
                AccessReviewDecision.MODIFIED,
            ).length;

          const campaignRevoked =
            campaign.items.filter(
              (
                item,
              ) =>
                item.decision ===
                AccessReviewDecision.REVOKED,
            ).length;

          const campaignPending =
            campaign.items.filter(
              (
                item,
              ) =>
                item.decision ===
                AccessReviewDecision.PENDING,
            ).length;

          const campaignReviewed =
            campaignCertified +
            campaignModified +
            campaignRevoked;

          return {
            id:
              campaign.id,

            name:
              campaign.name,

            status:
              campaign.status,

            scope:
              campaign.scope,

            academicYear:
              campaign.academicYearSnapshot,

            term:
              campaign.termSnapshot,

            dueAt:
              campaign.dueAt,

            startedAt:
              campaign.startedAt,

            completedAt:
              campaign.completedAt,

            cancelledAt:
              campaign.cancelledAt,

            total:
              campaign.items.length,

            pending:
              campaignPending,

            certified:
              campaignCertified,

            modified:
              campaignModified,

            revoked:
              campaignRevoked,

            progress:
              percentage(
                campaignReviewed,
                campaign.items.length,
              ),

            overdue:
              campaign.status ===
                AccessReviewCampaignStatus.ACTIVE &&
              campaign.dueAt <
                now,
          };
        },
      );

  return {
    overview: {
      totalCampaigns,

      activeCampaigns,

      completedCampaigns,

      cancelledCampaigns,

      overdueCampaigns,

      completionRate,

      averageCompletionHours,

      totalAssignmentsReviewed:
        reviewed,

      pendingAssignments:
        pending,
    },

    decisions: {
      certified,

      modified,

      revoked,

      pending,

      reviewed,

      total:
        totalItems,

      certifiedRate:
        percentage(
          certified,
          reviewed,
        ),

      modifiedRate:
        percentage(
          modified,
          reviewed,
        ),

      revokedRate:
        percentage(
          revoked,
          reviewed,
        ),
    },

    exposure: {
      highTrustItems,

      protectedItems,

      temporaryItems,

      currentlyPendingHighTrust,
    },

    reviewers,

    periods,

    recentCampaigns,

    filterOptions: {
      academicYears,

      terms,
    },
  };
}