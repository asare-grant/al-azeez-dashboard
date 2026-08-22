// src/app/(dashboard)/dashboard/page.tsx

import {
  redirect,
} from "next/navigation";

import {
  auth,
} from "@clerk/nextjs/server";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function normalizeRole(
  value:
    unknown,
) {
  return typeof value ===
    "string"
    ? value
        .trim()
        .toLowerCase()
    : "";
}

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default async function DashboardGatewayPage() {
  const {
    userId,
    sessionClaims,
  } =
    await auth();

  if (
    !userId
  ) {
    redirect(
      "/sign-in",
    );
  }

  const rawRole =
    (
      sessionClaims
        ?.publicMetadata as
        | {
            role?:
              unknown;
          }
        | undefined
    )?.role ??
    (
      sessionClaims
        ?.metadata as
        | {
            role?:
              unknown;
          }
        | undefined
    )?.role;

  const role =
    normalizeRole(
      rawRole,
    );

  /* ------------------------------------------------------------------------ */
  /* STANDARD SCHOOL PERSONAS                                                 */
  /* ------------------------------------------------------------------------ */

  switch (
    role
  ) {
    case "student":
      redirect(
        "/student",
      );

    case "teacher":
      redirect(
        "/teacher",
      );

    case "parent":
      redirect(
        "/parent",
      );

    case "account":
      redirect(
        "/account",
      );

    case "admin":
    case "super_admin":
      redirect(
        "/admin",
      );
  }

  /* ------------------------------------------------------------------------ */
  /* RBAC / CUSTOM ROLE                                                       */
  /* ------------------------------------------------------------------------ */

  /*
   * For future custom roles, do NOT invent a dashboard
   * path from the role name.
   *
   * Instead inspect the user's effective permissions and
   * send them to the strongest relevant workspace.
   */
  const accessActor =
    await getCurrentAccessActor();

  if (
    accessActor
      ?.can(
        "access_reviews.view",
      )
  ) {
    redirect(
      "/list/access-control/reviews",
    );
  }

  if (
    accessActor
      ?.can(
        "roles.assign",
      ) ||
    accessActor
      ?.can(
        "roles.remove",
      ) ||
    accessActor
      ?.can(
        "users.update",
      ) ||
    accessActor
      ?.can(
        "users.manage_status",
      )
  ) {
    redirect(
      "/list/access-control",
    );
  }

  /*
   * Authenticated but not yet granted an application
   * workspace.
   *
   * The profile page remains a safe universal landing
   * destination while an administrator assigns RBAC.
   */
  redirect(
    "/profile",
  );
}