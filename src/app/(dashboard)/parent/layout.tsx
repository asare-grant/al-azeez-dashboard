// src/app/(dashboard)/parent/layout.tsx

import type {
  ReactNode,
} from "react";

import {
  getCurrentSchoolProfile,
} from "@/lib/users/current-school-profile";

import {
  redirect,
} from "next/navigation";

export default async function ParentLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  const profile =
    await getCurrentSchoolProfile();

  if (!profile) {
    redirect(
      "/sign-in",
    );
  }

  if (
    profile.role !==
    "parent"
  ) {
    redirect(
      "/dashboard",
    );
  }

  return children;
}