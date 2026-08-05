"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Crown,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  toast,
} from "react-toastify";

import {
  createGradingScale,
  updateGradingScale,
} from "@/lib/academic-weightings/actions";

import {
  gradingScaleSchema,
} from "@/lib/academic-weightings/validation";

import type {
  GradingScaleInput,
} from "@/lib/academic-weightings/types";

import GradeBoundaryBuilder from "./GradeBoundaryBuilder";
import GradingScaleValidationPanel from "./GradingScaleValidationPanel";

type GradingScaleStudioProps = {
  mode:
    | "create"
    | "edit";

  initialScale: GradingScaleInput;
};

export default function GradingScaleStudio({
  mode,
  initialScale,
}: GradingScaleStudioProps) {
  const router =
    useRouter();

  const [
    scale,
    setScale,
  ] = useState<GradingScaleInput>(
    initialScale,
  );

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const validation =
    useMemo(
      () =>
        gradingScaleSchema.safeParse(
          scale,
        ),
      [scale],
    );

  function updateScale<
    Key extends keyof GradingScaleInput,
  >(
    key: Key,
    value: GradingScaleInput[Key],
  ) {
    setScale(
      (current) => ({
        ...current,
        [key]: value,
      }),
    );
  }

  function handleSave() {
    if (isPending) {
      return;
    }

    const parsed =
      gradingScaleSchema.safeParse(
        scale,
      );

    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]
          ?.message ??
          "Review the grading scale before saving.",
      );

      return;
    }

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createGradingScale(
              parsed.data,
            )
          : await updateGradingScale(
              parsed.data,
            );

      if (!result.success) {
        toast.error(
          result.message,
        );

        return;
      }

      toast.success(
        result.message,
      );

      router.replace(
        `/list/academic-settings/grading-scales/${result.data.gradingScaleId}/edit`,
      );

      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/list/academic-settings/grading-scales"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Grading Scale Studio
              </p>

              <h1 className="mt-1 truncate text-lg font-black text-slate-950 sm:text-xl">
                {scale.name ||
                  "Untitled Grading Scale"}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              isPending ||
              !validation.success
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {mode === "create"
              ? "Create Scale"
              : "Save Changes"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0 space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                    Scale Details
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    Define the grading standard
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <label className="flex flex-col gap-2 lg:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Grading Scale Name
                  </span>

                  <input
                    type="text"
                    value={scale.name}
                    onChange={(event) =>
                      updateScale(
                        "name",
                        event.target.value,
                      )
                    }
                    placeholder="Example: Al-Azeez Standard Grading Scale"
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="flex flex-col gap-2 lg:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Description
                  </span>

                  <textarea
                    rows={4}
                    value={
                      scale.description ??
                      ""
                    }
                    onChange={(event) =>
                      updateScale(
                        "description",
                        event.target.value,
                      )
                    }
                    placeholder="Explain where and how this grading scale should be used..."
                    className="resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Status
                  </span>

                  <select
                    value={scale.status}
                    onChange={(event) =>
                      updateScale(
                        "status",
                        event.target
                          .value as GradingScaleInput["status"],
                      )
                    }
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="DRAFT">
                      Draft
                    </option>

                    <option value="ACTIVE">
                      Active
                    </option>

                    {mode === "edit" ? (
                      <option value="ARCHIVED">
                        Archived
                      </option>
                    ) : null}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    updateScale(
                      "isDefault",
                      !scale.isDefault,
                    )
                  }
                  className={`flex min-h-12 items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    scale.isDefault
                      ? "border-amber-300 bg-amber-50"
                      : "border-slate-200 bg-white hover:border-blue-200"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      scale.isDefault
                        ? "bg-amber-500 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Crown className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      School Default
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Automatically prefer this scale when configuring academic
                      weightings.
                    </p>
                  </div>
                </button>
              </div>
            </section>

            <GradeBoundaryBuilder
              boundaries={
                scale.boundaries
              }
              onChange={(boundaries) =>
                updateScale(
                  "boundaries",
                  boundaries,
                )
              }
              disabled={isPending}
            />
          </div>

          <div className="space-y-5 xl:sticky xl:top-[110px]">
            <GradingScaleValidationPanel
              scale={scale}
            />

            <section className="rounded-[26px] border border-slate-200 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Scale Summary
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <SummaryMetric
                  label="Boundaries"
                  value={String(
                    scale.boundaries
                      .length,
                  )}
                />

                <SummaryMetric
                  label="Status"
                  value={
                    scale.status
                  }
                />

                <SummaryMetric
                  label="Lowest Score"
                  value={String(
                    Math.min(
                      ...scale.boundaries.map(
                        (item) =>
                          item.minimumScore,
                      ),
                    ),
                  )}
                />

                <SummaryMetric
                  label="Highest Score"
                  value={String(
                    Math.max(
                      ...scale.boundaries.map(
                        (item) =>
                          item.maximumScore,
                      ),
                    ),
                  )}
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <p className="truncate text-lg font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}