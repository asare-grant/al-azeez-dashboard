import type {
  ReactNode,
} from "react";

import {
  requireRouteAccess,
} from "@/lib/auth";

export default async function AssignmentsLayout({
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
    ],

    permissionPrefixes: [
      "assignments.",
      "academics.",
    ],
  });

  return children;
}