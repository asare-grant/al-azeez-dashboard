"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import { toast } from "react-toastify";

import {
  submitAssessmentAttempt,
  saveAssessmentAnswer,
} from "@/lib/assessments/actions";

import AssessmentMobileNavigator from "./AssessmentMobileNavigator";
import AssessmentPlayerFooter from "./AssessmentPlayerFooter";
import AssessmentPlayerHeader from "./AssessmentPlayerHeader";
import AssessmentQuestionNavigator from "./AssessmentQuestionNavigator";
import AssessmentQuestionPanel from "./AssessmentQuestionPanel";
import AssessmentSubmitModal from "./AssessmentSubmitModal";

import type {
  AssessmentPlayerAnswerState,
  AssessmentPlayerProps,
} from "./types";

export default function AssessmentPlayer({ data }: AssessmentPlayerProps) {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<AssessmentPlayerAnswerState[]>(() =>
    data.questions.map((question) => {
      const savedAnswer = data.savedAnswers.find(
        (answer) => answer.questionId === question.id,
      );

      return {
        questionId: question.id,

        selectedOptionId: savedAnswer?.selectedOptionId ?? null,

        flagged: savedAnswer?.flagged ?? false,

        saveStatus: "saved",
      };
    }),
  );

  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  const [autoSubmission, setAutoSubmission] = useState(false);

  const [isSubmitting, startSubmitting] = useTransition();

  const questionEnteredAtRef = useRef<number>(Date.now());

  const currentQuestion = data.questions[currentIndex];

  const currentAnswer = answers[currentIndex];

  const answeredCount = answers.filter(
    (answer) => answer.selectedOptionId !== null,
  ).length;

  const flaggedCount = answers.filter((answer) => answer.flagged).length;

  const unansweredCount = data.questions.length - answeredCount;

  const globalSaveStatus = useMemo(() => {
    if (answers.some((answer) => answer.saveStatus === "error")) {
      return "error" as const;
    }

    if (answers.some((answer) => answer.saveStatus === "saving")) {
      return "saving" as const;
    }

    return "saved" as const;
  }, [answers]);

  const hasPendingSaves = answers.some(
    (answer) => answer.saveStatus === "saving",
  );

  function updateAnswerState(
    questionId: number,
    changes: Partial<AssessmentPlayerAnswerState>,
  ) {
    setAnswers((current) =>
      current.map((answer) =>
        answer.questionId === questionId
          ? {
              ...answer,
              ...changes,
            }
          : answer,
      ),
    );
  }

  async function persistAnswer({
    questionId,
    selectedOptionId,
    flagged,
  }: {
    questionId: number;
    selectedOptionId?: number | null;
    flagged?: boolean;
  }) {
    updateAnswerState(questionId, {
      saveStatus: "saving",
    });

    const timeSpentSeconds = Math.max(
      0,
      Math.floor((Date.now() - questionEnteredAtRef.current) / 1000),
    );

    const result = await saveAssessmentAnswer({
      attemptId: data.attempt.id,

      questionId,

      ...(selectedOptionId !== undefined
        ? {
            selectedOptionId,
          }
        : {}),

      ...(flagged !== undefined
        ? {
            flagged,
          }
        : {}),

      timeSpentSeconds,
    });

    if (!result.success) {
      updateAnswerState(questionId, {
        saveStatus: "error",
      });

      toast.error(result.message);
      return false;
    }

    updateAnswerState(questionId, {
      saveStatus: "saved",
    });

    return true;
  }

  function handleSelectOption(optionId: number) {
    if (isSubmitting) return;

    const questionId = currentQuestion.id;

    updateAnswerState(questionId, {
      selectedOptionId: optionId,
    });

    void persistAnswer({
      questionId,
      selectedOptionId: optionId,
    });
  }

  function handleClearAnswer() {
    if (isSubmitting) return;

    const questionId = currentQuestion.id;

    updateAnswerState(questionId, {
      selectedOptionId: null,
    });

    void persistAnswer({
      questionId,
      selectedOptionId: null,
    });
  }

  function handleToggleFlag() {
    if (isSubmitting) return;

    const questionId = currentQuestion.id;

    const nextFlagged = !currentAnswer.flagged;

    updateAnswerState(questionId, {
      flagged: nextFlagged,
    });

    void persistAnswer({
      questionId,
      flagged: nextFlagged,
    });
  }

  function navigateToQuestion(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= data.questions.length) {
      return;
    }

    if (!data.assessment.allowBacktrack && nextIndex < currentIndex) {
      toast.info("Backtracking is disabled for this assessment.");

      return;
    }

    setCurrentIndex(nextIndex);

    questionEnteredAtRef.current = Date.now();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handlePrevious() {
    navigateToQuestion(currentIndex - 1);
  }

  function handleNext() {
    navigateToQuestion(currentIndex + 1);
  }

  function requestSubmission() {
    if (hasPendingSaves) {
      toast.info("Your latest answer is still saving.");

      return;
    }

    if (globalSaveStatus === "error") {
      toast.error(
        "One or more answers failed to save. Retry before submitting.",
      );

      return;
    }

    setAutoSubmission(false);
    setSubmitModalOpen(true);
  }

  const handleExpiry = useCallback(() => {
    setAutoSubmission(true);

    if (data.assessment.autoSubmit) {
      startSubmitting(async () => {
        const result = await submitAssessmentAttempt({
          assessmentId: data.assessment.id,

          attemptId: data.attempt.id,

          submissionMode: "AUTO",
        });

        if (result.success && result.data) {
          toast.info(
            "Time expired. Your saved answers were submitted automatically.",
          );

          router.replace(
            `/student/assessments/${data.assessment.id}/result?attemptId=${data.attempt.id}`,
          );

          return;
        }

        toast.error(result.message);

        router.replace(`/student/assessments/${data.assessment.id}`);
      });

      return;
    }

    setSubmitModalOpen(true);
  }, [data.assessment.autoSubmit, data.assessment.id, data.attempt.id, router]);

  function handleFinalSubmission() {
    startSubmitting(async () => {
      const result = await submitAssessmentAttempt({
        assessmentId: data.assessment.id,

        attemptId: data.attempt.id,

        submissionMode: autoSubmission ? "AUTO" : "MANUAL",
      });

      if (!result.success || !result.data) {
        toast.error(result.message);

        if (autoSubmission) {
          router.replace(`/student/assessments/${data.assessment.id}`);
        }

        return;
      }

      setSubmitModalOpen(false);

      toast.success(result.message);

      router.replace(
        `/student/assessments/${data.assessment.id}/result?attemptId=${data.attempt.id}`,
      );
    });
  }

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();

      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;

      const typing =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (typing) {
        return;
      }

      if (event.key === "ArrowRight") {
        handleNext();
      }

      if (event.key === "ArrowLeft" && data.assessment.allowBacktrack) {
        handlePrevious();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, data.assessment.allowBacktrack]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AssessmentPlayerHeader
        title={data.assessment.title}
        subject={data.assessment.lesson.subject.name}
        currentQuestion={currentIndex + 1}
        questionCount={data.questions.length}
        answeredCount={answeredCount}
        globalSaveStatus={globalSaveStatus}
        expiresAt={data.attempt.expiresAt}
        isSubmitting={isSubmitting}
        onSubmit={requestSubmission}
        onExpire={handleExpiry}
      />

      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        <AssessmentMobileNavigator
          answers={answers}
          currentIndex={currentIndex}
          allowBacktrack={data.assessment.allowBacktrack}
          onNavigate={navigateToQuestion}
        />

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
          <div className="min-w-0">
            <AssessmentQuestionPanel
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              selectedOptionId={currentAnswer.selectedOptionId}
              flagged={currentAnswer.flagged}
              isSaving={currentAnswer.saveStatus === "saving" || isSubmitting}
              onSelectOption={handleSelectOption}
              onClearAnswer={handleClearAnswer}
              onToggleFlag={handleToggleFlag}
            />

            <AssessmentPlayerFooter
              currentIndex={currentIndex}
              questionCount={data.questions.length}
              allowBacktrack={data.assessment.allowBacktrack}
              hasCurrentAnswer={currentAnswer.selectedOptionId !== null}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSubmit={requestSubmission}
            />
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-[145px]">
              <AssessmentQuestionNavigator
                answers={answers}
                currentIndex={currentIndex}
                allowBacktrack={data.assessment.allowBacktrack}
                onNavigate={navigateToQuestion}
              />
            </div>
          </div>
        </div>
      </main>

      <AssessmentSubmitModal
        open={submitModalOpen}
        questionCount={data.questions.length}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        flaggedCount={flaggedCount}
        allowUnanswered={data.assessment.allowUnanswered}
        isSubmitting={isSubmitting}
        autoSubmission={autoSubmission}
        onClose={() => {
          if (!autoSubmission) {
            setSubmitModalOpen(false);
          }
        }}
        onConfirm={handleFinalSubmission}
      />
    </div>
  );
}
