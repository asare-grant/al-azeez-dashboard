import {
  NextResponse,
} from "next/server";

import {
  getTeacherAssessmentAnalytics,
} from "@/lib/assessments/queries";

type RouteContext = {
  params: Promise<{
    assessmentId: string;
  }>;
};

function escapeCsv(
  value: string | number | null
) {
  if (value === null) {
    return "";
  }

  return `"${String(value).replaceAll(
    '"',
    '""'
  )}"`;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  const { assessmentId } =
    await context.params;

  const parsedAssessmentId =
    Number(assessmentId);

  if (
    !Number.isInteger(
      parsedAssessmentId
    ) ||
    parsedAssessmentId <= 0
  ) {
    return NextResponse.json(
      {
        message:
          "Invalid assessment ID.",
      },
      {
        status: 400,
      }
    );
  }

  const data =
    await getTeacherAssessmentAnalytics(
      parsedAssessmentId
    );

  if (!data) {
    return NextResponse.json(
      {
        message:
          "Assessment not found.",
      },
      {
        status: 404,
      }
    );
  }

  const headers = [
    "Question Number",
    "Question",
    "Marks",
    "Total Responses",
    "Correct",
    "Incorrect",
    "Unanswered",
    "Correct Percentage",
    "Incorrect Percentage",
    "Unanswered Percentage",
    "Difficulty",
    "Average Marks Awarded",
  ];

  const rows =
    data.questionAnalytics.map(
      (question) =>
        [
          question.questionNumber,
          question.questionText,
          question.marks,
          question.totalResponses,
          question.correctResponses,
          question.incorrectResponses,
          question.unansweredResponses,
          question.correctPercentage,
          question.incorrectPercentage,
          question.unansweredPercentage,
          question.difficulty,
          question.averageMarksAwarded,
        ]
          .map(escapeCsv)
          .join(",")
    );

  const csv = [
    headers
      .map(escapeCsv)
      .join(","),
    ...rows,
  ].join("\n");

  const safeTitle =
    data.assessment.title
      .replace(
        /[^a-z0-9]+/gi,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      )
      .toLowerCase();

  return new NextResponse(csv, {
    status: 200,

    headers: {
      "Content-Type":
        "text/csv; charset=utf-8",

      "Content-Disposition":
        `attachment; filename="${safeTitle}-analytics.csv"`,
    },
  });
}