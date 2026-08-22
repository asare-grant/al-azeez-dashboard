// src/lib/settings.ts

export const ITEM_PER_PAGE =
  10;

/* ========================================================================== */
/* LEGACY / DOMAIN PERSONAS                                                   */
/* ========================================================================== */

/*
 * IMPORTANT:
 *
 * These are not the full RBAC roles.
 *
 * They represent the broad application personas that
 * still exist while the application is transitioning
 * from route-role authorization to permission-based RBAC.
 */

export const ADMIN_PERSONAS = [
  "admin",
  "super_admin",
] as const;

export const STAFF_PERSONAS = [
  "admin",
  "super_admin",
  "teacher",
  "account",
] as const;

export const SCHOOL_PERSONAS = [
  "admin",
  "super_admin",
  "teacher",
  "student",
  "parent",
  "account",
] as const;

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type RouteAccessMap = {
  [key:
    string]:
    readonly string[];
};

/* ========================================================================== */
/* LEGACY ROUTE ACCESS                                                        */
/* ========================================================================== */

/*
 * This remains only as a transitional coarse route map.
 *
 * Sensitive authorization must continue to be enforced
 * by the RBAC checks inside pages, services and APIs.
 */

export const routeAccessMap: RouteAccessMap = {
  /* ------------------------------------------------------------------------ */
  /* DASHBOARDS                                                               */
  /* ------------------------------------------------------------------------ */

  "/admin(.*)":
    ADMIN_PERSONAS,

  "/student(.*)": [
    "student",
  ],

  "/teacher(.*)": [
    "teacher",
  ],

  "/parent(.*)": [
    "parent",
  ],

  "/account(.*)": [
    "account",
  ],

  /* ------------------------------------------------------------------------ */
  /* PEOPLE                                                                   */
  /* ------------------------------------------------------------------------ */

  "/list/teachers": [
    ...ADMIN_PERSONAS,
    "teacher",
    "account",
  ],

  "/list/students": [
    ...ADMIN_PERSONAS,
    "teacher",
    "account",
  ],

  "/list/parents": [
    ...ADMIN_PERSONAS,
    "teacher",
  ],

  /* ------------------------------------------------------------------------ */
  /* ACADEMICS                                                                */
  /* ------------------------------------------------------------------------ */

  "/list/subjects":
    ADMIN_PERSONAS,

  "/list/classes": [
    ...ADMIN_PERSONAS,
    "teacher",
    "account",
  ],

  "/list/exams": [
    ...ADMIN_PERSONAS,
    "teacher",
    "student",
    "parent",
  ],

  "/list/assignments": [
    ...ADMIN_PERSONAS,
    "teacher",
    "student",
    "parent",
  ],

  "/list/results": [
    ...ADMIN_PERSONAS,
    "teacher",
    "student",
    "parent",
  ],

  "/list/attendance": [
    ...ADMIN_PERSONAS,
    "teacher",
    "account",
  ],

  /* ------------------------------------------------------------------------ */
  /* COMMUNICATIONS                                                           */
  /* ------------------------------------------------------------------------ */

  "/list/events":
    SCHOOL_PERSONAS,

  "/list/announcements":
    SCHOOL_PERSONAS,

  /* ------------------------------------------------------------------------ */
  /* FINANCE                                                                  */
  /* ------------------------------------------------------------------------ */

  "/list/fee":
    ADMIN_PERSONAS,

  "/list/fee-category":
    ADMIN_PERSONAS,

  "/list/fee-master":
    ADMIN_PERSONAS,

  "/list/fee-report":
    ADMIN_PERSONAS,

  "/list/fee-structure":
    ADMIN_PERSONAS,

  "/list/fee-type":
    ADMIN_PERSONAS,

  "/list/feeding-fees": [
    ...ADMIN_PERSONAS,
    "account",
  ],

  "/list/bus-fees": [
    ...ADMIN_PERSONAS,
    "account",
  ],

  "/list/FinanceDashboardPage":
    ADMIN_PERSONAS,
};
