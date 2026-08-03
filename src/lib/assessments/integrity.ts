import prisma from "@/lib/prisma";

export async function inspectAssessmentIntegrity(
  assessmentId: number
) {
  const assessment =
    await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },

      select: {
        id: true,
        totalMarks: true,
        questionCount: true,

        questions: {
          select: {
            id: true,
            marks: true,

            options: {
              select: {
                id: true,
                isCorrect: true,
              },
            },
          },
        },
      },
    });

  if (!assessment) {
    return {
      valid: false,
      errors: [
        "Assessment not found.",
      ],
    };
  }

  const errors: string[] = [];

  if (
    assessment.questions.length !==
    assessment.questionCount
  ) {
    errors.push(
      "Stored question count does not match the actual questions."
    );
  }

  const calculatedMarks =
    assessment.questions.reduce(
      (total, question) =>
        total + question.marks,
      0
    );

  if (
    calculatedMarks !==
    assessment.totalMarks
  ) {
    errors.push(
      "Stored total marks do not match the question marks."
    );
  }

  for (
    const question of
    assessment.questions
  ) {
    const correctCount =
      question.options.filter(
        (option) =>
          option.isCorrect
      ).length;

    if (correctCount !== 1) {
      errors.push(
        `Question ${question.id} has ${correctCount} correct options.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}