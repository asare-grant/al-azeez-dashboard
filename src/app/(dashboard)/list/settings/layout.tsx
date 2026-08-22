// src/app/(dashboard)/list/settings/layout.tsx

import type {
  ReactNode,
} from "react";

import {
  requireRouteAccess,
} from "@/lib/auth";

/* ========================================================================== */
/* SETTINGS AUTHORIZATION                                                     */
/* ========================================================================== */

export default async function SettingsLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  await requireRouteAccess({
    /* ---------------------------------------------------------------------- */
    /* LEGACY COMPATIBILITY                                                   */
    /* ---------------------------------------------------------------------- */

    legacyRoles: [
      "admin",
    ],

    /* ---------------------------------------------------------------------- */
    /* RBAC                                                                   */
    /* ---------------------------------------------------------------------- */

    permissionPrefixes: [
      "settings.",
    ],
  });

  return children;
}