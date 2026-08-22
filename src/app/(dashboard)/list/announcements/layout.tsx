import type {
  ReactNode,
} from "react";

import {
  requireRouteAccess,
} from "@/lib/auth";

export default async function AnnouncementsLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  await requireRouteAccess({
    legacyRoles: [
      "admin",
      "teacher",
      "student",
      "parent",
      "account",
    ],

    permissionPrefixes: [
      "communications.",
    ],
  });

  return children;
}