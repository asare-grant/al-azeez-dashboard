import type {
  ReactNode,
} from "react";

import { requireRouteAccess } from "@/lib/auth";

export default async function AdminReportCardsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRouteAccess({
  legacyRoles: [
    "admin",
    "teacher",
  ],

  permissionPrefixes: [
    "report_cards.",
  ],
});

  return children;
}