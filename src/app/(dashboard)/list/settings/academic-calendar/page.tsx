// src/app/(dashboard)/list/settings/academic-calendar/page.tsx
import {
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock3,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import {
  contextHasPermission,
  getCurrentAccessContext,
} from "@/lib/access-control";

import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";

import TermForm from "@/components/forms/TermForm";

import AcademicYearForm from "@/components/forms/AcademicYearForm";

export const dynamic = "force-dynamic";

export const revalidate = 0;

export default async function AcademicCalendarSettingsPage() {
  /* ========================================================================== */
/* ACCESS                                                                     */
/* ========================================================================== */

const access =
  await getCurrentAccessContext();

if (
  !access.authenticated
) {
  redirect(
    "/sign-in",
  );
}

if (
  !contextHasPermission(
    access,
    "settings.manage",
  )
) {
  redirect(
    "/",
  );
}

  const [academicYears, terms] = await Promise.all([
    prisma.schoolAcademicYear.findMany({
      orderBy: [
        {
          isActive: "desc",
        },

        {
          startDate: "desc",
        },
      ],
    }),

    prisma.schoolTerm.findMany({
      orderBy: [
        {
          isActive: "desc",
        },

        {
          startDate: "desc",
        },
      ],
    }),
  ]);

  const activeAcademicYear =
    academicYears.find((year) => year.isActive) ?? null;

  const activeTerm = terms.find((term) => term.isActive) ?? null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1700px]">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[34px] border border-slate-800 bg-[linear-gradient(135deg,#020617_0%,#0f172a_52%,#172554_100%)] p-6 text-white shadow-[0_32px_100px_rgba(15,23,42,0.24)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-28 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-36 left-[28%] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-blue-200 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" />
                Academic Administration
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-blue-300">
                Calendar Configuration
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                Academic Calendar Settings
              </h1>

              <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-300 sm:text-base">
                Configure the academic year and school term used across
                assessments, assignments, examinations, weightings and terminal
                report cards.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
              <HeroMetric
                icon={CalendarRange}
                label="Active Year"
                value={activeAcademicYear?.name ?? "Not set"}
              />

              <HeroMetric
                icon={CalendarDays}
                label="Active Term"
                value={activeTerm?.name.replace(/_/g, " ") ?? "Not set"}
              />
            </div>
          </div>
        </section>

        {/* STATUS STRIP */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatusCard
            icon={GraduationCap}
            label="Academic Years"
            value={academicYears.length}
            description="Configured school years"
          />

          <StatusCard
            icon={CalendarDays}
            label="Terms"
            value={terms.length}
            description="Configured academic terms"
          />

          <StatusCard
            icon={CheckCircle2}
            label="Current Year"
            value={activeAcademicYear?.name ?? "—"}
            description="Used by academic records"
          />

          <StatusCard
            icon={Clock3}
            label="Current Term"
            value={activeTerm?.name.replace(/_/g, " ") ?? "—"}
            description="Current reporting period"
          />
        </section>

        {/* SETTINGS WORKSPACES */}
        <section className="mt-6 grid items-start gap-6 xl:grid-cols-2">
          {/* ACADEMIC YEAR */}
          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_22px_65px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50/70 via-white to-white p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  <CalendarRange className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.17em] text-blue-600">
                    Academic Year
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                    School academic year
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Create and manage the school year used by assessments,
                    examinations, academic weighting and report-card generation.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <AcademicYearForm
                data={activeAcademicYear}
                academicYears={academicYears}
              />
            </div>
          </div>

          {/* TERM */}
          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_22px_65px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 bg-gradient-to-br from-violet-50/60 via-white to-white p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.17em] text-violet-600">
                    School Term
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                    Academic term
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Configure term dates and select the active reporting term
                    used throughout the academic system.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <TermForm
                data={activeTerm}
                terms={terms}
                academicYears={academicYears}
                activeAcademicYearId={activeAcademicYear?.id ?? null}
              />
            </div>
          </div>
        </section>

        {/* GUIDANCE */}
        <section className="mt-6 rounded-[28px] border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <ShieldCheck className="h-4 w-4" />
            </div>

            <div>
              <p className="font-black text-slate-900">
                Academic period integrity
              </p>

              <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-600">
                The active academic year and active term should represent the
                school's current reporting period. Existing published report
                cards remain historical records even when the active period is
                changed.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;

  label: string;

  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
      <Icon className="h-5 w-5 text-blue-300" />

      <p className="mt-3 truncate text-sm font-black text-white">{value}</p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof CalendarDays;

  label: string;

  value: string | number;

  description: string;
}) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.05)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 break-words text-xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
    </article>
  );
}
