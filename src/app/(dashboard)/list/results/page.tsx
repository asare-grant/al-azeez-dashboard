// src/app/(dashboard)/list/results/page.tsx

import { redirect } from "next/navigation";

import {
  contextHasPermission,
  getCurrentAccessContext,
} from "@/lib/access-control";

import prisma from "@/lib/prisma";

import StudentResultsPage from "@/components/results/StudentResultsPage";

import { getStudentUnifiedResults } from "@/lib/results";

export const dynamic = "force-dynamic";

export const revalidate = 0;

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default async function ResultsPage() {
  /* ------------------------------------------------------------------------ */
  /* ACCESS                                                                   */
  /* ------------------------------------------------------------------------ */

  const access = await getCurrentAccessContext();

  if (!access.authenticated || !access.userId) {
    redirect("/sign-in");
  }

  const userId = access.userId;

  const canViewResults = contextHasPermission(access, "results.view");

  const canManageResults = contextHasPermission(access, "results.manage");

  if (!canViewResults && !canManageResults) {
    redirect("/");
  }

  /* ------------------------------------------------------------------------ */
  /* MANAGEMENT WORKSPACE                                                     */
  /* ------------------------------------------------------------------------ */

  /*
   * Management authority takes precedence over
   * persona-specific result workspaces.
   *
   * This covers:
   *
   * - Administrator
   * - Academic Director
   * - Teacher
   * - future delegated roles with results.manage
   */
  if (canManageResults) {
    redirect("/list/results/manage");
  }

  /* ------------------------------------------------------------------------ */
  /* RESOLVE SCHOOL-DOMAIN IDENTITY                                           */
  /* ------------------------------------------------------------------------ */

  const [student, parent] = await Promise.all([
    prisma.student.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,

        name: true,

        surname: true,
      },
    }),

    prisma.parent.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
      },
    }),
  ]);

  /* ------------------------------------------------------------------------ */
  /* STUDENT SELF RESULTS                                                     */
  /* ------------------------------------------------------------------------ */

  if (student) {
    const [results, terms] = await Promise.all([
      getStudentUnifiedResults(),

      prisma.schoolTerm.findMany({
        select: {
          id: true,

          name: true,

          isActive: true,
        },

        orderBy: [
          {
            isActive: "desc",
          },

          {
            startDate: "desc",
          },
        ],
      }),
    ]);

    return (
      <StudentResultsPage
        studentName={`${student.name} ${student.surname}`}
        results={results}
        terms={terms}
      />
    );
  }

  /* ------------------------------------------------------------------------ */
  /* PARENT RESULTS                                                           */
  /* ------------------------------------------------------------------------ */

  if (parent) {
    redirect("/parent/results");
  }

  /* ------------------------------------------------------------------------ */
  /* NO MATCHING RESULTS PERSONA                                              */
  /* ------------------------------------------------------------------------ */

  redirect("/");
}
