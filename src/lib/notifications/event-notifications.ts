import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  createNotificationEvent,
} from "./service";

import {
  getEventRecipients,
} from "./event-recipients";

type NotificationTx = {
  tx?:
    Prisma.TransactionClient;
};

type EventNotificationBase = {
  eventId:
    number;

  title:
    string;

  description:
    string;

  startTime:
    Date | string;

  endTime:
    Date | string;

  classId:
    number | null;

  className?:
    string | null;

  notificationRevision:
    number;
};





function formatEventDate(
  value:
    Date | string,
) {
  return new Intl.DateTimeFormat(
    "en-GH",
    {
      weekday:
        "short",

      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",

      timeZone:
        "UTC",
    },
  ).format(
    new Date(
      value,
    ),
  );
}



function mergeRecipients(
  ...groups:
    Awaited<
      ReturnType<
        typeof getEventRecipients
      >
    >[]
) {
  const map =
    new Map<
      string,
      (
        typeof groups
      )[number][number]
    >();

  for (
    const group of
    groups
  ) {
    for (
      const recipient of
      group
    ) {
      map.set(
        `${recipient.recipientRole}:${recipient.recipientId}`,
        recipient,
      );
    }
  }

  return Array.from(
    map.values(),
  );
}
/* 
-------------------------------------------------------------------------- */
/*                           UPCOMING — 24 HOURS                              */
/* -------------------------------------------------------------------------- */

export async function notifyEventUpcoming({
  tx,

  ...input
}: EventNotificationBase &
  NotificationTx) {
  const recipients =
    await getEventRecipients({
      classId:
        input.classId,

      tx,
    });

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type:
        "EVENT_UPCOMING",

      category:
        "ACADEMIC",

      priority:
        "NORMAL",

      title:
        "Upcoming School Event",

      message:
        input.className
          ? `${input.title} is coming up for ${input.className}.`
          : `${input.title} is coming up soon.`,

      actionUrl:
        "/list/events",

      entityType:
        "EVENT",

      entityId:
        String(
          input.eventId,
        ),

      dedupeKey:
        `event:${input.eventId}:upcoming:v${input.notificationRevision}:24h`,

      actorId:
        null,

      actorRole:
        "system",

      actorName:
        "School Calendar",

      metadata: {
        eventId:
          input.eventId,

        eventTitle:
          input.title,

        description:
          input.description,

        classId:
          input.classId,

        className:
          input.className ??
          null,

        startTime:
          new Date(
            input.startTime,
          ).toISOString(),

        endTime:
          new Date(
            input.endTime,
          ).toISOString(),

        reminderWindow:
          "24h",
      },

      recipients,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                          STARTING SOON — 2 HOURS                           */
/* -------------------------------------------------------------------------- */

export async function notifyEventStartingSoon({
  tx,

  ...input
}: EventNotificationBase &
  NotificationTx) {
  const recipients =
    await getEventRecipients({
      classId:
        input.classId,

      tx,
    });

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type:
        "EVENT_STARTING_SOON",

      category:
        "ACADEMIC",

      priority:
        "HIGH",

      title:
        "Event Starting Soon",

      message:
        `${input.title} begins in approximately 2 hours.`,

      actionUrl:
        "/list/events",

      entityType:
        "EVENT",

      entityId:
        String(
          input.eventId,
        ),

      dedupeKey:
         `event:${input.eventId}:starting-soon:v${input.notificationRevision}:2h`,

      actorId:
        null,

      actorRole:
        "system",

      actorName:
        "School Calendar",

      metadata: {
        eventId:
          input.eventId,

        eventTitle:
          input.title,

        classId:
          input.classId,

        className:
          input.className ??
          null,

        startTime:
          new Date(
            input.startTime,
          ).toISOString(),

        reminderWindow:
          "2h",
      },

      recipients,
    },
  });
}



/* -------------------------------------------------------------------------- */
/*                            EVENT PUBLISHED                                 */
/* -------------------------------------------------------------------------- */

