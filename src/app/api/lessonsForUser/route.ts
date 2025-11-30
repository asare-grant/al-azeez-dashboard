import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    let lessons: { id: number; name: string; }[];

    if (role === "admin") {
      // Admin: fetch all lessons
      lessons = await prisma.lesson.findMany({
        select: { id: true, name: true },
      });
    } else if (role === "teacher") {
      // Teacher: fetch only lessons they teach
      lessons = await prisma.lesson.findMany({
        where: { teacherId: userId! },
        select: { id: true, name: true },
      });
    } else {
      // Other roles: return empty list
      lessons = [];
    }

    return NextResponse.json({ lessons });
  } catch (err) {
    console.error("❌ Error fetching lessons:", err);
    return NextResponse.json({ lessons: [], error: true });
  }
}
