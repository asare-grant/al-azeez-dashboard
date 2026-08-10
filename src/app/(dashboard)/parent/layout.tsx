import type {
  ReactNode,
} from "react";

import {
  requireRouteRole,
} from "@/lib/auth/route-permissions";

export default async function ParentLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRouteRole([
    "parent",
  ]);

  return children;
}