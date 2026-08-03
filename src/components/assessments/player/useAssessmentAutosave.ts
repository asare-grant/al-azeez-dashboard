"use client";

import {
  useCallback,
  useRef,
} from "react";

import {
  saveAssessmentAnswer,
} from "@/lib/assessments/actions";

import {
  createClientMutationId,
} from "@/lib/assessments/client-id";

type SavePayload = {
  attemptId: number;
  questionId: number;

  selectedOptionId?:
    | number
    | null;

  flagged?: boolean;

  timeSpentSeconds?: number;

  expectedVersion: number;
  activeSessionId: string;
  currentQuestionIndex: number;
};

type SaveResult = {
  questionId: number;
  success: boolean;
  version?: number;
  savedAt?: Date | string;
  message?: string;
  conflict?: boolean;
};

export function useAssessmentAutosave({
  onSaving,
  onSaved,
  onError,
}: {
  onSaving: (
    questionId: number
  ) => void;

  onSaved: (
    result: SaveResult
  ) => void;

  onError: (
    result: SaveResult
  ) => void;
}) {
  const queues =
    useRef(
      new Map<number, SavePayload>()
    );

  const active =
    useRef(
      new Set<number>()
    );

  const processQueue =
    useCallback(
      async (
        questionId: number
      ) => {
        if (
          active.current.has(
            questionId
          )
        ) {
          return;
        }

        const next =
          queues.current.get(
            questionId
          );

        if (!next) {
          return;
        }

        active.current.add(
          questionId
        );

        queues.current.delete(
          questionId
        );

        onSaving(questionId);

        const result =
          await saveAssessmentAnswer({
            ...next,

            clientMutationId:
              createClientMutationId(),
          });

        active.current.delete(
          questionId
        );

        if (
          result.success &&
          result.data
        ) {
          onSaved({
            questionId,
            success: true,

            version:
              result.data.version,

            savedAt:
              result.data.savedAt,
          });
        } else {
          onError({
            questionId,
            success: false,

            message:
              result.message,

            conflict:
              result.code ===
              "VERSION_CONFLICT" ||
              result.code ===
                "SESSION_CONFLICT",
          });
        }

        if (
          queues.current.has(
            questionId
          )
        ) {
          void processQueue(
            questionId
          );
        }
      },
      [
        onError,
        onSaved,
        onSaving,
      ]
    );

  const enqueue =
    useCallback(
      (payload: SavePayload) => {
        queues.current.set(
          payload.questionId,
          payload
        );

        void processQueue(
          payload.questionId
        );
      },
      [processQueue]
    );

  const hasPendingSaves =
    useCallback(() => {
      return (
        queues.current.size > 0 ||
        active.current.size > 0
      );
    }, []);

  return {
    enqueue,
    hasPendingSaves,
  };
}