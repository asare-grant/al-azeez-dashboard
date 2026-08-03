export function createClientMutationId() {
  return crypto.randomUUID();
}

export function getAssessmentSessionId(
  attemptId: number
) {
  const key =
    `assessment-session:${attemptId}`;

  const existing =
    sessionStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const created =
    crypto.randomUUID();

  sessionStorage.setItem(
    key,
    created
  );

  return created;
}