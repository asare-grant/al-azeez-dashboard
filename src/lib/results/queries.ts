// import prisma from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";

// import type {
//   UnifiedStudentResult,
// } from "./types";

// export async function getStudentUnifiedResults({
//   studentId,
//   academicYear,
//   termId,
// }: {
//   studentId?: string;
//   academicYear?: string;
//   termId?: number;
// } = {}): Promise<UnifiedStudentResult[]> {
//   const {
//     userId,
//     sessionClaims,
//   } = await auth();

//   if (!userId) {
//     throw new Error(
//       "UNAUTHENTICATED"
//     );
//   }

//   const role = (
//     sessionClaims?.metadata as {
//       role?: string;
//     }
//   )?.role;

//   const resolvedStudentId =
//     role === "student"
//       ? userId
//       : studentId;

//   if (!resolvedStudentId) {
//     throw new Error(
//       "STUDENT_ID_REQUIRED"
//     );
//   }

//   const results =
//     await prisma.result.findMany({
//       where: {
//         studentId:
//           resolvedStudentId,

//         AND: [
//           ...(academicYear
//             ? [
//                 {
//                   OR: [
//                     {
//                       assessment: {
//                         academicYear,
//                       },
//                     },
//                     {
//                       exam: {
//                         academicYear,
//                       },
//                     },
//                   ],
//                 },
//               ]
//             : []),

//           ...(termId
//             ? [
//                 {
//                   OR: [
//                     {
//                       assessment: {
//                         termId,
//                       },
//                     },
//                     {
//                       exam: {
//                         termId,
//                       },
//                     },
//                   ],
//                 },
//               ]
//             : []),
//         ],
//       },

//       orderBy: {
//         createdAt:
//           "desc",
//       },

//       select: {
//         id: true,
//         type: true,

//         score: true,
//         totalMarks: true,
//         percentage: true,

//         grade: true,
//         remarks: true,

//         createdAt: true,

//         exam: {
//           select: {
//             id: true,
//             title: true,

//             academicYear: true,

//             term: {
//               select: {
//                 id: true,
//                 name: true,
//               },
//             },

//             lesson: {
//               select: {
//                 subject: {
//                   select: {
//                     name: true,
//                   },
//                 },

//                 class: {
//                   select: {
//                     name: true,
//                   },
//                 },
//               },
//             },
//           },
//         },

//         assignment: {
//           select: {
//             id: true,
//             title: true,

//             lesson: {
//               select: {
//                 subject: {
//                   select: {
//                     name: true,
//                   },
//                 },

//                 class: {
//                   select: {
//                     name: true,
//                   },
//                 },
//               },
//             },
//           },
//         },

//         assessment: {
//           select: {
//             id: true,
//             title: true,
//             academicYear: true,

//             term: {
//               select: {
//                 id: true,
//                 name: true,
//               },
//             },

//             lesson: {
//               select: {
//                 subject: {
//                   select: {
//                     name: true,
//                   },
//                 },

//                 class: {
//                   select: {
//                     name: true,
//                   },
//                 },
//               },
//             },
//           },
//         },

//         assessmentAttempt: {
//           select: {
//             id: true,
//             attemptNumber: true,
//           },
//         },
//       },
//     });

//   return results.map(
//     (
//       result
//     ): UnifiedStudentResult => {
//       if (
//         result.type ===
//           "ASSESSMENT" &&
//         result.assessment
//       ) {
//         return {
//           id:
//             result.id,

//           type:
//             "ASSESSMENT",

//           title:
//             result.assessment
//               .title,

//           subject:
//             result.assessment
//               .lesson.subject
//               .name,

//           className:
//             result.assessment
//               .lesson.class.name,

//           score:
//             result.score,

//           totalMarks:
//             result.totalMarks,

//           percentage:
//             result.percentage,

//           grade:
//             result.grade,

//           remarks:
//             result.remarks,

//           academicYear:
//             result.assessment
//               .academicYear,

//           term:
//             result.assessment
//               .term
//               ? {
//                   id:
//                     result.assessment
//                       .term.id,

