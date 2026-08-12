"use client";

import {
  Bell,
  Clock3,
  Mail,
  MessageCircle,
  MessageSquareText,
  MoonStar,
  Save,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import {
  useState,
  useTransition,
} from "react";

import {
  toast,
} from "react-toastify";

import {
  updateNotificationUserSettings,
} from "@/lib/notifications/actions";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

type UserSettings = {
  userId:
    string;

  quietHoursEnabled:
    boolean;

  quietHoursStartMinute:
    number | null;

  quietHoursEndMinute:
    number | null;

  timezone:
    string;
};

type SystemSettings = {
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

  quietHoursEnabled:
    boolean;
};

/* -------------------------------------------------------------------------- */
/*                                 HELPERS                                    */
/* -------------------------------------------------------------------------- */

function minuteToTime(
  value:
    number | null,
) {
  if (
    value ===
    null
  ) {
    return "";
  }

  const hours =
    Math.floor(
      value /
        60,
    );

  const minutes =
    value %
    60;

  return `${String(
    hours,
  ).padStart(
    2,
    "0",
  )}:${String(
    minutes,
  ).padStart(
    2,
    "0",
  )}`;
}

/* -------------------------------------------------------------------------- */
/*                               COMPONENT                                    */
/* -------------------------------------------------------------------------- */

export default function NotificationDeliverySettings({
  userSettings,
  systemSettings,
}: {
  userSettings:
    UserSettings;

  systemSettings:
    SystemSettings;
}) {
  const [
    pending,
    startTransition,
  ] =
    useTransition();

  const [
    quietHoursEnabled,
    setQuietHoursEnabled,
  ] =
    useState(
      userSettings
        .quietHoursEnabled,
    );

  const [
    quietHoursStart,
    setQuietHoursStart,
  ] =
    useState(
      minuteToTime(
        userSettings
          .quietHoursStartMinute,
      ) ||
        "21:00",
    );

  const [
    quietHoursEnd,
    setQuietHoursEnd,
  ] =
    useState(
      minuteToTime(
        userSettings
          .quietHoursEndMinute,
      ) ||
        "06:00",
    );

  const [
    timezone,
    setTimezone,
  ] =
    useState(
      userSettings.timezone ||
        "Africa/Accra",
    );

  function handleSave() {
    startTransition(
      async () => {
        const result =
          await updateNotificationUserSettings({
            quietHoursEnabled,

            quietHoursStart,

            quietHoursEnd,

            timezone,
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
      },
    );
  }

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------------------- */}
      {/* DELIVERY CHANNELS                                                */}
      {/* ---------------------------------------------------------------- */}

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            <Smartphone className="h-4 w-4" />

            Delivery Channels
          </div>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            How notifications can reach you
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            In-app notifications are currently active. Additional channels
            will become available as they are enabled by the school.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5 sm:p-6">
          <ChannelCard
            icon={
              Bell
            }
            title="In-App"
            description="Notification centre and navbar alerts."
            available={
              systemSettings
                .inAppEnabled
            }
            active
          />

          <ChannelCard
            icon={
              Mail
            }
            title="Email"
            description="Important notices delivered by email."
            available={
              systemSettings
                .emailEnabled
            }
          />

          <ChannelCard
            icon={
              Smartphone
            }
            title="Push"
            description="Device push notifications."
            available={
              systemSettings
                .pushEnabled
            }
          />

          <ChannelCard
            icon={
              MessageCircle
            }
            title="WhatsApp"
            description="School alerts through WhatsApp."
            available={
              systemSettings
                .whatsAppEnabled
            }
          />

          <ChannelCard
            icon={
              MessageSquareText
            }
            title="SMS"
            description="Critical messages by text message."
            available={
              systemSettings
                .smsEnabled
            }
          />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* QUIET HOURS                                                      */}
      {/* ---------------------------------------------------------------- */}

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-violet-600">
            <MoonStar className="h-4 w-4" />

            Quiet Hours
          </div>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Reduce interruptions at night
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Quiet hours apply to optional interruptive delivery channels.
            In-app notifications remain available in your notification centre,
            while mandatory school alerts can bypass quiet hours when
            necessary.
          </p>
        </div>

        {!systemSettings
          .quietHoursEnabled ? (
          <div className="p-5 sm:p-6">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-black text-amber-800">
                Quiet hours are currently unavailable.
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-700">
                This feature has been disabled by the school administrator.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            {/* ENABLE SWITCH */}

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-black text-slate-950">
                    Enable quiet hours
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Hold optional outbound alerts during your chosen period.
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-pressed={
                  quietHoursEnabled
                }
                disabled={
                  pending
                }
                onClick={() =>
                  setQuietHoursEnabled(
                    (
                      value,
                    ) =>
                      !value,
                  )
                }
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  quietHoursEnabled
                    ? "bg-violet-600"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                    quietHoursEnabled
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* TIMES */}

            <div
              className={`mt-5 grid gap-4 md:grid-cols-3 ${
                quietHoursEnabled
                  ? ""
                  : "pointer-events-none opacity-50"
              }`}
            >
              <TimeField
                label="Quiet hours begin"
                value={
                  quietHoursStart
                }
                onChange={
                  setQuietHoursStart
                }
              />

              <TimeField
                label="Quiet hours end"
                value={
                  quietHoursEnd
                }
                onChange={
                  setQuietHoursEnd
                }
              />

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                  Timezone
                </label>

                <select
                  value={
                    timezone
                  }
                  onChange={(
                    event,
                  ) =>
                    setTimezone(
                      event.target
                        .value,
                    )
                  }
                  className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="Africa/Accra">
                    Africa/Accra — Ghana
                  </option>
                </select>
              </div>
            </div>

            {/* POLICY NOTE */}

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <div>
                <p className="text-sm font-black text-emerald-800">
                  Important school alerts remain protected
                </p>

                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  Critical academic workflow, security and selected transaction
                  notifications may still be delivered immediately.
                </p>
              </div>
            </div>

            {/* SAVE */}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={
                  pending
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />

                {pending
                  ? "Saving..."
                  : "Save Delivery Settings"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             CHANNEL CARD                                   */
/* -------------------------------------------------------------------------- */

function ChannelCard({
  icon: Icon,
  title,
  description,
  available,
  active = false,
}: {
  icon:
    typeof Bell;

  title:
    string;

  description:
    string;

  available:
    boolean;

  active?:
    boolean;
}) {
  const enabled =
    available &&
    active;

  return (
    <article
      className={`relative overflow-hidden rounded-[22px] border p-4 ${
        available
          ? "border-blue-100 bg-blue-50/50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
          available
            ? "bg-blue-100 text-blue-600"
            : "bg-slate-200 text-slate-400"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-4 font-black text-slate-950">
        {title}
      </h3>

      <p className="mt-1 min-h-[40px] text-xs leading-5 text-slate-500">
        {description}
      </p>

      <div className="mt-4">
        {enabled ? (
          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-700">
            Active
          </span>
        ) : available ? (
          <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-blue-700">
            Available
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
            Not available yet
          </span>
        )}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                              TIME FIELD                                    */
/* -------------------------------------------------------------------------- */

function TimeField({
  label,
  value,
  onChange,
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string,
    ) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </label>

      <input
        type="time"
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target
              .value,
          )
        }
        className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}