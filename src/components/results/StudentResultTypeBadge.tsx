import {
  BookOpenCheck,
  ClipboardList,
  FileText,
} from "lucide-react";

import type {
  UnifiedResultType,
} from "@/lib/results";

export default function StudentResultTypeBadge({
  type,
}: {
  type: UnifiedResultType;
}) {
  const config = {
    EXAM: {
      label: "Exam",
      icon: FileText,
      className:
        "border-violet-200 bg-violet-50 text-violet-700",
    },

    ASSIGNMENT: {
      label: "Assignment",
      icon: ClipboardList,
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    ASSESSMENT: {
      label: "Assessment",
      icon: BookOpenCheck,
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    },
  }[type];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}