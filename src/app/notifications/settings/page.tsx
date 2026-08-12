import {
  ArrowLeft,
  BellRing,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import Link from "next/link";

import {
  getUserNotificationDeliverySettings,
  getUserNotificationPreferences,
} from "@/lib/notifications/queries";

import NotificationPreferences from "@/components/notifications/NotificationPreferences";

import NotificationDeliverySettings from "@/components/notifications/NotificationDeliverySettings";

export const dynamic = "force-dynamic";

export const revalidate = 0;

export default async function NotificationSettingsPage() {
  const [preferences, deliverySettings] = await Promise.all([
    getUserNotificationPreferences(),

    getUserNotificationDeliverySettings(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1200px]">
        <Link
          href="/notifications"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Notifications
        </Link>

        <section className="relative mt-5 overflow-hidden rounded-[30px] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.20)] sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.17em] text-blue-200">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Notification Control
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Notification Preferences
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Control how school notifications reach you, manage quiet hours and
              choose which optional updates appear in your notification centre
              while critical academic and system alerts remain protected.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Critical workflow alerts remain enabled
            </div>
          </div>
        </section>

        <div className="mt-6 space-y-6">
          <NotificationDeliverySettings
            userSettings={deliverySettings.user}
            systemSettings={deliverySettings.system}
          />

          <NotificationPreferences preferences={preferences} />
        </div>
      </div>
    </div>
  );
}
