export type AssessmentGrade = {
  grade: string;
  remarks: string;
};

export function calculateAssessmentPercentage(
  score: number,
  totalMarks: number
): number {
  if (
    !Number.isFinite(score) ||
    !Number.isFinite(totalMarks) ||
    totalMarks <= 0
  ) {
    return 0;
  }

  const percentage = (score / totalMarks) * 100;

  return Number(percentage.toFixed(2));
}

export function getAssessmentGrade(
  percentage: number
): AssessmentGrade {
  const normalizedPercentage = Math.max(
    0,
    Math.min(100, percentage)
  );

  if (normalizedPercentage >= 90) {
    return {
      grade: "A+",
      remarks: "Outstanding",
    };
  }

  if (normalizedPercentage >= 80) {
    return {
      grade: "A",
      remarks: "Excellent",
    };
  }

  if (normalizedPercentage >= 70) {
    return {
      grade: "B",
      remarks: "Very Good",
    };
  }

  if (normalizedPercentage >= 60) {
    return {
      grade: "C",
      remarks: "Good",
    };
  }

  if (normalizedPercentage >= 50) {
    return {
      grade: "D",
      remarks: "Developing",
    };
  }

  return {
    grade: "F",
    remarks: "Needs Support",
  };
}

export function hasPassedAssessment(
  percentage: number,
  passMarkPercent: number
): boolean {
  return percentage >= passMarkPercent;
}

export function calculateAssessmentResult({
  score,
  totalMarks,
  passMarkPercent,
}: {
  score: number;
  totalMarks: number;
  passMarkPercent: number;
}) {
  const percentage = calculateAssessmentPercentage(
    score,
    totalMarks
  );

  const { grade, remarks } =
    getAssessmentGrade(percentage);

  const passed = hasPassedAssessment(
    percentage,
    passMarkPercent
  );

  return {
    score,
    totalMarks,
    percentage,
    grade,
    remarks,
    passed,
  };
}

export function formatAssessmentDuration(
  totalSeconds: number
): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}