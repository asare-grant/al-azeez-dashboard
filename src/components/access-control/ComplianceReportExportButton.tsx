"use client";

import {
  Download,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  toast,
} from "react-toastify";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type Props =
  | {
      mode:
        "CAMPAIGN";

      campaignId:
        number;

      academicYear?:
        never;

      term?:
        never;

      allowed:
        boolean;

      label?:
        string;

      restrictionReason?:
        string | null;
    }
  | {
      mode:
        "PERIOD";

      campaignId?:
        never;

      academicYear?:
        string | null;

      term?:
        string | null;

      allowed:
        boolean;

      label?:
        string;

      restrictionReason?:
        string | null;
    };

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function ComplianceReportExportButton(
  props:
    Props,
) {
  const [
    pending,
    setPending,
  ] =
    useState(
      false,
    );

  async function downloadReport() {
    if (
      pending ||
      !props.allowed
    ) {
      return;
    }

    setPending(
      true,
    );

    try {
      const body =
        props.mode ===
        "CAMPAIGN"
          ? {
              mode:
                "CAMPAIGN",

              campaignId:
                props.campaignId,
            }
          : {
              mode:
                "PERIOD",

              academicYear:
                props.academicYear ??
                null,

              term:
                props.term ??
                null,
            };

      const response =
        await fetch(
          "/api/access-control/reviews/reports",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                body,
              ),
          },
        );

      if (
        !response.ok
      ) {
        let message =
          "The compliance report could not be generated.";

        try {
          const payload =
            (await response.json()) as {
              error?:
                string;
            };

          message =
            payload.error ??
            message;
        } catch {
          // Response was not JSON.
        }

        throw new Error(
          message,
        );
      }

      const blob =
        await response.blob();

      const disposition =
        response.headers.get(
          "Content-Disposition",
        );

      const match =
        disposition?.match(
          /filename="([^"]+)"/,
        );

      const filename =
        match?.[1] ??
        "access-review-compliance-report.pdf";

      const url =
        URL.createObjectURL(
          blob,
        );

      const anchor =
        document.createElement(
          "a",
        );

      anchor.href =
        url;

      anchor.download =
        filename;

      document.body.appendChild(
        anchor,
      );

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(
        url,
      );

      toast.success(
        "Compliance report generated successfully.",
      );
    } catch (
      error
    ) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The compliance report could not be downloaded.",
      );
    } finally {
      setPending(
        false,
      );
    }
  }

  if (
    !props.allowed
  ) {
    return (
      <div
        title={
          props.restrictionReason ??
          "You do not have permission to export this report."
        }
        className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-[14px] border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-300"
      >
        <ShieldCheck className="h-4 w-4" />

        {props.label ??
          "Export PDF"}
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={
        pending
      }
      onClick={
        downloadReport
      }
      className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-violet-200 bg-violet-50 px-4 text-sm font-black text-violet-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}

      {pending
        ? "Generating PDF..."
        : props.label ??
          "Export PDF"}
    </button>
  );
}