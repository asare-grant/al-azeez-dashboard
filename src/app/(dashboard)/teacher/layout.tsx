import type {
  ReactNode,
} from "react";

import {
  requireRouteRole,
} from "@/lib/auth/route-permissions";

export default async function TeacherLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRouteRole([
    "teacher",
    "admin",
  ]);

  return children;
}