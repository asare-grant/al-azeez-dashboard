// src/lib/access-control/system-roles.ts

import {
  permissionCatalogue,
} from "./permission-catalogue";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type SystemRoleDefinition = {
  key:
    string;

  name:
    string;

  description:
    string;

  protected:
    boolean;

  permissions:
    string[];
};

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

const ALL_PERMISSION_KEYS =
  permissionCatalogue.map(
    (
      permission,
    ) =>
      permission.key,
  );

function unique(
  permissions:
    readonly string[],
) {
  return Array.from(
    new Set(
      permissions.map(
        (
          permission,
        ) =>
          permission
            .trim()
            .toLowerCase(),
      ),
    ),
  );
}

/* ========================================================================== */
/* SHARED AUTHENTICATED CAPABILITIES                                          */
/* ========================================================================== */

const COMMON_SIGNED_IN_PERMISSIONS = [
  "communications.events.view",
  "communications.announcements.view",
  "communications.notifications.view",
  "communications.messages.view",
] as const;

/* ========================================================================== */
/* SYSTEM / DEFAULT ROLES                                                     */
/* ========================================================================== */

export const systemRoles:
  SystemRoleDefinition[] = [
  /* ------------------------------------------------------------------------ */
  /* SUPER ADMIN                                                              */
  /* ------------------------------------------------------------------------ */

  {
    key:
      "super_admin",

    name:
      "Super Administrator",

    description:
      "Platform-level school administrator with unrestricted access.",

    protected:
      true,

    /*
     * Super Admin automatically receives every permission
     * currently defined in the permission catalogue.
     */
    permissions:
      [...ALL_PERMISSION_KEYS],
  },

  /* ------------------------------------------------------------------------ */
  /* ADMIN                                                                    */
  /* ------------------------------------------------------------------------ */

  {
    key:
      "admin",

    name:
      "Administrator",

    description:
      "Full day-to-day school administration and academic operations.",

    protected:
      true,

    permissions:
      unique([
        /* USERS */
        "users.view",
        "users.create",
        "users.update",
        "users.disable",
        "users.manage_status",
        "users.reset_password",

        /* ROLES & PERMISSIONS */
        "roles.view",
        "roles.manage",
        "roles.assign",
        "roles.remove",
        "roles.manage_expiry",

        "permissions.manage",

        /* STUDENTS */
        "students.view",
        "students.create",
        "students.update",
        "students.delete",

        /* TEACHERS */
        "teachers.view",
        "teachers.create",
        "teachers.update",
        "teachers.delete",

        /* PARENTS */
        "parents.view",
        "parents.create",
        "parents.update",
        "parents.delete",

        /* ACADEMICS */
        "academics.subjects.view",
        "academics.subjects.manage",

        "academics.classes.view",
        "academics.classes.manage",

        "academics.lessons.view",
        "academics.lessons.manage",

        /* EXAMS */
        "exams.view",
        "exams.manage",

        /* ASSIGNMENTS */
        "assignments.view",
        "assignments.manage",

        /* RESULTS */
        "results.view",
        "results.manage",

        /* ASSESSMENTS */
        "assessments.view",
        "assessments.create",
        "assessments.publish",
        "assessments.grade",

        /* ATTENDANCE */
        "attendance.view",
        "attendance.record",
        "attendance.modify",
        "attendance.report",

        /* REPORT CARDS */
        "report_cards.view",
        "report_cards.generate",
        "report_cards.edit",
        "report_cards.submit",
        "report_cards.review",
        "report_cards.publish",
        "report_cards.settings",

        /* FINANCE */
        "finance.dashboard.view",
        "finance.invoices.view",
        "finance.invoices.manage",
        "finance.payments.record",
        "finance.payments.modify",
        "finance.structure.manage",
        "finance.reports.view",
        "finance.statements.generate",
        "finance.reminders.send",

        /* COMMUNICATIONS */
        "communications.events.view",
        "communications.events.manage",

        "communications.announcements.view",
        "communications.announcements.manage",

        "communications.notifications.view",

        "communications.messages.view",
        "communications.messages.send",
        "communications.messages.manage",

        /* NOTIFICATION OPERATIONS */
        "notification_operations.view",
        "notification_operations.policy.manage",
        "notification_operations.analytics.view",
        "notification_operations.scheduler.run",

        /* SETTINGS */
        "settings.view",
        "settings.manage",

        /* AUDIT */
        "audit.view",

        /*
         * Admin can inspect formal review governance,
         * but the most sensitive certification powers
         * remain Super-Admin level by default.
         */
        "access_reviews.view",
      ]),
  },

  /* ------------------------------------------------------------------------ */
  /* ACADEMIC DIRECTOR                                                        */
  /* ------------------------------------------------------------------------ */

  {
    key:
      "academic_director",

    name:
      "Academic Director",

    description:
      "Academic leadership, teachers, classes, assessments and report oversight.",

    protected:
      false,

    permissions:
      unique([
        ...COMMON_SIGNED_IN_PERMISSIONS,

        "students.view",

        "teachers.view",

        "parents.view",

        "academics.subjects.view",
        "academics.subjects.manage",

        "academics.classes.view",
        "academics.classes.manage",

        "academics.lessons.view",
        "academics.lessons.manage",

        "exams.view",
        "exams.manage",

        "assignments.view",
        "assignments.manage",

        "results.view",
        "results.manage",

        "assessments.view",
        "assessments.create",
        "assessments.publish",
        "assessments.grade",

        "attendance.view",
        "attendance.report",

        "report_cards.view",
        "report_cards.generate",
        "report_cards.review",
        "report_cards.publish",
        "report_cards.settings",

        "communications.events.manage",

        "communications.announcements.manage",

        "communications.messages.send",
      ]),
  },

  /* ------------------------------------------------------------------------ */
  /* TEACHER                                                                  */
  /* ------------------------------------------------------------------------ */

  {
    key:
      "teacher",

    name:
      "Teacher",

    description:
      "Teaching, classroom, assessment, attendance and report-card responsibilities.",

    protected:
      true,

    permissions:
      unique([
        ...COMMON_SIGNED_IN_PERMISSIONS,

        "students.view",

        "teachers.view",

        "parents.view",

        "academics.subjects.view",
        "academics.classes.view",
        "academics.lessons.view",
        "academics.lessons.manage",

        "exams.view",
        "exams.manage",

        "assignments.view",
        "assignments.manage",

        "results.view",
        "results.manage",

        "assessments.view",
        "assessments.create",
        "assessments.publish",
        "assessments.grade",

        "attendance.view",
        "attendance.record",

        "report_cards.view",
        "report_cards.edit",
        "report_cards.submit",

        "communications.messages.send",
      ]),
  },

  /* ------------------------------------------------------------------------ */
  /* ACCOUNTANT / BURSAR                                                      */
  /* ------------------------------------------------------------------------ */

  {
    key:
      "accountant",

    name:
      "Accountant / Bursar",

    description:
      "School finance, billing, payments, statements and finance reporting.",

    protected:
      false,

    permissions:
      unique([
        ...COMMON_SIGNED_IN_PERMISSIONS,

        "students.view",

        "parents.view",

        "academics.classes.view",

        "finance.dashboard.view",

        "finance.invoices.view",
        "finance.invoices.manage",

        "finance.payments.record",
        "finance.payments.modify",

        "finance.structure.manage",

        "finance.reports.view",

        "finance.statements.generate",

        "finance.reminders.send",
      ]),
  },

  /* ------------------------------------------------------------------------ */
  /* LEGACY ACCOUNT PERSONA                                                   */
  /* ------------------------------------------------------------------------ */

  {
    key:
      "account",

    name:
      "Accounts Officer",

    description:
      "Legacy finance and accounts persona retained during RBAC migration.",

    protected:
      true,

    permissions:
      unique([
        ...COMMON_SIGNED_IN_PERMISSIONS,

        "students.view",

        "parents.view",

        "academics.classes.view",

        "attendance.view",

        "finance.dashboard.view",

        "finance.invoices.view",
        "finance.invoices.manage",

        "finance.payments.record",
        "finance.payments.modify",

        "finance.reports.view",

        "finance.statements.generate",

        "finance.reminders.send",
      ]),
  },

  /* ------------------------------------------------------------------------ */
  /* ADMISSIONS OFFICER                                                       */
  /* ------------------------------------------------------------------------ */

  {
    key:
      "admissions_officer",

    name:
      "Admissions Officer",

    description:
      "Student and parent onboarding and enrolment administration.",

    protected:
      false,

    permissions:
      unique([
        ...COMMON_SIGNED_IN_PERMISSIONS,

        "students.view",
        "students.create",
        "students.update",

        "parents.view",
        "parents.create",
        "parents.update",

        "academics.classes.view",

        "communications.messages.send",
      ]),
  },

  /* ------------------------------------------------------------------------ */
  /* SECRETARY                                                                */
  /* ------------------------------------------------------------------------ */

  {
    key:
      "secretary",

    name:
      "School Secretary",

    description:
      "Front-office records, communications and general administrative support.",

    protected:
      false,

    permissions:
      unique([
        ...COMMON_SIGNED_IN_PERMISSIONS,

        "students.view",

        "teachers.view",

        "parents.view",

        "academics.classes.view",

        "communications.events.manage",

        "communications.announcements.manage",

        "communications.messages.send",
      ]),
  },

  /* ------------------------------------------------------------------------ */
  /* STUDENT                                                                  */
  /* ------------------------------------------------------------------------ */

  {
    key:
      "student",

    name:
      "Student",

    description:
      "Student access to personal academic information.",

    protected:
      true,

    permissions:
      unique([
        ...COMMON_SIGNED_IN_PERMISSIONS,

        "academics.subjects.view",
        "academics.lessons.view",

        "exams.view",

        "assignments.view",

        "results.view",

        "assessments.view",

        "attendance.view",

        "report_cards.view",
      ]),
  },

  /* ------------------------------------------------------------------------ */
  /* PARENT                                                                   */
  /* ------------------------------------------------------------------------ */

  {
    key:
      "parent",

    name:
      "Parent / Guardian",

    description:
      "Parent access to linked children's academic and financial information.",

    protected:
      true,

    permissions:
      unique([
        ...COMMON_SIGNED_IN_PERMISSIONS,

        "academics.lessons.view",

        "assignments.view",

        "results.view",

        "assessments.view",

        "attendance.view",

        "report_cards.view",

        /*
         * Parent can see the linked child's
         * fee account.
         */
        "finance.invoices.view",

        "finance.statements.generate",
      ]),
  },

  /* ------------------------------------------------------------------------ */
  /* AUDITOR                                                                  */
  /* ------------------------------------------------------------------------ */

  {
    key:
      "auditor",

    name:
      "Auditor / Read Only",

    description:
      "Read-only access to selected administrative and financial records.",

    protected:
      false,

    permissions:
      unique([
        "students.view",

        "teachers.view",

        "parents.view",

        "academics.subjects.view",
        "academics.classes.view",

        "attendance.view",
        "attendance.report",

        "report_cards.view",

        "finance.dashboard.view",
        "finance.invoices.view",
        "finance.reports.view",

        "audit.view",

        "communications.notifications.view",
      ]),
  },
];

/* ========================================================================== */
/* LOOKUP HELPERS                                                             */
/* ========================================================================== */

export function getSystemRoleDefinition(
  roleKey:
    string,
) {
  const normalized =
    roleKey
      .trim()
      .toLowerCase();

  return (
    systemRoles.find(
      (
        role,
      ) =>
        role.key ===
        normalized,
    ) ??
    null
  );
}

export function getSystemRolePermissionKeys(
  roleKey:
    string,
) {
  return (
    getSystemRoleDefinition(
      roleKey,
    )?.permissions ??
    []
  );
}