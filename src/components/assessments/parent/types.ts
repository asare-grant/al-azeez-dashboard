// src/components/assessments/parent/types.ts

export type ParentAssessmentRecentResult = {
  assessmentId: number;
  attemptId: number;

  title: string;
  subject: string;

  score: number;
  totalMarks: number;
  percentage: number;

  grade: string | null;
  remarks: string | null;

  date: Date | string;
};

export type ParentChildAssessmentSummary = {
  child: {
    id: string;
    name: string;
    surname: string;
    img: string | null;
    className: string;
  };

  available: number;
  upcoming: number;
  completed: number;
  missed: number;

  averageScore: number | null;

  recentResults: ParentAssessmentRecentResult[];
};

export type ParentAssessmentDashboardProps = {
  children: ParentChildAssessmentSummary[];
};