//                   name:
//                     result.assessment
//                       .term.name,
//                 }
//               : null,

//           attemptNumber:
//             result
//               .assessmentAttempt
//               ?.attemptNumber ??
//             null,

//           date:
//             result.createdAt,

//           assessment: {
//             id:
//               result.assessment
//                 .id,

//             attemptId:
//               result
//                 .assessmentAttempt
//                 ?.id ??
//               null,
//           },
//         };
//       }

//       if (
//         result.type ===
//           "EXAM" &&
//         result.exam
//       ) {
//         return {
//           id:
//             result.id,

//           type:
//             "EXAM",

//           title:
//             result.exam.title,

//           subject:
//             result.exam.lesson
//               .subject.name,

//           className:
//             result.exam.lesson
//               .class.name,

//           score:
//             result.score,

//           totalMarks:
//             result.totalMarks,

//           percentage:
//             result.percentage,

//           grade:
//             result.grade,

//           remarks:
//             result.remarks,

//           academicYear:
//             result.exam
//               .academicYear,

//           term:
//             result.exam.term
//               ? {
//                   id:
//                     result.exam
//                       .term.id,

//                   name:
//                     result.exam
//                       .term.name,
//                 }
//               : null,

//           attemptNumber:
//             null,

//           date:
//             result.createdAt,

//           assessment:
//             null,
//         };
//       }

//       return {
//         id:
//           result.id,

//         type:
//           "ASSIGNMENT",

//         title:
//           result.assignment
//             ?.title ??
//           "Assignment",

//         subject:
//           result.assignment
//             ?.lesson.subject
//             .name ??
//           "Unknown Subject",

//         className:
//           result.assignment
//             ?.lesson.class.name ??
//           "Unknown Class",

//         score:
//           result.score,

//         totalMarks:
//           result.totalMarks,

//         percentage:
//           result.percentage,

//         grade:
//           result.grade,

//         remarks:
//           result.remarks,

//         academicYear:
//           null,

//         term:
//           null,

//         attemptNumber:
//           null,

//         date:
//           result.createdAt,

//         assessment:
//           null,
//       };
//     }
//   );
// }




import "server-only";

import prisma from "@/lib/prisma";

import {
  auth,
} from "@clerk/nextjs/server";

