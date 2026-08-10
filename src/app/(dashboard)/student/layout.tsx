import type {
  ReactNode,
} from "react";

import {
  requireRouteRole,
} from "@/lib/auth/route-permissions";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRouteRole([
    "student",
  ]);

  return children;
}