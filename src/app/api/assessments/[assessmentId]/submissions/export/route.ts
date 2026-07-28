import {
  NextResponse,
} from "next/server";

import {
  getTeacherAssessmentSubmissions,
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

  const text = String(value);

  return `"${text.replaceAll(
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
    await getTeacherAssessmentSubmissions(
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
    "Student ID",
    "Student Name",
    "Status",
    "Attempts Used",
    "Latest Score",
    "Latest Total Marks",
    "Latest Percentage",
    "Highest Percentage",
    "Grade",
    "Passed",
    "Time Used Seconds",
    "Submitted At",
  ];

  const rows =
    data.submissions.map(
      (submission) => {
        const latest =
          submission.latestAttempt;

        return [
          submission.student.studentID,
          `${submission.student.name} ${submission.student.surname}`,
          submission.status,
          submission.attemptsUsed,

          latest?.score ?? "",
          latest?.totalMarks ?? "",
          latest?.percentage ?? "",

          submission.highestScore
            ?.percentage ?? "",

          submission.highestScore
            ?.grade ?? "",

          submission.passed === null
            ? ""
            : submission.passed
            ? "Yes"
            : "No",

          latest?.timeSpentSeconds ??
            "",

          latest?.submittedAt
            ? new Date(
                latest.submittedAt
              ).toISOString()
            : "",
        ]
          .map(escapeCsv)
          .join(",");
      }
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
        `attachment; filename="${safeTitle}-submissions.csv"`,
    },
  });
}