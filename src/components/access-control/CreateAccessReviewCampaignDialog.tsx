"use client";

import {
  AlertTriangle,
  CalendarDays,
  Check,
  ClipboardCheck,
  Clock3,
  Crown,
  Layers3,
  Loader2,
  ShieldCheck,
  Sparkles,
  TimerReset,
  UsersRound,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useMemo,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type ReviewScope =
  | "PRIVILEGED"
  | "TEMPORARY"
  | "PRIVILEGED_AND_TEMPORARY"
  | "ALL_ASSIGNMENTS";

type CreateCampaignResponse = {
  success?:
    boolean;

  message?:
    string;

  error?:
    string;

  code?:
    string;

  campaign?: {
    id:
      number;

    itemCount:
      number;

    privilegedCount:
      number;

    temporaryCount:
      number;

    highTrustCount:
      number;
  };
};

/* ========================================================================== */
/* OPTIONS                                                                    */
/* ========================================================================== */

const scopeOptions: {
  value:
    ReviewScope;

  label:
    string;

  description:
    string;

  icon:
    typeof ShieldCheck;

  tone:
    string;
}[] = [
  {
    value:
      "PRIVILEGED",

    label:
      "Privileged Access",

    description:
      "Review high-trust and protected assignments such as administrative authority.",

    icon:
      Crown,

    tone:
      "violet",
  },

  {
    value:
      "TEMPORARY",

    label:
      "Temporary Access",

    description:
      "Review currently effective role assignments that have an expiry date.",

    icon:
      TimerReset,

    tone:
      "amber",
  },

  {
    value:
      "PRIVILEGED_AND_TEMPORARY",

    label:
      "Privileged + Temporary",

    description:
      "Review both privileged authority and temporary delegated-access assignments.",

    icon:
      Layers3,

    tone:
      "blue",
  },

  {
    value:
      "ALL_ASSIGNMENTS",

    label:
      "All Active Assignments",

    description:
      "Perform a complete certification review of every currently effective RBAC assignment.",

    icon:
      UsersRound,

    tone:
      "slate",
  },
];

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function CreateAccessReviewCampaignDialog({
  allowed,
  restrictionReason,
}: {
  allowed:
    boolean;

  restrictionReason?:
    string | null;
}) {
  const router =
    useRouter();

  const [
    open,
    setOpen,
  ] =
    useState(
      false,
    );

  const [
    name,
    setName,
  ] =
    useState(
      "",
    );

  const [
    description,
    setDescription,
  ] =
    useState(
      "",
    );

  const [
    scope,
    setScope,
  ] =
    useState<ReviewScope>(
      "PRIVILEGED_AND_TEMPORARY",
    );

  const [
    dueAt,
    setDueAt,
  ] =
    useState(
      "",
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const selectedScope =
    useMemo(
      () =>
        scopeOptions.find(
          (
            option,
          ) =>
            option.value ===
            scope,
        ) ??
        scopeOptions[2],
      [
        scope,
      ],
    );

  /* ======================================================================== */
  /* CLOSE                                                                    */
  /* ======================================================================== */

  function closeDialog() {
    if (
      submitting
    ) {
      return;
    }

    setOpen(
      false,
    );

    window.setTimeout(
      () => {
        setName(
          "",
        );

        setDescription(
          "",
        );

        setScope(
          "PRIVILEGED_AND_TEMPORARY",
        );

        setDueAt(
          "",
        );

        setError(
          null,
        );

        setSuccess(
          null,
        );
      },
      150,
    );
  }

  /* ======================================================================== */
  /* SUBMIT                                                                   */
  /* ======================================================================== */

  async function createCampaign() {
    if (
      !name.trim()
    ) {
      setError(
        "Enter a campaign name.",
      );

      return;
    }

    if (!dueAt) {
      setError(
        "Choose a campaign due date and time.",
      );

      return;
    }

    const parsedDueAt =
      new Date(
        dueAt,
      );

    if (
      Number.isNaN(
        parsedDueAt.getTime(),
      )
    ) {
      setError(
        "The selected due date is invalid.",
      );

      return;
    }

    setSubmitting(
      true,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      const response =
        await fetch(
          "/api/access-control/reviews/campaigns",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                name:
                  name
                    .trim()
                    .slice(
                      0,
                      120,
                    ),

                description:
                  description
                    .trim()
                    .slice(
                      0,
                      1000,
                    ) ||
                  null,

                scope,

                dueAt:
                  parsedDueAt.toISOString(),
              }),
          },
        );

      const payload =
        (await response.json()) as CreateCampaignResponse;

      if (!response.ok) {
        throw new Error(
          payload.error ??
            payload.message ??
            "The access review campaign could not be created.",
        );
      }

      setSuccess(
        payload.message ??
          "Access review campaign created successfully.",
      );

      const campaignId =
        payload.campaign
          ?.id;

      window.setTimeout(
        () => {
          setOpen(
            false,
          );

          if (
            campaignId
          ) {
            router.push(
              `/list/access-control/reviews/${campaignId}`,
            );
          } else {
            router.refresh();
          }
        },
        900,
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while creating the access review campaign.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  /* ======================================================================== */
  /* RENDER                                                                   */
  /* ======================================================================== */

  return (
    <>
      {allowed ? (
        <button
          type="button"
          onClick={() =>
            setOpen(
              true,
            )
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-blue-600 px-4 text-sm font-black text-white shadow-[0_10px_24px_rgba(37,99,235,0.20)] transition hover:bg-blue-700"
        >
          <ClipboardCheck className="h-4 w-4" />

          Create Campaign
        </button>
      ) : (
        <div
          title={
            restrictionReason ??
            "You cannot create access review campaigns."
          }
          className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-[14px] border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-300"
        >
          <ShieldCheck className="h-4 w-4" />

          Create Campaign
        </div>
      )}

      {open &&
      typeof document !==
        "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[180] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-[4px] sm:p-5">
              <div className="flex max-h-[94vh] w-full max-w-[820px] flex-col overflow-hidden rounded-[32px] border border-white/20 bg-white shadow-[0_45px_150px_rgba(15,23,42,0.42)]">
                {/* ========================================================== */}
                {/* HEADER                                                     */}
                {/* ========================================================== */}

                <div className="relative shrink-0 overflow-hidden border-b border-slate-100 bg-slate-950 p-5 text-white sm:p-6">
                  <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />

                  <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-blue-500/15 text-blue-300">
                        <ClipboardCheck className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-300">
                          Access Governance
                        </p>

                        <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                          Create Review Campaign
                        </h2>

                        <p className="mt-1 max-w-xl text-xs leading-5 text-slate-400">
                          Capture a formal snapshot of current access assignments
                          and prepare them for certification, modification or
                          revocation.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={
                        submitting
                      }
                      onClick={
                        closeDialog
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-40"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* ========================================================== */}
                {/* BODY                                                       */}
                {/* ========================================================== */}

                <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
                  {/* CAMPAIGN IDENTITY */}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                        Campaign Name
                      </label>

                      <input
                        type="text"
                        maxLength={
                          120
                        }
                        value={
                          name
                        }
                        onChange={(
                          event,
                        ) =>
                          setName(
                            event.target
                              .value,
                          )
                        }
                        placeholder="e.g. Term 1 Privileged Access Review"
                        className="mt-2 h-11 w-full rounded-[14px] border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                        Review Due
                      </label>

                      <div className="relative mt-2">
                        <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          type="datetime-local"
                          value={
                            dueAt
                          }
                          onChange={(
                            event,
                          ) =>
                            setDueAt(
                              event.target
                                .value,
                            )
                          }
                          className="h-11 w-full rounded-[14px] border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                      Description{" "}
                      <span className="text-slate-300">
                        (optional)
                      </span>
                    </label>

                    <textarea
                      rows={
                        3
                      }
                      maxLength={
                        1000
                      }
                      value={
                        description
                      }
                      onChange={(
                        event,
                      ) =>
                        setDescription(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Explain the purpose of this certification campaign..."
                      className="mt-2 w-full resize-none rounded-[16px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />

                    <p className="mt-1 text-right text-[9px] font-black text-slate-300">
                      {
                        description.length
                      }
                      /1000
                    </p>
                  </div>

                  {/* SCOPE */}

                  <div className="mt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black text-slate-700">
                          Review scope
                        </p>

                        <p className="mt-1 text-[10px] leading-5 text-slate-400">
                          The selected scope determines which effective role
                          assignments are captured into the campaign snapshot.
                        </p>
                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[8px] font-black uppercase tracking-wider text-blue-700">
                        {
                          selectedScope.label
                        }
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {scopeOptions.map(
                        (
                          option,
                        ) => {
                          const Icon =
                            option.icon;

                          const selected =
                            scope ===
                            option.value;

                          return (
                            <button
                              key={
                                option.value
                              }
                              type="button"
                              disabled={
                                submitting
                              }
                              onClick={() => {
                                setScope(
                                  option.value,
                                );

                                setError(
                                  null,
                                );
                              }}
                              className={`rounded-[18px] border p-4 text-left transition ${
                                selected
                                  ? "border-blue-300 bg-blue-50/70 ring-4 ring-blue-50"
                                  : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${
                                    selected
                                      ? "bg-blue-600 text-white"
                                      : "bg-slate-50 text-slate-500"
                                  }`}
                                >
                                  {selected ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Icon className="h-4 w-4" />
                                  )}
                                </div>

                                <div>
                                  <p className="text-sm font-black text-slate-900">
                                    {
                                      option.label
                                    }
                                  </p>

                                  <p className="mt-1 text-[10px] leading-5 text-slate-500">
                                    {
                                      option.description
                                    }
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  {/* SNAPSHOT EXPLANATION */}

                  <div className="mt-5 flex items-start gap-3 rounded-[18px] border border-violet-100 bg-violet-50/60 p-4">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.11em] text-violet-700">
                        Point-in-Time Snapshot
                      </p>

                      <p className="mt-1 text-[10px] leading-5 text-violet-700">
                        Creating the campaign records the matching assignments as
                        they exist now. Later role changes will not silently add
                        new items to this review campaign.
                      </p>
                    </div>
                  </div>

                  {/* DRAFT NOTICE */}

                  <div className="mt-3 flex items-start gap-3 rounded-[18px] border border-amber-100 bg-amber-50/60 p-4">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.11em] text-amber-700">
                        Starts as Draft
                      </p>

                      <p className="mt-1 text-[10px] leading-5 text-amber-700">
                        Reviewers cannot certify assignments until the campaign
                        is formally started. You will be able to inspect the
                        snapshot first.
                      </p>
                    </div>
                  </div>

                  {error ? (
                    <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-rose-100 bg-rose-50 p-4">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />

                      <p className="text-[10px] font-semibold leading-5 text-rose-700">
                        {
                          error
                        }
                      </p>
                    </div>
                  ) : null}

                  {success ? (
                    <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-emerald-100 bg-emerald-50 p-4">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                      <p className="text-[10px] font-semibold leading-5 text-emerald-700">
                        {
                          success
                        }
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* ========================================================== */}
                {/* FOOTER                                                     */}
                {/* ========================================================== */}

                <div className="shrink-0 border-t border-slate-100 bg-white p-4 sm:px-6">
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="hidden text-[9px] font-semibold text-slate-400 sm:block">
                      Super Admin certification governance
                    </p>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row">
                      <button
                        type="button"
                        disabled={
                          submitting
                        }
                        onClick={
                          closeDialog
                        }
                        className="h-11 rounded-[14px] border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        disabled={
                          submitting
                        }
                        onClick={
                          createCampaign
                        }
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-blue-600 px-5 text-sm font-black text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ClipboardCheck className="h-4 w-4" />
                        )}

                        {submitting
                          ? "Creating..."
                          : "Create Campaign"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}