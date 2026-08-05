import Link from "next/link";

import {
  ClipboardCheck,
  Eye,
} from "lucide-react";

import type {
  ReportCardBulkReviewItem,
} from "@/lib/report-cards/bulk-review-types";

import {
  ReportCardCalculationBadge,
  ReportCardReviewStatusBadge,
} from "@/components/report-cards/review";

type ReportCardBulkReviewTableProps = {
  items:
    ReportCardBulkReviewItem[];

  selectedIds:
    Set<number>;

  allPageSelected:
    boolean;

  onToggleAll: () => void;

  onToggle: (
    reportCardId: number,
  ) => void;
};

export default function ReportCardBulkReviewTable({
  items,
  selectedIds,
  allPageSelected,
  onToggleAll,
  onToggle,
}: ReportCardBulkReviewTableProps) {
  return (
    <div className="hidden overflow-x-auto xl:block">
      <table className="w-full min-w-[1350px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-4 text-left">
              <input
                type="checkbox"
                checked={
                  allPageSelected
                }
                onChange={
                  onToggleAll
                }
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                aria-label="Select all visible report cards"
              />
            </th>

            <Heading>
              Student
            </Heading>

            <Heading>
              Class
            </Heading>

            <Heading>
              Academic Result
            </Heading>

            <Heading>
              Completion
            </Heading>

            <Heading>
              Attendance
            </Heading>

            <Heading>
              Review
            </Heading>

            <Heading>
              Readiness
            </Heading>

            <Heading>
              Available Action
            </Heading>

            <Heading align="right">
              Open
            </Heading>
          </tr>
        </thead>

        <tbody>
          {items.map(
            (item) => (
              <tr
                key={item.id}
                className={`border-b border-slate-100 transition ${
                  selectedIds.has(
                    item.id,
                  )
                    ? "bg-blue-50/60"
                    : "hover:bg-slate-50/70"
                }`}
              >
                <Cell>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(
                      item.id,
                    )}
                    onChange={() =>
                      onToggle(
                        item.id,
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    aria-label={`Select ${item.student.name} ${item.student.surname}`}
                  />
                </Cell>

                <Cell>
                  <p className="font-black text-slate-950">
                    {
                      item.student
                        .name
                    }{" "}
                    {
                      item.student
                        .surname
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {
                      item.student
                        .studentId
                    }
                  </p>
                </Cell>

                <Cell>
                  <p className="font-bold text-slate-700">
                    {
                      item.class
                        .name
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {
                      item.grade
                        .level
                    }
                  </p>
                </Cell>

                <Cell>
                  <p className="text-lg font-black text-blue-700">
                    {item.averageScore ===
                    null
                      ? "—"
                      : `${item.averageScore.toFixed(
                          2,
                        )}%`}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Grade{" "}
                    {item.overallGrade ??
                      "—"}
                  </p>
                </Cell>

                <Cell>
                  <p className="font-black text-slate-800">
                    {
                      item.completedSubjectCount
                    }
                    /
                    {
                      item.subjectCount
                    }
                  </p>

                  {item.incompleteSubjectCount >
                  0 ? (
                    <p className="mt-1 text-xs font-bold text-red-500">
                      {
                        item.incompleteSubjectCount
                      }{" "}
                      incomplete
                    </p>
                  ) : (
                    <p className="mt-1 text-xs font-bold text-emerald-600">
                      Complete
                    </p>
                  )}
                </Cell>

                <Cell>
                  <p className="font-black text-slate-800">
                    {item.daysPresent ??
                      "—"}
                    /
                    {item.daysSchoolOpened ??
                      "—"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Present
                  </p>
                </Cell>

                <Cell>
                  <ReportCardReviewStatusBadge
                    status={
                      item.reviewStatus
                    }
                  />
                </Cell>

                <Cell>
                  <ReportCardCalculationBadge
                    status={
                      item.calculationStatus
                    }
                  />
                </Cell>

                <Cell>
                  <AvailableAction
                    item={
                      item
                    }
                  />
                </Cell>

                <Cell align="right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/list/report-cards/${item.id}`}
                      className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-700 transition hover:bg-slate-50"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Link>

                    <Link
                      href={`/list/report-cards/${item.id}/review`}
                      className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-50 px-3 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      Review
                    </Link>
                  </div>
                </Cell>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

function AvailableAction({
  item,
}: {
  item:
    ReportCardBulkReviewItem;
}) {
  if (
    item.canApprove
  ) {
    return (
      <span className="text-xs font-black text-emerald-600">
        Approve
      </span>
    );
  }

  if (
    item.canRequestChanges
  ) {
    return (
      <span className="text-xs font-black text-amber-600">
        Review or return
      </span>
    );
  }

  if (
    item.canPublish
  ) {
    return (
      <span className="text-xs font-black text-blue-600">
        Publish
      </span>
    );
  }

  return (
    <span className="text-xs font-bold text-slate-300">
      No bulk action
    </span>
  );
}

function Heading({
  children,
  align = "left",
}: {
  children:
    React.ReactNode;

  align?:
    | "left"
    | "right";
}) {
  return (
    <th
      className={`px-4 py-4 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Cell({
  children,
  align = "left",
}: {
  children:
    React.ReactNode;

  align?:
    | "left"
    | "right";
}) {
  return (
    <td
      className={`px-4 py-5 align-middle ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </td>
  );
}