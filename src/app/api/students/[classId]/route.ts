// src/app/api/students/[classId]/route.ts
import prisma from "@/lib/prisma";

export async function GET(req: Request, props: { params: Promise<{ classId: string }> }) {
  const { classId } = await props.params; // ✅ Unwrap the Promise

  const students = await prisma.student.findMany({
    where: { classId: parseInt(classId) },
    select: { id: true, name: true, surname: true },
    orderBy: { name: "asc" },
  });

  return Response.json(students);
}
