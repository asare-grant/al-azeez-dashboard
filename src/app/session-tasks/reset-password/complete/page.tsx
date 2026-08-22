import {
  auth,
} from "@clerk/nextjs/server";

import {
  redirect,
} from "next/navigation";

import {
  getCurrentAccessContext,
} from "@/lib/access-control";

import {
  getRoleDashboardPath,
  normalizeAppRole,
} from "@/lib/navigation/roles";

export default async function PasswordResetCompletePage() {
  const {
    userId,
  } =
    await auth({
      treatPendingAsSignedOut:
        false,
    });

  if (
    !userId
  ) {
    redirect(
      "/sign-in",
    );
  }

  const access =
    await getCurrentAccessContext();

  /*
   * If the authenticated Clerk identity has not yet
   * been provisioned into the local RBAC system,
   * send the user to the neutral dashboard instead
   * of trusting legacy Clerk metadata.
   */
  if (
    !access.authenticated ||
    !access.provisioned ||
    !access.active
  ) {
    redirect(
      "/dashboard",
    );
  }

  /*
   * Resolve a dashboard persona from the active RBAC
   * assignments.
   *
   * Priority matters for multi-role users:
   *
   * super_admin / admin
   * teacher
   * student
   * parent
   * account
   * custom
   *
   * This keeps dashboard routing independent from
   * Clerk publicMetadata / metadata.
   */
  const dashboardRoleKey =
    access.roleKeys.has(
      "super_admin",
    )
      ? "super_admin"
      : access.roleKeys.has(
            "admin",
          )
        ? "admin"
        : access.roleKeys.has(
              "teacher",
            )
          ? "teacher"
          : access.roleKeys.has(
                "student",
              )
            ? "student"
            : access.roleKeys.has(
                  "parent",
                )
              ? "parent"
              : access.roleKeys.has(
                    "account",
                  )
                ? "account"
                : "custom";

  const role =
    normalizeAppRole(
      dashboardRoleKey,
    );

  redirect(
    getRoleDashboardPath(
      role,
    ),
  );
}