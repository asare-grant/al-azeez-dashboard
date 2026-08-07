export const APP_ROLES = [
  "admin",
  "teacher",
  "student",
  "parent",
  "account",
] as const;

export type AppRole =
  (typeof APP_ROLES)[number];

export function isAppRole(
  value: unknown,
): value is AppRole {
  return (
    typeof value === "string" &&
    APP_ROLES.includes(
      value as AppRole,
    )
  );
}

export function getRoleDashboardPath(
  role: AppRole,
): string {
  switch (role) {
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

    default:
      return "/";
  }
}