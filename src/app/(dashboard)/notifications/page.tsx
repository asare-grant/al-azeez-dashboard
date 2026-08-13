import Link from "next/link";

import { ArrowLeft, Bell, Inbox, Settings2, Sparkles } from "lucide-react";

import { auth } from "@clerk/nextjs/server";

import { getRoleDashboardPath, type AppRole } from "@/lib/navigation/roles";

import { getNotificationCentre } from "@/lib/notifications";

import NotificationCentre from "@/components/notifications/NotificationCentre";

export const dynamic = "force-dynamic";

export const revalidate = 0;

type NotificationsPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const params = await searchParams;

  const { sessionClaims } = await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: AppRole;
    }
  )?.role;

  const dashboardPath = role ? getRoleDashboardPath(role) : "/";

  const page = Math.max(1, Number(params.page) || 1);

  const data = await getNotificationCentre({
    page,

    pageSize: 20,
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={dashboardPath}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <Link
            href="/notifications/settings"
            className="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
          >
            <Settings2 className="h-4 w-4" />
            Notification Preferences
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-slate-950 text-white shadow-[0_35px_100px_rgba(15,23,42,0.28)]">
          {/* BACKGROUND EFFECTS */}
          <div className="pointer-events-none absolute inset-0">
            {/* BLUE GLOW */}
            <div className="absolute -right-24 -top-28 h-[360px] w-[360px] rounded-full bg-blue-500/20 blur-[90px]" />

            {/* CYAN GLOW */}
            <div className="absolute -bottom-28 left-[28%] h-[320px] w-[320px] rounded-full bg-cyan-400/10 blur-[100px]" />

            {/* VIOLET GLOW */}
            <div className="absolute left-[-100px] top-1/2 h-[260px] w-[260px] -translate-y-1/2 rounded-full bg-violet-500/10 blur-[90px]" />

            {/* SUBTLE GRID */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `
          linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)
        `,
                backgroundSize: "42px 42px",
              }}
            />

            {/* TOP HIGHLIGHT */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />
          </div>

          <div className="relative p-6 sm:p-8 lg:p-10 xl:p-12">
            <div className="grid gap-10 xl:grid-cols-[1.4fr_0.8fr] xl:items-end">
              {/* LEFT */}
              <div className="max-w-3xl">
                {/* EYEBROW */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 backdrop-blur-xl sm:text-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  School Communications
                </div>

                {/* TITLE */}
                <div className="mt-6 flex items-start gap-4">
                  <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.08] shadow-inner backdrop-blur-xl sm:flex">
                    <Bell className="h-6 w-6 text-blue-300" />
                  </div>

                  <div>
                    <h1 className="text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl xl:text-[3.4rem]">
                      Notification Centre
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base lg:text-[17px]">
                      A secure communications hub for academic updates,
                      report-card workflows, assessments, finance activity and
                      important school notices.
                    </p>
                  </div>
                </div>

                {/* TRUST / STATUS STRIP */}
                <div className="mt-7 flex flex-wrap gap-2.5">
                  <HeroPill label="Secure Delivery" />
                  <HeroPill label="Role-Aware" />
                  <HeroPill label="Academic Workflows" />
                  <HeroPill label="Live Activity" />
                </div>
              </div>

              {/* RIGHT */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <PremiumHeroMetric
                  icon={Bell}
                  label="Total Notifications"
                  value={data.total}
                  helper="Communication history"
                />

                <PremiumHeroMetric
                  icon={Inbox}
                  label="Unread"
                  value={data.unread}
                  helper={
                    data.unread > 0
                      ? "Requires attention"
                      : "You're all caught up"
                  }
                  highlight={data.unread > 0}
                />
              </div>
            </div>
          </div>

          {/* BOTTOM STATUS BAR */}
          <div className="relative border-t border-white/10 bg-white/[0.035] px-6 py-3.5 backdrop-blur-xl sm:px-8 lg:px-10 xl:px-12">
            <div className="flex flex-col gap-2 text-[11px] font-bold text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Notification services operational
              </div>

              <div className="text-slate-500">
                Personalized for your school account
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6">
          <NotificationCentre data={data} />
        </div>
      </div>
    </div>
  );
}

function PremiumHeroMetric({
  icon: Icon,
  label,
  value,
  helper,
  highlight = false,
}: {
  icon: typeof Bell;
  label: string;
  value: number;
  helper: string;
  highlight?: boolean;
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[24px] border p-4 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12] sm:p-5 ${
        highlight
          ? "border-blue-400/25 bg-blue-400/[0.10]"
          : "border-white/10 bg-white/[0.07]"
      }`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-400/10 blur-2xl transition group-hover:bg-blue-400/20" />

      <div className="relative">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${
            highlight
              ? "border-blue-300/20 bg-blue-400/15 text-blue-200"
              : "border-white/10 bg-white/[0.07] text-slate-200"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <p className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
          {value}
        </p>

        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          {helper}
        </p>
      </div>
    </article>
  );
}

function HeroPill({
  label,
}: {
  label: string;
}) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-300 backdrop-blur-lg">
      {label}
    </span>
  );
}
