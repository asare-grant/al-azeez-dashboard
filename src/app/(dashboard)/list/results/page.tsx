import {
  redirect,
} from "next/navigation";

import {
  auth,
} from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

import StudentResultsPage from "@/components/results/StudentResultsPage"

import {
  getStudentUnifiedResults,
} from "@/lib/results";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export default async function ResultsPage() {
  const {
    userId,
    sessionClaims,
  } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  /*
   * Student results centre
   */
  if (role === "student") {
    const [
      student,
      results,
      terms,
    ] = await Promise.all([
      prisma.student.findUnique({
        where: {
          id: userId,
        },

        select: {
          name: true,
          surname: true,
        },
      }),

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

    if (!student) {
      redirect("/student");
    }

    return (
      <StudentResultsPage
        studentName={`${student.name} ${student.surname}`}
        results={results}
        terms={terms}
      />
    );
  }

  /*
   * Dedicated parent results centre
   */
  if (role === "parent") {
    redirect(
      "/parent/results",
    );
  }

  /*
   * Teacher and administrator command centre
   */
  if (
    role === "teacher" ||
    role === "admin"
  ) {
    redirect(
      "/list/results/manage",
    );
  }

  redirect("/");
}