import type {
  GradeBoundaryInput,
  GradingScaleInput,
} from "./types";

export function createGradeBoundary({
  grade = "",
  minimumScore = 0,
  maximumScore = 0,
  remark = "",
  gradePoint = null,
  position = 0,
}: Partial<GradeBoundaryInput> = {}): GradeBoundaryInput {
  return {
    grade,
    minimumScore,
    maximumScore,
    remark,
    gradePoint,
    position,
  };
}

export function createDefaultGradeBoundaries(): GradeBoundaryInput[] {
  return [
    {
      grade: "A",
      minimumScore: 80,
      maximumScore: 100,
      remark: "Excellent",
      gradePoint: 5,
      position: 0,
    },

    {
      grade: "B",
      minimumScore: 70,
      maximumScore: 79.99,
      remark: "Very Good",
      gradePoint: 4,
      position: 1,
    },

    {
      grade: "C",
      minimumScore: 60,
      maximumScore: 69.99,
      remark: "Good",
      gradePoint: 3,
      position: 2,
    },

    {
      grade: "D",
      minimumScore: 50,
      maximumScore: 59.99,
      remark: "Credit",
      gradePoint: 2,
      position: 3,
    },

    {
      grade: "E",
      minimumScore: 40,
      maximumScore: 49.99,
      remark: "Pass",
      gradePoint: 1,
      position: 4,
    },

    {
      grade: "F",
      minimumScore: 0,
      maximumScore: 39.99,
      remark: "Needs Improvement",
      gradePoint: 0,
      position: 5,
    },
  ];
}

export function createEmptyGradingScale(): GradingScaleInput {
  return {
    name: "",
    description: "",

    status: "DRAFT",
    isDefault: false,

    boundaries:
      createDefaultGradeBoundaries(),
  };
}