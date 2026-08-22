import type {
  ReactNode,
} from "react";

import {
  requireRouteAccess,
} from "@/lib/auth";

export default async function AttendanceLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  await requireRouteAccess({
    legacyRoles: [
      "admin",
      "teacher",
      "account",
    ],

    permissionPrefixes: [
      "attendance.",
    ],
  });

  return children;
}