import type {
  ReactNode,
} from "react";

import {
  requireRouteAccess,
} from "@/lib/auth";

export default async function NotificationOperationsLayout({
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
      "notification_operations.",
    ],
  });

  return children;
}