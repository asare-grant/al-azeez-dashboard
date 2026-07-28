import type {
  AssessmentStatus,
} from "@prisma/client";

export type AssessmentCommandItem = {
  id: number;
  title: string;
  status: AssessmentStatus;

  startDate: Date | string;
  dueDate: Date | string;

  durationMinutes: number | null;
  totalMarks: number;
  questionCount: number;
  passMarkPercent: number;

  createdAt: Date | string;
  updatedAt: Date | string;
  publishedAt: Date | string | null;

  submittedStudents: number;
  classStudentCount: number;
  averagePercentage: number | null;

  lesson: {
    id: number;

    subject: {
      id: number;
      name: string;
    };

    class: {
      id: number;
      name: string;

      _count: {
        students: number;
      };
    };

    teacher: {
      id: string;
      name: string;
      surname: string;
    };
  };

  _count: {
    attempts: number;
    results: number;
  };
};

export type AssessmentDashboardMetrics = {
  total: number;
  active: number;
  scheduled: number;
  draft: number;
  closed: number;
  archived: number;

  submissionRate: number;
  averageScore: number | null;
};

export type AssessmentFilterOption = {
  id: number;
  name: string;
};

export type AssessmentCommandCentreProps = {
  assessments: AssessmentCommandItem[];

  metrics: AssessmentDashboardMetrics;

  classes: AssessmentFilterOption[];
  subjects: AssessmentFilterOption[];

  page: number;
  totalPages: number;
  total: number;

  currentFilters: {
    search?: string;
    status?: string;
    classId?: string;
    subjectId?: string;
  };
};