export async function notifyEventPublished({
  tx,

  actorId,

  actorRole,

  actorName,

  ...input
}: EventNotificationBase &
  NotificationTx & {
    actorId?:
      string | null;

    actorRole?:
      string | null;

    actorName?:
      string | null;
  }) {
  const recipients =
    await getEventRecipients({
      classId:
        input.classId,

      tx,
    });

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type:
        "EVENT_PUBLISHED",

      category:
        "ACADEMIC",

      priority:
        "NORMAL",

      title:
        "New School Event",

      message:
        `${input.title} has been scheduled for ${formatEventDate(
          input.startTime,
        )}.`,

      actionUrl:
        `/list/events?date=${new Date(
          input.startTime,
        )
          .toISOString()
          .slice(
            0,
            10,
          )}`,

      entityType:
        "EVENT",

      entityId:
        String(
          input.eventId,
        ),

      dedupeKey:
        `event:${input.eventId}:published:v${input.notificationRevision}`,

      actorId:
        actorId ??
        null,

      actorRole:
        actorRole ??
        null,

      actorName:
        actorName ??
        null,

      metadata: {
        eventId:
          input.eventId,

        eventTitle:
          input.title,

        classId:
          input.classId,

        className:
          input.className ??
          null,

        startTime:
          new Date(
            input.startTime,
          ).toISOString(),

        endTime:
          new Date(
            input.endTime,
          ).toISOString(),

        notificationRevision:
          input.notificationRevision,
      },

      recipients,
    },
  });
}




/* -------------------------------------------------------------------------- */
/*                              EVENT UPDATED                                 */
/* -------------------------------------------------------------------------- */

export async function notifyEventUpdated({
  previousClassId,

  tx,

  actorId,

  actorRole,

  actorName,

  ...input
}: EventNotificationBase &
  NotificationTx & {
    previousClassId:
      number | null;

    actorId?:
      string | null;

    actorRole?:
      string | null;

    actorName?:
      string | null;
  }) {
  const [
    previousRecipients,
    currentRecipients,
  ] =
    await Promise.all([
      getEventRecipients({
        classId:
          previousClassId,

        tx,
      }),

      getEventRecipients({
        classId:
          input.classId,

        tx,
      }),
    ]);

  const recipients =
    mergeRecipients(
      previousRecipients,
      currentRecipients,
    );

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type:
        "EVENT_UPDATED",

      category:
        "ACADEMIC",

      priority:
        "HIGH",

      title:
        "School Event Updated",

      message:
        `${input.title} has been updated. It is scheduled for ${formatEventDate(
          input.startTime,
        )}.`,

      actionUrl:
        `/list/events?date=${new Date(
          input.startTime,
        )
          .toISOString()
          .slice(
            0,
            10,
          )}`,

      entityType:
        "EVENT",

      entityId:
        String(
          input.eventId,
        ),

      dedupeKey:
        `event:${input.eventId}:updated:v${input.notificationRevision}`,

      actorId:
        actorId ??
        null,

      actorRole:
        actorRole ??
        null,

      actorName:
        actorName ??
        null,

      metadata: {
        eventId:
          input.eventId,

        eventTitle:
          input.title,

        previousClassId,

        classId:
          input.classId,

        className:
          input.className ??
          null,

        startTime:
          new Date(
            input.startTime,
          ).toISOString(),

        endTime:
          new Date(
            input.endTime,
          ).toISOString(),

        notificationRevision:
          input.notificationRevision,
      },

      recipients,
    },
  });
}




/* -------------------------------------------------------------------------- */
/*                            EVENT CANCELLED                                 */
/* -------------------------------------------------------------------------- */

export async function notifyEventCancelled({
  tx,

  actorId,

  actorRole,

  actorName,

  ...input
}: EventNotificationBase &
  NotificationTx & {
    actorId?:
      string | null;

    actorRole?:
      string | null;

    actorName?:
      string | null;
  }) {
  const recipients =
    await getEventRecipients({
      classId:
        input.classId,

      tx,
    });

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type:
        "EVENT_CANCELLED",

      category:
        "ACADEMIC",

      priority:
        "HIGH",

      title:
        "School Event Cancelled",

      message:
        `${input.title}, previously scheduled for ${formatEventDate(
          input.startTime,
        )}, has been cancelled.`,

      actionUrl:
        "/list/events",

      entityType:
        "EVENT",

      entityId:
        String(
          input.eventId,
        ),

      dedupeKey:
        `event:${input.eventId}:cancelled:v${input.notificationRevision}`,

      actorId:
        actorId ??
        null,

      actorRole:
        actorRole ??
        null,

      actorName:
        actorName ??
        null,

      metadata: {
        eventId:
          input.eventId,

        eventTitle:
          input.title,

        classId:
          input.classId,

        className:
          input.className ??
          null,

        scheduledStartTime:
          new Date(
            input.startTime,
          ).toISOString(),

        notificationRevision:
          input.notificationRevision,
      },

      recipients,
    },
  });
}