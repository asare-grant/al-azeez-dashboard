import type {
  ResultType,
  TermName,
} from "@prisma/client";

export type StudentResultProfileRecord = {
  id: number;
  type: ResultType;

  title: string;
  subject: {
    id: number;
    name: string;
  };

  className: string;

  teacherName: string;

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

export type StudentSubjectPerformance = {
  subjectId: number;
  subjectName: string;

  resultCount: number;

  assessmentCount: number;
  examinationCount: number;
  assignmentCount: number;

  averagePercentage: number | null;
  highestPercentage: number | null;
  lowestPercentage: number | null;

  latestPercentage: number | null;
};

export type StudentResultProfileMetrics = {
  totalResults: number;

  averagePercentage: number | null;
  highestPercentage: number | null;
  lowestPercentage: number | null;

  passedResults: number;
  failedResults: number;
  passRate: number | null;

  assessmentResults: number;
  examinationResults: number;
  assignmentResults: number;

  subjectsCovered: number;
};

export type StudentResultProfileFilterOptions = {
  academicYears: string[];

  terms: {
    id: number;
    name: TermName;
    isActive: boolean;
  }[];

  subjects: {
    id: number;
    name: string;
  }[];
};

export type StudentResultProfileData = {
  student: {
    id: string;
    name: string;
    surname: string;

    img: string | null;
    studentID: string;

    sex: string;

    class: {
      id: number;
      name: string;
    };

    grade: {
      id: number;
      level: string;
    };

    parent: {
      id: string;
      name: string;
      surname: string;
      phone: string;
    } | null;
  };

  records: StudentResultProfileRecord[];

  subjectPerformance:
    StudentSubjectPerformance[];

  metrics:
    StudentResultProfileMetrics;

  filterOptions:
    StudentResultProfileFilterOptions;

  selectedFilters: {
    academicYear: string | null;
    termId: number | null;
    subjectId: number | null;
    type: ResultType | null;
  };
};