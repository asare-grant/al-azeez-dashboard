"use client";

import {
  ArrowLeftRight,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  ListRestart,
  MessageSquareText,
  MousePointerClick,
  Repeat2,
  Shuffle,
  TimerReset,
} from "lucide-react";

import {
  ASSESSMENT_LIMITS,
} from "@/lib/assessments/constants";

import type {
  AssessmentBuilderData,
} from "@/lib/assessments/types";

import AssessmentStudioSection from "../AssessmentStudioSection";
import AssessmentSettingCard from "./AssessmentSettingCard";
import AssessmentToggle from "./AssessmentToggle";

type AssessmentBehaviourSettingsProps = {
  assessment: AssessmentBuilderData;

  updateAssessment: <
    Key extends keyof AssessmentBuilderData
  >(
    key: Key,
    value: AssessmentBuilderData[Key]
  ) => void;

  disabled?: boolean;
};

export default function AssessmentBehaviourSettings({
  assessment,
  updateAssessment,
  disabled = false,
}: AssessmentBehaviourSettingsProps) {
  return (
    <AssessmentStudioSection
      eyebrow="Step 3"
      title="Assessment behaviour"
      description="Control timing, attempts, question order, navigation and the feedback students receive."
    >
      <div className="grid gap-5 lg:grid-cols-3 xl:grid-cols-1">
        <AssessmentSettingCard
          icon={Clock3}
          title="Time limit"
          description="Set how long each student has after starting the assessment."
        >
          <div className="space-y-3">
            <label
              htmlFor="assessment-duration"
              className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400"
            >
              Duration in minutes
            </label>

            <div className="relative">
              <TimerReset className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

              <input
                id="assessment-duration"
                type="number"
                min={
                  ASSESSMENT_LIMITS.MIN_DURATION_MINUTES
                }
                max={
                  ASSESSMENT_LIMITS.MAX_DURATION_MINUTES
                }
                value={
                  assessment.durationMinutes ?? ""
                }
                disabled={disabled}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  updateAssessment(
                    "durationMinutes",
                    value === ""
                      ? null
                      : Math.min(
                          ASSESSMENT_LIMITS.MAX_DURATION_MINUTES,
                          Math.max(
                            ASSESSMENT_LIMITS.MIN_DURATION_MINUTES,
                            Number(value)
                          )
                        )
                  );
                }}
                placeholder="Untimed"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-black text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[15, 30, 45, 60].map(
                (minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      updateAssessment(
                        "durationMinutes",
                        minutes
                      )
                    }
                    className={`rounded-xl border px-3 py-2 text-xs font-black transition ${
                      assessment.durationMinutes ===
                      minutes
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    {minutes} min
                  </button>
                )
              )}

              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    updateAssessment(
                        "durationMinutes",
                        null
                    );

                    updateAssessment(
                        "autoSubmit",
                        false
                    );
                }}
                className={`rounded-xl border px-3 py-2 text-xs font-black transition ${
                  assessment.durationMinutes ===
                  null
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                }`}
              >
                Untimed
              </button>
            </div>
          </div>
        </AssessmentSettingCard>

        <AssessmentSettingCard
          icon={Repeat2}
          title="Maximum attempts"
          description="Choose how many times each student may take the assessment."
        >
          <label
            htmlFor="assessment-attempts"
            className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400"
          >
            Attempts allowed
          </label>

          <select
            id="assessment-attempts"
            value={assessment.maxAttempts}
            disabled={disabled}
            onChange={(event) =>
              updateAssessment(
                "maxAttempts",
                Number(event.target.value)
              )
            }
            className="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            {Array.from(
              {
                length:
                  ASSESSMENT_LIMITS.MAX_ATTEMPTS,
              },
              (_, index) => index + 1
            ).map((attempt) => (
              <option
                key={attempt}
                value={attempt}
              >
                {attempt}{" "}
                {attempt === 1
                  ? "attempt"
                  : "attempts"}
              </option>
            ))}
          </select>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            The official result rule for multiple
            attempts will be configured in the
            advanced results stage.
          </p>
        </AssessmentSettingCard>

        <AssessmentSettingCard
          icon={CheckCircle2}
          title="Pass mark"
          description="Set the minimum percentage required to pass."
        >
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              disabled={disabled}
              value={
                assessment.passMarkPercent
              }
              onChange={(event) =>
                updateAssessment(
                  "passMarkPercent",
                  Number(event.target.value)
                )
              }
              className="min-w-0 flex-1 accent-blue-600"
            />

            <div className="flex h-12 w-20 items-center justify-center rounded-2xl bg-blue-50 text-lg font-black text-blue-700">
              {assessment.passMarkPercent}%
            </div>
          </div>

          <div className="mt-4 flex justify-between text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </AssessmentSettingCard>
      </div>

      <div className="mt-6">
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            Question delivery
          </p>

          <h3 className="mt-2 text-lg font-black text-slate-950">
            Control how questions appear
          </h3>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
          <AssessmentToggle
            icon={Shuffle}
            title="Shuffle questions"
            description="Present questions in a different order for each student attempt."
            checked={
              assessment.shuffleQuestions
            }
            disabled={disabled}
            onChange={(checked) =>
              updateAssessment(
                "shuffleQuestions",
                checked
              )
            }
          />

          <AssessmentToggle
            icon={ListRestart}
            title="Shuffle answer options"
            description="Randomise the order of answer choices without changing the correct answer."
            checked={
              assessment.shuffleOptions
            }
            disabled={disabled}
            onChange={(checked) =>
              updateAssessment(
                "shuffleOptions",
                checked
              )
            }
          />

          <AssessmentToggle
            icon={ArrowLeftRight}
            title="Allow backtracking"
            description="Permit students to return to previous questions before submitting."
            checked={
              assessment.allowBacktrack
            }
            disabled={disabled}
            onChange={(checked) =>
              updateAssessment(
                "allowBacktrack",
                checked
              )
            }
          />

          <AssessmentToggle
            icon={MousePointerClick}
            title="Allow unanswered questions"
            description="Permit submission even when some questions have not been answered."
            checked={
              assessment.allowUnanswered
            }
            disabled={disabled}
            onChange={(checked) =>
              updateAssessment(
                "allowUnanswered",
                checked
              )
            }
          />
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            Results and feedback
          </p>

          <h3 className="mt-2 text-lg font-black text-slate-950">
            Decide what students see
          </h3>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
          <AssessmentToggle
            icon={Eye}
            title="Show result immediately"
            description="Display the score, percentage and performance message immediately after submission."
            checked={
              assessment.showInstantResult
            }
            disabled={disabled}
            onChange={(checked) => {
              updateAssessment(
                "showInstantResult",
                checked
              );

              if (!checked) {
                updateAssessment(
                  "showCorrectAnswers",
                  false
                );

                updateAssessment(
                  "showExplanations",
                  false
                );
              }
            }}
          />

          <AssessmentToggle
            icon={EyeOff}
            title="Show correct answers"
            description="Allow students to see the correct response during result review."
            checked={
              assessment.showCorrectAnswers
            }
            disabled={
              disabled ||
              !assessment.showInstantResult
            }
            onChange={(checked) => {
                updateAssessment(
                    "showCorrectAnswers",
                    checked
                );

                if (!checked) {
                    updateAssessment(
                    "showExplanations",
                    false
                    );
                }
                }
            }
            badge={
              !assessment.showInstantResult
                ? "Requires instant result"
                : undefined
            }
          />

          <AssessmentToggle
            icon={MessageSquareText}
            title="Show answer explanations"
            description="Display the teacher's explanation for each reviewed question."
            checked={
              assessment.showExplanations
            }
            disabled={
              disabled ||
              !assessment.showInstantResult ||
              !assessment.showCorrectAnswers
            }
            onChange={(checked) =>
              updateAssessment(
                "showExplanations",
                checked
              )
            }
            badge={
              !assessment.showCorrectAnswers
                ? "Requires answer review"
                : undefined
            }
          />

          <AssessmentToggle
            icon={TimerReset}
            title="Auto-submit when time expires"
            description="Automatically submit the student's saved answers when the assessment timer reaches zero."
            checked={assessment.autoSubmit}
            disabled={
              disabled ||
              assessment.durationMinutes === null
            }
            onChange={(checked) =>
              updateAssessment(
                "autoSubmit",
                checked
              )
            }
            badge={
              assessment.durationMinutes === null
                ? "Timed assessments only"
                : undefined
            }
          />
        </div>
      </div>
    </AssessmentStudioSection>
  );
}