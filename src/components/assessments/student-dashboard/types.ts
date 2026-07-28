import type {
  StudentAssessmentCardStatus,
  StudentAssessmentDashboardItem,
} from "@/lib/assessments/types";

export type StudentAssessmentTab =
  | "ALL"
  | StudentAssessmentCardStatus;

export type StudentAssessmentDashboardProps = {
  studentName?: string;
  items: StudentAssessmentDashboardItem[];

  metrics: {
    available: number;
    inProgress: number;
    upcoming: number;
    completed: number;
    missed: number;
    averageScore: number | null;
  };
};