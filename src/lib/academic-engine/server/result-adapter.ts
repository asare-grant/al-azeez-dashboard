// src/lib/academic-engine/server/result-adapter.ts

import type {
  ResultType,
} from "@prisma/client";

import type {
  AcademicEngineResultRecord,
} from "../types";

import type {
  AcademicEngineLoaderIssue,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                            PRISMA ROW SHAPE                                */
/* -------------------------------------------------------------------------- */

/**
 * This is the exact minimum shape needed by the academic engine.
 *
 * It deliberately avoids importing a huge generated Prisma payload type.
 */
export type AcademicResultDatabaseRow = {
  id: number;

  type: ResultType;

  studentId: string;

  score: number;
  totalMarks: number | null;
  percentage: number | null;

  createdAt: Date;

  assignmentId: number | null;
  assessmentId: number | null;
  assessmentAttemptId: number | null;
  examId: number | null;

  assignment: {
    id: number;
    title: string;

    academicYear: string | null;
    termId: number | null;

    startDate: Date;
    dueDate: Date;

    lesson: {
      id: number;

      subject: {
        id: number;
        name: string;
      };
    };
  } | null;

  assessment: {
    id: number;
    title: string;

    academicYear: string | null;
    termId: number | null;

    startDate: Date;
    dueDate: Date;

    lesson: {
      id: number;

      subject: {
        id: number;
        name: string;
      };
    };
  } | null;

  exam: {
    id: number;
    title: string;

    academicYear: string | null;
    termId: number | null;

    startTime: Date;

    lesson: {
      id: number;

      subject: {
        id: number;
        name: string;
      };
    };
  } | null;

  assessmentAttempt: {
    id: number;
    attemptNumber: number;
    submittedAt: Date | null;
    startedAt: Date;
  } | null;
};

/* -------------------------------------------------------------------------- */
/*                            SOURCE RESOLUTION                               */
/* -------------------------------------------------------------------------- */

type ResolvedResultSource = {
  title: string;

  lessonId: number;

  subjectId: number;
  subjectName: string;

  academicYear: string | null;
  termId: number | null;

  date: Date;
};

function resolveResultSource(
  row: AcademicResultDatabaseRow,
): ResolvedResultSource | null {
  switch (row.type) {
    case "ASSIGNMENT": {
      if (!row.assignment) {
        return null;
      }

      return {
        title:
          row.assignment.title,

        lessonId:
          row.assignment.lesson.id,

        subjectId:
          row.assignment.lesson.subject.id,

        subjectName:
          row.assignment.lesson.subject.name,

        academicYear:
          row.assignment.academicYear,

        termId:
          row.assignment.termId,

        /*
         * Result creation time is preferable for
         * FIRST and LATEST strategies because it
         * represents when the mark was entered.
         */
        date:
          row.createdAt,
      };
    }

    case "ASSESSMENT": {
      if (!row.assessment) {
        return null;
      }

      return {
        title:
          row.assessment.title,

        lessonId:
          row.assessment.lesson.id,

        subjectId:
          row.assessment.lesson.subject.id,

        subjectName:
          row.assessment.lesson.subject.name,

        academicYear:
          row.assessment.academicYear,

        termId:
          row.assessment.termId,

        date:
          row.assessmentAttempt
            ?.submittedAt ??
          row.assessmentAttempt
            ?.startedAt ??
          row.createdAt,
      };
    }

    case "EXAM": {
      if (!row.exam) {
        return null;
      }

      return {
        title:
          row.exam.title,

        lessonId:
          row.exam.lesson.id,

        subjectId:
          row.exam.lesson.subject.id,

        subjectName:
          row.exam.lesson.subject.name,

        academicYear:
          row.exam.academicYear,

        termId:
          row.exam.termId,

        date:
          row.exam.startTime,
      };
    }

    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                              SINGLE ROW                                    */
/* -------------------------------------------------------------------------- */

export function adaptDatabaseResult(
  row: AcademicResultDatabaseRow,
): {
  record:
    AcademicEngineResultRecord | null;

  issue:
    AcademicEngineLoaderIssue | null;
} {
  const source =
    resolveResultSource(row);

  if (!source) {
    return {
      record: null,

      issue: {
        code:
          "RESULT_SOURCE_MISSING",

        message:
          `Result ${row.id} has no matching ${row.type.toLowerCase()} source.`,

        severity:
          "ERROR",

        resultId:
          row.id,

        studentId:
          row.studentId,
      },
    };
  }

  if (
    !Number.isInteger(
      source.subjectId,
    ) ||
    source.subjectId <= 0
  ) {
    return {
      record: null,

      issue: {
        code:
          "RESULT_SUBJECT_MISSING",

        message:
          `Result ${row.id} is not connected to a valid subject.`,

        severity:
          "ERROR",

        resultId:
          row.id,

        studentId:
          row.studentId,
      },
    };
  }

  return {
    issue: null,

    record: {
      id:
        row.id,

      type:
        row.type,

      studentId:
        row.studentId,

      subjectId:
        source.subjectId,

      subjectName:
        source.subjectName,

      lessonId:
        source.lessonId,

      academicYear:
        source.academicYear,

      termId:
        source.termId,

      title:
        source.title,

      score:
        row.score,

      totalMarks:
        row.totalMarks,

      percentage:
        row.percentage,

      date:
        source.date,

      assignmentId:
        row.assignmentId,

      assessmentId:
        row.assessmentId,

      assessmentAttemptId:
        row.assessmentAttemptId,

      examId:
        row.examId,

      attemptNumber:
        row.assessmentAttempt
          ?.attemptNumber ??
        null,

      createdAt:
        row.createdAt,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                              MULTIPLE ROWS                                 */
/* -------------------------------------------------------------------------- */

export function adaptDatabaseResults(
  rows:
    AcademicResultDatabaseRow[],
): {
  records:
    AcademicEngineResultRecord[];

  issues:
    AcademicEngineLoaderIssue[];
} {
  const records:
    AcademicEngineResultRecord[] =
    [];

  const issues:
    AcademicEngineLoaderIssue[] =
    [];

  for (const row of rows) {
    const adapted =
      adaptDatabaseResult(row);

    if (adapted.record) {
      records.push(
        adapted.record,
      );
    }

    if (adapted.issue) {
      issues.push(
        adapted.issue,
      );
    }
  }

  return {
    records,
    issues,
  };
}