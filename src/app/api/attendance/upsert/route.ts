// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function POST(req: Request) {
//   const { sessionClaims, userId } = await auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   const { studentId, date, day, present } = await req.json();

//   // Check permissions for non-admin
//   if (role !== "admin") {
//     const student = await prisma.student.findUnique({
//       where: { id: studentId },
//       include: { class: true },
//     });

//     if (student?.class.supervisorId !== userId) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }
//   }

//   // Upsert attendance: either update existing or create new
//   const attendance = await prisma.attendance.upsert({
//     where: {
//       studentId_date: { studentId, date: new Date(date) },
//     },
//     update: { present },
//     create: { studentId, date: new Date(date), day, present },
//   });

//   return NextResponse.json(attendance, { status: 200 });
// }









// import {
//   auth,
// } from "@clerk/nextjs/server";

// import {
//   NextResponse,
// } from "next/server";

// import prisma from "@/lib/prisma";

// export async function POST(
//   req: Request,
// ) {
//   const {
//     sessionClaims,
//     userId,
//   } = await auth();

//   if (!userId) {
//     return NextResponse.json(
//       {
//         error:
//           "Unauthorized",
//       },
//       {
//         status: 401,
//       },
//     );
//   }

//   const role = (
//     sessionClaims?.metadata as {
//       role?: string;
//     }
//   )?.role;

//   const body =
//     await req.json();

//   const studentId =
//     typeof body.studentId ===
//     "string"
//       ? body.studentId.trim()
//       : "";

//   const dateValue =
//     typeof body.date ===
//     "string"
//       ? body.date.trim()
//       : "";

//   const day =
//     Number(
//       body.day,
//     );

//   if (!studentId) {
//     return NextResponse.json(
//       {
//         error:
//           "A student is required.",
//       },
//       {
//         status: 400,
//       },
//     );
//   }

//   /*
//    * Attendance dates must arrive as YYYY-MM-DD.
//    *
//    * We deliberately store them at UTC midnight
//    * so browser timezone conversions cannot shift
//    * the attendance day backward or forward.
//    */
//   if (
//     !/^\d{4}-\d{2}-\d{2}$/.test(
//       dateValue,
//     )
//   ) {
//     return NextResponse.json(
//       {
//         error:
//           "A valid attendance date is required.",
//       },
//       {
//         status: 400,
//       },
//     );
//   }

//   const attendanceDate =
//     new Date(
//       `${dateValue}T00:00:00.000Z`,
//     );

//   if (
//     Number.isNaN(
//       attendanceDate.getTime(),
//     )
//   ) {
//     return NextResponse.json(
//       {
//         error:
//           "A valid attendance date is required.",
//       },
//       {
//         status: 400,
//       },
//     );
//   }

//   if (
//     !Number.isInteger(
//       day,
//     ) ||
//     day < 1 ||
//     day > 31
//   ) {
//     return NextResponse.json(
//       {
//         error:
//           "A valid attendance day is required.",
//       },
//       {
//         status: 400,
//       },
//     );
//   }

//   if (
//     typeof body.present !==
//     "boolean"
//   ) {
//     return NextResponse.json(
//       {
//         error:
//           "Attendance status must be true or false.",
//       },
//       {
//         status: 400,
//       },
//     );
//   }

//   const present =
//     body.present;

//   /* -------------------------------------------------------------------- */
//   /*                         PERMISSIONS                                  */
//   /* -------------------------------------------------------------------- */

//   const student =
//     await prisma.student.findUnique({
//       where: {
//         id:
//           studentId,
//       },

//       select: {
//         id:
//           true,

//         class: {
//           select: {
//             supervisorId:
//               true,
//           },
//         },
//       },
//     });

//   if (!student) {
//     return NextResponse.json(
//       {
//         error:
//           "Student not found.",
//       },
//       {
//         status: 404,
//       },
//     );
//   }

//   if (
//     role !== "admin" &&
//     student.class
//       .supervisorId !==
//       userId
//   ) {
//     return NextResponse.json(
//       {
//         error:
//           "Forbidden",
//       },
//       {
//         status: 403,
//       },
//     );
//   }

//   /* -------------------------------------------------------------------- */
//   /*                           UPSERT                                     */
//   /* -------------------------------------------------------------------- */

//   const attendance =
//     await prisma.attendance.upsert({
//       where: {
//         studentId_date: {
//           studentId,

//           date:
//             attendanceDate,
//         },
//       },

//       update: {
//         present,
//       },

//       create: {
//         studentId,

//         date:
//           attendanceDate,

//         day,

//         present,
//       },
//     });

//   return NextResponse.json(
//     attendance,
//     {
//       status: 200,
//     },
//   );
// }






import {
  auth,
} from "@clerk/nextjs/server";

import {
  NextResponse,
} from "next/server";

import {
  Prisma,
} from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  invalidateStudentReportCardWithTransaction,
} from "@/lib/report-cards/invalidation-service";

export async function POST(
  req: Request,
) {
  const {
    sessionClaims,
    userId,
  } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        error:
          "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

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

  if (!studentId) {
    return NextResponse.json(
      {
        error:
          "A student is required.",
      },
      {
        status: 400,
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
        status: 400,
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
        status: 400,
      },
    );
  }

  if (
    !Number.isInteger(
      day,
    ) ||
    day < 1 ||
    day > 31
  ) {
    return NextResponse.json(
      {
        error:
          "A valid attendance day is required.",
      },
      {
        status: 400,
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
        status: 400,
      },
    );
  }

  const present =
    body.present;

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

  if (!student) {
    return NextResponse.json(
      {
        error:
          "Student not found.",
      },
      {
        status: 404,
      },
    );
  }

  if (
    role !== "admin" &&
    student.class
      .supervisorId !==
      userId
  ) {
    return NextResponse.json(
      {
        error:
          "Forbidden",
      },
      {
        status: 403,
      },
    );
  }

  try {
    const result =
      await prisma.$transaction(
        async (tx) => {
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
            number[] = [];

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
                  `Attendance for ${dateValue} was created or updated.`,
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
            Prisma.TransactionIsolationLevel.Serializable,

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
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "UPSERT ATTENDANCE ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Attendance could not be saved.",
      },
      {
        status: 500,
      },
    );
  }
}