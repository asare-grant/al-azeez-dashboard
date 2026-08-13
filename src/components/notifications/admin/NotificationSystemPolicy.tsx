"use client";

import {
  BellRing,
  LockKeyhole,
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
  updateNotificationSystemSettings,
} from "@/lib/notifications/actions";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

type NotificationSystemPolicyProps = {
  settings: {
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

    updatedBy:
      string | null;

    updatedAt:
      Date | string | null;
  };
};

/* -------------------------------------------------------------------------- */
/*                               COMPONENT                                    */
/* -------------------------------------------------------------------------- */

export default function NotificationSystemPolicy({
  settings,
}: NotificationSystemPolicyProps) {
  const [
    pending,
    startTransition,
  ] =
    useTransition();

  const [
    emailEnabled,
    setEmailEnabled,
  ] =
    useState(
      settings.emailEnabled,
    );

  const [
    pushEnabled,
    setPushEnabled,
  ] =
    useState(
      settings.pushEnabled,
    );

  const [
    whatsAppEnabled,
    setWhatsAppEnabled,
  ] =
    useState(
      settings.whatsAppEnabled,
    );

  const [
    smsEnabled,
    setSmsEnabled,
  ] =
    useState(
      settings.smsEnabled,
    );

  const [
    quietHoursEnabled,
    setQuietHoursEnabled,
  ] =
    useState(
      settings.quietHoursEnabled,
    );

  function handleSave() {
    startTransition(
      async () => {
        const result =
          await updateNotificationSystemSettings({
            emailEnabled,

            pushEnabled,

            whatsAppEnabled,

            smsEnabled,

            quietHoursEnabled,
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
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      {/* HEADER */}

      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-600">
          <ShieldCheck className="h-4 w-4" />

          Global Notification Policy
        </div>

        <h2 className="mt-2 text-2xl font-black text-slate-950">
          School-wide delivery controls
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Control which notification delivery channels are available across
          the school. Individual user preferences only apply when the
          corresponding channel is enabled here.
        </p>
      </div>

      {/* POLICY NOTICE */}

      <div className="p-5 pb-0 sm:p-6 sm:pb-0">
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <p className="text-sm font-black text-blue-900">
              In-app delivery is protected
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-700">
              The school notification centre is the primary communication
              record and cannot be globally disabled from this panel.
            </p>
          </div>
        </div>
      </div>

      {/* CHANNELS */}

      <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5 sm:p-6">
        <SystemChannelCard
          icon={
            BellRing
          }
          title="In-App"
          description="Navbar alerts and notification centre."
          enabled
          protectedChannel
          onChange={() => {}}
        />

        <SystemChannelCard
          icon={
            Mail
          }
          title="Email"
          description="Email delivery infrastructure."
          enabled={
            emailEnabled
          }
          onChange={
            setEmailEnabled
          }
        />

        <SystemChannelCard
          icon={
            Smartphone
          }
          title="Push"
          description="Mobile and browser push alerts."
          enabled={
            pushEnabled
          }
          onChange={
            setPushEnabled
          }
        />

        <SystemChannelCard
          icon={
            MessageCircle
          }
          title="WhatsApp"
          description="WhatsApp Business delivery."
          enabled={
            whatsAppEnabled
          }
          onChange={
            setWhatsAppEnabled
          }
        />

        <SystemChannelCard
          icon={
            MessageSquareText
          }
          title="SMS"
          description="Text-message delivery."
          enabled={
            smsEnabled
          }
          onChange={
            setSmsEnabled
          }
        />
      </div>

      {/* QUIET HOURS POLICY */}

      <div className="border-t border-slate-100 p-5 sm:p-6">
        <div className="flex flex-col gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <MoonStar className="h-5 w-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-black text-slate-950">
                  Allow user quiet hours
                </p>

                <span className="rounded-full bg-violet-100 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-violet-700">
                  Delivery Policy
                </span>
              </div>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                When enabled, users may configure quiet hours for future
                interruptive delivery channels. Mandatory notifications can
                still bypass quiet hours.
              </p>
            </div>
          </div>

          <PolicySwitch
            enabled={
              quietHoursEnabled
            }
            disabled={
              pending
            }
            onChange={
              setQuietHoursEnabled
            }
          />
        </div>

        {/* SAVE */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs leading-5 text-slate-400">
            {settings.updatedAt ? (
              <>
                Last updated{" "}
                {new Intl.DateTimeFormat(
                  "en-GH",
                  {
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
                  },
                ).format(
                  new Date(
                    settings.updatedAt,
                  ),
                )}
              </>
            ) : (
              "Using system defaults"
            )}
          </div>

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
              ? "Saving Policy..."
              : "Save Global Policy"}
          </button>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                            CHANNEL CARD                                    */
/* -------------------------------------------------------------------------- */

function SystemChannelCard({
  icon: Icon,
  title,
  description,
  enabled,
  protectedChannel = false,
  onChange,
}: {
  icon:
    typeof BellRing;

  title:
    string;

  description:
    string;

  enabled:
    boolean;

  protectedChannel?:
    boolean;

  onChange:
    (
      value:
        boolean,
    ) => void;
}) {
  return (
    <article
      className={`rounded-[22px] border p-4 transition ${
        enabled
          ? "border-blue-200 bg-blue-50/60"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
            enabled
              ? "bg-blue-100 text-blue-600"
              : "bg-slate-200 text-slate-400"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <PolicySwitch
          enabled={
            enabled
          }
          disabled={
            protectedChannel
          }
          onChange={
            onChange
          }
        />
      </div>

      <h3 className="mt-4 font-black text-slate-950">
        {title}
      </h3>

      <p className="mt-1 min-h-[40px] text-xs leading-5 text-slate-500">
        {description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
            enabled
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          {enabled
            ? "Enabled"
            : "Disabled"}
        </span>

        {protectedChannel ? (
          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-blue-700">
            Protected
          </span>
        ) : null}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SWITCH                                        */
/* -------------------------------------------------------------------------- */

function PolicySwitch({
  enabled,
  disabled = false,
  onChange,
}: {
  enabled:
    boolean;

  disabled?:
    boolean;

  onChange:
    (
      value:
        boolean,
    ) => void;
}) {
  return (
    <button
      type="button"
      disabled={
        disabled
      }
      aria-pressed={
        enabled
      }
      onClick={() =>
        onChange(
          !enabled,
        )
      }
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        enabled
          ? "bg-blue-600"
          : "bg-slate-300"
      } ${
        disabled
          ? "cursor-not-allowed opacity-70"
          : ""
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
          enabled
            ? "left-6"
            : "left-1"
        }`}
      />
    </button>
  );
}