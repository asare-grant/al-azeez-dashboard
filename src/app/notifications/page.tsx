import {
  Bell,
  CheckCheck,
  Settings2,
  Inbox,
  Sparkles,
} from "lucide-react";

import {
  getNotificationCentre,
} from "@/lib/notifications";

import NotificationCentre from "@/components/notifications/NotificationCentre";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

type NotificationsPageProps = {
  searchParams:
    Promise<{
      page?:
        string;
    }>;
};

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const params =
    await searchParams;

  const page =
    Math.max(
      1,
      Number(
        params.page,
      ) || 1,
    );

  const data =
    await getNotificationCentre({
      page,

      pageSize:
        20,
    });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <section className="relative overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_32px_90px_rgba(15,23,42,0.22)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
                <Sparkles className="h-3.5 w-3.5" />

                School Communications
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Notification Centre
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Academic updates, report-card workflows, assessments and important school activity in one secure place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <HeroMetric
                icon={
                  Bell
                }
                label="Notifications"
                value={
                  data.total
                }
              />

              <HeroMetric
                icon={
                  Inbox
                }
                label="Unread"
                value={
                  data.unread
                }
              />
            </div>
          </div>
        </section>

        <div className="mt-6">
          <NotificationCentre
            data={
              data
            }
          />
        </div>
      </div>
    </div>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof Bell;

  label:
    string;

  value:
    number;
}) {
  return (
    <div className="min-w-[135px] rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
      <Icon className="h-5 w-5 text-blue-300" />

      <p className="mt-3 text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
    </div>
  );
}