"use client";

import type {
  NotificationCategory,
} from "@prisma/client";

import {
  BadgeDollarSign,
  BellRing,
  BookOpenCheck,
  CalendarCheck2,
  FileText,
  Megaphone,
  School,
  ShieldCheck,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useTransition,
} from "react";

import {
  toast,
} from "react-toastify";

import {
  updateNotificationPreference,
} from "@/lib/notifications/actions";

type Preference = {
  category:
    NotificationCategory;

  inAppEnabled:
    boolean;

  emailEnabled:
    boolean;

  pushEnabled:
    boolean;

  whatsAppEnabled:
    boolean;

  smsEnabled:
    boolean;
};

const categoryDetails = {
  ASSESSMENT: {
    title:
      "Assessments",

    description:
      "Assessment publication, scheduling, results and teacher feedback.",

    icon:
      BookOpenCheck,
  },

  REPORT_CARD: {
    title:
      "Report Cards",

    description:
      "Report-card workflow, approvals, publication and academic integrity alerts.",

    icon:
      FileText,
  },

  ATTENDANCE: {
    title:
      "Attendance",

    description:
      "Attendance-related notices and register updates.",

    icon:
      CalendarCheck2,
  },

  ACADEMIC: {
    title:
      "Academic Updates",

    description:
      "Academic calendar, weightings, grading standards and school configuration updates.",

    icon:
      School,
  },

  FINANCE: {
    title:
      "Finance",

    description:
      "Fees, balances, receipts and confirmed payments.",

    icon:
      BadgeDollarSign,
  },

  ANNOUNCEMENT: {
    title:
      "Announcements",

    description:
      "School-wide announcements and important notices.",

    icon:
      Megaphone,
  },

  SYSTEM: {
    title:
      "System Alerts",

    description:
      "Critical security, integrity and system messages.",

    icon:
      ShieldCheck,
  },

  GENERAL: {
    title:
      "General",

    description:
      "Other school-management notifications.",

    icon:
      BellRing,
  },
} satisfies Record<
  NotificationCategory,
  {
    title:
      string;

    description:
      string;

    icon:
      typeof BellRing;
  }
>;

export default function NotificationPreferences({
  preferences,
}: {
  preferences:
    Preference[];
}) {
  const router =
    useRouter();

  const [
    pending,
    startTransition,
  ] =
    useTransition();

  function handleChange(
    category:
      NotificationCategory,

    enabled:
      boolean,
  ) {
    startTransition(
      async () => {
        const result =
          await updateNotificationPreference({
            category,

            inAppEnabled:
              enabled,
          });

        if (
          !result.success
        ) {
          toast.error(
            result.message,
          );

          return;
        }

        toast.success(
          result.message,
        );

        router.refresh();
      },
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
          In-App Delivery
        </p>

        <h2 className="mt-2 text-2xl font-black text-slate-950">
          What should appear in your inbox?
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Preferences apply to optional notification categories. Protected workflow and system alerts may still be delivered when necessary.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {preferences.map(
          (
            preference,
          ) => {
            const config =
              categoryDetails[
                preference.category
              ];

            const Icon =
              config.icon;

            const protectedCategory =
              preference.category ===
              "SYSTEM";

            return (
              <div
                key={
                  preference.category
                }
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <div className="flex min-w-0 gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-slate-950">
                        {
                          config.title
                        }
                      </h3>

                      {protectedCategory ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-700">
                          Protected
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                      {
                        config.description
                      }
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    pending ||
                    protectedCategory
                  }
                  onClick={() =>
                    handleChange(
                      preference.category,

                      !preference.inAppEnabled,
                    )
                  }
                  aria-pressed={
                    preference.inAppEnabled
                  }
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    preference.inAppEnabled
                      ? "bg-blue-600"
                      : "bg-slate-200"
                  } ${
                    protectedCategory
                      ? "cursor-not-allowed opacity-70"
                      : ""
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      preference.inAppEnabled
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}