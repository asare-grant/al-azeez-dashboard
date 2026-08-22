// src/lib/finance/auth.ts

import "server-only";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

/* ========================================================================== */
/* PERMISSIONS                                                                */
/* ========================================================================== */

export type FinancePermission =
  | "finance.dashboard.view"
  | "finance.invoices.view"
  | "finance.invoices.manage"
  | "finance.payments.record"
  | "finance.payments.modify"
  | "finance.structure.manage"
  | "finance.reports.view"
  | "finance.statements.generate"
  | "finance.reminders.send";

/* ========================================================================== */
/* CONTEXT                                                                    */
/* ========================================================================== */

export type FinanceActorContext = {
  userId:
    string;

  actorRole:
    string | null;

  actorName:
    string | null;
};

/* ========================================================================== */
/* REQUIRE FINANCE PERMISSION                                                 */
/* ========================================================================== */

export async function requireFinancePermission(
  permission:
    FinancePermission,
): Promise<FinanceActorContext> {
  const accessActor =
    await getCurrentAccessActor();

  if (
    !accessActor
  ) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  if (
    !accessActor.can(
      permission,
    )
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  /*
   * Prefer the active RBAC role that actually
   * supplied the requested Finance permission.
   */
  const grantingAssignment =
    accessActor.activeAssignments.find(
      (
        assignment,
      ) =>
        assignment.role.permissions.some(
          (
            rolePermission,
          ) =>
            rolePermission
              .permission
              .isActive &&
            rolePermission
              .permission
              .key
              .trim()
              .toLowerCase() ===
              permission,
        ),
    );

  const actorRole =
    grantingAssignment
      ?.role.key
      ?.trim()
      .toLowerCase() ??
    accessActor.actor
      .legacyRole
      ?.trim()
      .toLowerCase() ??
    null;

  const actorName =
    accessActor.actor
      .displayName
      ?.trim() ||
    accessActor.actor
      .username
      ?.trim() ||
    accessActor.actor
      .email
      ?.trim() ||
    "Finance Officer";

  return {
    userId:
      accessActor.actor.id,

    actorRole,

    actorName,
  };
}