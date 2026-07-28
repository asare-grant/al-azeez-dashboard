"use client";

import { AlertTriangle, Clock3 } from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import { getRemainingSeconds } from "@/lib/assessments/timing";

type AssessmentTimerProps = {
  expiresAt: Date | string | null;
  onExpire: () => void;
};

function formatTimer(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);

  const hours = Math.floor(safeSeconds / 3600);

  const minutes = Math.floor((safeSeconds % 3600) / 60);

  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

export default function AssessmentTimer({
  expiresAt,
  onExpire,
}: AssessmentTimerProps) {
  const initialRemaining = useMemo(
    () =>
      getRemainingSeconds({
        expiresAt,
      }),
    [expiresAt],
  );

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(
    initialRemaining,
  );

  const hasExpiredRef = useRef(false);

  useEffect(() => {
    if (remainingSeconds === null) {
      return;
    }

    const interval = window.setInterval(() => {
      const nextRemaining = getRemainingSeconds({
        expiresAt,
      });

      setRemainingSeconds(nextRemaining);

      if (
        nextRemaining !== null &&
        nextRemaining <= 0 &&
        !hasExpiredRef.current
      ) {
        hasExpiredRef.current = true;

        window.clearInterval(
            interval
        );

        onExpire();
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (remainingSeconds === null) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700">
        <Clock3 className="h-4 w-4 text-blue-600" />
        Untimed
      </div>
    );
  }

  const isCritical = remainingSeconds <= 300;

  const isWarning = remainingSeconds <= 600 && !isCritical;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-black ${
        isCritical
          ? "border-red-200 bg-red-50 text-red-700"
          : isWarning
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-slate-200 bg-white text-slate-700"
      }`}
    >
      {isCritical ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Clock3 className="h-4 w-4 text-blue-600" />
      )}

      {formatTimer(remainingSeconds)}
    </div>
  );
}
