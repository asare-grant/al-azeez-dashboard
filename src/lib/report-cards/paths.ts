export const REPORT_CARD_LIST_PATH =
  "/list/report-cards";

export const REPORT_CARD_GENERATE_PATH =
  `${REPORT_CARD_LIST_PATH}/generate`;

export function reportCardDetailsPath(
  reportCardId: number,
) {
  return `${REPORT_CARD_LIST_PATH}/${reportCardId}`;
}

export function studentReportCardPath(
  reportCardId: number,
) {
  return `/student/report-cards/${reportCardId}`;
}

export function parentReportCardPath({
  childId,
  reportCardId,
}: {
  childId: string;
  reportCardId: number;
}) {
  return `/parent/children/${childId}/report-cards/${reportCardId}`;
}

export function teacherClassReportCardsPath(
  classId: number,
) {
  return `/teacher/classes/${classId}/report-cards`;
}