type AssessmentDifficultyBadgeProps = {
  difficulty:
    | "VERY_EASY"
    | "EASY"
    | "MODERATE"
    | "DIFFICULT"
    | "VERY_DIFFICULT";
};

export default function AssessmentDifficultyBadge({
  difficulty,
}: AssessmentDifficultyBadgeProps) {
  const config = {
    VERY_EASY: {
      label: "Very Easy",
      className:
        "bg-emerald-100 text-emerald-700",
    },

    EASY: {
      label: "Easy",
      className:
        "bg-green-100 text-green-700",
    },

    MODERATE: {
      label: "Moderate",
      className:
        "bg-amber-100 text-amber-700",
    },

    DIFFICULT: {
      label: "Difficult",
      className:
        "bg-orange-100 text-orange-700",
    },

    VERY_DIFFICULT: {
      label: "Very Difficult",
      className:
        "bg-red-100 text-red-700",
    },
  }[difficulty];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  );
}