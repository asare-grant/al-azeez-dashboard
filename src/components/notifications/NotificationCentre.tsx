"use client";

import { Archive, Bell, CheckCheck, ChevronRight, Inbox, Settings2 } from "lucide-react";

import { useRouter } from "next/navigation";

import { useTransition } from "react";

import {
  archiveNotification,
  markAllNotificationsAsRead,
  openNotification,
} from "@/lib/notifications/actions";

import NotificationPriorityBadge from "./NotificationPriorityBadge";

import { resolveNotificationUrl } from "./notification-links";

import type { NotificationEntityType, NotificationType } from "@prisma/client";
import Link from "next/link";

type NotificationCentreData = {
  items: any[];

  total: number;

  unread: number;

  page: number;

  pageSize: number;

  totalPages: number;
};

export default function NotificationCentre({
  data,
}: {
  data: NotificationCentreData;
}) {
  const router = useRouter();

  const [pending, startTransition] = useTransition();

  function handleOpen(notification: any) {
    const href = resolveNotificationUrl({
      type: notification.event.type as NotificationType,

      entityType: notification.event
        .entityType as NotificationEntityType | null,

      entityId: notification.event.entityId,

      eventActionUrl: notification.event.actionUrl,

      recipientRole: notification.recipientRole,

      metadata: notification.event.metadata,
    });

    startTransition(async () => {
      await openNotification(notification.id);

      if (href) {
        router.push(href);
      } else {
        router.refresh();
      }
    });
  }

  function handleArchive(notificationId: number) {
    startTransition(async () => {
      await archiveNotification(notificationId);

      router.refresh();
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsAsRead();

      router.refresh();
    });
  }

  if (data.items.length === 0) {
    return (
      <section className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-blue-600">
          <Inbox className="h-7 w-7" />
        </div>

        <h2 className="mt-5 text-2xl font-black text-slate-950">
          No notifications yet
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          Academic updates and important school activity will appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Activity Inbox
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Recent notifications
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {data.unread} unread of {data.total} active notifications.
          </p>
        </div>

        {data.unread > 0 ? (
          <button
            type="button"
            disabled={pending}
            onClick={handleMarkAllRead}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-black text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </button>
        ) : null}

        <Link
          href="/notifications/settings"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <Settings2 className="h-4 w-4" />
          Preferences
        </Link>
      </div>

      <div>
        {data.items.map((notification) => {
          const unread = !notification.readAt;

          return (
            <article
              key={notification.id}
              className={`relative border-b border-slate-100 p-5 transition last:border-b-0 sm:p-6 ${
                unread ? "bg-blue-50/30" : "bg-white"
              }`}
            >
              {unread ? (
                <div className="absolute inset-y-0 left-0 w-1 bg-blue-600" />
              ) : null}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ${
                    notification.event.priority === "URGENT"
                      ? "bg-red-50 text-red-600"
                      : notification.event.priority === "HIGH"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <Bell className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-base ${
                        unread
                          ? "font-black text-slate-950"
                          : "font-bold text-slate-800"
                      }`}
                    >
                      {notification.event.title}
                    </h3>

                    <NotificationPriorityBadge
                      priority={notification.event.priority}
                    />

                    {unread ? (
                      <span className="rounded-full bg-blue-600 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white">
                        New
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">
                    {notification.event.message}
                  </p>

                  <p className="mt-3 text-xs font-semibold text-slate-400">
                    {new Intl.DateTimeFormat("en-GH", {
                      day: "numeric",

                      month: "short",

                      year: "numeric",

                      hour: "numeric",

                      minute: "2-digit",
                    }).format(new Date(notification.createdAt))}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleOpen(notification)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    Open
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    disabled={pending}
                    title="Archive notification"
                    onClick={() => handleArchive(notification.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {data.totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400">
            Page {data.page} of {data.totalPages}
          </p>

          <div className="flex gap-2">
            {data.page > 1 ? (
              <button
                type="button"
                onClick={() =>
                  router.push(`/notifications?page=${data.page - 1}`)
                }
                className="h-9 rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-600"
              >
                Previous
              </button>
            ) : null}

            {data.page < data.totalPages ? (
              <button
                type="button"
                onClick={() =>
                  router.push(`/notifications?page=${data.page + 1}`)
                }
                className="h-9 rounded-xl bg-blue-600 px-4 text-xs font-black text-white"
              >
                Next
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
