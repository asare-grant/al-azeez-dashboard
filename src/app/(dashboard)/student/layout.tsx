// src/app/(dashboard)/student/layout.tsx

import type {
  ReactNode,
} from "react";

import {
  getCurrentSchoolProfile,
} from "@/lib/users/current-school-profile";

import {
  redirect,
} from "next/navigation";

export default async function StudentLayout({
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
    "student"
  ) {
    redirect(
      "/dashboard",
    );
  }

  return children;
}