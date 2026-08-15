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

const allPermissions =
  ["*"];

export const systemRoles:
  SystemRoleDefinition[] = [
    {
      key:
        "super_admin",

      name:
        "Super Administrator",

      description:
        "Platform-level school administrator with unrestricted access.",

      protected:
        true,

      permissions:
        allPermissions,
    },

    {
      key:
        "admin",

      name:
        "Administrator",

      description:
        "Full day-to-day school administration and academic operations.",

      protected:
        true,

      permissions: [
        "*",
      ],
    },

    {
      key:
        "academic_director",

      name:
        "Academic Director",

      description:
        "Academic leadership, teachers, classes, assessments and report oversight.",

      protected:
        false,

      permissions: [
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

        "communications.events.view",
        "communications.events.manage",

        "communications.announcements.view",
        "communications.announcements.manage",

        "communications.notifications.view",
      ],
    },

    {
      key:
        "teacher",

      name:
        "Teacher",

      description:
        "Teaching, classroom, assessment, attendance and report-card responsibilities.",

      protected:
        true,

      permissions: [
        "students.view",

        "academics.subjects.view",
        "academics.classes.view",
        "academics.lessons.view",

        "exams.view",

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

        "communications.events.view",

        "communications.announcements.view",

        "communications.notifications.view",
      ],
    },

    {
      key:
        "accountant",

      name:
        "Accountant / Bursar",

      description:
        "School finance, billing, payments, statements and finance reporting.",

      protected:
        false,

      permissions: [
        "students.view",
        "parents.view",

        "finance.dashboard.view",

        "finance.invoices.view",
        "finance.invoices.manage",

        "finance.payments.record",
        "finance.payments.modify",

        "finance.structure.manage",

        "finance.reports.view",

        "finance.statements.generate",

        "finance.reminders.send",

        "communications.notifications.view",
      ],
    },

    {
      key:
        "admissions_officer",

      name:
        "Admissions Officer",

      description:
        "Student and parent onboarding and enrolment administration.",

      protected:
        false,

      permissions: [
        "students.view",
        "students.create",
        "students.update",

        "parents.view",
        "parents.create",
        "parents.update",

        "academics.classes.view",

        "communications.notifications.view",
      ],
    },

    {
      key:
        "secretary",

      name:
        "School Secretary",

      description:
        "Front-office records, communications and general administrative support.",

      protected:
        false,

      permissions: [
        "students.view",

        "teachers.view",

        "parents.view",

        "academics.classes.view",

        "communications.events.view",
        "communications.events.manage",

        "communications.announcements.view",
        "communications.announcements.manage",

        "communications.notifications.view",
      ],
    },

    {
      key:
        "student",

      name:
        "Student",

      description:
        "Student access to personal academic information.",

      protected:
        true,

      permissions: [
        "academics.lessons.view",

        "exams.view",

        "assignments.view",

        "results.view",

        "assessments.view",

        "attendance.view",

        "report_cards.view",

        "communications.events.view",

        "communications.announcements.view",

        "communications.notifications.view",
      ],
    },

    {
      key:
        "parent",

      name:
        "Parent / Guardian",

      description:
        "Parent access to linked children's academic and financial information.",

      protected:
        true,

      permissions: [
        "academics.lessons.view",

        "assignments.view",

        "results.view",

        "assessments.view",

        "attendance.view",

        "report_cards.view",

        "finance.invoices.view",

        "finance.statements.generate",

        "communications.events.view",

        "communications.announcements.view",

        "communications.notifications.view",
      ],
    },

    {
      key:
        "auditor",

      name:
        "Auditor / Read Only",

      description:
        "Read-only access to selected administrative and financial records.",

      protected:
        false,

      permissions: [
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
      ],
    },
  ];