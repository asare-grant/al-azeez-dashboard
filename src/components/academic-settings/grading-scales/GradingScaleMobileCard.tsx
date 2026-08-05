import Link from "next/link";

import {
  Crown,
  Edit3,
  Layers3,
  Scale,
} from "lucide-react";

import type {
  GradingScaleListItem,
} from "@/lib/academic-weightings/types";

import GradingScaleActions from "./GradingScaleActions";
import GradingScaleStatusBadge from "./GradingScaleStatusBadge";

export default function GradingScaleMobileCard({
  scale,
}: {
  scale: GradingScaleListItem;
}) {
  return (
    <article className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Scale className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-black text-slate-950">
                {scale.name}
              </h3>

              {scale.isDefault ? (
                <Crown className="h-4 w-4 fill-amber-400 text-amber-500" />
              ) : null}
            </div>

            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
              {scale.description ??
                "No description has been provided."}
            </p>
          </div>

          <GradingScaleActions
            id={scale.id}
            name={scale.name}
            status={scale.status}
            isDefault={
              scale.isDefault
            }
            weightingCount={
              scale.weightingCount
            }
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <GradingScaleStatusBadge
            status={scale.status}
          />

          {scale.isDefault ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
              <Crown className="h-3 w-3" />

              Default
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5">
        <MobileMetric
          label="Boundaries"
          value={String(
            scale.boundaryCount,
          )}
          icon={Layers3}
        />

        <MobileMetric
          label="Weightings"
          value={String(
            scale.weightingCount,
          )}
          icon={Scale}
        />
      </div>

      <div className="border-t border-slate-100 p-4">
        <Link
          href={`/list/academic-settings/grading-scales/${scale.id}/edit`}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-black text-white transition hover:bg-blue-700"
        >
          <Edit3 className="h-4 w-4" />

          Open Grading Studio
        </Link>
      </div>
    </article>
  );
}

function MobileMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Layers3;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <Icon className="h-4 w-4 text-blue-600" />

      <p className="mt-3 text-xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}