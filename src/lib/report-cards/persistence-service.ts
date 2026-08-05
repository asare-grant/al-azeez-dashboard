import "server-only";

import {
  Prisma,
} from "@prisma/client";

import prisma from "@/lib/prisma";

import type {
  ClassTermReport,
  StudentTermReport,
} from "@/lib/academic-engine";

import {
  mapReportCardData,
  mapReportCardSubjectData,
} from "./mapper";

type PersistStudentReportResult = {
  reportCardId: number;

  operation:
    | "GENERATED"
    | "REGENERATED"
    | "LOCKED";
};

async function persistStudentReport({
  tx,
  report,
  generatedById,
}: {
  tx: Prisma.TransactionClient;
  report: StudentTermReport;
  generatedById: string;
}): Promise<PersistStudentReportResult> {
  const classId =
    report.period.class?.id ??
    report.student.class.id;

  const existing =
    await tx.reportCard.findUnique({
      where: {
        studentId_academicYear_termId_classId:
          {
            studentId:
              report.student.id,

            academicYear:
              report.period.academicYear,

            termId:
              report.period.term.id,

            classId,
          },
      },

      select: {
        id: true,
        status: true,
        version: true,
      },
    });

  /*
   * Published and archived report cards are immutable.
   */
  if (
    existing &&
    existing.status !== "DRAFT"
  ) {
    return {
      reportCardId:
        existing.id,

      operation:
        "LOCKED",
    };
  }

  const reportData =
    mapReportCardData({
      report,
      generatedById,
    });

  const reportCard =
    existing
      ? await tx.reportCard.update({
          where: {
            id: existing.id,
          },

          data: {
            ...reportData,

            regeneratedAt:
              new Date(),

            version: {
              increment: 1,
            },
          },

          select: {
            id: true,
          },
        })
      : await tx.reportCard.create({
          data: {
            ...reportData,

            status:
              "DRAFT",

            version: 1,
          },

          select: {
            id: true,
          },
        });

  /*
   * Subject snapshots are replaced only while the
   * parent report card remains a draft.
   */
  await tx.reportCardSubject.deleteMany({
    where: {
      reportCardId:
        reportCard.id,
    },
  });

  if (report.subjects.length > 0) {
    await tx.reportCardSubject.createMany({
      data:
        report.subjects.map(
          (subject) =>
            mapReportCardSubjectData({
              reportCardId:
                reportCard.id,

              subject,
            }),
        ),
    });
  }

  return {
    reportCardId:
      reportCard.id,

    operation:
      existing
        ? "REGENERATED"
        : "GENERATED",
  };
}

export async function persistClassTermReport({
  report,
  generatedById,
}: {
  report: ClassTermReport;
  generatedById: string;
}) {
  return prisma.$transaction(
    async (tx) => {
      const results:
        PersistStudentReportResult[] =
        [];

      /*
       * Sequential processing keeps the transaction predictable
       * and avoids competing writes against the same unique keys.
       */
      for (
        const studentReport of
        report.students
      ) {
        const persisted =
          await persistStudentReport({
            tx,
            report:
              studentReport,

            generatedById,
          });

        results.push(
          persisted,
        );
      }

      return {
        results,

        generatedCount:
          results.filter(
            (result) =>
              result.operation ===
              "GENERATED",
          ).length,

        regeneratedCount:
          results.filter(
            (result) =>
              result.operation ===
              "REGENERATED",
          ).length,

        lockedCount:
          results.filter(
            (result) =>
              result.operation ===
              "LOCKED",
          ).length,

        reportCardIds:
          results.map(
            (result) =>
              result.reportCardId,
          ),
      };
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel
          .Serializable,

      maxWait: 10_000,
      timeout: 60_000,
    },
  );
}