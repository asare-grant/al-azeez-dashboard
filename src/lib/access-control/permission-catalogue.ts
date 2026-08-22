// src/lib/access-control/permission-catalogue.ts
export type PermissionDefinition = {
  key: string;

  name: string;

  description: string;

  group: string;

  sortOrder: number;
};

export const permissionCatalogue: PermissionDefinition[] = [
  /* ---------------------------------------------------------------------- */
  /* USERS & ACCESS                                                        */
  /* ---------------------------------------------------------------------- */

  {
    key: "users.view",

    name: "View Users",

    description: "View user accounts and school identities.",

    group: "USERS_ACCESS",

    sortOrder: 10,
  },

  {
    key: "users.create",

    name: "Create Users",

    description: "Create new system user accounts.",

    group: "USERS_ACCESS",

    sortOrder: 20,
  },

  {
    key: "users.update",

    name: "Update Users",

    description: "Edit user account information.",

    group: "USERS_ACCESS",

    sortOrder: 30,
  },

  {
    key: "users.disable",

    name: "Disable Users",

    description: "Suspend or disable user access.",

    group: "USERS_ACCESS",

    sortOrder: 40,
  },

  {
    key: "users.manage_status",

    name: "Manage User Account Status",

    description: "Suspend, reactivate and disable user accounts.",

    group: "USERS_ACCESS",

    sortOrder: 42,
  },

  {
    key: "users.reset_password",

    name: "Reset User Passwords",

    description:
      "Initiate administrator-controlled password recovery and reset workflows.",

    group: "USERS_ACCESS",

    sortOrder: 44,
  },

  {
    key: "roles.view",

    name: "View Roles",

    description: "View roles and their assigned permissions.",

    group: "USERS_ACCESS",

    sortOrder: 50,
  },

  {
    key: "roles.manage",

    name: "Manage Roles",

    description: "Create, update and retire roles.",

    group: "USERS_ACCESS",

    sortOrder: 60,
  },

  {
    key: "roles.assign",

    name: "Assign Roles",

    description: "Assign access-control roles to user accounts.",

    group: "USERS_ACCESS",

    sortOrder: 62,
  },

  {
    key: "roles.remove",

    name: "Remove Roles",

    description: "Remove role assignments from user accounts.",

    group: "USERS_ACCESS",

    sortOrder: 64,
  },

  {
    key: "roles.manage_expiry",

    name: "Manage Delegated Role Expiry",

    description:
      "Create, extend, shorten, convert or expire temporary role assignments.",

    group: "USERS_ACCESS",

    sortOrder: 66,
  },

  {
    key: "permissions.manage",

    name: "Manage Role Permissions",

    description: "Grant and revoke permissions from roles.",

    group: "USERS_ACCESS",

    sortOrder: 70,
  },

  /* ---------------------------------------------------------------------- */
  /* STUDENTS                                                              */
  /* ---------------------------------------------------------------------- */

  {
    key: "students.view",

    name: "View Students",

    description: "View student profiles and enrolment information.",

    group: "STUDENTS",

    sortOrder: 100,
  },

  {
    key: "students.create",

    name: "Create Students",

    description: "Register new students.",

    group: "STUDENTS",

    sortOrder: 110,
  },

  {
    key: "students.update",

    name: "Update Students",

    description: "Edit student records.",

    group: "STUDENTS",

    sortOrder: 120,
  },

  {
    key: "students.delete",

    name: "Delete Students",

    description: "Remove student records where permitted.",

    group: "STUDENTS",

    sortOrder: 130,
  },

  /* ---------------------------------------------------------------------- */
  /* TEACHERS                                                              */
  /* ---------------------------------------------------------------------- */

  {
    key: "teachers.view",

    name: "View Teachers",

    description: "View teaching staff information.",

    group: "TEACHERS",

    sortOrder: 200,
  },

  {
    key: "teachers.create",

    name: "Create Teachers",

    description: "Register teaching staff.",

    group: "TEACHERS",

    sortOrder: 210,
  },

  {
    key: "teachers.update",

    name: "Update Teachers",

    description: "Edit teacher information.",

    group: "TEACHERS",

    sortOrder: 220,
  },

  {
    key: "teachers.delete",

    name: "Delete Teachers",

    description: "Remove teaching staff records where permitted.",

    group: "TEACHERS",

    sortOrder: 230,
  },

  /* ---------------------------------------------------------------------- */
  /* PARENTS                                                               */
  /* ---------------------------------------------------------------------- */

  {
    key: "parents.view",

    name: "View Parents",

    description: "View parent and guardian information.",

    group: "PARENTS",

    sortOrder: 300,
  },

  {
    key: "parents.create",

    name: "Create Parents",

    description: "Register parent and guardian accounts.",

    group: "PARENTS",

    sortOrder: 310,
  },

  {
    key: "parents.update",

    name: "Update Parents",

    description: "Edit parent and guardian records.",

    group: "PARENTS",

    sortOrder: 320,
  },

  {
    key: "parents.delete",

    name: "Delete Parents",

    description: "Remove parent records where permitted.",

    group: "PARENTS",

    sortOrder: 330,
  },

  /* ---------------------------------------------------------------------- */
  /* ACADEMICS                                                             */
  /* ---------------------------------------------------------------------- */

  {
    key: "academics.subjects.view",

    name: "View Subjects",

    description: "View school subjects.",

    group: "ACADEMICS",

    sortOrder: 400,
  },

  {
    key: "academics.subjects.manage",

    name: "Manage Subjects",

    description: "Create, update and remove subjects.",

    group: "ACADEMICS",

    sortOrder: 410,
  },

  {
    key: "academics.classes.view",

    name: "View Classes",

    description: "View classes and class membership.",

    group: "ACADEMICS",

    sortOrder: 420,
  },

  {
    key: "academics.classes.manage",

    name: "Manage Classes",

    description: "Create, update and configure classes.",

    group: "ACADEMICS",

    sortOrder: 430,
  },

  {
    key: "academics.lessons.view",

    name: "View Lessons",

    description: "View lessons and timetables.",

    group: "ACADEMICS",

    sortOrder: 440,
  },

  {
    key: "academics.lessons.manage",

    name: "Manage Lessons",

    description: "Create and update lessons and schedules.",

    group: "ACADEMICS",

    sortOrder: 450,
  },

  /* ---------------------------------------------------------------------- */
  /* EXAMS & ASSIGNMENTS                                                   */
  /* ---------------------------------------------------------------------- */

  {
    key: "exams.view",

    name: "View Exams",

    description: "View examination records.",

    group: "EXAMS",

    sortOrder: 500,
  },

  {
    key: "exams.manage",

    name: "Manage Exams",

    description: "Create, update and remove examinations.",

    group: "EXAMS",

    sortOrder: 510,
  },

  {
    key: "assignments.view",

    name: "View Assignments",

    description: "View assignments.",

    group: "ASSIGNMENTS",

    sortOrder: 520,
  },

  {
    key: "assignments.manage",

    name: "Manage Assignments",

    description: "Create, update and remove assignments.",

    group: "ASSIGNMENTS",

    sortOrder: 530,
  },

  {
    key: "results.view",

    name: "View Results",

    description: "View student results.",

    group: "RESULTS",

    sortOrder: 540,
  },

  {
    key: "results.manage",

    name: "Manage Results",

    description: "Create and modify academic results.",

    group: "RESULTS",

    sortOrder: 550,
  },

  /* ---------------------------------------------------------------------- */
  /* ASSESSMENTS                                                           */
  /* ---------------------------------------------------------------------- */

  {
    key: "assessments.view",

    name: "View Assessments",

    description: "View assessments and assessment activity.",

    group: "ASSESSMENTS",

    sortOrder: 600,
  },

  {
    key: "assessments.create",

    name: "Create Assessments",

    description: "Create student assessments.",

    group: "ASSESSMENTS",

    sortOrder: 610,
  },

  {
    key: "assessments.publish",

    name: "Publish Assessments",

    description: "Publish assessments to students.",

    group: "ASSESSMENTS",

    sortOrder: 620,
  },

  {
    key: "assessments.grade",

    name: "Grade Assessments",

    description: "Grade assessment attempts and provide feedback.",

    group: "ASSESSMENTS",

    sortOrder: 630,
  },

  /* ---------------------------------------------------------------------- */
  /* ATTENDANCE                                                            */
  /* ---------------------------------------------------------------------- */

  {
    key: "attendance.view",

    name: "View Attendance",

    description: "View student attendance records.",

    group: "ATTENDANCE",

    sortOrder: 700,
  },

  {
    key: "attendance.record",

    name: "Record Attendance",

    description: "Record attendance for assigned students or classes.",

    group: "ATTENDANCE",

    sortOrder: 710,
  },

  {
    key: "attendance.modify",

    name: "Modify Attendance",

    description: "Correct previously entered attendance.",

    group: "ATTENDANCE",

    sortOrder: 720,
  },

  {
    key: "attendance.report",

    name: "View Attendance Reports",

    description: "Access attendance summaries and completeness reports.",

    group: "ATTENDANCE",

    sortOrder: 730,
  },

  /* ---------------------------------------------------------------------- */
  /* REPORT CARDS                                                          */
  /* ---------------------------------------------------------------------- */

  {
    key: "report_cards.view",

    name: "View Report Cards",

    description: "View permitted report cards.",

    group: "REPORT_CARDS",

    sortOrder: 800,
  },

  {
    key: "report_cards.generate",

    name: "Generate Report Cards",

    description: "Generate report cards.",

    group: "REPORT_CARDS",

    sortOrder: 810,
  },

  {
    key: "report_cards.edit",

    name: "Edit Report Cards",

    description: "Edit draft report cards.",

    group: "REPORT_CARDS",

    sortOrder: 820,
  },

  {
    key: "report_cards.submit",

    name: "Submit Report Cards",

    description: "Submit report cards for review.",

    group: "REPORT_CARDS",

    sortOrder: 830,
  },

  {
    key: "report_cards.review",

    name: "Review Report Cards",

    description: "Review submitted report cards.",

    group: "REPORT_CARDS",

    sortOrder: 840,
  },

  {
    key: "report_cards.publish",

    name: "Publish Report Cards",

    description: "Publish approved report cards.",

    group: "REPORT_CARDS",

    sortOrder: 850,
  },

  {
    key: "report_cards.settings",

    name: "Manage Report Configuration",

    description:
      "Manage academic weighting, grading scales and report settings.",

    group: "REPORT_CARDS",

    sortOrder: 860,
  },

  /* ---------------------------------------------------------------------- */
  /* FINANCE                                                               */
  /* ---------------------------------------------------------------------- */

  {
    key: "finance.dashboard.view",

    name: "View Finance Dashboard",

    description: "View finance dashboard and summary metrics.",

    group: "FINANCE",

    sortOrder: 900,
  },

  {
    key: "finance.invoices.view",

    name: "View Invoices",

    description: "View student fee accounts and invoices.",

    group: "FINANCE",

    sortOrder: 910,
  },

  {
    key: "finance.invoices.manage",

    name: "Manage Invoices",

    description: "Generate and modify school fee invoices.",

    group: "FINANCE",

    sortOrder: 920,
  },

  {
    key: "finance.payments.record",

    name: "Record Payments",

    description: "Record payments received from students or parents.",

    group: "FINANCE",

    sortOrder: 930,
  },

  {
    key: "finance.payments.modify",

    name: "Modify Payments",

    description: "Correct existing payment records.",

    group: "FINANCE",

    sortOrder: 940,
  },

  {
    key: "finance.structure.manage",

    name: "Manage Fee Structure",

    description: "Configure fee categories, fee types and fee structures.",

    group: "FINANCE",

    sortOrder: 950,
  },

  {
    key: "finance.reports.view",

    name: "View Finance Reports",

    description: "Access financial reports and outstanding balances.",

    group: "FINANCE",

    sortOrder: 960,
  },

  {
    key: "finance.statements.generate",

    name: "Generate Fee Statements",

    description: "Generate and download fee statements.",

    group: "FINANCE",

    sortOrder: 970,
  },

  {
    key: "finance.reminders.send",

    name: "Send Fee Reminders",

    description: "Send outstanding-fee reminders to parents.",

    group: "FINANCE",

    sortOrder: 980,
  },

  /* ---------------------------------------------------------------------- */
  /* COMMUNICATIONS                                                        */
  /* ---------------------------------------------------------------------- */

  {
    key: "communications.events.view",

    name: "View Events",

    description: "View permitted school events.",

    group: "COMMUNICATIONS",

    sortOrder: 1000,
  },

  {
    key: "communications.events.manage",

    name: "Manage Events",

    description: "Create and modify school events.",

    group: "COMMUNICATIONS",

    sortOrder: 1010,
  },

  {
    key: "communications.announcements.view",

    name: "View Announcements",

    description: "View school announcements.",

    group: "COMMUNICATIONS",

    sortOrder: 1020,
  },

  {
    key: "communications.announcements.manage",

    name: "Manage Announcements",

    description: "Create and modify school announcements.",

    group: "COMMUNICATIONS",

    sortOrder: 1030,
  },

  {
    key: "communications.notifications.view",

    name: "View Notifications",

    description: "Access personal notification activity.",

    group: "COMMUNICATIONS",

    sortOrder: 1040,
  },

  {
    key: "communications.messages.view",

    name: "View Messages",

    description: "View permitted school communication messages.",

    group: "COMMUNICATIONS",

    sortOrder: 1045,
  },

  {
    key: "communications.messages.send",

    name: "Send Messages",

    description: "Send school communication messages to permitted recipients.",

    group: "COMMUNICATIONS",

    sortOrder: 1050,
  },

  {
    key: "communications.messages.manage",

    name: "Manage Messages",

    description: "Manage administrative school messaging activity.",

    group: "COMMUNICATIONS",

    sortOrder: 1060,
  },

  /* ---------------------------------------------------------------------- */
  /* NOTIFICATION OPERATIONS                                               */
  /* ---------------------------------------------------------------------- */

  {
    key: "notification_operations.view",

    name: "View Notification Operations",

    description: "View notification scheduler and delivery health.",

    group: "OPERATIONS",

    sortOrder: 1100,
  },

  {
    key: "notification_operations.policy.manage",

    name: "Manage Notification Policy",

    description: "Manage school-wide notification delivery policy.",

    group: "OPERATIONS",

    sortOrder: 1110,
  },

  {
    key: "notification_operations.analytics.view",

    name: "View Notification Analytics",

    description: "View delivery analytics and audit intelligence.",

    group: "OPERATIONS",

    sortOrder: 1120,
  },

  {
    key: "notification_operations.scheduler.run",

    name: "Run Notification Scheduler",

    description: "Manually execute scheduled notification processing.",

    group: "OPERATIONS",

    sortOrder: 1130,
  },

  /* ---------------------------------------------------------------------- */
  /* SETTINGS                                                              */
  /* ---------------------------------------------------------------------- */

  {
    key: "settings.view",

    name: "View School Settings",

    description: "View administrative school configuration.",

    group: "SETTINGS",

    sortOrder: 1200,
  },

  {
    key: "settings.manage",

    name: "Manage School Settings",

    description: "Modify school-wide configuration.",

    group: "SETTINGS",

    sortOrder: 1210,
  },

  /* ---------------------------------------------------------------------- */
  /* AUDITING                                                              */
  /* ---------------------------------------------------------------------- */

  {
    key: "audit.view",

    name: "View Audit Logs",

    description: "View security and administrative activity history.",

    group: "AUDIT",

    sortOrder: 1300,
  },
  {
    key: "access_reviews.view",
    name: "View Access Reviews",
    description:
      "View access review campaigns, assignments and certification history.",
    group: "ACCESS_CONTROL",
    sortOrder: 1300,
  },

  {
    key: "access_reviews.create",
    name: "Create Access Reviews",
    description: "Create privileged and delegated-access review campaigns.",
    group: "ACCESS_CONTROL",
    sortOrder: 1300,
  },

  {
    key: "access_reviews.manage",
    name: "Manage Access Reviews",
    description: "Start, complete or cancel access review campaigns.",
    group: "ACCESS_CONTROL",
    sortOrder: 1300,
  },

  {
    key: "access_reviews.decide",
    name: "Certify Access Reviews",
    description:
      "Certify, modify or revoke access assignments under formal review.",
    group: "ACCESS_CONTROL",
    sortOrder: 1300,
  },
  {
    key: "access_reviews.export",

    name: "Export Access Review Compliance Reports",

    description:
      "Generate and download formal access review compliance and executive governance reports.",

    group: "ACCESS_CONTROL",
    sortOrder: 1300,
  },
];
