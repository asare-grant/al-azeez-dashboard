import "server-only";

import {
  createNotificationEvent,
} from "./service";

export async function createNotificationDevTest({
  recipientId,
  recipientRole,
}: {
  recipientId:
    string;

  recipientRole:
    string;
}) {
  return createNotificationEvent({
    input: {
      type:
        "GENERAL",

      category:
        "GENERAL",

      priority:
        "NORMAL",

      title:
        "Notification System Test",

      message:
        "The new notification architecture is working correctly.",

      actionUrl:
        "/",

      entityType:
        "SYSTEM",

      entityId:
        "notification-test",

      dedupeKey:
        `notification-dev-test:${recipientId}`,

      recipients: [
        {
          recipientId,

          recipientRole,
        },
      ],
    },
  });
}