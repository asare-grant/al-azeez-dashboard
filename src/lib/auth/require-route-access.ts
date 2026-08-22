// src/lib/auth/require-route-access.ts

import "server-only";

import {
  redirect,
} from "next/navigation";

import {
  getCurrentAccessContext,
} from "@/lib/access-control";

import {
  getCurrentSchoolProfile,
} from "@/lib/users/current-school-profile";

import {
  getRoleDashboardPath,
} from "@/lib/navigation/roles";

import type {
  AppRole,
} from "@/lib/navigation/roles";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type RouteAccessRequirement = {
  /*
   * Transitional compatibility for the original
   * application personas.
   *
   * Example:
   *
   * ["admin", "teacher"]
   *
   * Super Admin automatically inherits legacy Admin
   * route access.
   */
  legacyRoles?:
    readonly AppRole[];

  /*
   * Grant access when ANY exact permission is effective.
   */
  anyPermissions?:
    readonly string[];

  /*
   * Grant access when ALL exact permissions are effective.
   */
  allPermissions?:
    readonly string[];

  /*
   * Grant access when the user has any effective
   * permission belonging to one of these permission
   * domains.
   *
   * Example:
   *
   * ["assessments."]
   *
   * matches:
   *
   * assessments.view
   * assessments.create
   * assessments.update
   */
  permissionPrefixes?:
    readonly string[];

  /*
   * Where an authenticated but unauthorized user should
   * be sent.
   *
   * If omitted, the universal /dashboard resolver is used.
   */
  unauthorizedRedirect?:
    string;
};

export type RouteAccessResult = {
  userId:
    string;

  role:
    AppRole;

  roleKey:
    string;

  permissions:
    ReadonlySet<string>;
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
/* LEGACY ROLE ACCESS                                                         */
/* ========================================================================== */

function hasLegacyRoleAccess({
  role,
  allowedRoles,
}: {
  role:
    AppRole;

  allowedRoles:
    readonly AppRole[];
}) {
  if (
    allowedRoles.includes(
      role,
    )
  ) {
    return true;
  }

  /*
   * Super Admin is a superset of the old Admin persona.
   *
   * This prevents every legacy route declaration from
   * requiring:
   *
   * ["admin", "super_admin"]
   */
  if (
    role ===
      "super_admin" &&
    allowedRoles.includes(
      "admin",
    )
  ) {
    return true;
  }

  return false;
}

/* ========================================================================== */
/* PREFIX ACCESS                                                              */
/* ========================================================================== */

function hasPermissionPrefix({
  permissions,
  prefixes,
}: {
  permissions:
    ReadonlySet<string>;

  prefixes:
    readonly string[];
}) {
  if (
    prefixes.length ===
    0
  ) {
    return false;
  }

  const normalizedPrefixes =
    prefixes
      .map(
        normalize,
      )
      .filter(
        Boolean,
      );

  for (
    const permission of
    permissions
  ) {
    const normalizedPermission =
      normalize(
        permission,
      );

    if (
      normalizedPrefixes.some(
        (
          prefix,
        ) =>
          normalizedPermission.startsWith(
            prefix,
          ),
      )
    ) {
      return true;
    }
  }

  return false;
}

/* ========================================================================== */
/* REQUIRE ROUTE ACCESS                                                       */
/* ========================================================================== */

export async function requireRouteAccess(
  requirement:
    RouteAccessRequirement,
): Promise<RouteAccessResult> {
  const [
    profile,
    context,
  ] =
    await Promise.all([
      getCurrentSchoolProfile(),

      getCurrentAccessContext(),
    ]);

  /* ------------------------------------------------------------------------ */
  /* AUTHENTICATION                                                           */
  /* ------------------------------------------------------------------------ */

  if (
    !profile ||
    !context.authenticated
  ) {
    redirect(
      "/sign-in",
    );
  }

  /* ------------------------------------------------------------------------ */
  /* ACCOUNT STATE                                                            */
  /* ------------------------------------------------------------------------ */

  /*
   * Suspended / disabled accounts must never regain
   * application authority merely because role assignments
   * still exist historically.
   */
  if (
    !context.active
  ) {
    redirect(
      "/sign-in",
    );
  }

  const permissions =
    new Set(
      Array.from(
        context.permissions,
      ).map(
        normalize,
      ),
    );

  /* ------------------------------------------------------------------------ */
  /* REQUIREMENTS                                                             */
  /* ------------------------------------------------------------------------ */

  const legacyRoles =
    requirement
      .legacyRoles ??
    [];

  const anyPermissions =
    requirement
      .anyPermissions
      ?.map(
        normalize,
      ) ??
    [];

  const allPermissions =
    requirement
      .allPermissions
      ?.map(
        normalize,
      ) ??
    [];

  const permissionPrefixes =
    requirement
      .permissionPrefixes ??
    [];

  /* ------------------------------------------------------------------------ */
  /* LEGACY PERSONA                                                           */
  /* ------------------------------------------------------------------------ */

  const legacyAllowed =
    legacyRoles.length >
      0 &&
    hasLegacyRoleAccess({
      role:
        profile.role,

      allowedRoles:
        legacyRoles,
    });

  /* ------------------------------------------------------------------------ */
  /* ANY PERMISSION                                                           */
  /* ------------------------------------------------------------------------ */

  const anyPermissionAllowed =
    anyPermissions.length >
      0 &&
    anyPermissions.some(
      (
        permission,
      ) =>
        permissions.has(
          permission,
        ),
    );

  /* ------------------------------------------------------------------------ */
  /* ALL PERMISSIONS                                                          */
  /* ------------------------------------------------------------------------ */

  const allPermissionsAllowed =
    allPermissions.length >
      0 &&
    allPermissions.every(
      (
        permission,
      ) =>
        permissions.has(
          permission,
        ),
    );

  /* ------------------------------------------------------------------------ */
  /* PERMISSION DOMAIN                                                        */
  /* ------------------------------------------------------------------------ */

  const prefixAllowed =
    permissionPrefixes.length >
      0 &&
    hasPermissionPrefix({
      permissions,

      prefixes:
        permissionPrefixes,
    });

  /* ------------------------------------------------------------------------ */
  /* NO REQUIREMENTS                                                          */
  /* ------------------------------------------------------------------------ */

  /*
   * Calling this helper with no authorization rules is
   * considered invalid.
   *
   * We fail closed rather than accidentally granting
   * authenticated users access.
   */
  const hasRequirement =
    legacyRoles.length >
      0 ||
    anyPermissions.length >
      0 ||
    allPermissions.length >
      0 ||
    permissionPrefixes.length >
      0;

  const allowed =
    hasRequirement &&
    (
      legacyAllowed ||
      anyPermissionAllowed ||
      allPermissionsAllowed ||
      prefixAllowed
    );

  if (
    !allowed
  ) {
    redirect(
      requirement
        .unauthorizedRedirect ??
        "/dashboard",
    );
  }

  return {
    userId:
      profile.id,

    role:
      profile.role,

    roleKey:
      profile.roleKey,

    permissions,
  };
}