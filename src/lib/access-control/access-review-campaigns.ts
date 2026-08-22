import "server-only";

import {
  AccessAuditAction,
  AccessReviewCampaignStatus,
  AccessReviewScope,
  Prisma,
} from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  getAccountTrustLevel,
  getCurrentAccessActor,
  getRoleTrustLevel,
} from "@/lib/access-control";

/* ========================================================================== */
/* CONSTANTS                                                                  */
/* ========================================================================== */

const PRIVILEGED_TRUST_LEVEL = 800;

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type CreateAccessReviewCampaignInput = {
  name: string;

  description?: string | null;

  scope: AccessReviewScope;

  dueAt: Date;
};

export type CreateAccessReviewCampaignResult = {
  campaignId: number;

  itemCount: number;

  privilegedCount: number;

  temporaryCount: number;

  highTrustCount: number;
};

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function normalizeText(value: string | null | undefined, maxLength: number) {
  const normalized = value?.trim().slice(0, maxLength) ?? "";

  return normalized || null;
}

/* ========================================================================== */
/* SUPER-ADMIN AUTHORIZATION                                                  */
/* ========================================================================== */

async function requireAccessReviewCreator() {
  const accessActor = await getCurrentAccessActor();

  if (!accessActor) {
    throw new AccessReviewCampaignError(
      "You must be signed in to create an access review campaign.",
      401,
      "UNAUTHENTICATED",
    );
  }

  if (!accessActor.can("access_reviews.create")) {
    throw new AccessReviewCampaignError(
      "You do not have permission to create access review campaigns.",
      403,
      "MISSING_PERMISSION",
    );
  }

  const actorTrust = getAccountTrustLevel(accessActor.actor);

  /*
   * Campaign creation is intentionally restricted
   * to Super-Admin-level authority.
   *
   * In the current hierarchy:
   *
   * super_admin = 1000
   * admin       = 800
   */
  if (actorTrust < 1000) {
    throw new AccessReviewCampaignError(
      "Access review campaigns may only be created by Super Admin authority.",
      403,
      "SUPER_ADMIN_REQUIRED",
    );
  }

  return {
    accessActor,
    actor: accessActor.actor,
    actorTrust,
  };
}

/* ========================================================================== */
/* CAMPAIGN ERROR                                                             */
/* ========================================================================== */

export class AccessReviewCampaignError extends Error {
  status: number;

  code: string;

  constructor(message: string, status = 400, code = "ACCESS_REVIEW_ERROR") {
    super(message);

    this.name = "AccessReviewCampaignError";

    this.status = status;

    this.code = code;
  }
}

/* ========================================================================== */
/* CREATE CAMPAIGN                                                            */
/* ========================================================================== */

