import {
  Archive,
  CircleCheckBig,
  CircleDashed,
  Crown,
  Layers3,
  type LucideIcon,
} from "lucide-react";

type GradingScaleMetricsProps = {
  metrics: {
    total: number;
    draft: number;
    active: number;
    archived: number;

    defaultScale: {
      id: number;
      name: string;
      status: string;
    } | null;
  };
};

export default function GradingScaleMetrics({
  metrics,
}: GradingScaleMetricsProps) {
  const cards: {
    label: string;
    value: string;
    description: string;
    icon: LucideIcon;
  }[] = [
    {
      label: "Total Scales",
      value: String(
        metrics.total,
      ),
      description:
        "All grading configurations",
      icon: Layers3,
    },

    {
      label: "Active",
      value: String(
        metrics.active,
      ),
      description:
        "Available for academic weightings",
      icon: CircleCheckBig,
    },

    {
      label: "Draft",
      value: String(
        metrics.draft,
      ),
      description:
        "Still being configured",
      icon: CircleDashed,
    },

    {
      label: "Archived",
      value: String(
        metrics.archived,
      ),
      description:
        "No longer available for selection",
      icon: Archive,
    },

    {
      label: "School Default",
      value:
        metrics.defaultScale
          ?.name ?? "Not Set",
      description:
        metrics.defaultScale
          ? "Preferred grading standard"
          : "Choose an active default scale",
      icon: Crown,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(
        ({
          label,
          value,
          description,
          icon: Icon,
        }) => (
          <article
            key={label}
            className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(15,23,42,0.09)]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
              <Icon className="h-5 w-5" />
            </div>

            <p className="mt-5 line-clamp-2 text-xl font-black tracking-tight text-slate-950">
              {value}
            </p>

            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              {label}
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </article>
        ),
      )}
    </div>
  );
}