import type {
  UnifiedStudentResult,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                               AUTH HELPERS                                 */
/* -------------------------------------------------------------------------- */

async function getCurrentResultUser() {
  const {
    userId,
    sessionClaims,
  } = await auth();

  if (!userId) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  const role = (
    sessionClaims
      ?.metadata as {
      role?: string;
    } | undefined
  )?.role;

  return {
    userId,
    role,
  };
}

/* -------------------------------------------------------------------------- */
/*                    INTERNAL UNIFIED RESULT QUERY                           */
/* -------------------------------------------------------------------------- */

async function getUnifiedResultsForStudent({
  studentId,
  academicYear,
  termId,
}: {
  studentId: string;

  academicYear?: string;

  termId?: number;
}): Promise<
  UnifiedStudentResult[]
> {
  const normalizedStudentId =
    studentId.trim();

  if (
    !normalizedStudentId
  ) {
    throw new Error(
      "STUDENT_ID_REQUIRED",
    );
  }

  const normalizedAcademicYear =
    academicYear?.trim() ||
    undefined;

  const results =
    await prisma.result.findMany({
      where: {
        studentId:
          normalizedStudentId,

        AND: [
          ...(normalizedAcademicYear
            ? [
                {
                  OR: [
                    {
                      assessment: {
                        academicYear:
                          normalizedAcademicYear,
                      },
                    },

                    {
                      exam: {
                        academicYear:
                          normalizedAcademicYear,
                      },
                    },

                    {
                      assignment: {
                        academicYear:
                          normalizedAcademicYear,
                      },
                    },
                  ],
                },
              ]
            : []),

          ...(termId
            ? [
                {
                  OR: [
                    {
                      assessment: {
                        termId,
                      },
                    },

                    {
                      exam: {
                        termId,
                      },
                    },

                    {
                      assignment: {
                        termId,
                      },
                    },
                  ],
                },
              ]
            : []),
        ],
      },

      orderBy: {
        createdAt:
          "desc",
      },

      select: {
        id:
          true,

        type:
          true,

        score:
          true,

        totalMarks:
          true,

        percentage:
          true,

        grade:
          true,

        remarks:
          true,

        createdAt:
          true,

        /* -------------------------------------------------------------- */
        /*                         EXAMINATION                            */
        /* -------------------------------------------------------------- */

        exam: {
          select: {
            id:
              true,

            title:
              true,

            academicYear:
              true,

            term: {
              select: {
                id:
                  true,

                name:
                  true,
              },
            },

            lesson: {
              select: {
                subject: {
                  select: {
                    name:
                      true,
                  },
                },

                class: {
                  select: {
                    name:
                      true,
                  },
                },
              },
            },
          },
        },

        /* -------------------------------------------------------------- */
        /*                         ASSIGNMENT                             */
        /* -------------------------------------------------------------- */

        assignment: {
          select: {
            id:
              true,

            title:
              true,

            academicYear:
              true,

            term: {
              select: {
                id:
                  true,

                name:
                  true,
              },
            },

            lesson: {
              select: {
                subject: {
                  select: {
                    name:
                      true,
                  },
                },

                class: {
                  select: {
                    name:
                      true,
                  },
                },
              },
            },
          },
        },

        /* -------------------------------------------------------------- */
        /*                         ASSESSMENT                             */
        /* -------------------------------------------------------------- */

        assessment: {
          select: {
            id:
              true,

            title:
              true,

            academicYear:
              true,

            term: {
              select: {
                id:
                  true,

                name:
                  true,
              },
            },

            lesson: {
              select: {
                subject: {
                  select: {
                    name:
                      true,
                  },
                },

                class: {
                  select: {
                    name:
                      true,
                  },
                },
              },
            },
          },
        },

        assessmentAttempt: {
          select: {
            id:
              true,

            attemptNumber:
              true,
          },
        },
      },
    });

  return results.map(
    (
      result,
    ): UnifiedStudentResult => {
      /* -------------------------------------------------------------- */
      /*                        ASSESSMENT                              */
      /* -------------------------------------------------------------- */

      if (
        result.type ===
          "ASSESSMENT" &&
        result.assessment
      ) {
        return {
          id:
            result.id,

          type:
            "ASSESSMENT",

          title:
            result.assessment
              .title,

          subject:
            result.assessment
              .lesson.subject
              .name,

          className:
            result.assessment
              .lesson.class.name,

          score:
            result.score,

          totalMarks:
            result.totalMarks,

          percentage:
            result.percentage,

          grade:
            result.grade,

          remarks:
            result.remarks,

          academicYear:
            result.assessment
              .academicYear,

          term:
            result.assessment
              .term
              ? {
                  id:
                    result.assessment
                      .term.id,

                  name:
                    result.assessment
                      .term.name,
                }
              : null,

          attemptNumber:
            result
              .assessmentAttempt
              ?.attemptNumber ??
            null,

          date:
            result.createdAt,

          assessment: {
            id:
              result.assessment
                .id,

            attemptId:
              result
                .assessmentAttempt
                ?.id ??
              null,
          },
        };
      }

      /* -------------------------------------------------------------- */
      /*                         EXAMINATION                            */
      /* -------------------------------------------------------------- */

      if (
        result.type ===
          "EXAM" &&
        result.exam
      ) {
        return {
          id:
            result.id,

          type:
            "EXAM",

          title:
            result.exam
              .title,

          subject:
            result.exam
              .lesson.subject
              .name,

          className:
            result.exam
              .lesson.class
              .name,

          score:
            result.score,

          totalMarks:
            result.totalMarks,

          percentage:
            result.percentage,

          grade:
            result.grade,

          remarks:
            result.remarks,

          academicYear:
            result.exam
              .academicYear,

          term:
            result.exam
              .term
              ? {
                  id:
                    result.exam
                      .term.id,

                  name:
                    result.exam
                      .term.name,
                }
              : null,

          attemptNumber:
            null,

          date:
            result.createdAt,

          assessment:
            null,
        };
      }

      /* -------------------------------------------------------------- */
      /*                         ASSIGNMENT                             */
      /* -------------------------------------------------------------- */

      if (
        result.type ===
          "ASSIGNMENT" &&
        result.assignment
      ) {
        return {
          id:
            result.id,

          type:
            "ASSIGNMENT",

          title:
            result.assignment
              .title,

          subject:
            result.assignment
              .lesson.subject
              .name,

          className:
            result.assignment
              .lesson.class
              .name,

          score:
            result.score,

          totalMarks:
            result.totalMarks,

          percentage:
            result.percentage,

          grade:
            result.grade,

          remarks:
            result.remarks,

          /*
           * Important:
           * Assignments now participate fully
           * in academic-year and term filtering.
           */
          academicYear:
            result.assignment
              .academicYear,

          term:
            result.assignment
              .term
              ? {
                  id:
                    result.assignment
                      .term.id,

                  name:
                    result.assignment
                      .term.name,
                }
              : null,

          attemptNumber:
            null,

          date:
            result.createdAt,

          assessment:
            null,
        };
      }

      /*
       * This should only happen if a Result row
       * is missing its corresponding source relation.
       */
      return {
        id:
          result.id,

        type:
          result.type,

        title:
          "Unavailable Result",

        subject:
          "Unknown Subject",

        className:
          "Unknown Class",

        score:
          result.score,

        totalMarks:
          result.totalMarks,

        percentage:
          result.percentage,

        grade:
          result.grade,

        remarks:
          result.remarks,

        academicYear:
          null,

        term:
          null,

        attemptNumber:
          null,

        date:
          result.createdAt,

        assessment:
          null,
      };
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                         STUDENT RESULTS                                    */
/* -------------------------------------------------------------------------- */

export async function getStudentUnifiedResults({
  academicYear,
  termId,
}: {
  academicYear?: string;

  termId?: number;
} = {}): Promise<
  UnifiedStudentResult[]
> {
  const {
    userId,
    role,
  } =
    await getCurrentResultUser();

  if (
    role !==
    "student"
  ) {
    throw new Error(
      "UNAUTHORISED",
    );
  }

  return getUnifiedResultsForStudent({
    studentId:
      userId,

    academicYear,

    termId,
  });
}

/* -------------------------------------------------------------------------- */
/*                     PARENT CHILD RESULTS                                   */
/* -------------------------------------------------------------------------- */

export async function getParentChildUnifiedResults({
  childId,
  academicYear,
  termId,
}: {
  childId: string;

  academicYear?: string;

  termId?: number;
}) {
  const {
    userId,
    role,
  } =
    await getCurrentResultUser();

  if (
    role !==
    "parent"
  ) {
    return null;
  }

  const normalizedChildId =
    childId.trim();

  if (
    !normalizedChildId
  ) {
    return null;
  }

  /*
   * Prove ownership BEFORE loading
   * any academic result records.
   */
  const child =
    await prisma.student.findFirst({
      where: {
        id:
          normalizedChildId,

        parentId:
          userId,
      },

      select: {
        id:
          true,

        studentID:
          true,

        name:
          true,

        surname:
          true,

        img:
          true,

        class: {
          select: {
            id:
              true,

            name:
              true,
          },
        },

        grade: {
          select: {
            id:
              true,

            level:
              true,
          },
        },
      },
    });

  if (!child) {
    return null;
  }

  const results =
    await getUnifiedResultsForStudent({
      studentId:
        child.id,

      academicYear,

      termId,
    });

  return {
    child: {
      id:
        child.id,

      studentId:
        child.studentID,

      name:
        child.name,

      surname:
        child.surname,

      img:
        child.img,

      class:
        child.class,

      grade:
        child.grade,
    },

    results,
  };
}