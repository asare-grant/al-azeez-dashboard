"use client";

import {
  ArrowDown,
  ArrowUp,
  Copy,
  Plus,
  Trash2,
} from "lucide-react";

import {
  createGradeBoundary,
} from "@/lib/academic-weightings/factory";

import type {
  GradeBoundaryInput,
} from "@/lib/academic-weightings/types";

type GradeBoundaryBuilderProps = {
  boundaries: GradeBoundaryInput[];

  onChange: (
    boundaries: GradeBoundaryInput[],
  ) => void;

  disabled?: boolean;
};

export default function GradeBoundaryBuilder({
  boundaries,
  onChange,
  disabled = false,
}: GradeBoundaryBuilderProps) {
  function normalize(
    items: GradeBoundaryInput[],
  ) {
    return items.map(
      (boundary, index) => ({
        ...boundary,
        position: index,
      }),
    );
  }

  function updateBoundary(
    index: number,
    changes: Partial<GradeBoundaryInput>,
  ) {
    onChange(
      normalize(
        boundaries.map(
          (boundary, currentIndex) =>
            currentIndex === index
              ? {
                  ...boundary,
                  ...changes,
                }
              : boundary,
        ),
      ),
    );
  }

  function addBoundary() {
    const next =
      createGradeBoundary({
        grade: "",
        minimumScore: 0,
        maximumScore: 0,
        remark: "",
        gradePoint: null,
        position:
          boundaries.length,
      });

    onChange([
      ...boundaries,
      next,
    ]);
  }

  function duplicateBoundary(
    index: number,
  ) {
    const source =
      boundaries[index];

    const duplicate: GradeBoundaryInput =
      {
        ...source,
        id: undefined,
        grade: `${source.grade} Copy`,
      };

    const next = [
      ...boundaries.slice(
        0,
        index + 1,
      ),

      duplicate,

      ...boundaries.slice(
        index + 1,
      ),
    ];

    onChange(
      normalize(next),
    );
  }

  function deleteBoundary(
    index: number,
  ) {
    if (
      boundaries.length <= 1
    ) {
      return;
    }

    onChange(
      normalize(
        boundaries.filter(
          (_, currentIndex) =>
            currentIndex !==
            index,
        ),
      ),
    );
  }

  function moveBoundary(
    fromIndex: number,
    toIndex: number,
  ) {
    if (
      toIndex < 0 ||
      toIndex >=
        boundaries.length
    ) {
      return;
    }

    const next = [
      ...boundaries,
    ];

    const [moved] =
      next.splice(
        fromIndex,
        1,
      );

    next.splice(
      toIndex,
      0,
      moved,
    );

    onChange(
      normalize(next),
    );
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Grade Boundaries
          </p>

          <h2 className="mt-2 text-xl font-black text-slate-950">
            Configure score ranges
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Every score from 0 to 100 must match exactly one grade.
          </p>
        </div>

        <button
          type="button"
          onClick={addBoundary}
          disabled={disabled}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />

          Add Boundary
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {boundaries.map(
          (boundary, index) => (
            <article
              key={
                boundary.id ??
                `boundary-${index}`
              }
              className="rounded-[24px] border border-slate-200 bg-slate-50/50 p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">
                    Boundary {index + 1}
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-500">
                    {boundary.minimumScore} – {boundary.maximumScore}
                  </p>
                </div>

                <div className="flex gap-1">
                  <BoundaryAction
                    label="Move up"
                    icon={ArrowUp}
                    disabled={
                      disabled ||
                      index === 0
                    }
                    onClick={() =>
                      moveBoundary(
                        index,
                        index - 1,
                      )
                    }
                  />

                  <BoundaryAction
                    label="Move down"
                    icon={ArrowDown}
                    disabled={
                      disabled ||
                      index ===
                        boundaries.length -
                          1
                    }
                    onClick={() =>
                      moveBoundary(
                        index,
                        index + 1,
                      )
                    }
                  />

                  <BoundaryAction
                    label="Duplicate"
                    icon={Copy}
                    disabled={disabled}
                    onClick={() =>
                      duplicateBoundary(
                        index,
                      )
                    }
                  />

                  <BoundaryAction
                    label="Delete"
                    icon={Trash2}
                    danger
                    disabled={
                      disabled ||
                      boundaries.length <=
                        1
                    }
                    onClick={() =>
                      deleteBoundary(
                        index,
                      )
                    }
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <BoundaryField
                  label="Grade"
                  value={
                    boundary.grade
                  }
                  disabled={disabled}
                  onChange={(value) =>
                    updateBoundary(
                      index,
                      {
                        grade: value,
                      },
                    )
                  }
                  placeholder="A"
                />

                <BoundaryNumberField
                  label="Minimum Score"
                  value={
                    boundary.minimumScore
                  }
                  disabled={disabled}
                  onChange={(value) =>
                    updateBoundary(
                      index,
                      {
                        minimumScore:
                          value === ""
                            ? 0
                            : value,
                      },
                    )
                  }
                />

                <BoundaryNumberField
                  label="Maximum Score"
                  value={
                    boundary.maximumScore
                  }
                  disabled={disabled}
                  onChange={(value) =>
                    updateBoundary(
                      index,
                      {
                        maximumScore:
                          value === ""
                            ? 0
                            : value,
                      },
                    )
                  }
                />

                <BoundaryNumberField
                  label="Grade Point"
                  value={
                    boundary.gradePoint ??
                    ""
                  }
                  allowEmpty
                  disabled={disabled}
                  onChange={(value) =>
                    updateBoundary(
                      index,
                      {
                        gradePoint:
                          value === ""
                            ? null
                            : value,
                      },
                    )
                  }
                />

                <BoundaryField
                  label="Remark"
                  value={
                    boundary.remark
                  }
                  disabled={disabled}
                  onChange={(value) =>
                    updateBoundary(
                      index,
                      {
                        remark:
                          value,
                      },
                    )
                  }
                  placeholder="Excellent"
                />
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  );
}

function BoundaryField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  disabled: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </span>

      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
      />
    </label>
  );
}

function BoundaryNumberField({
  label,
  value,
  onChange,
  disabled,
  allowEmpty = false,
}: {
  label: string;
  value: number | "";
  onChange: (
    value: number | "",
  ) => void;
  disabled: boolean;
  allowEmpty?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </span>

      <input
        type="number"
        step="0.01"
        min="0"
        max="100"
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const raw =
            event.target.value;

          if (
            raw === "" &&
            allowEmpty
          ) {
            onChange("");
            return;
          }

          onChange(
            Number(raw),
          );
        }}
        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
      />
    </label>
  );
}

function BoundaryAction({
  label,
  icon: Icon,
  onClick,
  disabled,
  danger = false,
}: {
  label: string;
  icon: typeof ArrowUp;
  onClick: () => void;
  disabled: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}