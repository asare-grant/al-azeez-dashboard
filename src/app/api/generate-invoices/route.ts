// src/app/api/generate-invoices/route.ts

import {
  Prisma,
} from "@prisma/client";

import {
  NextResponse,
} from "next/server";

import {
  requireFinancePermission,
} from "@/lib/finance/auth";

import {
  notifyFeeAssigned,
} from "@/lib/notifications/finance-notifications";

import prisma from "@/lib/prisma";

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function formatTermName(
  name:
    string,
) {
  switch (
    name
  ) {
    case "FIRST":
      return "First Term";

    case "SECOND":
      return "Second Term";

    case "THIRD":
      return "Third Term";

    default:
      return name;
  }
}

/* ========================================================================== */
/* POST                                                                       */
/* ========================================================================== */

export async function POST() {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    const actor =
      await requireFinancePermission(
        "finance.invoices.manage",
      );

    /* ---------------------------------------------------------------------- */
    /* ACTIVE TERM                                                            */
    /* ---------------------------------------------------------------------- */

    const activeTerm =
      await prisma.schoolTerm.findFirst({
        where: {
          isActive:
            true,

          academicYear: {
            isNot:
              null,
          },
        },

        select: {
          id:
            true,

          name:
            true,

          startDate:
            true,

          endDate:
            true,

          academicYear: {
            select: {
              id:
                true,

              name:
                true,
            },
          },
        },

        orderBy: {
          updatedAt:
            "desc",
        },
      });

    if (
      !activeTerm
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "No active academic term found. Please set an active term first.",
        },

        {
          status:
            400,
        },
      );
    }

    if (
      !activeTerm.academicYear
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "The active term is not linked to an academic year.",
        },

        {
          status:
            400,
        },
      );
    }

    const term =
      formatTermName(
        activeTerm.name,
      );

    const academicYear =
      activeTerm
        .academicYear
        .name;

    /* ---------------------------------------------------------------------- */
    /* STUDENTS + FEE STRUCTURES                                              */
    /* ---------------------------------------------------------------------- */

    const [
      students,
      feeStructures,
    ] =
      await prisma.$transaction([
        prisma.student.findMany({
          select: {
            id:
              true,

            classId:
              true,

            gradeId:
              true,

            studentType:
              true,

            boardingType:
              true,
          },
        }),

        prisma.feeStructure.findMany(),
      ]);

    let createdCount =
      0;

    let skippedCount =
      0;

    let noStructureCount =
      0;

    /* ---------------------------------------------------------------------- */
    /* GENERATE                                                               */
    /* ---------------------------------------------------------------------- */

    for (
      const student of
      students
    ) {
      const existingInvoice =
        await prisma.feeMaster.findFirst({
          where: {
            studentId:
              student.id,

            term,

            academicYear,
          },

          select: {
            id:
              true,
          },
        });

      if (
        existingInvoice
      ) {
        skippedCount++;

        continue;
      }

      const applicableStructures =
        feeStructures.filter(
          (
            feeStructure,
          ) => {
            const matchesClass =
              !feeStructure.classId ||
              feeStructure.classId ===
                student.classId;

            const matchesGrade =
              !feeStructure.gradeId ||
              feeStructure.gradeId ===
                student.gradeId;

            const matchesStudentType =
              feeStructure
                .studentType
                .toLowerCase() ===
              student
                .studentType
                .toLowerCase();

            const matchesBoardingType =
              feeStructure
                .boardingType
                .toLowerCase() ===
              student
                .boardingType
                .toLowerCase();

            return (
              matchesClass &&
              matchesGrade &&
              matchesStudentType &&
              matchesBoardingType
            );
          },
        );

      if (
        applicableStructures.length ===
        0
      ) {
        noStructureCount++;

        continue;
      }

      const totalAmount =
        applicableStructures.reduce(
          (
            sum,
            feeStructure,
          ) =>
            sum +
            feeStructure.amount,

          0,
        );

      await prisma.$transaction(
        async (
          tx,
        ) => {
          const studentDetails =
            await tx.student.findUnique({
              where: {
                id:
                  student.id,
              },

              select: {
                id:
                  true,

                name:
                  true,

                surname:
                  true,

                class: {
                  select: {
                    id:
                      true,

                    name:
                      true,
                  },
                },
              },
            });

          if (
            !studentDetails
          ) {
            throw new Error(
              "Student could not be resolved while generating the invoice.",
            );
          }

          const feeMaster =
            await tx.feeMaster.create({
              data: {
                studentId:
                  student.id,

                term,

                academicYear,

                totalAmount,

                status:
                  "PENDING",

                details: {
                  create:
                    applicableStructures.map(
                      (
                        feeStructure,
                      ) => ({
                        structureId:
                          feeStructure.id,

                        amount:
                          feeStructure.amount,
                      }),
                    ),
                },
              },
            });

          await notifyFeeAssigned({
            tx,

            feeMasterId:
              feeMaster.id,

            studentId:
              studentDetails.id,

            studentName:
              `${studentDetails.name} ${studentDetails.surname}`.trim(),

            classId:
              studentDetails
                .class.id,

            className:
              studentDetails
                .class.name,

            term,

            academicYear,

            totalAmount:
              feeMaster.totalAmount,

            actorId:
              actor.userId,

            actorRole:
              actor.actorRole,

            actorName:
              actor.actorName,
          });
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

      createdCount++;
    }

    return NextResponse.json({
      success:
        true,

      message:
        "Invoices generated successfully.",

      term,

      academicYear,

      createdCount,

      skippedCount,

      noStructureCount,
    });
  } catch (
    error
  ) {
    console.error(
      "GENERATE INVOICES ERROR:",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHENTICATED"
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Authentication required.",
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
          success:
            false,

          message:
            "You do not have permission to generate fee invoices.",
        },

        {
          status:
            403,
        },
      );
    }

    return NextResponse.json(
      {
        success:
          false,

        message:
          "Failed to generate invoices.",

        error:
          error instanceof Error
            ? error.message
            : String(
                error,
              ),
      },

      {
        status:
          500,
      },
    );
  }
}