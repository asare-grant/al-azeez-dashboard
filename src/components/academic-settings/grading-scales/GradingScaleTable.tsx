import Link from "next/link";

import {
  Crown,
  Eye,
  Layers3,
  Scale,
} from "lucide-react";

import type {
  GradingScaleListItem,
} from "@/lib/academic-weightings/types";

import GradingScaleActions from "./GradingScaleActions";
import GradingScaleStatusBadge from "./GradingScaleStatusBadge";

function formatDate(
  value: Date | string,
) {
  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );
}

export default function GradingScaleTable({
  scales,
}: {
  scales: GradingScaleListItem[];
}) {
  return (
    <div className="hidden overflow-hidden rounded-[26px] border border-slate-200 xl:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90">
              <Heading>
                Grading Scale
              </Heading>

              <Heading>
                Status
              </Heading>

              <Heading>
                Boundaries
              </Heading>

              <Heading>
                Academic Usage
              </Heading>

              <Heading>
                Updated
              </Heading>

              <Heading align="right">
                Actions
              </Heading>
            </tr>
          </thead>

          <tbody>
            {scales.map(
              (scale) => (
                <tr
                  key={scale.id}
                  className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/80"
                >
                  <Cell>
                    <div className="flex max-w-md items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Scale className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-slate-950">
                            {scale.name}
                          </p>

                          {scale.isDefault ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-amber-700">
                              <Crown className="h-3 w-3" />

                              School Default
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                          {scale.description ??
                            "No description has been provided."}
                        </p>
                      </div>
                    </div>
                  </Cell>

                  <Cell>
                    <GradingScaleStatusBadge
                      status={
                        scale.status
                      }
                    />
                  </Cell>

                  <Cell>
                    <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
                      <Layers3 className="h-4 w-4 text-slate-500" />

                      <span className="text-sm font-black text-slate-800">
                        {scale.boundaryCount}
                      </span>
                    </div>
                  </Cell>

                  <Cell>
                    <div>
                      <p className="font-black text-slate-900">
                        {scale.weightingCount}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Academic{" "}
                        {scale.weightingCount ===
                        1
                          ? "weighting"
                          : "weightings"}
                      </p>
                    </div>
                  </Cell>

                  <Cell>
                    <p className="text-sm font-bold text-slate-700">
                      {formatDate(
                        scale.updatedAt,
                      )}
                    </p>
                  </Cell>

                  <Cell align="right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/list/academic-settings/grading-scales/${scale.id}/edit`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                      >
                        <Eye className="h-3.5 w-3.5" />

                        Open
                      </Link>

                      <GradingScaleActions
                        id={scale.id}
                        name={
                          scale.name
                        }
                        status={
                          scale.status
                        }
                        isDefault={
                          scale.isDefault
                        }
                        weightingCount={
                          scale.weightingCount
                        }
                      />
                    </div>
                  </Cell>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Heading({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-4 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 ${
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
  children: React.ReactNode;
  align?: "left" | "right";
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