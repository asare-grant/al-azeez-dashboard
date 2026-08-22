// src/app/(dashboard)/teacher/layout.tsx

import type {
  ReactNode,
} from "react";

import {
  getCurrentSchoolProfile,
} from "@/lib/users/current-school-profile";

import {
  redirect,
} from "next/navigation";

export default async function TeacherLayout({
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
    "teacher"
  ) {
    redirect(
      "/dashboard",
    );
  }

  return children;
}