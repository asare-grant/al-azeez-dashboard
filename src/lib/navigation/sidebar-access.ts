// src/lib/navigation/sidebar-access.ts

import type {
  AppRole,
} from "./roles";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type SidebarAccessRule = {
  /**
   * Persona-based navigation.
   *
   * Use this ONLY when the user's actual domain identity
   * is relevant to the navigation experience.
   *
   * Examples:
   *
   * student
   * teacher
   * parent
   *
   * Do NOT use this as a substitute for RBAC authorization
   * of administrative workspaces.
   */
  personas?:
    readonly AppRole[];

  /**
   * Any effective permission beginning with one of these
   * prefixes grants visibility.
   *
   * Examples:
   *
   * students.
   * finance.
   * assessments.
   */
  permissionPrefixes?:
    readonly string[];

  /**
   * Any one of these exact permission keys grants
   * visibility.
   */
  anyPermissions?:
    readonly string[];

  /**
   * Every exact permission listed here must be present.
   */
  allPermissions?:
    readonly string[];

  /**
   * Universal authenticated navigation.
   *
   * Examples:
   *
   * Dashboard
   * Notification Centre
   * Personal Profile
   */
  authenticated?:
    boolean;
};

/* ========================================================================== */
/* NORMALIZE                                                                  */
/* ========================================================================== */

function normalize(
  value:
    string,
) {
  return value
    .trim()
    .toLowerCase();
}

/* ========================================================================== */
/* ACCESS                                                                     */
/* ========================================================================== */

export function canSeeSidebarItem({
  role,
  permissions,
  rule,
}: {
  role:
    AppRole;

  permissions:
    ReadonlySet<string>;

  rule:
    SidebarAccessRule;
}) {
  /* ------------------------------------------------------------------------ */
  /* UNIVERSAL AUTHENTICATED ITEM                                             */
  /* ------------------------------------------------------------------------ */

  if (
    rule.authenticated
  ) {
    return true;
  }

  /* ------------------------------------------------------------------------ */
  /* DOMAIN PERSONA                                                           */
  /* ------------------------------------------------------------------------ */

  /*
   * Persona visibility is deliberately separate from
   * administrative authorization.
   *
   * This is suitable for things such as:
   *
   * Student personal workspace
   * Teacher personal workspace
   * Parent personal workspace
   *
   * It should NOT be used to grant Admin/Super Admin
   * access to management workspaces.
   */
  if (
    rule.personas
      ?.includes(
        role,
      )
  ) {
    return true;
  }

  /* ------------------------------------------------------------------------ */
  /* EXACT ANY-PERMISSION                                                     */
  /* ------------------------------------------------------------------------ */

  if (
    rule.anyPermissions
      ?.some(
        (
          permission,
        ) =>
          permissions.has(
            normalize(
              permission,
            ),
          ),
      )
  ) {
    return true;
  }

  /* ------------------------------------------------------------------------ */
  /* EXACT ALL-PERMISSIONS                                                    */
  /* ------------------------------------------------------------------------ */

  if (
    rule.allPermissions &&
    rule.allPermissions.length >
      0 &&
    rule.allPermissions.every(
      (
        permission,
      ) =>
        permissions.has(
          normalize(
            permission,
          ),
        ),
    )
  ) {
    return true;
  }

  /* ------------------------------------------------------------------------ */
  /* PERMISSION DOMAIN                                                        */
  /* ------------------------------------------------------------------------ */

  if (
    rule.permissionPrefixes
      ?.some(
        (
          prefix,
        ) => {
          const normalizedPrefix =
            normalize(
              prefix,
            );

          for (
            const permission of
            permissions
          ) {
            if (
              normalize(
                permission,
              ).startsWith(
                normalizedPrefix,
              )
            ) {
              return true;
            }
          }

          return false;
        },
      )
  ) {
    return true;
  }

  return false;
}