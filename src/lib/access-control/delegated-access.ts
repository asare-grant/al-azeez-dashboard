import "server-only";

import prisma from "@/lib/prisma";

import {
  getCurrentAccessActor,
  getRoleTrustLevel,
} from "@/lib/access-control";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type DelegatedAccessStatus =
  | "ALL"
  | "ACTIVE"
  | "EXPIRING"
  | "EXPIRED";

export type DelegatedAccessWindow =
  | "ALL"
  | "24H"
  | "3D"
  | "7D"
  | "30D";

export type DelegatedAccessTrust =
  | "ALL"
  | "STANDARD"
  | "HIGH";

export type DelegatedAccessSort =
  | "EXPIRY_ASC"
  | "EXPIRY_DESC"
  | "ASSIGNED_DESC"
  | "USER_ASC"
  | "ROLE_ASC";

export type GetDelegatedAccessInput = {
  page?: number;

  pageSize?: number;

  search?: string;

  status?:
    DelegatedAccessStatus;

  window?:
    DelegatedAccessWindow;

  trust?:
    DelegatedAccessTrust;

  sort?:
    DelegatedAccessSort;
};

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function addDays(
  date: Date,
  days: number,
) {
  return new Date(
    date.getTime() +
      days *
        24 *
        60 *
        60 *
        1000,
  );
}

function normalizeStatus(
  value:
    string | undefined,
): DelegatedAccessStatus {
  return value === "ACTIVE" ||
    value === "EXPIRING" ||
    value === "EXPIRED"
    ? value
    : "ALL";
}

function normalizeWindow(
  value:
    string | undefined,
): DelegatedAccessWindow {
  return value === "24H" ||
    value === "3D" ||
    value === "7D" ||
    value === "30D"
    ? value
    : "ALL";
}

function normalizeTrust(
  value:
    string | undefined,
): DelegatedAccessTrust {
  return value === "STANDARD" ||
    value === "HIGH"
    ? value
    : "ALL";
}

function normalizeSort(
  value:
    string | undefined,
): DelegatedAccessSort {
  return value ===
      "EXPIRY_DESC" ||
    value ===
      "ASSIGNED_DESC" ||
    value ===
      "USER_ASC" ||
    value ===
      "ROLE_ASC"
    ? value
    : "EXPIRY_ASC";
}

function getWindowEnd({
  now,
  window,
}: {
  now: Date;

  window:
    DelegatedAccessWindow;
}) {
  switch (window) {
    case "24H":
      return new Date(
        now.getTime() +
          24 *
            60 *
            60 *
            1000,
      );

    case "3D":
      return addDays(
        now,
        3,
      );

    case "7D":
      return addDays(
        now,
        7,
      );

    case "30D":
      return addDays(
        now,
        30,
      );

    default:
      return null;
  }
}

/* ========================================================================== */
/* GOVERNANCE DATA                                                            */
/* ========================================================================== */

