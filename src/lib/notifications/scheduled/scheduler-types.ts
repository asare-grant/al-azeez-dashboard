export type ScheduledScannerKey =
  | "assessment-due-soon"
  | "attendance-absence"
  | "attendance-completeness"
  | "fee-balance-reminders"
  | "upcoming-events";

export type ScheduledScannerExecution = {
  key:
    ScheduledScannerKey;

  status:
    "SUCCEEDED" |
    "FAILED";

  durationMs:
    number;

  result?:
    unknown;

  error?:
    string;
};

export type ScheduledNotificationEngineResult = {
  executed:
    boolean;

  reason?:
    "ALREADY_RUNNING";

  runId?:
    number;

  status?:
    "SUCCEEDED" |
    "PARTIAL" |
    "FAILED";

  startedAt?:
    string;

  completedAt?:
    string;

  durationMs?:
    number;

  scannerCount?:
    number;

  succeededCount?:
    number;

  failedCount?:
    number;

  scanners?:
    ScheduledScannerExecution[];
};

