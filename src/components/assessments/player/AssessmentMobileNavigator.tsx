"use client";

import {
  ChevronDown,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  AssessmentPlayerAnswerState,
} from "./types";

type AssessmentMobileNavigatorProps = {
  answers: AssessmentPlayerAnswerState[];
  currentIndex: number;
  allowBacktrack: boolean;

  onNavigate: (
    index: number
  ) => void;
};

export default function AssessmentMobileNavigator({
  answers,
  currentIndex,
  allowBacktrack,
  onNavigate,
}: AssessmentMobileNavigatorProps) {
  const [open, setOpen] =
    useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className="mb-4 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm lg:hidden"
      >
        Question{" "}
        {currentIndex + 1} of{" "}
        {answers.length}

        <ChevronDown className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] bg-slate-950/60 backdrop-blur-sm lg:hidden">
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-[30px] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                  Question Navigator
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Jump to a question
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-5 gap-3 sm:grid-cols-8">
              {answers.map(
                (answer, index) => {
                  const current =
                    index ===
                    currentIndex;

                  const answered =
                    answer.selectedOptionId !==
                    null;

                  const inaccessible =
                    !allowBacktrack &&
                    index <
                      currentIndex;

                  return (
                    <button
                      key={
                        answer.questionId
                      }
                      type="button"
                      disabled={
                        inaccessible
                      }
                      onClick={() => {
                        onNavigate(
                          index
                        );

                        setOpen(
                          false
                        );
                      }}
                      className={`relative h-11 rounded-xl text-sm font-black ${
                        current
                          ? "bg-blue-600 text-white"
                          : answer.flagged
                          ? "border border-amber-300 bg-amber-50 text-amber-700"
                          : answered
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border border-slate-200 bg-slate-50 text-slate-500"
                      } disabled:opacity-30`}
                    >
                      {index + 1}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}