export async function getDelegatedAccessGovernance({
  page = 1,
  pageSize = 12,
  search,
  status,
  window,
  trust,
  sort,
}: GetDelegatedAccessInput = {}) {
  const accessActor =
    await getCurrentAccessActor();

  if (!accessActor) {
    throw new Error(
      "Unauthorized",
    );
  }

  /*
   * This page contains privileged access-management data.
   *
   * During the current migration period, legacy Admins retain
   * access through getCurrentAccessActor().legacyAdmin.
   */
  const mayView =
    accessActor.legacyAdmin ||
    accessActor.permissions.has(
      "roles.assign",
    ) ||
    accessActor.permissions.has(
      "roles.remove",
    ) ||
    accessActor.permissions.has(
      "roles.manage_expiry",
    );

  if (!mayView) {
    throw new Error(
      "Forbidden",
    );
  }

  const now =
    new Date();

  const sevenDays =
    addDays(
      now,
      7,
    );

  const safeStatus =
    normalizeStatus(
      status,
    );

  const safeWindow =
    normalizeWindow(
      window,
    );

  const safeTrust =
    normalizeTrust(
      trust,
    );

  const safeSort =
    normalizeSort(
      sort,
    );

  const safePage =
    Math.max(
      1,
      Math.floor(
        page,
      ),
    );

  const safePageSize =
    Math.min(
      50,
      Math.max(
        5,
        Math.floor(
          pageSize,
        ),
      ),
    );

  const normalizedSearch =
    search
      ?.trim()
      .slice(
        0,
        100,
      ) ?? "";

  /* ------------------------------------------------------------------------ */
  /* ALL TEMPORARY ASSIGNMENTS                                                */
  /* ------------------------------------------------------------------------ */

  const rawAssignments =
    await prisma.userRoleAssignment.findMany({
      where: {
        expiresAt: {
          not:
            null,
        },

        ...(normalizedSearch
          ? {
              OR: [
                {
                  user: {
                    displayName: {
                      contains:
                        normalizedSearch,

                      mode:
                        "insensitive",
                    },
                  },
                },

                {
                  user: {
                    username: {
                      contains:
                        normalizedSearch,

                      mode:
                        "insensitive",
                    },
                  },
                },

                {
                  user: {
                    email: {
                      contains:
                        normalizedSearch,

                      mode:
                        "insensitive",
                    },
                  },
                },

                {
                  role: {
                    name: {
                      contains:
                        normalizedSearch,

                      mode:
                        "insensitive",
                    },
                  },
                },

                {
                  role: {
                    key: {
                      contains:
                        normalizedSearch,

                      mode:
                        "insensitive",
                    },
                  },
                },
              ],
            }
          : {}),
      },

      select: {
        id:
          true,

        source:
          true,

        assignedBy:
          true,

        assignedAt:
          true,

        expiresAt:
          true,

        userId:
          true,

        roleId:
          true,

        user: {
          select: {
            id:
              true,

            displayName:
              true,

            username:
              true,

            email:
              true,

            imageUrl:
              true,

            status:
              true,

            legacyRole:
              true,

            roles: {
              select: {
                expiresAt:
                  true,

                role: {
                  select: {
                    key:
                      true,

                    isActive:
                      true,

                    isProtected:
                      true,
                  },
                },
              },
            },
          },
        },

        role: {
          select: {
            id:
              true,

            key:
              true,

            name:
              true,

            description:
              true,

            type:
              true,

            isProtected:
              true,

            isActive:
              true,

            _count: {
              select: {
                permissions:
                  true,

                assignments:
                  true,
              },
            },
          },
        },
      },
    });

  /* ------------------------------------------------------------------------ */
  /* NORMALIZE                                                               */
  /* ------------------------------------------------------------------------ */

  const normalized =
    rawAssignments
      .filter(
        (
          assignment,
        ): assignment is typeof assignment & {
          expiresAt:
            Date;
        } =>
          assignment.expiresAt !==
          null,
      )
      .map(
        (
          assignment,
        ) => {
          const expiresAt =
            assignment.expiresAt;

          const expired =
            expiresAt <=
            now;

          const active =
            !expired &&
            assignment.role
              .isActive &&
            assignment.user
              .status ===
              "ACTIVE";

          const expiringSoon =
            !expired &&
            expiresAt <=
              sevenDays;

          const trustLevel =
            getRoleTrustLevel(
              assignment.role,
            );

          const highTrust =
            trustLevel >=
            800;

          const millisecondsRemaining =
            expiresAt.getTime() -
            now.getTime();

          return {
            ...assignment,

            expired,

            active,

            expiringSoon,

            highTrust,

            trustLevel,

            millisecondsRemaining,
          };
        },
      );

  /* ------------------------------------------------------------------------ */
  /* METRICS — ALWAYS GLOBAL FOR TEMPORARY ACCESS                             */
  /* ------------------------------------------------------------------------ */

  const metrics = {
    totalTemporary:
      normalized.length,

    activeTemporary:
      normalized.filter(
        (
          item,
        ) =>
          item.active,
      ).length,

    expiringSoon:
      normalized.filter(
        (
          item,
        ) =>
          item.active &&
          item.expiringSoon,
      ).length,

    urgent24Hours:
      normalized.filter(
        (
          item,
        ) =>
          item.active &&
          item.expiresAt <=
            new Date(
              now.getTime() +
                24 *
                  60 *
                  60 *
                  1000,
            ),
      ).length,

    expired:
      normalized.filter(
        (
          item,
        ) =>
          item.expired,
      ).length,

    highTrust:
      normalized.filter(
        (
          item,
        ) =>
          item.highTrust &&
          !item.expired,
      ).length,
  };

  /* ------------------------------------------------------------------------ */
  /* FILTERS                                                                 */
  /* ------------------------------------------------------------------------ */

  const windowEnd =
    getWindowEnd({
      now,

      window:
        safeWindow,
    });

  let filtered =
    normalized.filter(
      (
        item,
      ) => {
        if (
          safeStatus ===
            "ACTIVE" &&
          !item.active
        ) {
          return false;
        }

        if (
          safeStatus ===
            "EXPIRING" &&
          !(
            item.active &&
            item.expiringSoon
          )
        ) {
          return false;
        }

        if (
          safeStatus ===
            "EXPIRED" &&
          !item.expired
        ) {
          return false;
        }

        if (
          safeTrust ===
            "HIGH" &&
          !item.highTrust
        ) {
          return false;
        }

        if (
          safeTrust ===
            "STANDARD" &&
          item.highTrust
        ) {
          return false;
        }

        if (
          windowEnd &&
          !(
            !item.expired &&
            item.expiresAt >
              now &&
            item.expiresAt <=
              windowEnd
          )
        ) {
          return false;
        }

        return true;
      },
    );

  /* ------------------------------------------------------------------------ */
  /* SORT                                                                     */
  /* ------------------------------------------------------------------------ */

  filtered =
    filtered.sort(
      (
        a,
        b,
      ) => {
        switch (
          safeSort
        ) {
          case "EXPIRY_DESC":
            return (
              b.expiresAt.getTime() -
              a.expiresAt.getTime()
            );

          case "ASSIGNED_DESC":
            return (
              b.assignedAt.getTime() -
              a.assignedAt.getTime()
            );

          case "USER_ASC":
            return (
              (
                a.user.displayName ??
                a.user.username ??
                ""
              ).localeCompare(
                b.user.displayName ??
                  b.user.username ??
                  "",
              )
            );

          case "ROLE_ASC":
            return a.role.name.localeCompare(
              b.role.name,
            );

          default:
            return (
              a.expiresAt.getTime() -
              b.expiresAt.getTime()
            );
        }
      },
    );

  /* ------------------------------------------------------------------------ */
  /* PAGINATION                                                               */
  /* ------------------------------------------------------------------------ */

  const total =
    filtered.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total /
          safePageSize,
      ),
    );

  const resolvedPage =
    Math.min(
      safePage,
      totalPages,
    );

  const start =
    (
      resolvedPage -
      1
    ) *
    safePageSize;

  const assignments =
    filtered.slice(
      start,
      start +
        safePageSize,
    );

  return {
    assignments,

    metrics,

    filters: {
      search:
        normalizedSearch,

      status:
        safeStatus,

      window:
        safeWindow,

      trust:
        safeTrust,

      sort:
        safeSort,
    },

    pagination: {
      page:
        resolvedPage,

      pageSize:
        safePageSize,

      total,

      totalPages,

      hasPrevious:
        resolvedPage >
        1,

      hasNext:
        resolvedPage <
        totalPages,
    },
  };
}