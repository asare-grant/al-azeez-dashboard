// // src/app/api/attendance/list/route.ts
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import moment from "moment";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const classId = searchParams.get("classId");
//   const month = searchParams.get("month");

//   const start = moment(month!, "MM/YYYY").startOf("month").toDate();
//   const end = moment(month!, "MM/YYYY").endOf("month").toDate();

//   const attendance = await prisma.attendance.findMany({
//     where: {
//       date: { gte: start, lte: end },
//       ...(classId && { student: { classId: Number(classId) } }),
//     },
//   });

//   return NextResponse.json({ data: attendance });
// }







// src/app/api/attendance/list/route.ts

import {
  NextResponse,
} from "next/server";

import moment from "moment";

import {
  requireAttendancePermission,
} from "@/lib/attendance/auth";

import prisma from "@/lib/prisma";

/* ========================================================================== */
/* GET ATTENDANCE                                                             */
/* ========================================================================== */

export async function GET(
  req:
    Request,
) {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    const actor =
      await requireAttendancePermission(
        "attendance.view",
      );

    /* ---------------------------------------------------------------------- */
    /* QUERY PARAMS                                                           */
    /* ---------------------------------------------------------------------- */

    const {
      searchParams,
    } =
      new URL(
        req.url,
      );

    const classIdParam =
      searchParams.get(
        "classId",
      );

    const month =
      searchParams.get(
        "month",
      );

    /* ---------------------------------------------------------------------- */
    /* MONTH VALIDATION                                                       */
    /* ---------------------------------------------------------------------- */

    if (
      !month ||
      !/^(0[1-9]|1[0-2])\/\d{4}$/.test(
        month,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid month is required.",
        },

        {
          status:
            400,
        },
      );
    }

    const parsedMonth =
      moment(
        month,
        "MM/YYYY",
        true,
      );

    if (
      !parsedMonth.isValid()
    ) {
      return NextResponse.json(
        {
          error:
            "A valid month is required.",
        },

        {
          status:
            400,
        },
      );
    }

    const start =
      parsedMonth
        .clone()
        .startOf(
          "month",
        )
        .toDate();

    const end =
      parsedMonth
        .clone()
        .endOf(
          "month",
        )
        .toDate();

    /* ---------------------------------------------------------------------- */
    /* CLASS                                                                  */
    /* ---------------------------------------------------------------------- */

    let classId:
      number | null =
      null;

    if (
      classIdParam
    ) {
      const parsedClassId =
        Number(
          classIdParam,
        );

      if (
        !Number.isInteger(
          parsedClassId,
        ) ||
        parsedClassId <=
          0
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid class.",
          },

          {
            status:
              400,
          },
        );
      }

      classId =
        parsedClassId;
    }

    /* ---------------------------------------------------------------------- */
    /* OWNERSHIP                                                              */
    /* ---------------------------------------------------------------------- */

    if (
      actor.scope ===
      "SUPERVISED_CLASSES"
    ) {
      /*
       * A teacher-scoped viewer must select a class.
       *
       * This also prevents a request with no classId
       * from returning attendance across the school.
       */
      if (
        !classId
      ) {
        return NextResponse.json(
          {
            data:
              [],
          },

          {
            status:
              200,
          },
        );
      }

      const supervisedClass =
        await prisma.class.findFirst({
          where: {
            id:
              classId,

            supervisorId:
              actor.userId,
          },

          select: {
            id:
              true,
          },
        });

      if (
        !supervisedClass
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
    }

    /* ---------------------------------------------------------------------- */
    /* ATTENDANCE                                                             */
    /* ---------------------------------------------------------------------- */

    const attendance =
      await prisma.attendance.findMany({
        where: {
          date: {
            gte:
              start,

            lte:
              end,
          },

          ...(classId
            ? {
                student: {
                  classId,
                },
              }
            : {}),
        },

        orderBy: [
          {
            date:
              "asc",
          },

          {
            studentId:
              "asc",
          },
        ],
      });

    return NextResponse.json({
      data:
        attendance,
    });
  } catch (
    error
  ) {
    console.error(
      "ATTENDANCE LIST ERROR:",
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
          "Attendance could not be loaded.",
      },

      {
        status:
          500,
      },
    );
  }
}