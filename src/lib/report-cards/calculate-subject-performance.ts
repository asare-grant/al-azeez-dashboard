type ScoreRecord = {
  percentage: number;
  date: Date | string;
};

export function selectOfficialAssessmentScore({
  scores,
  strategy,
}: {
  scores: ScoreRecord[];

  strategy:
    | "HIGHEST"
    | "LATEST"
    | "FIRST"
    | "AVERAGE";
}): number | null {
  if (scores.length === 0) {
    return null;
  }

  const sorted = [...scores].sort(
    (a, b) =>
      new Date(a.date).getTime() -
      new Date(b.date).getTime()
  );

  switch (strategy) {
    case "HIGHEST":
      return Math.max(
        ...scores.map(
          (score) =>
            score.percentage
        )
      );

    case "LATEST":
      return sorted.at(-1)
        ?.percentage ?? null;

    case "FIRST":
      return sorted.at(0)
        ?.percentage ?? null;

    case "AVERAGE":
    default:
      return Number(
        (
          scores.reduce(
            (sum, score) =>
              sum +
              score.percentage,
            0
          ) / scores.length
        ).toFixed(2)
      );
  }
}

export function calculateWeightedSubjectScore({
  assessmentPercentage,
  examPercentage,
  assignmentPercentage,

  assessmentWeight,
  examWeight,
  assignmentWeight,
}: {
  assessmentPercentage:
    | number
    | null;

  examPercentage:
    | number
    | null;

  assignmentPercentage:
    | number
    | null;

  assessmentWeight: number;
  examWeight: number;
  assignmentWeight: number;
}) {
  const components = [
    {
      percentage:
        assessmentPercentage,

      weight:
        assessmentWeight,
    },
    {
      percentage:
        examPercentage,

      weight:
        examWeight,
    },
    {
      percentage:
        assignmentPercentage,

      weight:
        assignmentWeight,
    },
  ].filter(
    (
      component
    ): component is {
      percentage: number;
      weight: number;
    } =>
      component.percentage !==
        null &&
      component.weight > 0
  );

  if (components.length === 0) {
    return null;
  }

  const availableWeight =
    components.reduce(
      (sum, component) =>
        sum + component.weight,
      0
    );

  const weightedTotal =
    components.reduce(
      (sum, component) =>
        sum +
        component.percentage *
          (component.weight /
            availableWeight),
      0
    );

  return Number(
    weightedTotal.toFixed(2)
  );
}