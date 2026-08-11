// /app/api/generate-invoices/route.ts
import { Prisma } from "@prisma/client";

import { notifyFeeAssigned } from "@/lib/notifications/finance-notifications";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const formatTermName = (name: string) => {
  switch (name) {
    case "FIRST":
      return "First Term";
    case "SECOND":
      return "Second Term";
    case "THIRD":
      return "Third Term";
    default:
      return name;
  }
};

// const getAcademicYear = (startDate: Date, endDate: Date) => {
//   const startYear = startDate.getFullYear();
//   const endYear = endDate.getFullYear();

//   if (startYear === endYear) {
//     return `${startYear}/${startYear + 1}`;
//   }

//   return `${startYear}/${endYear}`;
// };

export async function POST() {
  try {
    const { sessionClaims, userId } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    // Get active term from your settings page
    const activeTerm = await prisma.schoolTerm.findFirst({
      where: {
        isActive: true,

        academicYear: {
          isNot: null,
        },
      },

      select: {
        id: true,

        name: true,

        startDate: true,

        endDate: true,

        academicYear: {
          select: {
            id: true,

            name: true,
          },
        },
      },

      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!activeTerm) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No active academic term found. Please set an active term first.",
        },
        { status: 400 },
      );
    }

    const term = formatTermName(activeTerm.name);
    if (!activeTerm.academicYear) {
      return NextResponse.json(
        {
          success: false,

          message: "The active term is not linked to an academic year.",
        },

        {
          status: 400,
        },
      );
    }

    const academicYear = activeTerm.academicYear.name;

    const students = await prisma.student.findMany({
      select: {
        id: true,
        classId: true,
        gradeId: true,
        studentType: true,
        boardingType: true,
      },
    });

    const feeStructures = await prisma.feeStructure.findMany();

    let createdCount = 0;
    let skippedCount = 0;
    let noStructureCount = 0;

    for (const student of students) {
      // Prevent duplicate invoice for the same student, term, and academic year
      const existingInvoice = await prisma.feeMaster.findFirst({
        where: {
          studentId: student.id,
          term,
          academicYear,
        },
      });

      if (existingInvoice) {
        skippedCount++;
        continue;
      }

      // Match grade/class + new/old + boarder/day
      const applicableStructures = feeStructures.filter((fs) => {
        const matchesClass = !fs.classId || fs.classId === student.classId;
        const matchesGrade = !fs.gradeId || fs.gradeId === student.gradeId;

        const matchesStudentType =
          fs.studentType.toLowerCase() === student.studentType.toLowerCase();

        const matchesBoardingType =
          fs.boardingType.toLowerCase() === student.boardingType.toLowerCase();

        return (
          matchesClass &&
          matchesGrade &&
          matchesStudentType &&
          matchesBoardingType
        );
      });

      if (applicableStructures.length === 0) {
        noStructureCount++;
        continue;
      }

      const totalAmount = applicableStructures.reduce(
        (sum, fs) => sum + fs.amount,
        0,
      );

      await prisma.$transaction(
        async (tx) => {
          const studentDetails = await tx.student.findUnique({
            where: {
              id: student.id,
            },

            select: {
              id: true,

              name: true,

              surname: true,

              class: {
                select: {
                  id: true,

                  name: true,
                },
              },
            },
          });

          if (!studentDetails) {
            throw new Error(
              "Student could not be resolved while generating the invoice.",
            );
          }

          const feeMaster = await tx.feeMaster.create({
            data: {
              studentId: student.id,

              term,

              academicYear,

              totalAmount,

              status: "PENDING",

              details: {
                create: applicableStructures.map((fs) => ({
                  structureId: fs.id,

                  amount: fs.amount,
                })),
              },
            },
          });

          await notifyFeeAssigned({
            tx,

            feeMasterId: feeMaster.id,

            studentId: studentDetails.id,

            studentName:
              `${studentDetails.name} ${studentDetails.surname}`.trim(),

            classId: studentDetails.class.id,

            className: studentDetails.class.name,

            term,

            academicYear,

            totalAmount: feeMaster.totalAmount,

            actorId: userId,

            actorRole: role,

            actorName: null,
          });
        },

        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

          maxWait: 10_000,

          timeout: 30_000,
        },
      );

      createdCount++;
    }

    return NextResponse.json({
      success: true,
      message: "Invoices generated successfully.",
      term,
      academicYear,
      createdCount,
      skippedCount,
      noStructureCount,
    });
  } catch (err) {
    console.error("generate-invoices error:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate invoices.",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
