import type {
  ReactNode,
} from "react";

import {
  requireRouteAccess,
} from "@/lib/auth";

export default async function ExamsLayout({
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
      "exams.",
    ],
  });

  return children;
}