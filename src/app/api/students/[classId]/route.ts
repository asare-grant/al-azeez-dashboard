// src/app/api/students/[classId]/route.ts

import {
  NextResponse,
} from "next/server";

import prisma from "@/lib/prisma";

import {
  requireResultsManagementAccess,
} from "@/lib/results/result-access";

export async function GET(
  _req: Request,

  props: {
    params: Promise<{
      classId: string;
    }>;
  },
) {
  try {
    const {
      classId: rawClassId,
    } =
      await props.params;

    const classId =
      Number(
        rawClassId,
      );

    if (
      !Number.isInteger(
        classId,
      ) ||
      classId <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid class.",
        },
        {
          status:
            400,
        },
      );
    }

    const access =
      await requireResultsManagementAccess();

    /*
     * Teacher-scoped managers may only request
     * students from classes containing one of
     * their lessons.
     */
    if (
      access.scope ===
      "TEACHER_OWNED"
    ) {
      const teacherClass =
        await prisma.class.findFirst({
          where: {
            id:
              classId,

            lessons: {
              some: {
                teacherId:
                  access.userId,
              },
            },
          },

          select: {
            id:
              true,
          },
        });

      if (!teacherClass) {
        return NextResponse.json(
          {
            message:
              "You do not have access to this class.",
          },
          {
            status:
              403,
          },
        );
      }
    }

    const students =
      await prisma.student.findMany({
        where: {
          classId,
        },

        select: {
          id:
            true,

          name:
            true,

          surname:
            true,
        },

        orderBy: [
          {
            name:
              "asc",
          },

          {
            surname:
              "asc",
          },
        ],
      });

    return NextResponse.json(
      students,
    );
  } catch (error) {
    console.error(
      "LOAD RESULT STUDENTS ERROR:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Students could not be loaded.";

    const unauthorized =
      message.includes(
        "permission",
      );

    const unauthenticated =
      message.includes(
        "signed in",
      );

    return NextResponse.json(
      {
        message,
      },
      {
        status:
          unauthenticated
            ? 401
            : unauthorized
              ? 403
              : 500,
      },
    );
  }
}