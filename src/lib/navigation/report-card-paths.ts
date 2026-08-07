export const REPORT_CARD_PATHS = {
  admin: {
    commandCentre:
      "/list/report-cards",

    generate:
      "/list/report-cards/generate",

    bulkReview:
      "/list/report-cards/review",

    weightings:
      "/list/academic-settings/weightings",

    gradingScales:
      "/list/academic-settings/grading-scales",
  },

  teacher: {
    classes:
      "/teacher/classes",
  },

  student: {
    list:
      "/student/report-cards",
  },

  parent: {
    children:
      "/parent/children",
  },
} as const;

export function adminReportCardPath(
  reportCardId: number,
) {
  return `/list/report-cards/${reportCardId}`;
}

export function adminReportCardReviewPath(
  reportCardId: number,
) {
  return `/list/report-cards/${reportCardId}/review`;
}

export function adminReportCardPrintPath(
  reportCardId: number,
) {
  return `/list/report-cards/${reportCardId}/print`;
}

export function teacherClassReportCardsPath(
  classId: number,
) {
  return `/teacher/classes/${classId}/report-cards`;
}

export function teacherReportCardPath({
  classId,
  reportCardId,
}: {
  classId: number;
  reportCardId: number;
}) {
  return `/teacher/classes/${classId}/report-cards/${reportCardId}`;
}

export function studentReportCardPath(
  reportCardId: number,
) {
  return `/student/report-cards/${reportCardId}`;
}

export function parentChildReportCardsPath(
  childId: string,
) {
  return `/parent/children/${childId}/report-cards`;
}