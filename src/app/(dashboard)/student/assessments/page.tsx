import {
  notFound,
} from "next/navigation";

import prisma from "@/lib/prisma";

import {
  getStudentAssessmentDashboard,
} from "@/lib/assessments/queries";

import {
  requireAssessmentStudent,
} from "@/lib/assessments/auth";

import {
  StudentAssessmentDashboard,
} from "@/components/assessments/student-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StudentAssessmentsPage() {
  const { userId } =
    await requireAssessmentStudent();

  const [dashboardData, student] =
    await Promise.all([
      getStudentAssessmentDashboard(),

      prisma.student.findUnique({
        where: {
          id: userId,
        },

        select: {
          name: true,
          surname: true,
        },
      }),
    ]);

  if (!student) {
    notFound();
  }

  return (
    <StudentAssessmentDashboard
      studentName={`${student.name} ${student.surname}`}
      items={dashboardData.items}
      metrics={dashboardData.metrics}
    />
  );
}