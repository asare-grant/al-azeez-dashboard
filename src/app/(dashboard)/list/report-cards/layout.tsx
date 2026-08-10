import type {
  ReactNode,
} from "react";

import {
  requireRouteRole,
} from "@/lib/auth/route-permissions";

export default async function AdminReportCardsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRouteRole([
    "admin",
  ]);

  return children;
}