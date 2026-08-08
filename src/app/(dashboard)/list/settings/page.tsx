import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  FileClock,
  Scale,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import {
  auth,
} from "@clerk/nextjs/server";

import {
  redirect,
} from "next/navigation";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export default async function SettingsPage() {
  const {
    userId,
    sessionClaims,
  } = await auth();

  if (!userId) {
    redirect(
      "/sign-in",
    );
  }

  const role = (
    sessionClaims
      ?.metadata as {
      role?: string;
    }
  )?.role;

  if (
    role !== "admin"
  ) {
    redirect("/");
  }

  const settings = [
    {
      title:
        "School Terms",

      description:
        "Configure academic terms, dates and the currently active school term.",

      href:
        "/list/settings/academic-calendar",

      icon:
        CalendarDays,

      eyebrow:
        "Academic Calendar",
    },

    {
      title:
        "Audit Trail",

      description:
        "Review report-card generation, edits, approvals, publication, regeneration and administrative activity.",

      href:
        "/list/settings/audit",

      icon:
        FileClock,

      eyebrow:
        "Governance & Security",
    },

    {
      title:
        "Academic Weightings",

      description:
        "Control how assignments, assessments and examinations contribute to final scores.",

      href:
        "/list/academic-settings/weightings",

      icon:
        SlidersHorizontal,

      eyebrow:
        "Academic Engine",
    },

    {
      title:
        "Grading Scales",

      description:
        "Manage score boundaries, grade labels, remarks and active grading standards.",

      href:
        "/list/academic-settings/grading-scales",

      icon:
        Scale,

      eyebrow:
        "Academic Standards",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[34px] border border-slate-800 bg-[linear-gradient(135deg,#020617_0%,#0f172a_52%,#172554_100%)] p-6 text-white shadow-[0_32px_100px_rgba(15,23,42,0.22)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-28 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-blue-200 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" />

                Administration
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-blue-300">
                System Configuration
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                Settings Centre
              </h1>

              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-300 sm:text-base">
                Manage the academic configuration, governance controls and
                institutional settings that support the school management
                platform.
              </p>
            </div>

            <div className="flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/10 bg-white/10 text-blue-200 backdrop-blur-xl">
              <Settings2 className="h-8 w-8" />
            </div>
          </div>
        </section>

        {/* SETTINGS */}
        <section className="mt-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Administration
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Configuration & governance
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Select a workspace to manage its configuration.
            </p>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {settings.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <Link
                    key={
                      item.title
                    }
                    href={
                      item.href
                    }
                    className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_26px_70px_rgba(37,99,235,0.10)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
                      {
                        item.eyebrow
                      }
                    </p>

                    <h3 className="mt-2 text-xl font-black text-slate-950">
                      {
                        item.title
                      }
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {
                        item.description
                      }
                    </p>
                  </Link>
                );
              },
            )}
          </div>
        </section>
      </div>
    </div>
  );
}