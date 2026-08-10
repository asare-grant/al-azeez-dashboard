"use client";

import {
  CalendarDays,
  Loader2,
  MessageSquareText,
  Save,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { toast } from "react-toastify";

import { saveReportCardDetails } from "@/lib/report-cards/review-actions";

import type { ReportCardReviewWorkspaceData } from "@/lib/report-cards/review-types";

type ReportCardDetailsFormProps = {
  reportCard: ReportCardReviewWorkspaceData;
};

type FormState = {
  conduct: string;
  attitude: string;
  interest: string;

  classTeacherRemark: string;
  headTeacherRemark: string;

  promotionStatus: string;

  termClosedOn: string;
  nextTermBegins: string;
};

function toDateInputValue(value: Date | string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export default function ReportCardDetailsForm({
  reportCard,
}: ReportCardDetailsFormProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>({
    conduct: reportCard.conduct ?? "",

    attitude: reportCard.attitude ?? "",

    interest: reportCard.interest ?? "",

    classTeacherRemark: reportCard.classTeacherRemark ?? "",

    headTeacherRemark: reportCard.headTeacherRemark ?? "",

    promotionStatus: reportCard.promotionStatus ?? "",

    termClosedOn: toDateInputValue(reportCard.termClosedOn),

    nextTermBegins: toDateInputValue(reportCard.nextTermBegins),
  });

  const canEdit = reportCard.permissions.canEditDetails;

  const canEditHeadTeacherRemark =
    reportCard.permissions.canEditHeadTeacherRemark;

  function updateField<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit() {
    if (!canEdit || isPending) {
      return;
    }

    startTransition(async () => {
      const result = await saveReportCardDetails({
        reportCardId: reportCard.id,

        conduct: form.conduct,

        attitude: form.attitude,

        interest: form.interest,

        classTeacherRemark: form.classTeacherRemark,

        headTeacherRemark: form.headTeacherRemark,

        promotionStatus: form.promotionStatus,

        termClosedOn: form.termClosedOn,

        nextTermBegins: form.nextTermBegins,
      });

      if (!result.success) {
        toast.error(result.message);

        return;
      }

      toast.success(result.message);

      router.refresh();
    });
  }

  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/30 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-blue-50 text-blue-600">
            <UserRoundCheck className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Student Record
            </p>

            <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
              Attendance, development and remarks
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Complete the non-academic information required for the terminal
              report.
            </p>
          </div>
        </div>

        {!canEdit ? (
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            Read Only
          </span>
        ) : null}
      </div>

      <div className="space-y-7 p-5 sm:p-6">
        <FormSection
          icon={CalendarDays}
          title="Attendance"
          description="Official attendance figures are synchronized automatically from the school's attendance register."
        >
          <div className="rounded-[22px] border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/40 p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black text-slate-900">
                  Official Attendance Snapshot
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  These values are generated from the attendance register and
                  cannot be edited from the report card.
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Synced from Attendance Register
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <AttendanceMetric
                label="Days School Opened"
                value={
                  reportCard.daysSchoolOpened === null
                    ? "—"
                    : String(reportCard.daysSchoolOpened)
                }
              />

              <AttendanceMetric
                label="Days Present"
                value={
                  reportCard.daysPresent === null
                    ? "—"
                    : String(reportCard.daysPresent)
                }
              />

              <AttendanceMetric
                label="Days Absent"
                value={
                  reportCard.daysAbsent === null
                    ? "—"
                    : String(reportCard.daysAbsent)
                }
              />

              <AttendanceMetric
                label="Attendance"
                value={
                  reportCard.attendancePercentage === null
                    ? "—"
                    : `${reportCard.attendancePercentage.toFixed(1)}%`
                }
                highlight
              />
            </div>

            {reportCard.daysPresent === null ||
            reportCard.daysAbsent === null ||
            reportCard.attendancePercentage === null ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-bold leading-5 text-amber-800">
                  The attendance register is not yet complete for this student
                  and academic term. Complete the attendance register and
                  regenerate the report card.
                </p>
              </div>
            ) : null}
          </div>
        </FormSection>

        <FormSection
          icon={UserRoundCheck}
          title="Student Development"
          description="Record conduct, attitude and areas of interest."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <InputField
              label="Conduct"
              value={form.conduct}
              placeholder="Example: Excellent"
              disabled={!canEdit}
              onChange={(value) => updateField("conduct", value)}
            />

            <InputField
              label="Attitude"
              value={form.attitude}
              placeholder="Example: Responsible"
              disabled={!canEdit}
              onChange={(value) => updateField("attitude", value)}
            />

            <InputField
              label="Interest"
              value={form.interest}
              placeholder="Example: Science and sports"
              disabled={!canEdit}
              onChange={(value) => updateField("interest", value)}
            />
          </div>
        </FormSection>

        <FormSection
          icon={MessageSquareText}
          title="Official Remarks"
          description="Enter the class-teacher and head-teacher comments."
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <TextAreaField
              label="Class-Teacher Remark"
              value={form.classTeacherRemark}
              disabled={!canEdit}
              placeholder="Enter a clear academic and behavioural remark..."
              maxLength={500}
              onChange={(value) => updateField("classTeacherRemark", value)}
            />

            <TextAreaField
              label="Head-Teacher Remark"
              value={form.headTeacherRemark}
              disabled={!canEdit || !canEditHeadTeacherRemark}
              placeholder={
                canEditHeadTeacherRemark
                  ? "Enter the head-teacher's final remark..."
                  : "Only an administrator can edit this remark."
              }
              maxLength={500}
              onChange={(value) => updateField("headTeacherRemark", value)}
            />
          </div>
        </FormSection>

        <FormSection
          icon={ShieldCheck}
          title="Progression and Dates"
          description="Record the progression decision and the academic calendar dates."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <InputField
              label="Promotion Status"
              value={form.promotionStatus}
              placeholder="Example: Promoted to Basic 9"
              disabled={!canEdit}
              onChange={(value) => updateField("promotionStatus", value)}
            />

            <InputField
              label="Term Closed On"
              value={form.termClosedOn}
              type="date"
              disabled={!canEdit}
              onChange={(value) => updateField("termClosedOn", value)}
            />

            <InputField
              label="Next Term Begins"
              value={form.nextTermBegins}
              type="date"
              disabled={!canEdit}
              onChange={(value) => updateField("nextTermBegins", value)}
            />
          </div>
        </FormSection>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-400">
            Changes are saved only after selecting the button.
          </p>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canEdit || isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {isPending ? "Saving..." : "Save Report Details"}
          </button>
        </div>
      </div>
    </section>
  );
}

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof CalendarDays;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <h3 className="text-sm font-black text-slate-900">{title}</h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>

      {children}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  placeholder,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  type?: string;
  placeholder?: string;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.13em] text-slate-500">
        {label}
      </span>

      <input
        type={type}
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder: string;
  maxLength: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.13em] text-slate-500">
        {label}
      </span>

      <textarea
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={6}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      />

      <span className="mt-1 block text-right text-[10px] font-semibold text-slate-400">
        {value.length}/{maxLength}
      </span>
    </label>
  );
}

function AttendanceMetric({
  label,
  value,
  highlight = false,
}: {
  label:
    string;

  value:
    string;

  highlight?:
    boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-blue-200 bg-blue-50/80"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-black ${
          highlight
            ? "text-blue-700"
            : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}