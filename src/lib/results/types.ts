import type {
  ResultType,
  TermName,
} from "@prisma/client";

export type UnifiedResultType =
  ResultType;

export type UnifiedStudentResult = {
  id: number;
  type: ResultType;

  title: string;
  subject: string;
  className: string;

  score: number;
  totalMarks: number | null;
  percentage: number | null;

  grade: string | null;
  remarks: string | null;

  academicYear: string | null;

  term: {
    id: number;
    name: TermName;
  } | null;

  attemptNumber: number | null;

  date: Date | string;

  assessment: {
    id: number;
    attemptId: number | null;
  } | null;
};