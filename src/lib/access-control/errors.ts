export class AccessDeniedError extends Error {
  readonly code =
    "ACCESS_DENIED";

  readonly permission:
    string | null;

  constructor({
    message =
      "You do not have permission to perform this action.",

    permission =
      null,
  }: {
    message?:
      string;

    permission?:
      string | null;
  } = {}) {
    super(
      message,
    );

    this.name =
      "AccessDeniedError";

    this.permission =
      permission;
  }
}

export class AccountInactiveError extends Error {
  readonly code =
    "ACCOUNT_INACTIVE";

  constructor() {
    super(
      "This user account is not currently active.",
    );

    this.name =
      "AccountInactiveError";
  }
}