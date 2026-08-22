// src/lib/navigation/roles.ts

/* ========================================================================== */
/* APPLICATION PERSONA                                                        */
/* ========================================================================== */

export type AppRole =
  | "super_admin"
  | "admin"
  | "teacher"
  | "student"
  | "parent"
  | "account"
  | "custom";

/* ========================================================================== */
/* APPLICATION ROLE GUARD                                                     */
/* ========================================================================== */

export function isAppRole(
  value:
    unknown,
): value is AppRole {
  return (
    value ===
      "super_admin" ||
    value ===
      "admin" ||
    value ===
      "teacher" ||
    value ===
      "student" ||
    value ===
      "parent" ||
    value ===
      "account" ||
    value ===
      "custom"
  );
}

/* ========================================================================== */
/* NORMALIZE                                                                  */
/* ========================================================================== */

export function normalizeAppRole(
  value:
    string | null | undefined,
): AppRole {
  const role =
    value
      ?.trim()
      .toLowerCase();

  switch (
    role
  ) {
    case "super_admin":
      return "super_admin";

    case "admin":
      return "admin";

    case "teacher":
      return "teacher";

    case "student":
      return "student";

    case "parent":
      return "parent";

    case "account":
      return "account";

    default:
      return "custom";
  }
}

/* ========================================================================== */
/* DASHBOARD                                                                  */
/* ========================================================================== */

export function getRoleDashboardPath(
  role:
    AppRole,
) {
  switch (
    role
  ) {
    case "super_admin":
    case "admin":
      return "/admin";

    case "teacher":
      return "/teacher";

    case "student":
      return "/student";

    case "parent":
      return "/parent";

    case "account":
      return "/account";

    case "custom":
    default:
      return "/dashboard";
  }
}

/* ========================================================================== */
/* ROLE GROUPS                                                                */
/* ========================================================================== */

export function isAdministrativeRole(
  role:
    AppRole,
) {
  return (
    role ===
      "admin" ||
    role ===
      "super_admin"
  );
}




export function formatRoleLabel(
  role: string | null | undefined,
) {
  if (!role) {
    return "User";
  }

  return role
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}