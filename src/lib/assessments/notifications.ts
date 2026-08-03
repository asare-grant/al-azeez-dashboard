import type {
  Prisma,
} from "@prisma/client";

type NotificationClient =
  Pick<
    Prisma.TransactionClient,
    "notification"
  >;

type CreatePublishedNotificationsInput = {
  assessmentId: number;
  assessmentTitle: string;
  studentIds: string[];
  scheduled: boolean;
};

export async function createAssessmentPublishedNotifications(
  client: NotificationClient,
  {
    assessmentId,
    assessmentTitle,
    studentIds,
    scheduled,
  }: CreatePublishedNotificationsInput,
) {
  if (
    studentIds.length === 0
  ) {
    return {
      created:
        0,
    };
  }

  const message =
    scheduled
      ? `${assessmentTitle} has been scheduled. Check the opening date before starting.`
      : `${assessmentTitle} is now available for you to complete.`;

  const result =
    await client.notification.createMany({
      data:
        studentIds.map(
          (studentId) => ({
            title:
              scheduled
                ? "Assessment scheduled"
                : "New assessment available",

            message,

            type:
              scheduled
                ? "ASSESSMENT_SCHEDULED"
                : "ASSESSMENT_PUBLISHED",

            recipientId:
              studentId,

            recipientRole:
              "student",

            assessmentId,

            actionUrl:
              `/student/assessments/${assessmentId}`,
          }),
        ),

      skipDuplicates:
        true,
    });

  return {
    created:
      result.count,
  };
}