"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowLeft,
  FilePlus2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";

import { createAssessmentDraft } from "@/lib/assessments/actions";

export default function CreateAssessmentLauncher() {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleCreateAssessment() {
    if (isPending) return;

    setErrorMessage(null);

    startTransition(async () => {
      const result = await createAssessmentDraft();

      if (!result.success) {
        setErrorMessage(result.message);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.replace(
        `/list/assessments/${result.data.assessmentId}/edit`
      );

      router.refresh();
    });
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/list/assessments"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Assessments
        </Link>

        <section className="relative mt-5 overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-9">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-100 blur-3xl" />

          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <FilePlus2 className="h-7 w-7" />
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              <Sparkles className="h-3.5 w-3.5" />
              Assessment Studio
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Create a new assessment
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Create a private draft and open the Assessment Studio to add
              questions, answer options, correct answers, marks, timing and
              publishing settings.
            </p>

            {errorMessage ? (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                <p className="text-sm font-semibold leading-6 text-red-700">
                  {errorMessage}
                </p>
              </div>
            ) : null}

            <button
              type="button"
              disabled={isPending}
              onClick={handleCreateAssessment}
              className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating draft...
                </>
              ) : (
                <>
                  <FilePlus2 className="h-4 w-4" />
                  Open Assessment Studio
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}