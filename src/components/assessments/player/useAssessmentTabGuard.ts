"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getAssessmentSessionId,
} from "@/lib/assessments/client-id";

export function useAssessmentTabGuard(
  attemptId: number
) {
  const [sessionId, setSessionId] =
    useState<string | null>(null);

  const [
    conflictingTab,
    setConflictingTab,
  ] = useState(false);

  useEffect(() => {
    const id =
      getAssessmentSessionId(
        attemptId
      );

    setSessionId(id);

    const channel =
      new BroadcastChannel(
        `assessment-attempt:${attemptId}`
      );

    channel.postMessage({
      type: "SESSION_OPENED",
      sessionId: id,
    });

    channel.onmessage = (
      event
    ) => {
      const message =
        event.data as {
          type?: string;
          sessionId?: string;
        };

      if (
        message.type ===
          "SESSION_OPENED" &&
        message.sessionId !== id
      ) {
        setConflictingTab(true);

        channel.postMessage({
          type:
            "SESSION_ALREADY_ACTIVE",
          sessionId: id,
        });
      }

      if (
        message.type ===
          "SESSION_ALREADY_ACTIVE" &&
        message.sessionId !== id
      ) {
        setConflictingTab(true);
      }
    };

    const heartbeat =
      window.setInterval(() => {
        channel.postMessage({
          type: "HEARTBEAT",
          sessionId: id,
        });
      }, 10_000);

    return () => {
      window.clearInterval(
        heartbeat
      );

      channel.close();
    };
  }, [attemptId]);

  return {
    sessionId,
    conflictingTab,
  };
}