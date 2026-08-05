import {
  CheckCircle2,
  CircleOff,
} from "lucide-react";

export default function AcademicWeightingStatusBadge({
  isActive,
}: {
  isActive: boolean;
}) {
  const Icon =
    isActive
      ? CheckCircle2
      : CircleOff;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-500"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />

      {isActive
        ? "Active"
        : "Inactive"}
    </span>
  );
}