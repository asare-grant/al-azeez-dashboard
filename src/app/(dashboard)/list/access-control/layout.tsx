import type {
  ReactNode,
} from "react";

import {
  requireRouteAccess,
} from "@/lib/auth";

export default async function AccessControlLayout({
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
      "users.",
      "roles.",
      "permissions.",
      "access_reviews.",
    ],
  });

  return children;
}