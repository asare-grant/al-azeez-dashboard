"use client";

import type { NotificationEntityType, NotificationType } from "@prisma/client";

import { Bell, CheckCheck, ChevronRight, Inbox, X } from "lucide-react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { useState, useTransition } from "react";

import {
  markAllNotificationsAsRead,
  markNotificationsAsSeen,
  openNotification,
} from "@/lib/notifications/actions";

import { resolveNotificationUrl } from "./notification-links";

type NotificationItem = {
  id: number;

  recipientRole: string;

  readAt: Date | string | null;

  seenAt: Date | string | null;

  createdAt: Date | string;

  event: {
    id: number;

    type: string;

    category: string;

    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";

    title: string;

    message: string;

    actionUrl: string | null;

    entityType: string | null;

    entityId: string | null;

    metadata: unknown;

    createdAt: Date | string;
  };
};

function formatRelativeTime(value: Date | string) {
  const date = new Date(value);

  const difference = Date.now() - date.getTime();

  const minutes = Math.floor(difference / 60_000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",

    month: "short",
  }).format(date);
}

export default function NotificationBellClient({
  notifications,
  unreadCount,
  unseenCount,
}: {
  notifications: NotificationItem[];

  unreadCount: number;

  unseenCount: number;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [pending, startTransition] = useTransition();

  function toggleDropdown() {
    const next = !open;

    setOpen(next);

    if (next && unseenCount > 0) {
      startTransition(async () => {
        await markNotificationsAsSeen();

        router.refresh();
      });
    }
  }

  function handleNotificationOpen(notification: NotificationItem) {
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

      setOpen(false);

      if (href) {
        router.push(href);
      } else {
        router.refresh();
      }
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsAsRead();

      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleDropdown}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-[0_14px_35px_rgba(37,99,235,0.10)]"
      >
        <Bell className="h-[19px] w-[19px]" />

        {unseenCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-black leading-none text-white">
            {unseenCount > 99 ? "99+" : unseenCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-transparent"
          />

          <section
            className="
              fixed
              inset-x-3
              bottom-3
              z-50
              flex
              max-h-[calc(100dvh-24px)]
              flex-col
              overflow-hidden
              rounded-[26px]
              border
              border-slate-200
              bg-white
              shadow-[0_30px_100px_rgba(15,23,42,0.24)]

              sm:absolute
              sm:inset-x-auto
              sm:bottom-auto
              sm:right-0
              sm:top-[calc(100%+12px)]
              sm:w-[430px]
              sm:max-h-[min(640px,calc(100dvh-90px))]
            "
          >
            {/* -------------------------------------------------------------- */}
            {/*                         PREMIUM HEADER                         */}
            {/* -------------------------------------------------------------- */}

            <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-slate-950 via-[#0B1733] to-[#142B5C] px-4 pb-4 pt-3 text-white sm:px-5 sm:pb-5 sm:pt-4">
              {/* BACKGROUND DETAIL */}
              <div className="pointer-events-none absolute -right-14 -top-20 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

              {/* MOBILE HANDLE */}
              <div className="relative mb-3 flex justify-center sm:hidden">
                <div className="h-1 w-10 rounded-full bg-white/20" />
              </div>

              {/* TOP ROW */}
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-blue-300 shadow-inner">
                    <Bell className="h-[18px] w-[18px]" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-300">
                      Notification Centre
                    </p>

                    <h2 className="mt-1 text-lg font-black tracking-tight text-white sm:text-xl">
                      Notifications
                    </h2>

                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                      Stay updated with important school activity.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-300 transition hover:bg-white/15 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* STATUS / ACTION ROW */}
              <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      unreadCount > 0
                        ? "bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                        : "bg-emerald-400"
                    }`}
                  />

                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
                    {unreadCount === 0
                      ? "All caught up"
                      : `${unreadCount} unread`}
                  </span>
                </div>

                {unreadCount > 0 ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={handleMarkAllRead}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.07] px-3 text-[10px] font-black text-blue-200 transition hover:bg-white/15 hover:text-white disabled:opacity-50"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                ) : null}
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-blue-50 text-blue-600">
                  <Inbox className="h-6 w-6" />
                </div>

                <p className="mt-4 font-black text-slate-950">
                  You&apos;re all caught up
                </p>

                <p className="mt-1 max-w-[250px] text-xs leading-5 text-slate-500">
                  New academic and school notifications will appear here.
                </p>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {notifications.map((notification) => {
                  const unread = !notification.readAt;

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      disabled={pending}
                      onClick={() => handleNotificationOpen(notification)}
                      className={`group relative flex w-full gap-3 border-b border-slate-100 px-3 py-4 text-left transition last:border-b-0 hover:bg-slate-50 sm:p-4 ${
                        unread ? "bg-blue-50/40" : "bg-white"
                      }`}
                    >
                      {unread ? (
                        <span className="absolute left-0 top-0 h-full w-[3px] bg-blue-600" />
                      ) : null}

                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 sm:rounded-2xl ${
                          notification.event.priority === "URGENT"
                            ? "bg-red-50 text-red-600"
                            : notification.event.priority === "HIGH"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p
                            className={`truncate text-sm ${
                              unread
                                ? "font-black text-slate-950"
                                : "font-bold text-slate-700"
                            }`}
                          >
                            {notification.event.title}
                          </p>

                          <span className="shrink-0 text-[10px] font-bold text-slate-400">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {notification.event.message}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-blue-600">
                          Open
                          <ChevronRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="shrink-0 border-t border-slate-100 bg-slate-50/70 p-3">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="group inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-xs font-black text-white transition hover:bg-blue-700"
              >
                View All Notifications
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
