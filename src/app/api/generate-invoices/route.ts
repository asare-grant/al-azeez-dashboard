// // /app/api/generate-invoices/route.ts
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";

// export async function POST() {
//   try {
//     // ensure requestor is admin (simple check via Clerk)
//     const { sessionClaims } = await auth();
//     const role = (sessionClaims?.metadata as { role?: string })?.role;
//     if (role !== "admin") {
//       return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
//     }

//     // load students and fee structures
//     const students = await prisma.student.findMany();
//     const feeStructures = await prisma.feeStructure.findMany();

//     for (const student of students) {
//       // find structures that apply to this student
//       const applicable = feeStructures.filter((fs) => {
//         // class-specific: if fs.classId present it must match student.classId
//         if (fs.classId && fs.classId !== student.classId) return false;
//         // grade-specific: if fs.gradeId present it must match student.gradeId
//         if (fs.gradeId && fs.gradeId !== student.gradeId) return false;
//         // if both null, it applies globally
//         return true;
//       });

//       if (applicable.length === 0) continue;

//       const totalAmount = applicable.reduce((s, a) => s + a.amount, 0);

//       // create master
//       const master = await prisma.feeMaster.create({
//         data: {
//           studentId: student.id,
//           term: "Term 3",
//           academicYear: "2025/2026",
//           totalAmount,
//           status: "PENDING",
//         },
//       });

//       // create lines
//       for (const fs of applicable) {
//         await prisma.fee.create({
//           data: {
//             masterId: master.id,
//             structureId: fs.id,
//             amount: fs.amount,
//           },
//         });
//       }
//     }

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("generate-invoices error:", err);
//     return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
//   }
// }



// /app/api/generate-invoices/route.ts

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

const getAcademicYear = (startDate: Date, endDate: Date) => {
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  if (startYear === endYear) {
    return `${startYear}/${startYear + 1}`;
  }

  return `${startYear}/${endYear}`;
};

export async function POST() {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get active term from your settings page
    const activeTerm = await prisma.schoolTerm.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!activeTerm) {
      return NextResponse.json(
        {
          success: false,
          message: "No active academic term found. Please set an active term first.",
        },
        { status: 400 }
      );
    }

    const term = formatTermName(activeTerm.name);
    const academicYear = getAcademicYear(
      activeTerm.startDate,
      activeTerm.endDate
    );

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
        0
      );

      await prisma.feeMaster.create({
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
      { status: 500 }
    );
  }
}