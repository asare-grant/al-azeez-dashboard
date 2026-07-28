"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Eye,
  Loader2,
  Save,
  Send,
} from "lucide-react";

import StudioSaveIndicator from "./StudioSaveIndicator";

import type {
  AssessmentSaveStatus,
} from "./types";

type AssessmentStudioHeaderProps = {
  title: string;
  status?: string;

  saveStatus: AssessmentSaveStatus;
  savedAt?: Date | string | null;

  isSaving: boolean;
  isPublishing: boolean;

  canPublish: boolean;

  publishLabel?: string;

  onSave: () => void;
  onPublish: () => void;
  onPreview: () => void;
};

export default function AssessmentStudioHeader({
  title,
  status,
  saveStatus,
  savedAt,
  isSaving,
  isPublishing,
  onSave,
  onPublish,
  onPreview,
  canPublish,
  publishLabel,
}: AssessmentStudioHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/list/assessments"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            aria-label="Back to assessments"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                {title || "Untitled Assessment"}
              </h1>

              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                {status ?? "DRAFT"}
              </span>
            </div>

            <div className="mt-1">
              <StudioSaveIndicator
                status={saveStatus}
                savedAt={savedAt}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || isPublishing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            Save Draft
          </button>

          <button
            type="button"
            onClick={onPublish}
            disabled={isSaving || isPublishing || !canPublish}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}

            {publishLabel || "Publish"}
          </button>
        </div>
      </div>
    </header>
  );
}