import type {
  ReactNode,
} from "react";

import {
  requireRouteAccess,
} from "@/lib/auth";

export default async function FinanceWorkspaceLayout({
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
      "finance.",
    ],
  });

  return children;
}