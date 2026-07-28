"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { BookOpen, FileQuestion, ShieldCheck } from "lucide-react";

import { toast } from "react-toastify";

import {
  publishAssessment,
  saveAssessmentBuilder,
  saveIncompleteAssessmentDraft,
} from "@/lib/assessments/actions";

import { assessmentBuilderSchema } from "@/lib/assessments/validation";

import type {
  AssessmentBuilderData,
  AssessmentLessonOption,
} from "@/lib/assessments/types";

import AssessmentStudioHeader from "./AssessmentStudioHeader";
import AssessmentStudioNavigation from "./AssessmentStudioNavigation";
import AssessmentStudioSection from "./AssessmentStudioSection";
import AssessmentStudioSummary from "./AssessmentStudioSummary";

import type { AssessmentSaveStatus, AssessmentStudioSectionId } from "./types";

import { AssessmentQuestionBuilder } from "./questions";

import {
  AssessmentAvailabilitySettings,
  AssessmentBehaviourSettings,
} from "./settings";

import {
  AssessmentReview,
  PublishAssessmentModal,
  reviewAssessment,
} from "./review";

type AssessmentStudioProps = {
  initialAssessment: AssessmentBuilderData;
  lessons: AssessmentLessonOption[];
};

export default function AssessmentStudio({
  initialAssessment,
  lessons,
}: AssessmentStudioProps) {
  const [assessment, setAssessment] =
    useState<AssessmentBuilderData>(initialAssessment);

  const [activeSection, setActiveSection] =
    useState<AssessmentStudioSectionId>("overview");

  const [saveStatus, setSaveStatus] = useState<AssessmentSaveStatus>("saved");

  const [savedAt, setSavedAt] = useState<Date | string | null>(new Date());

  const [isSaving, startSaving] = useTransition();

  const [isPublishing, startPublishing] = useTransition();

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === assessment.lessonId),
    [assessment.lessonId, lessons],
  );

  const [publishModalOpen, setPublishModalOpen] = useState(false);

  const assessmentReview = useMemo(
    () => reviewAssessment(assessment),
    [assessment],
  );

  const isEditable = !assessment.status || assessment.status === "DRAFT";

  const hasMountedRef = useRef(false);

  const autosaveTimeoutRef =
  useRef<number | null>(null);

  const activeAutosaveRef = useRef<Promise<void> | null>(null);

  const publishingRef = useRef(false);

  function cancelScheduledAutosave() {
    if (
      autosaveTimeoutRef.current !== null
    ) {
      window.clearTimeout(
        autosaveTimeoutRef.current
      );
      autosaveTimeoutRef.current = null;
    }
  }

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    cancelScheduledAutosave();

    if (publishingRef.current || isPublishing || isSaving) {
      return;
    }

    if (assessment.status && assessment.status !== "DRAFT") {
      return;
    }

    setSaveStatus("unsaved");

    const assessmentSnapshot = assessment;

    autosaveTimeoutRef.current = window.setTimeout(() => {
      autosaveTimeoutRef.current = null;

      if (publishingRef.current) {
        return;
      }

      const autosaveRequest = (async () => {
        try {
          setSaveStatus("saving");

          const result =
            await saveIncompleteAssessmentDraft(assessmentSnapshot);

          if (!result.success) {
            /*
             * Do not overwrite publishing UI with an
             * autosave error when publishing has begun.
             */
            if (!publishingRef.current) {
              setSaveStatus("error");
            }

            return;
          }

          if (!publishingRef.current) {
            setSavedAt(result.data.updatedAt);

            setSaveStatus("saved");
          }
        } catch (error) {
          console.error("ASSESSMENT AUTOSAVE ERROR:", error);

          if (!publishingRef.current) {
            setSaveStatus("error");
          }
        }
      })();

      activeAutosaveRef.current = autosaveRequest;

      void autosaveRequest.finally(() => {
        if (activeAutosaveRef.current === autosaveRequest) {
          activeAutosaveRef.current = null;
        }
      });
    }, 1800);

    return () => {
      cancelScheduledAutosave();
    };
  }, [assessment, isPublishing, isSaving]);

  function markUnsaved() {
    setSaveStatus("unsaved");
  }

  function updateAssessment<Key extends keyof AssessmentBuilderData>(
    key: Key,
    value: AssessmentBuilderData[Key],
  ) {
    setAssessment((current) => ({
      ...current,
      [key]: value,
    }));

    markUnsaved();
  }

  function handleSave() {
    if (isSaving || isPublishing || publishingRef.current) {
      return;
    }

    cancelScheduledAutosave();

    startSaving(async () => {
      try {
        setSaveStatus("saving");

        if (activeAutosaveRef.current) {
          await activeAutosaveRef.current;
        }

        const validation = assessmentBuilderSchema.safeParse(assessment);

        const result = validation.success
          ? await saveAssessmentBuilder(validation.data)
          : await saveIncompleteAssessmentDraft(assessment);

        if (!result.success) {
          setSaveStatus("error");
          toast.error(result.message);
          return;
        }

        setSavedAt(result.data.updatedAt);

        setSaveStatus("saved");

        if (validation.success) {
          toast.success("Assessment and questions saved successfully.");
        } else {
          toast.info("Draft saved. Complete all questions before publishing.");
        }
      } catch (error) {
        console.error("SAVE ASSESSMENT CLIENT ERROR:", error);

        setSaveStatus("error");

        toast.error("The assessment could not be saved.");
      }
    });
  }

  function handlePublish() {
    if (publishingRef.current || isPublishing) {
      return;
    }

    const validation = assessmentBuilderSchema.safeParse(assessment);

    if (!validation.success) {
      setPublishModalOpen(false);
      setActiveSection("review");

      toast.error("The assessment contains validation errors.");

      return;
    }

    cancelScheduledAutosave();
    publishingRef.current = true;

    startPublishing(async () => {
      try {
        setSaveStatus("saving");

        /*
         * Allow an autosave that already reached the
         * server to finish before publishing begins.
         */
        if (activeAutosaveRef.current) {
          await activeAutosaveRef.current;
        }

        const result = await publishAssessment(validation.data);

        if (!result.success) {
          setSaveStatus("error");
          setPublishModalOpen(false);

          toast.error(result.message);
          return;
        }

        setAssessment((current) => ({
          ...current,
          status: result.data.status,
        }));

        setSavedAt(result.data.publishedAt);

        setSaveStatus("saved");
        setPublishModalOpen(false);

        toast.success(result.message);
      } catch (error) {
        console.error("PUBLISH ASSESSMENT CLIENT ERROR:", error);

        setSaveStatus("error");
        setPublishModalOpen(false);

        toast.error("The assessment could not be published. Please try again.");
      } finally {
        publishingRef.current = false;
      }
    });
  }

  function handlePreview() {
    toast.info(
      "Student preview will be connected after the question player is built.",
    );
  }

  function navigateToQuestion(questionIndex: number) {
    setActiveSection("questions");

    window.setTimeout(() => {
      const element = document.getElementById(
        `assessment-question-${questionIndex}`,
      );

      element?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AssessmentStudioHeader
        title={assessment.title}
        status={assessment.status}
        saveStatus={saveStatus}
        savedAt={savedAt}
        isSaving={isSaving}
        isPublishing={isPublishing}
        canPublish={isEditable && assessmentReview.isReady}
        publishLabel={
          isEditable
            ? "Publish"
            : assessment.status === "SCHEDULED"
              ? "Scheduled"
              : assessment.status === "PUBLISHED"
                ? "Published"
                : assessment.status === "CLOSED"
                  ? "Closed"
                  : "Archived"
        }
        onSave={handleSave}
        onPublish={() => {
          if (!assessmentReview.isReady) {
            setActiveSection("review");

            toast.error(
              "Complete the required assessment checks before publishing.",
            );

            return;
          }

          setPublishModalOpen(true);
        }}
        onPreview={handlePreview}
      />

      <main className="mx-auto max-w-[1800px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="mb-5 xl:hidden">
          <AssessmentStudioNavigation
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            questionCount={assessment.questions.length}
          />
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-[260px_minmax(0,1fr)_310px]">
          <div className="hidden xl:block">
            <AssessmentStudioNavigation
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              questionCount={assessment.questions.length}
            />
          </div>

          <div className="min-w-0 space-y-5">
            {/* PUBLISHED-ASSESSMENT NOTICE */}
            {!isEditable ? (
              <div className="flex items-start gap-3 rounded-[22px] border border-amber-200 bg-amber-50 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <div>
                  <p className="text-sm font-black text-amber-900">
                    This assessment is locked
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    Published, closed and archived assessments cannot be
                    structurally edited. Return the assessment to draft only
                    when no student has started it.
                  </p>
                </div>
              </div>
            ) : null}

            {/* ACTIVE ASSESSMENT CONDITIONS */}

            {activeSection === "overview" ? (
              <OverviewSection
                assessment={assessment}
                lessons={lessons}
                selectedLesson={selectedLesson}
                updateAssessment={updateAssessment}
                disabled={!isEditable}
              />
            ) : null}

            {activeSection === "questions" ? (
              <AssessmentQuestionBuilder
                questions={assessment.questions}
                onChange={(questions) => {
                  if (!isEditable) return;

                  updateAssessment("questions", questions);
                }}
              />
            ) : null}

            {activeSection === "behaviour" ? (
              <AssessmentBehaviourSettings
                assessment={assessment}
                updateAssessment={updateAssessment}
                disabled={!isEditable}
              />
            ) : null}

            {activeSection === "availability" ? (
              <AssessmentAvailabilitySettings
                assessment={assessment}
                updateAssessment={updateAssessment}
                disabled={!isEditable}
              />
            ) : null}

            {activeSection === "review" ? (
              <AssessmentReview
                assessment={assessment}
                lessons={lessons}
                onNavigate={setActiveSection}
                onNavigateToQuestion={navigateToQuestion}
                onRequestPublish={() => {
                  if (
                    !assessmentReview.isReady ||
                    !isEditable ||
                    isPublishing ||
                    publishingRef.current
                  ) {
                    return;
                  }

                  cancelScheduledAutosave();
                  setPublishModalOpen(true);
                }}
                disabled={!isEditable}
              />
            ) : null}
          </div>

          <div className="hidden xl:block">
            <div className="sticky top-[110px]">
              <AssessmentStudioSummary
                assessment={assessment}
                lessons={lessons}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 xl:hidden">
          <AssessmentStudioSummary assessment={assessment} lessons={lessons} />
        </div>
      </main>

      {/* PUBLISH MODAL */}
      <PublishAssessmentModal
        open={publishModalOpen}
        assessment={assessment}
        selectedLesson={selectedLesson}
        isPublishing={isPublishing}
        onClose={() => setPublishModalOpen(false)}
        onConfirm={handlePublish}
      />
    </div>
  );
}

type UpdateAssessmentFunction = <Key extends keyof AssessmentBuilderData>(
  key: Key,
  value: AssessmentBuilderData[Key],
) => void;

function OverviewSection({
  assessment,
  lessons,
  selectedLesson,
  updateAssessment,
  disabled,
}: {
  assessment: AssessmentBuilderData;
  lessons: AssessmentLessonOption[];
  selectedLesson?: AssessmentLessonOption;
  updateAssessment: UpdateAssessmentFunction;
  disabled?: boolean;
}) {
  return (
    <AssessmentStudioSection
      eyebrow="Step 1"
      title="Basic information"
      description="Give the assessment a clear identity and assign it to the correct lesson."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <label
            htmlFor="assessment-title"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Assessment title
          </label>

          <input
            id="assessment-title"
            type="text"
            value={assessment.title}
            onChange={(event) => updateAssessment("title", event.target.value)}
            placeholder="Example: Linear Inequalities Mastery Assessment"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed
            disabled:bg-slate-50 disabled:text-slate-500"
            disabled={disabled}
          />
        </div>

        <div className="lg:col-span-2">
          <label
            htmlFor="assessment-lesson"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Lesson
          </label>

          <div className="relative">
            <BookOpen className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

            <select
              id="assessment-lesson"
              value={assessment.lessonId ?? ""}
              onChange={(event) =>
                updateAssessment("lessonId", Number(event.target.value))
              }
              disabled={disabled}
              className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed
              disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">Select a lesson</option>

              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.subject.name} — {lesson.class.name}
                </option>
              ))}
            </select>
          </div>

          {selectedLesson ? (
            <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-sm font-bold text-blue-900">
                {selectedLesson.subject.name}
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                {selectedLesson.class.name} • {selectedLesson.teacher.name}{" "}
                {selectedLesson.teacher.surname}
              </p>
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <label
            htmlFor="assessment-instructions"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Student instructions
          </label>

          <textarea
            id="assessment-instructions"
            value={assessment.instructions ?? ""}
            onChange={(event) =>
              updateAssessment("instructions", event.target.value)
            }
            rows={7}
            placeholder="Explain how students should complete this assessment..."
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed
            disabled:bg-slate-50 disabled:text-slate-500"
            disabled={disabled}
          />

          <div className="mt-2 flex justify-end">
            <span className="text-xs font-medium text-slate-400">
              {(assessment.instructions ?? "").length}
              /5000
            </span>
          </div>
        </div>
      </div>
    </AssessmentStudioSection>
  );
}

function PlaceholderSection({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof FileQuestion;
}) {
  return (
    <AssessmentStudioSection
      eyebrow={eyebrow}
      title={title}
      description={description}
    >
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-blue-600 shadow-lg shadow-slate-200/60">
          <Icon className="h-7 w-7" />
        </div>

        <h3 className="mt-5 text-lg font-black text-slate-900">
          Coming in the next build step
        </h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          The studio shell is ready. This section will be connected to its
          complete interactive controls next.
        </p>
      </div>
    </AssessmentStudioSection>
  );
}
