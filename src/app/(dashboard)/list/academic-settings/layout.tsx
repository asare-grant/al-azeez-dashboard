// src/app/(dashboard)/list/academic-settings/layout.tsx

import type {
  ReactNode,
} from "react";

import {
  requireRouteAccess,
} from "@/lib/auth";

export default async function AcademicSettingsLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  await requireRouteAccess({
    legacyRoles: [
      "admin",
    ],

    permissionPrefixes: [
      "settings.",
      "academics.",
      "report_cards.",
    ],
  });

  return children;
}