export async function createAccessReviewCampaign(
  input: CreateAccessReviewCampaignInput,
): Promise<CreateAccessReviewCampaignResult> {
  const { actor, actorTrust } = await requireAccessReviewCreator();

  /* ------------------------------------------------------------------------ */
  /* VALIDATE                                                                 */
  /* ------------------------------------------------------------------------ */

  const name = normalizeText(input.name, 120);

  if (!name) {
    throw new AccessReviewCampaignError(
      "Campaign name is required.",
      400,
      "CAMPAIGN_NAME_REQUIRED",
    );
  }

  const description = normalizeText(input.description, 1000);

  const now = new Date();

  /* ------------------------------------------------------------------------ */
  /* ACADEMIC PERIOD SNAPSHOT                                                 */
  /* ------------------------------------------------------------------------ */

  const activeTerm = await prisma.schoolTerm.findFirst({
    where: {
      isActive: true,
    },

    select: {
      name: true,

      academicYear: {
        select: {
          name: true,
        },
      },
    },

    orderBy: {
      startDate: "desc",
    },
  });

  const academicYearSnapshot = activeTerm?.academicYear?.name ?? null;

  const termSnapshot = activeTerm?.name ?? null;

  const minimumDueAt = new Date(now.getTime() + 60 * 60 * 1000);

  if (Number.isNaN(input.dueAt.getTime()) || input.dueAt <= minimumDueAt) {
    throw new AccessReviewCampaignError(
      "The campaign due date must be at least one hour in the future.",
      400,
      "INVALID_DUE_DATE",
    );
  }

  const maximumDueAt = new Date(now.getTime() + 366 * 24 * 60 * 60 * 1000);

  if (input.dueAt > maximumDueAt) {
    throw new AccessReviewCampaignError(
      "An access review campaign cannot remain open for more than one year.",
      400,
      "DUE_DATE_TOO_FAR",
    );
  }

  /* ------------------------------------------------------------------------ */
  /* LOAD CURRENT EFFECTIVE ASSIGNMENTS                                       */
  /* ------------------------------------------------------------------------ */

  const assignments = await prisma.userRoleAssignment.findMany({
    where: {
      user: {
        status: "ACTIVE",
      },

      role: {
        isActive: true,
      },

      OR: [
        {
          expiresAt: null,
        },

        {
          expiresAt: {
            gt: now,
          },
        },
      ],
    },

    include: {
      user: {
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      },

      role: true,
    },

    orderBy: [
      {
        role: {
          name: "asc",
        },
      },

      {
        user: {
          displayName: "asc",
        },
      },
    ],
  });

  /* ------------------------------------------------------------------------ */
  /* RESOLVE CAMPAIGN SCOPE                                                   */
  /* ------------------------------------------------------------------------ */

  const scopedAssignments = assignments.filter((assignment) => {
    const roleTrust = getRoleTrustLevel(assignment.role);

    const privileged =
      roleTrust >= PRIVILEGED_TRUST_LEVEL || assignment.role.isProtected;

    const temporary = assignment.expiresAt !== null;

    switch (input.scope) {
      case AccessReviewScope.PRIVILEGED:
        return privileged;

      case AccessReviewScope.TEMPORARY:
        return temporary;

      case AccessReviewScope.PRIVILEGED_AND_TEMPORARY:
        return privileged || temporary;

      case AccessReviewScope.ALL_ASSIGNMENTS:
        return true;

      default:
        return false;
    }
  });

  if (scopedAssignments.length === 0) {
    throw new AccessReviewCampaignError(
      "No currently effective role assignments match the selected review scope.",
      409,
      "NO_ASSIGNMENTS_IN_SCOPE",
    );
  }

  /* ------------------------------------------------------------------------ */
  /* METRICS                                                                  */
  /* ------------------------------------------------------------------------ */

  let privilegedCount = 0;

  let temporaryCount = 0;

  let highTrustCount = 0;

  for (const assignment of scopedAssignments) {
    const trustLevel = getRoleTrustLevel(assignment.role);

    if (trustLevel >= PRIVILEGED_TRUST_LEVEL || assignment.role.isProtected) {
      privilegedCount += 1;
    }

    if (assignment.expiresAt) {
      temporaryCount += 1;
    }

    if (trustLevel >= PRIVILEGED_TRUST_LEVEL) {
      highTrustCount += 1;
    }
  }

  /* ------------------------------------------------------------------------ */
  /* CREATE CAMPAIGN + SNAPSHOT ITEMS + AUDIT                                 */
  /* ------------------------------------------------------------------------ */

  const campaign = await prisma.$transaction(async (tx) => {
    const createdCampaign = await tx.accessReviewCampaign.create({
      data: {
        name,

        description,

        status: AccessReviewCampaignStatus.DRAFT,

        scope: input.scope,

        dueAt: input.dueAt,

        createdBy: actor.id,

        academicYearSnapshot,

        termSnapshot,

        createdByName:
          actor.displayName ??
          actor.username ??
          actor.email ??
          "Super Administrator",
      },
    });

    await tx.accessReviewItem.createMany({
      data: scopedAssignments.map((assignment) => ({
        campaignId: createdCampaign.id,

        assignmentId: assignment.id,

        userId: assignment.userId,

        roleId: assignment.roleId,

        userDisplayName: assignment.user.displayName,

        username: assignment.user.username,

        roleName: assignment.role.name,

        roleKey: assignment.role.key,

        roleType: assignment.role.type,

        roleProtected: assignment.role.isProtected,

        assignedAt: assignment.assignedAt,

        expiresAt: assignment.expiresAt,

        source: assignment.source,
      })),
    });

    await tx.accessAuditLog.create({
      data: {
        action: AccessAuditAction.ACCESS_REVIEW_CAMPAIGN_CREATED,

        actorId: actor.id,

        actorName:
          actor.displayName ??
          actor.username ??
          actor.email ??
          "Super Administrator",

        actorRole: actor.legacyRole,

        reason: description,

        metadata: {
          source: "ACCESS_REVIEW_CREATE_CAMPAIGN",

          campaign: {
            id: createdCampaign.id,

            name,

            scope: input.scope,

            dueAt: input.dueAt.toISOString(),

            academicPeriod: {
              academicYear: academicYearSnapshot,

              term: termSnapshot,
            },

            status: AccessReviewCampaignStatus.DRAFT,
          },

          snapshot: {
            itemCount: scopedAssignments.length,

            privilegedCount,

            temporaryCount,

            highTrustCount,
          },

          actorTrust,
        } satisfies Prisma.InputJsonValue,
      },
    });

    return createdCampaign;
  });

  return {
    campaignId: campaign.id,

    itemCount: scopedAssignments.length,

    privilegedCount,

    temporaryCount,

    highTrustCount,
  };
}
