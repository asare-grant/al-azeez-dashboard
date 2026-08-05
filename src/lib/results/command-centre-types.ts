import type {
  ResultType,
  TermName,
} from "@prisma/client";

export type ResultsCommandCentreRole =
  | "admin"
  | "teacher";

export type ResultsCommandCentreStatus =
  | "ALL"
  | ResultType;

export type ResultsCommandCentreRow = {
  id: number;
  type: ResultType;

  title: string;
  subject: string;
  className: string;

  student: {
    id: string;
    name: string;
    surname: string;
    img: string | null;
    studentID: string;
  };

  teacher: {
    id: string;
    name: string;
    surname: string;
  };

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

  assessment: {
    id: number;
    attemptId: number | null;
    attemptNumber: number | null;
  } | null;

  exam: {
    id: number;
  } | null;

  assignment: {
    id: number;
  } | null;

  date: Date | string;
};

export type ResultsCommandCentreMetrics = {
  totalResults: number;

  assessmentResults: number;
  examinationResults: number;
  assignmentResults: number;

  averagePercentage: number | null;
  highestPercentage: number | null;
  lowestPercentage: number | null;

  passedResults: number;
  failedResults: number;
  ungradedResults: number;

  passRate: number | null;

  uniqueStudents: number;
};

export type ResultsCommandCentreFilters = {
  page?: number;
  pageSize?: number;

  search?: string;
  type?: ResultsCommandCentreStatus;

  classId?: number;
  subjectId?: number;
  studentId?: string;

  academicYear?: string;
  termId?: number;
};

export type ResultsCommandCentreFilterOptions = {
  classes: {
    id: number;
    name: string;
  }[];

  subjects: {
    id: number;
    name: string;
  }[];

  students: {
    id: string;
    name: string;
    surname: string;
    studentID: string;
    classId: number;
  }[];

  terms: {
    id: number;
    name: TermName;
    isActive: boolean;
  }[];

  academicYears: string[];
};

export type ResultsCommandCentreData = {
  rows: ResultsCommandCentreRow[];
  metrics: ResultsCommandCentreMetrics;
  filters: ResultsCommandCentreFilterOptions;

  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};