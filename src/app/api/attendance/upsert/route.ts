// src/app/api/attendance/upsert/route.ts

import {
  Prisma,
} from "@prisma/client";

import {
  NextResponse,
} from "next/server";

import {
  requireAttendancePermission,
} from "@/lib/attendance/auth";

import prisma from "@/lib/prisma";

import {
  invalidateStudentReportCardWithTransaction,
} from "@/lib/report-cards/invalidation-service";

export async function POST(
  req:
    Request,
) {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    const actor =
      await requireAttendancePermission(
        "attendance.record",
      );

    /* ---------------------------------------------------------------------- */
    /* BODY                                                                    */
    /* ---------------------------------------------------------------------- */

    const body =
      await req.json();

    const studentId =
      typeof body.studentId ===
      "string"
        ? body.studentId.trim()
        : "";

    const dateValue =
      typeof body.date ===
      "string"
        ? body.date.trim()
        : "";

    const day =
      Number(
        body.day,
      );

    if (
      !studentId
    ) {
      return NextResponse.json(
        {
          error:
            "A student is required.",
        },

        {
          status:
            400,
        },
      );
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        dateValue,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid attendance date is required.",
        },

        {
          status:
            400,
        },
      );
    }

    const attendanceDate =
      new Date(
        `${dateValue}T00:00:00.000Z`,
      );

    if (
      Number.isNaN(
        attendanceDate.getTime(),
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid attendance date is required.",
        },

        {
          status:
            400,
        },
      );
    }

    if (
      !Number.isInteger(
        day,
      ) ||
      day <
        1 ||
      day >
        31
    ) {
      return NextResponse.json(
        {
          error:
            "A valid attendance day is required.",
        },

        {
          status:
            400,
        },
      );
    }

    if (
      typeof body.present !==
      "boolean"
    ) {
      return NextResponse.json(
        {
          error:
            "Attendance status must be true or false.",
        },

        {
          status:
            400,
        },
      );
    }

    const present =
      body.present;

    /* ---------------------------------------------------------------------- */
    /* STUDENT                                                                */
    /* ---------------------------------------------------------------------- */

    const student =
      await prisma.student.findUnique({
        where: {
          id:
            studentId,
        },

        select: {
          id:
            true,

          class: {
            select: {
              id:
                true,

              supervisorId:
                true,
            },
          },
        },
      });

    if (
      !student
    ) {
      return NextResponse.json(
        {
          error:
            "Student not found.",
        },

        {
          status:
            404,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* OWNERSHIP                                                              */
    /* ---------------------------------------------------------------------- */

    if (
      actor.scope ===
        "SUPERVISED_CLASSES" &&
      student.class
        .supervisorId !==
        actor.userId
    ) {
      return NextResponse.json(
        {
          error:
            "Forbidden",
        },

        {
          status:
            403,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* TRANSACTION                                                            */
    /* ---------------------------------------------------------------------- */

    const result =
      await prisma.$transaction(
        async (
          tx,
        ) => {
          const matchingTerms =
            await tx.schoolTerm.findMany({
              where: {
                startDate: {
                  lte:
                    attendanceDate,
                },

                endDate: {
                  gte:
                    attendanceDate,
                },

                academicYear: {
                  isNot:
                    null,
                },
              },

              select: {
                id:
                  true,

                academicYear: {
                  select: {
                    name:
                      true,
                  },
                },
              },

              take:
                2,
            });

          if (
            matchingTerms.length >
            1
          ) {
            throw new Error(
              "More than one academic term contains this attendance date. Check the academic calendar configuration.",
            );
          }

          const term =
            matchingTerms[0] ??
            null;

          const existingAttendance =
            await tx.attendance.findUnique({
              where: {
                studentId_date: {
                  studentId,

                  date:
                    attendanceDate,
                },
              },

              select: {
                id:
                  true,

                present:
                  true,
              },
            });

          const attendance =
            await tx.attendance.upsert({
              where: {
                studentId_date: {
                  studentId,

                  date:
                    attendanceDate,
                },
              },

              update: {
                present,
              },

              create: {
                studentId,

                date:
                  attendanceDate,

                day,

                present,
              },
            });

          const attendanceChanged =
            !existingAttendance ||
            existingAttendance.present !==
              present;

          let invalidatedReportCardCount =
            0;

          let invalidatedReportCardIds:
            number[] =
            [];

          if (
            attendanceChanged &&
            term?.academicYear
          ) {
            const invalidation =
              await invalidateStudentReportCardWithTransaction({
                tx,

                studentId,

                classId:
                  student.class.id,

                academicYear:
                  term.academicYear.name,

                termId:
                  term.id,

                reason:
                  existingAttendance
                    ? `Attendance for ${dateValue} was changed from ${
                        existingAttendance.present
                          ? "present"
                          : "absent"
                      } to ${
                        present
                          ? "present"
                          : "absent"
                      }.`
                    : `Attendance for ${dateValue} was recorded as ${
                        present
                          ? "present"
                          : "absent"
                      }.`,

                actor: {
                  actorId:
                    actor.userId,

                  actorRole:
                    actor.actorRole ??
                    "system",

                  actorName:
                    actor.actorName,
                },
              });

            invalidatedReportCardCount =
              invalidation.invalidatedCount;

            invalidatedReportCardIds =
              invalidation.reportCardIds;
          }

          return {
            attendance,

            attendanceChanged,

            invalidatedReportCardCount,

            invalidatedReportCardIds,
          };
        },

        {
          isolationLevel:
            Prisma
              .TransactionIsolationLevel
              .Serializable,

          maxWait:
            10_000,

          timeout:
            30_000,
        },
      );

    return NextResponse.json(
      {
        ...result.attendance,

        attendanceChanged:
          result.attendanceChanged,

        invalidatedReportCardCount:
          result.invalidatedReportCardCount,

        invalidatedReportCardIds:
          result.invalidatedReportCardIds,
      },

      {
        status:
          200,
      },
    );
  } catch (
    error
  ) {
    console.error(
      "UPSERT ATTENDANCE ERROR:",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHENTICATED"
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },

        {
          status:
            401,
        },
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error:
            "Forbidden",
        },

        {
          status:
            403,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Attendance could not be saved.",
      },

      {
        status:
          500,
      },
    );
  }
}