import type {
  ReactNode,
} from "react";

import {
  requireRouteAccess,
} from "@/lib/auth";

export default async function SubjectsLayout({
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
      "academics.",
      "subjects.",
    ],
  });

  return children;
}