export function calculateAttemptExpiry({
  startedAt,
  dueDate,
  durationMinutes,
}: {
  startedAt: Date;
  dueDate: Date;
  durationMinutes: number | null;
}): Date {
  /*
   * An untimed attempt still cannot continue
   * beyond the assessment closing date.
   */
  if (durationMinutes === null) {
    return dueDate;
  }

  const durationExpiry =
    new Date(
      startedAt.getTime() +
        durationMinutes *
          60 *
          1000
    );

  /*
   * A student starting shortly before closing
   * cannot continue beyond the closing date.
   */
  return durationExpiry < dueDate
    ? durationExpiry
    : dueDate;
}

export function hasAttemptExpired({
  expiresAt,
  now = new Date(),
}: {
  expiresAt: Date | string | null;
  now?: Date;
}): boolean {
  if (!expiresAt) {
    return false;
  }

  return (
    new Date(expiresAt).getTime() <=
    now.getTime()
  );
}

export function getRemainingSeconds({
  expiresAt,
  now = new Date(),
}: {
  expiresAt: Date | string | null;
  now?: Date;
}): number | null {
  if (!expiresAt) {
    return null;
  }

  const difference =
    new Date(expiresAt).getTime() -
    now.getTime();

  return Math.max(
    0,
    Math.floor(difference / 1000)
  );
}


export function calculateTimeSpentSeconds({
  startedAt,
  submittedAt,
  maximumSeconds,
}: {
  startedAt: Date | string;
  submittedAt: Date | string;
  maximumSeconds?: number | null;
}): number {
  const startedTime =
    new Date(startedAt).getTime();

  const submittedTime =
    new Date(submittedAt).getTime();

  if (
    Number.isNaN(startedTime) ||
    Number.isNaN(submittedTime)
  ) {
    return 0;
  }

  const elapsedSeconds = Math.max(
    0,
    Math.floor(
      (submittedTime - startedTime) /
        1000
    )
  );

  if (
    maximumSeconds === null ||
    maximumSeconds === undefined
  ) {
    return elapsedSeconds;
  }

  return Math.min(
    elapsedSeconds,
    Math.max(0, maximumSeconds)
  );
}


export * from "./grade-attempt";