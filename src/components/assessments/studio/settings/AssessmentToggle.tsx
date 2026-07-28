"use client";

import type { LucideIcon } from "lucide-react";

type AssessmentToggleProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  badge?: string;
};

export default function AssessmentToggle({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  disabled = false,
  badge,
}: AssessmentToggleProps) {
  return (
    <div
      className={`rounded-2xl border p-4 transition sm:p-5 ${
        checked
          ? "border-blue-200 bg-blue-50/60"
          : "border-slate-200 bg-white hover:border-slate-300"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            checked
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black text-slate-900">
              {title}
            </h3>

            {badge ? (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                {badge}
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition ${
            checked ? "bg-blue-600" : "bg-slate-300"
          } disabled:cursor-not-allowed`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
              checked ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}