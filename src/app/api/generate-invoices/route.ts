// /app/api/generate-invoices/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  try {
    // ensure requestor is admin (simple check via Clerk)
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    if (role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    // load students and fee structures
    const students = await prisma.student.findMany();
    const feeStructures = await prisma.feeStructure.findMany();

    for (const student of students) {
      // find structures that apply to this student
      const applicable = feeStructures.filter((fs) => {
        // class-specific: if fs.classId present it must match student.classId
        if (fs.classId && fs.classId !== student.classId) return false;
        // grade-specific: if fs.gradeId present it must match student.gradeId
        if (fs.gradeId && fs.gradeId !== student.gradeId) return false;
        // if both null, it applies globally
        return true;
      });

      if (applicable.length === 0) continue;

      const totalAmount = applicable.reduce((s, a) => s + a.amount, 0);

      // create master
      const master = await prisma.feeMaster.create({
        data: {
          studentId: student.id,
          term: "Term 1",
          academicYear: "2025/2026",
          totalAmount,
          status: "PENDING",
        },
      });

      // create lines
      for (const fs of applicable) {
        await prisma.fee.create({
          data: {
            masterId: master.id,
            structureId: fs.id,
            amount: fs.amount,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("generate-invoices error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
