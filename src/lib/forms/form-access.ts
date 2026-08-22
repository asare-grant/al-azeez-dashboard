// src/lib/forms/form-access.ts

import type {
  FormContainerProps,
} from "@/components/FormContainer";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type FormPermissionKey =
  | "teachers.create"
  | "teachers.update"
  | "teachers.delete"
  | "students.create"
  | "students.update"
  | "students.delete"
  | "parents.create"
  | "parents.update"
  | "parents.delete"
  | "academics.subjects.manage"
  | "academics.classes.manage"
  | "academics.lessons.manage"
  | "exams.manage"
  | "assignments.manage"
  | "results.manage"
  | "attendance.record"
  | "attendance.modify"
  | "communications.events.manage"
  | "communications.announcements.manage"
  | "finance.structure.manage"
  | "finance.invoices.manage"
  | "finance.payments.record"
  | "finance.payments.modify";

type Table =
  FormContainerProps["table"];

type Operation =
  FormContainerProps["type"];

/* ========================================================================== */
/* RESOLVE                                                                    */
/* ========================================================================== */

export function getFormRequiredPermission({
  table,
  type,
}: {
  table:
    Table;

  type:
    Operation;
}): FormPermissionKey | null {
  switch (
    table
  ) {
    /* ---------------------------------------------------------------------- */
    /* PEOPLE                                                                 */
    /* ---------------------------------------------------------------------- */

    case "teacher":
      if (
        type ===
        "create"
      ) {
        return "teachers.create";
      }

      if (
        type ===
        "update"
      ) {
        return "teachers.update";
      }

      return "teachers.delete";

    case "student":
      if (
        type ===
        "create"
      ) {
        return "students.create";
      }

      if (
        type ===
        "update"
      ) {
        return "students.update";
      }

      return "students.delete";

    case "parent":
      if (
        type ===
        "create"
      ) {
        return "parents.create";
      }

      if (
        type ===
        "update"
      ) {
        return "parents.update";
      }

      return "parents.delete";

    /* ---------------------------------------------------------------------- */
    /* ACADEMICS                                                              */
    /* ---------------------------------------------------------------------- */

    case "subject":
      return "academics.subjects.manage";

    case "class":
      return "academics.classes.manage";

    case "lesson":
      return "academics.lessons.manage";

    case "exam":
      return "exams.manage";

    case "assignment":
      return "assignments.manage";

    case "result":
      return "results.manage";

    /* ---------------------------------------------------------------------- */
    /* ATTENDANCE                                                             */
    /* ---------------------------------------------------------------------- */

    case "attendance":
      return type ===
        "create"
        ? "attendance.record"
        : "attendance.modify";

    /* ---------------------------------------------------------------------- */
    /* COMMUNICATIONS                                                         */
    /* ---------------------------------------------------------------------- */

    case "event":
      return "communications.events.manage";

    case "announcement":
      return "communications.announcements.manage";

    /* ---------------------------------------------------------------------- */
    /* FINANCE STRUCTURE                                                      */
    /* ---------------------------------------------------------------------- */

    case "fee-category":
    case "fee-type":
    case "fee-structure":
      return "finance.structure.manage";

    /* ---------------------------------------------------------------------- */
    /* FINANCE INVOICES                                                       */
    /* ---------------------------------------------------------------------- */

    case "fee":
    case "fee-master":
      return "finance.invoices.manage";

    /* ---------------------------------------------------------------------- */
    /* PAYMENTS                                                               */
    /* ---------------------------------------------------------------------- */

    case "fee-payment":
      return type ===
        "create"
        ? "finance.payments.record"
        : "finance.payments.modify";

    default:
      return null;
  }
}