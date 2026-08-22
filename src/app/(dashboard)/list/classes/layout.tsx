import type {
  ReactNode,
} from "react";

import {
  requireRouteAccess,
} from "@/lib/auth";

export default async function ClassesLayout({
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
      "academics.",
      "classes.",
    ],
  });

  return children;
}