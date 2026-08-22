// src/lib/access-control/audit-query.ts

import "server-only";

import {
  AccessAuditAction,
  Prisma,
} from "@prisma/client";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type AuditQueryFilters = {
  action:
    AccessAuditAction | null;

  actor:
    string | null;

  from:
    Date | null;

  to:
    Date | null;
};

/* ========================================================================== */
/* NORMALIZE SINGLE VALUE                                                     */
/* ========================================================================== */

export function getSingleQueryValue(
  value:
    | string
    | string[]
    | undefined,
) {
  if (
    Array.isArray(
      value,
    )
  ) {
    return (
      value[0] ??
      ""
    ).trim();
  }

  return (
    value ??
    ""
  ).trim();
}

/* ========================================================================== */
/* PARSE AUDIT ACTION                                                         */
/* ========================================================================== */

export function parseAuditAction(
  value:
    string,
): AccessAuditAction | null {
  if (
    !value
  ) {
    return null;
  }

  const actions =
    Object.values(
      AccessAuditAction,
    );

  return actions.includes(
    value as
      AccessAuditAction,
  )
    ? (
        value as
          AccessAuditAction
      )
    : null;
}

/* ========================================================================== */
/* DATE HELPERS                                                               */
/* ========================================================================== */

function parseStartDate(
  value:
    string,
) {
  if (
    !value
  ) {
    return null;
  }

  const date =
    new Date(
      `${value}T00:00:00.000`,
    );

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date;
}

function parseEndDate(
  value:
    string,
) {
  if (
    !value
  ) {
    return null;
  }

  const date =
    new Date(
      `${value}T23:59:59.999`,
    );

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date;
}

/* ========================================================================== */
/* BUILD FILTERS                                                              */
/* ========================================================================== */

export function buildAuditFilters({
  action,
  actor,
  from,
  to,
}: {
  action?:
    | string
    | string[]
    | undefined;

  actor?:
    | string
    | string[]
    | undefined;

  from?:
    | string
    | string[]
    | undefined;

  to?:
    | string
    | string[]
    | undefined;
}): AuditQueryFilters {
  const actionValue =
    getSingleQueryValue(
      action,
    );

  const actorValue =
    getSingleQueryValue(
      actor,
    );

  const fromValue =
    getSingleQueryValue(
      from,
    );

  const toValue =
    getSingleQueryValue(
      to,
    );

  return {
    action:
      parseAuditAction(
        actionValue,
      ),

    actor:
      actorValue ||
      null,

    from:
      parseStartDate(
        fromValue,
      ),

    to:
      parseEndDate(
        toValue,
      ),
  };
}

/* ========================================================================== */
/* BUILD USER AUDIT WHERE                                                     */
/* ========================================================================== */

export function buildUserAuditWhere({
  userId,
  filters,
}: {
  userId:
    string;

  filters:
    AuditQueryFilters;
}): Prisma.AccessAuditLogWhereInput {
  const AND:
    Prisma.AccessAuditLogWhereInput[] =
    [
      {
        targetUserId:
          userId,
      },
    ];

  if (
    filters.action
  ) {
    AND.push({
      action:
        filters.action,
    });
  }

  if (
    filters.actor
  ) {
    AND.push({
      OR: [
        {
          actorId:
            filters.actor,
        },

        {
          actorName: {
            contains:
              filters.actor,

            mode:
              "insensitive",
          },
        },
      ],
    });
  }

  if (
    filters.from ||
    filters.to
  ) {
    AND.push({
      createdAt: {
        ...(filters.from
          ? {
              gte:
                filters.from,
            }
          : {}),

        ...(filters.to
          ? {
              lte:
                filters.to,
            }
          : {}),
      },
    });
  }

  return {
    AND,
  };
}