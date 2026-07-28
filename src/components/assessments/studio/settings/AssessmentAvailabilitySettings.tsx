"use client";

import {
  AlertTriangle,
  CalendarCheck2,
  CalendarClock,
  Clock3,
  Info,
  Timer,
} from "lucide-react";

import type { AssessmentBuilderData } from "@/lib/assessments/types";

import AssessmentStudioSection from "../AssessmentStudioSection";
import AssessmentSettingCard from "./AssessmentSettingCard";

type AssessmentAvailabilitySettingsProps = {
  assessment: AssessmentBuilderData;

  updateAssessment: <Key extends keyof AssessmentBuilderData>(
    key: Key,
    value: AssessmentBuilderData[Key],
  ) => void;

  disabled?: boolean;
};

function toDateTimeLocalValue(value?: Date | string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();

  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function formatAvailabilityDate(value?: Date | string): string {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-GH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function AssessmentAvailabilitySettings({
  assessment,
  updateAssessment,
  disabled = false,
}: AssessmentAvailabilitySettingsProps) {
  const startDate = assessment.startDate
    ? new Date(assessment.startDate)
    : null;

  const dueDate = assessment.dueDate ? new Date(assessment.dueDate) : null;

  const hasValidDates =
    startDate &&
    dueDate &&
    !Number.isNaN(startDate.getTime()) &&
    !Number.isNaN(dueDate.getTime());

  const dueDateIsAfterStart =
    hasValidDates && dueDate.getTime() > startDate.getTime();

  const availabilityMilliseconds = dueDateIsAfterStart
    ? dueDate.getTime() - startDate.getTime()
    : 0;

  const availabilityHours = Math.round(
    availabilityMilliseconds / (1000 * 60 * 60),
  );

  const now = new Date();

  const availabilityStatus =
    !startDate || !dueDateIsAfterStart
      ? "INVALID"
      : dueDate <= now
        ? "EXPIRED"
        : startDate > now
          ? "SCHEDULED"
          : "AVAILABLE";

  function setQuickSchedule(hoursFromNow: number) {
    const now = new Date();

    const end = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);

    updateAssessment("startDate", now);

    updateAssessment("dueDate", end);
  }

  return (
    <AssessmentStudioSection
      eyebrow="Step 4"
      title="Availability and scheduling"
      description="Choose when students can begin the assessment and when submissions should close."
    >
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-1">
        <AssessmentSettingCard
          icon={CalendarCheck2}
          title="Opening date and time"
          description="Students cannot begin before this time."
        >
          <label
            htmlFor="assessment-start-date"
            className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-400"
          >
            Assessment opens
          </label>

          <input
            id="assessment-start-date"
            type="datetime-local"
            disabled={disabled}
            value={toDateTimeLocalValue(assessment.startDate)}
            onChange={(event) => {
              if (!event.target.value) {
                updateAssessment("startDate", undefined);

                return;
              }

              updateAssessment("startDate", new Date(event.target.value));
            }}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <p className="mt-3 text-xs leading-5 text-slate-500">
            {formatAvailabilityDate(assessment.startDate)}
          </p>
        </AssessmentSettingCard>

        <AssessmentSettingCard
          icon={CalendarClock}
          title="Closing date and time"
          description="New submissions will not be accepted after this time."
        >
          <label
            htmlFor="assessment-due-date"
            className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-400"
          >
            Assessment closes
          </label>

          <input
            id="assessment-due-date"
            type="datetime-local"
            disabled={disabled}
            min={toDateTimeLocalValue(assessment.startDate)}
            value={toDateTimeLocalValue(assessment.dueDate)}
            onChange={(event) => {
              if (!event.target.value) {
                updateAssessment("dueDate", undefined);

                return;
              }

              updateAssessment("dueDate", new Date(event.target.value));
            }}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <p className="mt-3 text-xs leading-5 text-slate-500">
            {formatAvailabilityDate(assessment.dueDate)}
          </p>
        </AssessmentSettingCard>
      </div>

      {!dueDateIsAfterStart ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

          <div>
            <p className="text-sm font-black text-red-900">
              Check the assessment dates
            </p>

            <p className="mt-1 text-xs leading-5 text-red-700">
              The closing date and time must be later than the opening date and
              time.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CalendarCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <div>
            <p className="text-sm font-black text-emerald-900">
              Availability window configured
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-700">
              Students will have approximately {availabilityHours}{" "}
              {availabilityHours === 1 ? "hour" : "hours"} in which to begin the
              assessment.
            </p>
          </div>
        </div>
      )}

      {/* OPENING STATUS DSIPLAY */}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <AvailabilityMetric
          label="Publishing Status"
          value={
            availabilityStatus === "SCHEDULED"
              ? "Scheduled"
              : availabilityStatus === "AVAILABLE"
                ? "Available Now"
                : availabilityStatus === "EXPIRED"
                  ? "Expired"
                  : "Check Dates"
          }
        />

        <AvailabilityMetric
          label="Availability Window"
          value={
            dueDateIsAfterStart ? `${availabilityHours} hours` : "Not available"
          }
        />

        <AvailabilityMetric
          label="Time per Attempt"
          value={
            assessment.durationMinutes
              ? `${assessment.durationMinutes} minutes`
              : "Untimed"
          }
        />
      </div>

      {/* QUICK SCHEDULES */}

      <div className="mt-7">
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            Quick schedules
          </p>

          <h3 className="mt-2 text-lg font-black text-slate-950">
            Apply a common availability window
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <QuickScheduleButton
            icon={Clock3}
            title="Next 24 Hours"
            description="Open now and close tomorrow"
            onClick={() => setQuickSchedule(24)}
            disabled={disabled}
          />

          <QuickScheduleButton
            icon={Timer}
            title="Three Days"
            description="Open now and close in 72 hours"
            onClick={() => setQuickSchedule(72)}
            disabled={disabled}
          />

          <QuickScheduleButton
            icon={CalendarClock}
            title="One Week"
            description="Open now and close in seven days"
            onClick={() => setQuickSchedule(168)}
            disabled={disabled}
          />

          <QuickScheduleButton
            icon={CalendarCheck2}
            title="Two Weeks"
            description="Open now and close in fourteen days"
            onClick={() => setQuickSchedule(336)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="mt-7 rounded-[24px] border border-blue-100 bg-blue-50/60 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
            <Info className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-sm font-black text-blue-950">
              How timing works
            </h3>

            <div className="mt-2 space-y-2 text-xs leading-5 text-blue-800">
              <p>
                The availability window controls when a student is permitted to
                start the assessment.
              </p>

              <p>
                The duration controls how long that student has after starting.
              </p>

              <p>
                A student who starts close to the closing time cannot continue
                beyond the assessment closing date.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AssessmentStudioSection>
  );
}

function QuickScheduleButton({
  icon: Icon,
  title,
  description,
  onClick,
  disabled,
}: {
  icon: typeof Clock3;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <p className="mt-3 text-sm font-black text-slate-950">{title}</p>

      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </button>
  );
}

function AvailabilityMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}
