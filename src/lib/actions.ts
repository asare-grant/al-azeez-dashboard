// src/lib/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import {
  AnnouncementSchema,
  announcementSchema,
  AssignmentSchema,
  AttendanceSchema,
  BulkAttendanceSchema,
  ClassSchema,
  EventSchema,
  eventSchema,
  ExamSchema,
  FeeCategorySchema,
  FeeMasterSchema,
  FeePaymentSchema,
  FeeSchema,
  FeeStructureSchema,
  feeStructureSchema,
  FeeTypeSchema,
  LessonSchema,
  ParentSchema,
  ResultSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";

import { auth, clerkClient } from "@clerk/nextjs/server";

import { syncAssignmentResult } from "@/lib/results";

import { requireLessonManager } from "@/lib/lessons/auth";

import { requireExamManager } from "@/lib/exams/auth";

import { requireAssignmentManager } from "@/lib/assignments/auth";

import { requireEventManager } from "@/lib/events/auth";

import { requireFinancePermission } from "@/lib/finance/auth";

import { requireAnnouncementManager } from "@/lib/announcements/auth";

import { getCurrentAccessActor } from "@/lib/access-control";

import { requirePermission } from "@/lib/access-control";

import { Prisma } from "@prisma/client";

import {
  requireResultsManagementAccess,
  requireTeacherAssignmentOwnership,
  requireTeacherExamOwnership,
  requireMutableManualResult,
} from "@/lib/results/result-access";

import { invalidateStudentReportCardWithTransaction } from "@/lib/report-cards/invalidation-service";

import { syncExamResult } from "@/lib/results/exam-result-sync";

import { deleteAcademicResultWithTransaction } from "@/lib/results/delete-result-service";

import { invalidateTermReportCardsWithTransaction } from "@/lib/report-cards/invalidation-service";

import { syncFeeMasterStatus } from "@/lib/finance/fee-account-service";

import { notifyFeePaymentReceived } from "@/lib/notifications/finance-notifications";

import {
  notifyEventCancelled,
  notifyEventPublished,
  notifyEventUpdated,
} from "@/lib/notifications/event-notifications";

type CurrentState = { success: boolean; error: boolean };

/* ========================================================================== */
/* SUBJECT ACTIONS                                                            */
/* ========================================================================== */

/* -------------------------------------------------------------------------- */
/* CREATE SUBJECT                                                             */
/* -------------------------------------------------------------------------- */

export const createSubject = async (
  _currentState: CurrentState,
  data: SubjectSchema,
) => {
  try {
    await requirePermission("academics.subjects.manage");

    await prisma.subject.create({
      data: {
        name: data.name,

        teachers: {
          connect: data.teachers.map((teacherId) => ({
            id: teacherId,
          })),
        },
      },
    });

    revalidatePath("/list/subjects");

    return {
      success: true,

      error: false,
    };
  } catch (error) {
    console.error("CREATE SUBJECT ERROR:", error);

    return {
      success: false,

      error: true,
    };
  }
};

/* -------------------------------------------------------------------------- */
/* UPDATE SUBJECT                                                             */
/* -------------------------------------------------------------------------- */

export const updateSubject = async (
  _currentState: CurrentState,
  data: SubjectSchema,
) => {
  if (!data.id) {
    return {
      success: false,

      error: true,
    };
  }

  try {
    await requirePermission("academics.subjects.manage");

    await prisma.subject.update({
      where: {
        id: data.id,
      },

      data: {
        name: data.name,

        teachers: {
          set: data.teachers.map((teacherId) => ({
            id: teacherId,
          })),
        },
      },
    });

    revalidatePath("/list/subjects");

    return {
      success: true,

      error: false,
    };
  } catch (error) {
    console.error("UPDATE SUBJECT ERROR:", error);

    return {
      success: false,

      error: true,
    };
  }
};

/* -------------------------------------------------------------------------- */
/* DELETE SUBJECT                                                             */
/* -------------------------------------------------------------------------- */

export const deleteSubject = async (
  _currentState: CurrentState,
  data: FormData,
) => {
  const subjectId = Number(data.get("id"));

  if (!Number.isInteger(subjectId) || subjectId <= 0) {
    return {
      success: false,

      error: true,
    };
  }

  try {
    await requirePermission("academics.subjects.manage");

    await prisma.subject.delete({
      where: {
        id: subjectId,
      },
    });

    revalidatePath("/list/subjects");

    return {
      success: true,

      error: false,
    };
  } catch (error) {
    console.error("DELETE SUBJECT ERROR:", error);

    return {
      success: false,

      error: true,
    };
  }
};

export const createClass = async (
  _currentState: CurrentState,

  data: ClassSchema,
) => {
  try {
    await requirePermission("academics.classes.manage");

    await prisma.class.create({
      data,
    });

    revalidatePath("/list/classes");

    return {
      success: true,

      error: false,
    };
  } catch (error) {
    console.error("CREATE CLASS ERROR:", error);

    return {
      success: false,

      error: true,
    };
  }
};

export const updateClass = async (
  _currentState: CurrentState,

  data: ClassSchema,
) => {
  if (!data.id) {
    return {
      success: false,

      error: true,
    };
  }

  try {
    await requirePermission("academics.classes.manage");

    await prisma.class.update({
      where: {
        id: data.id,
      },

      data,
    });

    revalidatePath("/list/classes");

    return {
      success: true,

      error: false,
    };
  } catch (error) {
    console.error("UPDATE CLASS ERROR:", error);

    return {
      success: false,

      error: true,
    };
  }
};

export const deleteClass = async (
  _currentState: CurrentState,

  data: FormData,
) => {
  const classId = Number(data.get("id"));

  if (!Number.isInteger(classId) || classId <= 0) {
    return {
      success: false,

      error: true,
    };
  }

  try {
    await requirePermission("academics.classes.manage");

    await prisma.class.delete({
      where: {
        id: classId,
      },
    });

    revalidatePath("/list/classes");

    return {
      success: true,

      error: false,
    };
  } catch (error) {
    console.error("DELETE CLASS ERROR:", error);

    return {
      success: false,

      error: true,
    };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema,
) => {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission("teachers.create");

    /* ---------------------------------------------------------------------- */
    /* CLERK USER                                                             */
    /* ---------------------------------------------------------------------- */

    const client = await clerkClient();

    const user = await client.users.createUser({
      username: data.username,

      password: data.password,

      firstName: data.name,

      lastName: data.surname,

      publicMetadata: {
        role: "teacher",
      },
    });

    /* ---------------------------------------------------------------------- */
    /* DOMAIN RECORD                                                          */
    /* ---------------------------------------------------------------------- */

    try {
      await prisma.teacher.create({
        data: {
          id: user.id,

          username: data.username,

          name: data.name,

          surname: data.surname,

          email: data.email || null,

          phone: data.phone || null,

          address: data.address,

          img: data.img || null,

          teacherID: data.teacherID,

          sex: data.sex,

          birthday: data.birthday,

          subjects: {
            connect:
              data.subjects?.map((subjectId: string) => ({
                id: Number.parseInt(subjectId, 10),
              })) ?? [],
          },
        },
      });
    } catch (databaseError) {
      /*
       * Clerk and Prisma cannot participate in the
       * same database transaction.
       *
       * If creation of the Teacher domain record
       * fails, remove the Clerk account we just
       * created so we do not leave an orphaned
       * identity behind.
       */
      try {
        await client.users.deleteUser(user.id);
      } catch (rollbackError) {
        console.error("CREATE TEACHER CLERK ROLLBACK ERROR:", rollbackError);
      }

      throw databaseError;
    }

    revalidatePath("/list/teachers");

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    console.error("CREATE TEACHER ERROR:", error);

    return {
      success: false,
      error: true,
    };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema,
) => {
  if (!data.id) {
    return {
      success: false,
      error: true,
    };
  }

  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission("teachers.update");

    /* ---------------------------------------------------------------------- */
    /* EXISTENCE CHECK                                                        */
    /* ---------------------------------------------------------------------- */

    const existingTeacher = await prisma.teacher.findUnique({
      where: {
        id: data.id,
      },

      select: {
        id: true,
      },
    });

    if (!existingTeacher) {
      return {
        success: false,
        error: true,
      };
    }

    /* ---------------------------------------------------------------------- */
    /* CLERK                                                                  */
    /* ---------------------------------------------------------------------- */

    const client = await clerkClient();

    await client.users.updateUser(data.id, {
      username: data.username,

      ...(data.password !== "" && {
        password: data.password,
      }),

      firstName: data.name,

      lastName: data.surname,
    });

    /* ---------------------------------------------------------------------- */
    /* DOMAIN RECORD                                                          */
    /* ---------------------------------------------------------------------- */

    await prisma.teacher.update({
      where: {
        id: data.id,
      },

      data: {
        username: data.username,

        name: data.name,

        surname: data.surname,

        email: data.email || null,

        phone: data.phone || null,

        address: data.address,

        img: data.img || null,

        teacherID: data.teacherID,

        sex: data.sex,

        birthday: data.birthday,

        subjects: {
          set:
            data.subjects?.map((subjectId: string) => ({
              id: Number.parseInt(subjectId, 10),
            })) ?? [],
        },
      },
    });

    revalidatePath("/list/teachers");

    revalidatePath(`/list/teachers/${data.id}`);

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    console.error("UPDATE TEACHER ERROR:", error);

    return {
      success: false,
      error: true,
    };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const rawId = data.get("id");

  const id = typeof rawId === "string" ? rawId.trim() : "";

  if (!id) {
    return {
      success: false,
      error: true,
    };
  }

  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission("teachers.delete");

    /* ---------------------------------------------------------------------- */
    /* VERIFY TARGET                                                          */
    /* ---------------------------------------------------------------------- */

    const teacher = await prisma.teacher.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
      },
    });

    if (!teacher) {
      return {
        success: false,
        error: true,
      };
    }

    /* ---------------------------------------------------------------------- */
    /* DOMAIN RECORD                                                          */
    /* ---------------------------------------------------------------------- */

    await prisma.teacher.delete({
      where: {
        id,
      },
    });

    /* ---------------------------------------------------------------------- */
    /* CLERK                                                                  */
    /* ---------------------------------------------------------------------- */

    const client = await clerkClient();

    try {
      await client.users.deleteUser(id);
    } catch (clerkError) {
      /*
       * The domain record has already been removed.
       *
       * Log this loudly because the Clerk identity
       * may require reconciliation.
       */
      console.error("DELETE TEACHER CLERK CLEANUP ERROR:", clerkError);

      throw new Error(
        "Teacher record was removed, but the authentication account could not be deleted.",
      );
    }

    revalidatePath("/list/teachers");

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    console.error("DELETE TEACHER ERROR:", error);

    return {
      success: false,
      error: true,
    };
  }
};

export const createStudent = async (
  _currentState: CurrentState,

  data: StudentSchema,
) => {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission("students.create");

    /* ---------------------------------------------------------------------- */
    /* CLASS                                                                  */
    /* ---------------------------------------------------------------------- */

    const classItem = await prisma.class.findUnique({
      where: {
        id: data.classId,
      },

      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    if (!classItem) {
      return {
        success: false,

        error: true,

        message: "The selected class could not be found.",
      };
    }

    if (classItem._count.students >= classItem.capacity) {
      return {
        success: false,

        error: true,

        message: "The selected class has reached its capacity.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* CLERK                                                                  */
    /* ---------------------------------------------------------------------- */

    const client = await clerkClient();

    const user = await client.users.createUser({
      username: data.username,

      password: data.password,

      firstName: data.name,

      lastName: data.surname,

      publicMetadata: {
        role: "student",
      },
    });

    /* ---------------------------------------------------------------------- */
    /* DATABASE                                                               */
    /* ---------------------------------------------------------------------- */

    try {
      await prisma.student.create({
        data: {
          id: user.id,

          username: data.username,

          name: data.name,

          surname: data.surname,

          email: data.email || null,

          phone: data.phone || null,

          address: data.address,

          img: data.img || null,

          studentID: data.studentID,

          sex: data.sex,

          birthday: data.birthday,

          gradeId: data.gradeId,

          classId: data.classId,

          parentId: data.parentId || null,

          studentType: data.studentType,

          boardingType: data.boardingType,
        },
      });
    } catch (databaseError) {
      /*
       * Prevent an orphaned Clerk identity when the
       * Student domain record cannot be created.
       */
      try {
        await client.users.deleteUser(user.id);
      } catch (rollbackError) {
        console.error("CREATE STUDENT CLERK ROLLBACK ERROR:", rollbackError);
      }

      throw databaseError;
    }

    revalidatePath("/list/students");

    return {
      success: true,

      error: false,
    };
  } catch (error) {
    console.error("CREATE STUDENT ERROR:", error);

    return {
      success: false,

      error: true,
    };
  }
};

export const updateStudent = async (
  _currentState: CurrentState,

  data: StudentSchema,
) => {
  if (!data.id) {
    return {
      success: false,

      error: true,
    };
  }

  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission("students.update");

    /* ---------------------------------------------------------------------- */
    /* CURRENT STUDENT                                                        */
    /* ---------------------------------------------------------------------- */

    const existingStudent = await prisma.student.findUnique({
      where: {
        id: data.id,
      },

      select: {
        id: true,

        classId: true,
      },
    });

    if (!existingStudent) {
      return {
        success: false,

        error: true,

        message: "Student could not be found.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* CLASS CAPACITY                                                         */
    /* ---------------------------------------------------------------------- */

    if (existingStudent.classId !== data.classId) {
      const targetClass = await prisma.class.findUnique({
        where: {
          id: data.classId,
        },

        include: {
          _count: {
            select: {
              students: true,
            },
          },
        },
      });

      if (!targetClass) {
        return {
          success: false,

          error: true,

          message: "The selected class could not be found.",
        };
      }

      if (targetClass._count.students >= targetClass.capacity) {
        return {
          success: false,

          error: true,

          message: "The selected class has reached its capacity.",
        };
      }
    }

    /* ---------------------------------------------------------------------- */
    /* CLERK                                                                  */
    /* ---------------------------------------------------------------------- */

    const client = await clerkClient();

    await client.users.updateUser(data.id, {
      username: data.username,

      ...(data.password !== ""
        ? {
            password: data.password,
          }
        : {}),

      firstName: data.name,

      lastName: data.surname,
    });

    /* ---------------------------------------------------------------------- */
    /* DATABASE                                                               */
    /* ---------------------------------------------------------------------- */

    await prisma.student.update({
      where: {
        id: data.id,
      },

      data: {
        /*
         * Password deliberately does NOT belong here.
         * Authentication credentials remain in Clerk.
         */
        username: data.username,

        name: data.name,

        surname: data.surname,

        email: data.email || null,

        phone: data.phone || null,

        address: data.address,

        img: data.img || null,

        studentID: data.studentID,

        sex: data.sex,

        birthday: data.birthday,

        gradeId: data.gradeId,

        classId: data.classId,

        parentId: data.parentId,

        studentType: data.studentType,

        boardingType: data.boardingType,
      },
    });

    revalidatePath("/list/students");

    revalidatePath(`/list/students/${data.id}`);

    return {
      success: true,

      error: false,
    };
  } catch (error) {
    console.error("UPDATE STUDENT ERROR:", error);

    return {
      success: false,

      error: true,
    };
  }
};

export const deleteStudent = async (
  _currentState: CurrentState,

  data: FormData,
) => {
  const rawId = data.get("id");

  const id = typeof rawId === "string" ? rawId.trim() : "";

  if (!id) {
    return {
      success: false,

      error: true,
    };
  }

  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission("students.delete");

    /* ---------------------------------------------------------------------- */
    /* TARGET                                                                 */
    /* ---------------------------------------------------------------------- */

    const student = await prisma.student.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
      },
    });

    if (!student) {
      return {
        success: false,

        error: true,
      };
    }

    /* ---------------------------------------------------------------------- */
    /* DATABASE                                                               */
    /* ---------------------------------------------------------------------- */

    await prisma.student.delete({
      where: {
        id,
      },
    });

    /* ---------------------------------------------------------------------- */
    /* CLERK                                                                  */
    /* ---------------------------------------------------------------------- */

    const client = await clerkClient();

    try {
      await client.users.deleteUser(id);
    } catch (clerkError) {
      console.error("DELETE STUDENT CLERK CLEANUP ERROR:", clerkError);

      throw new Error(
        "Student record was removed, but the authentication account could not be deleted.",
      );
    }

    revalidatePath("/list/students");

    return {
      success: true,

      error: false,
    };
  } catch (error) {
    console.error("DELETE STUDENT ERROR:", error);

    return {
      success: false,

      error: true,
    };
  }
};

/* ------------------------- CREATE PARENT ------------------------- */
export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema,
) => {
  try {
    /* ------------------------------------------------------------------ */
    /* AUTHORIZATION                                                      */
    /* ------------------------------------------------------------------ */
    const accessActor = await getCurrentAccessActor();

    if (!accessActor) {
      throw new Error("UNAUTHENTICATED");
    }

    if (!accessActor.can("parents.create")) {
      throw new Error("UNAUTHORIZED");
    }

    const client = await clerkClient();

    // Create a user in Clerk for the parent (if you are managing parent logins too)
    const user = await client.users.createUser({
      username: data.username,
      password: data.password, // include password in form schema if applicable
      firstName: data.name,
      lastName: data.surname,
      emailAddress: data.email ? [data.email] : [],
      publicMetadata: { role: "parent" },
    });

    // Create parent in Prisma
    await prisma.parent.create({
      data: {
        id: user.id, // Clerk user id as parent id
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        students: {
          connect: data.studentIds?.map((id) => ({ id: id })) || [],
        },
      },
    });

    // revalidatePath("/list/parents"); // enable after page is ready
    return { success: true, error: false };
  } catch (err) {
    console.error("❌ Error creating parent:", err);
    return { success: false, error: true };
  }
};

/* ------------------------- UPDATE PARENT ------------------------- */
export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema,
) => {
  if (!data.id) return { success: false, error: true };

  try {
    /* ------------------------------------------------------------------ */
    /* AUTHORIZATION                                                      */
    /* ------------------------------------------------------------------ */

    const accessActor = await getCurrentAccessActor();

    if (!accessActor) {
      throw new Error("UNAUTHENTICATED");
    }

    if (!accessActor.can("parents.update")) {
      throw new Error("UNAUTHORIZED");
    }
    const client = await clerkClient();

    // Update Clerk user account
    await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    // Update Prisma parent record
    await prisma.parent.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        students: {
          set: data.studentIds?.map((id) => ({ id: id })) || [],
        },
      },
    });

    // revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.error("❌ Error updating parent:", err);
    return { success: false, error: true };
  }
};

/* ------------------------- DELETE PARENT ------------------------- */
/* ------------------------- DELETE PARENT ------------------------- */
/* ------------------------- DELETE PARENT ------------------------- */

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;

  if (!id) {
    console.error(
      "No parent id provided for deletion.",
    );

    return {
      success: false,
      error: true,
    };
  }

  try {
    /* ------------------------------------------------------------------ */
    /* AUTHORIZATION                                                      */
    /* ------------------------------------------------------------------ */

    const accessActor =
      await getCurrentAccessActor();

    if (!accessActor) {
      throw new Error(
        "UNAUTHENTICATED",
      );
    }

    if (
      !accessActor.can(
        "parents.delete",
      )
    ) {
      throw new Error(
        "UNAUTHORIZED",
      );
    }

    /* ------------------------------------------------------------------ */
    /* DELETE LOCAL PARENT SAFELY                                         */
    /* ------------------------------------------------------------------ */

    /*
     * A parent/guardian account may be removed without
     * deleting the students previously linked to it.
     *
     * Because Student.parentId is nullable, disconnect
     * those students first.
     */
    await prisma.$transaction(
      async (tx) => {
        await tx.student.updateMany({
          where: {
            parentId:
              id,
          },

          data: {
            parentId:
              null,
          },
        });

        await tx.parent.delete({
          where: {
            id,
          },
        });
      },
    );

    /* ------------------------------------------------------------------ */
    /* DELETE CLERK IDENTITY                                              */
    /* ------------------------------------------------------------------ */

    const client =
      await clerkClient();

    try {
      await client.users.deleteUser(
        id,
      );
    } catch (clerkError: any) {
      /*
       * If the Clerk account has already been removed,
       * the local deletion is still complete.
       */
      if (
        clerkError?.code ===
          "api_response_error" &&
        clerkError?.status ===
          404
      ) {
        console.warn(
          "Parent account was already absent from Clerk.",
        );

        return {
          success: true,
          error: false,
        };
      }

      /*
       * The Prisma record is already safely removed at this
       * point. Surface the Clerk failure rather than attempting
       * another database deletion.
       */
      console.error(
        "Parent was removed locally, but the Clerk identity could not be deleted:",
        clerkError,
      );

      return {
        success: false,
        error: true,
      };
    }

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    console.error(
      "DELETE PARENT ERROR:",
      error,
    );

    return {
      success: false,
      error: true,
    };
  }
};
/* -------------------------------------------------------------------------- */
/*                                CREATE EXAM                                 */
/* -------------------------------------------------------------------------- */

export const createExam = async (
  _currentState: CurrentState,

  data: ExamSchema,
) => {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    const { userId, scope } = await requireExamManager();

    /* ---------------------------------------------------------------------- */
    /* OWNERSHIP                                                              */
    /* ---------------------------------------------------------------------- */

    if (scope === "OWN_LESSONS") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          id: data.lessonId,

          teacherId: userId,
        },

        select: {
          id: true,
        },
      });

      if (!teacherLesson) {
        return {
          success: false,

          error: true,

          message: "You can only create exams for lessons assigned to you.",
        };
      }
    }

    /* ---------------------------------------------------------------------- */
    /* ACADEMIC CONTEXT                                                       */
    /* ---------------------------------------------------------------------- */

    const academicYear = data.academicYear.trim();

    if (!academicYear) {
      return {
        success: false,

        error: true,

        message: "Select an academic year before creating the exam.",
      };
    }

    const term = await prisma.schoolTerm.findUnique({
      where: {
        id: data.termId,
      },

      select: {
        id: true,
      },
    });

    if (!term) {
      return {
        success: false,

        error: true,

        message: "Select a valid school term before creating the exam.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* CREATE                                                                 */
    /* ---------------------------------------------------------------------- */

    await prisma.exam.create({
      data: {
        title: data.title,

        startTime: data.startTime,

        endTime: data.endTime,

        lessonId: data.lessonId,

        academicYear,

        termId: data.termId,
      },
    });

    revalidatePath("/list/exams");

    revalidatePath("/list/results");

    revalidatePath("/list/report-cards/generate");

    return {
      success: true,

      error: false,

      message: "Exam created successfully.",
    };
  } catch (error) {
    console.error("CREATE EXAM ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error && error.message === "UNAUTHORIZED"
          ? "You do not have permission to manage exams."
          : error instanceof Error && error.message === "UNAUTHENTICATED"
            ? "You must be signed in to manage exams."
            : "The exam could not be created.",
    };
  }
};

/* -------------------------------------------------------------------------- */
/*                                UPDATE EXAM                                 */
/* -------------------------------------------------------------------------- */

export const updateExam = async (
  _currentState: CurrentState,

  data: ExamSchema,
) => {
  try {
    const { userId, scope } = await requireExamManager();

    if (!data.id) {
      return {
        success: false,

        error: true,

        message: "The exam could not be resolved.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* OWNERSHIP                                                              */
    /* ---------------------------------------------------------------------- */

    if (scope === "OWN_LESSONS") {
      /*
       * The exam being edited must already belong
       * to one of the Teacher's lessons.
       */
      const ownedExam = await prisma.exam.findFirst({
        where: {
          id: data.id,

          lesson: {
            teacherId: userId,
          },
        },

        select: {
          id: true,
        },
      });

      if (!ownedExam) {
        return {
          success: false,

          error: true,

          message: "You can only update exams belonging to your own lessons.",
        };
      }

      /*
       * The destination lesson must also belong
       * to the same Teacher.
       */
      const destinationLesson = await prisma.lesson.findFirst({
        where: {
          id: data.lessonId,

          teacherId: userId,
        },

        select: {
          id: true,
        },
      });

      if (!destinationLesson) {
        return {
          success: false,

          error: true,

          message: "You can only move exams between lessons assigned to you.",
        };
      }
    }

    /* ---------------------------------------------------------------------- */
    /* ACADEMIC CONTEXT                                                       */
    /* ---------------------------------------------------------------------- */

    const academicYear = data.academicYear.trim();

    if (!academicYear) {
      return {
        success: false,

        error: true,

        message: "Select an academic year before updating the exam.",
      };
    }

    const term = await prisma.schoolTerm.findUnique({
      where: {
        id: data.termId,
      },

      select: {
        id: true,
      },
    });

    if (!term) {
      return {
        success: false,

        error: true,

        message: "Select a valid school term before updating the exam.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* UPDATE                                                                 */
    /* ---------------------------------------------------------------------- */

    await prisma.exam.update({
      where: {
        id: data.id,
      },

      data: {
        title: data.title,

        startTime: data.startTime,

        endTime: data.endTime,

        lessonId: data.lessonId,

        academicYear,

        termId: data.termId,
      },
    });

    revalidatePath("/list/exams");

    revalidatePath("/list/results");

    revalidatePath("/list/report-cards/generate");

    return {
      success: true,

      error: false,

      message: "Exam updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE EXAM ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error && error.message === "UNAUTHORIZED"
          ? "You do not have permission to manage exams."
          : error instanceof Error && error.message === "UNAUTHENTICATED"
            ? "You must be signed in to manage exams."
            : "The exam could not be updated.",
    };
  }
};

/* -------------------------------------------------------------------------- */
/*                                DELETE EXAM                                 */
/* -------------------------------------------------------------------------- */

export const deleteExam = async (
  _currentState: CurrentState,

  data: FormData,
) => {
  try {
    const { userId, scope } = await requireExamManager();

    const examId = Number(data.get("id"));

    if (!Number.isInteger(examId) || examId <= 0) {
      return {
        success: false,

        error: true,

        message: "Select a valid exam.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* OWNERSHIP                                                              */
    /* ---------------------------------------------------------------------- */

    if (scope === "OWN_LESSONS") {
      const exam = await prisma.exam.findFirst({
        where: {
          id: examId,

          lesson: {
            teacherId: userId,
          },
        },

        select: {
          id: true,
        },
      });

      if (!exam) {
        return {
          success: false,

          error: true,

          message: "You can only delete exams belonging to your own lessons.",
        };
      }
    }

    await prisma.exam.delete({
      where: {
        id: examId,
      },
    });

    revalidatePath("/list/exams");

    revalidatePath("/list/results");

    revalidatePath("/list/report-cards");

    revalidatePath("/list/report-cards/generate");

    return {
      success: true,

      error: false,

      message: "Exam deleted successfully.",
    };
  } catch (error) {
    console.error("DELETE EXAM ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error && error.message === "UNAUTHORIZED"
          ? "You do not have permission to manage exams."
          : error instanceof Error && error.message === "UNAUTHENTICATED"
            ? "You must be signed in to manage exams."
            : "The exam could not be deleted.",
    };
  }
};

export const createLesson = async (
  _currentState: CurrentState,

  data: LessonSchema,
) => {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    const { userId, scope } = await requireLessonManager();

    /* ---------------------------------------------------------------------- */
    /* OWNERSHIP                                                              */
    /* ---------------------------------------------------------------------- */

    if (scope === "OWN_LESSONS" && data.teacherId !== userId) {
      return {
        success: false,

        error: true,

        message: "Teachers can only create lessons assigned to themselves.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* TIME                                                                   */
    /* ---------------------------------------------------------------------- */

    const startTime = new Date(`1970-01-01T${data.startTime}:00Z`);

    const endTime = new Date(`1970-01-01T${data.endTime}:00Z`);

    /* ---------------------------------------------------------------------- */
    /* CREATE                                                                 */
    /* ---------------------------------------------------------------------- */

    await prisma.lesson.create({
      data: {
        name: data.name,

        day: data.day,

        startTime,

        endTime,

        subjectId: data.subjectId,

        classId: data.classId,

        teacherId: data.teacherId,
      },
    });

    revalidatePath("/list/lessons");

    return {
      success: true,

      error: false,

      message: "Lesson created successfully.",
    };
  } catch (error) {
    console.error("CREATE LESSON ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error && error.message === "UNAUTHORIZED"
          ? "You do not have permission to manage lessons."
          : error instanceof Error && error.message === "UNAUTHENTICATED"
            ? "You must be signed in to manage lessons."
            : "The lesson could not be created.",
    };
  }
};

export const updateLesson = async (
  _currentState: CurrentState,

  data: LessonSchema,
) => {
  try {
    const { userId, scope } = await requireLessonManager();

    if (!data.id) {
      return {
        success: false,

        error: true,

        message: "The lesson could not be resolved.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* OWNERSHIP                                                              */
    /* ---------------------------------------------------------------------- */

    if (scope === "OWN_LESSONS") {
      const existingLesson = await prisma.lesson.findFirst({
        where: {
          id: data.id,

          teacherId: userId,
        },

        select: {
          id: true,
        },
      });

      if (!existingLesson) {
        return {
          success: false,

          error: true,

          message: "You can only update lessons assigned to you.",
        };
      }

      /*
       * Teacher cannot transfer their lesson to
       * another Teacher.
       */
      if (data.teacherId !== userId) {
        return {
          success: false,

          error: true,

          message: "Teachers cannot transfer their lessons to another teacher.",
        };
      }
    }

    const startTime = new Date(`1970-01-01T${data.startTime}:00Z`);

    const endTime = new Date(`1970-01-01T${data.endTime}:00Z`);

    await prisma.lesson.update({
      where: {
        id: data.id,
      },

      data: {
        name: data.name,

        day: data.day,

        startTime,

        endTime,

        subjectId: data.subjectId,

        classId: data.classId,

        teacherId: data.teacherId,
      },
    });

    revalidatePath("/list/lessons");

    return {
      success: true,

      error: false,

      message: "Lesson updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE LESSON ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error && error.message === "UNAUTHORIZED"
          ? "You do not have permission to manage lessons."
          : error instanceof Error && error.message === "UNAUTHENTICATED"
            ? "You must be signed in to manage lessons."
            : "The lesson could not be updated.",
    };
  }
};

export const deleteLesson = async (
  _currentState: CurrentState,

  data: FormData,
) => {
  try {
    const { userId, scope } = await requireLessonManager();

    const lessonId = Number(data.get("id"));

    if (!Number.isInteger(lessonId) || lessonId <= 0) {
      return {
        success: false,

        error: true,

        message: "Select a valid lesson.",
      };
    }

    if (scope === "OWN_LESSONS") {
      const lesson = await prisma.lesson.findFirst({
        where: {
          id: lessonId,

          teacherId: userId,
        },

        select: {
          id: true,
        },
      });

      if (!lesson) {
        return {
          success: false,

          error: true,

          message: "You can only delete lessons assigned to you.",
        };
      }
    }

    await prisma.lesson.delete({
      where: {
        id: lessonId,
      },
    });

    revalidatePath("/list/lessons");

    return {
      success: true,

      error: false,

      message: "Lesson deleted successfully.",
    };
  } catch (error) {
    console.error("DELETE LESSON ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error && error.message === "UNAUTHORIZED"
          ? "You do not have permission to manage lessons."
          : error instanceof Error && error.message === "UNAUTHENTICATED"
            ? "You must be signed in to manage lessons."
            : "The lesson could not be deleted.",
    };
  }
};

/* -------------------------------------------------------------------------- */
/*                             CREATE ASSIGNMENT                              */
/* -------------------------------------------------------------------------- */
export const getLessonsForUser = async () => {
  try {
    const { userId, scope } = await requireAssignmentManager();

    return await prisma.lesson.findMany({
      where:
        scope === "OWN_LESSONS"
          ? {
              teacherId: userId,
            }
          : undefined,

      select: {
        id: true,

        name: true,
      },

      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("GET ASSIGNMENT LESSONS ERROR:", error);

    return [];
  }
};

/* ------------------------- CREATE ASSIGNMENT ------------------------- */
/* -------------------------------------------------------------------------- */
/*                             CREATE ASSIGNMENT                              */
/* -------------------------------------------------------------------------- */

export const createAssignment = async (data: AssignmentSchema) => {
  try {
    /* -------------------------------------------------------------------- */
    /* AUTHORIZATION                                                        */
    /* -------------------------------------------------------------------- */

    const { userId, scope } = await requireAssignmentManager();

    /* -------------------------------------------------------------------- */
    /* OWNERSHIP                                                            */
    /* -------------------------------------------------------------------- */

    if (scope === "OWN_LESSONS") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          id: data.lessonId,

          teacherId: userId,
        },

        select: {
          id: true,
        },
      });

      if (!teacherLesson) {
        return {
          success: false,

          error: true,

          message:
            "You can only create assignments for lessons assigned to you.",
        };
      }
    }

    /* -------------------------------------------------------------------- */
    /* ACADEMIC CONTEXT                                                     */
    /* -------------------------------------------------------------------- */

    const academicYear = data.academicYear.trim();

    const termId = Number(data.termId);

    if (!academicYear) {
      return {
        success: false,

        error: true,

        message: "Select an academic year before creating the assignment.",
      };
    }

    if (!Number.isInteger(termId) || termId <= 0) {
      return {
        success: false,

        error: true,

        message: "Select a valid school term before creating the assignment.",
      };
    }

    /* -------------------------------------------------------------------- */
    /* CREATE                                                               */
    /* -------------------------------------------------------------------- */

    await prisma.assignment.create({
      data: {
        title: data.title,

        startDate: data.startDate,

        dueDate: data.dueDate,

        lessonId: data.lessonId,

        academicYear,

        termId,
      },
    });

    /* -------------------------------------------------------------------- */
    /* REVALIDATION                                                         */
    /* -------------------------------------------------------------------- */

    revalidatePath("/list/assignments");

    revalidatePath("/list/results");

    revalidatePath("/list/report-cards/generate");

    return {
      success: true,

      error: false,

      message: "Assignment created successfully.",
    };
  } catch (error) {
    console.error("CREATE ASSIGNMENT ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error && error.message === "UNAUTHORIZED"
          ? "You do not have permission to manage assignments."
          : error instanceof Error && error.message === "UNAUTHENTICATED"
            ? "You must be signed in to manage assignments."
            : "The assignment could not be created.",
    };
  }
};

/* ------------------------- UPDATE ASSIGNMENT ------------------------- */
/* -------------------------------------------------------------------------- */
/*                             UPDATE ASSIGNMENT                              */
/* -------------------------------------------------------------------------- */

export const updateAssignment = async (data: AssignmentSchema) => {
  try {
    /* -------------------------------------------------------------------- */
    /* AUTHORIZATION                                                        */
    /* -------------------------------------------------------------------- */

    const { userId, scope } = await requireAssignmentManager();

    /* -------------------------------------------------------------------- */
    /* VALIDATE ASSIGNMENT                                                  */
    /* -------------------------------------------------------------------- */

    if (!data.id) {
      return {
        success: false,

        error: true,

        message: "The assignment could not be resolved.",
      };
    }

    /* -------------------------------------------------------------------- */
    /* TEACHER OWNERSHIP                                                    */
    /* -------------------------------------------------------------------- */

    if (scope === "OWN_LESSONS") {
      /*
       * First verify that the assignment being edited
       * already belongs to one of this Teacher's lessons.
       *
       * This closes a subtle hole in the old implementation
       * where a Teacher could potentially submit another
       * assignment ID and move it into one of their lessons.
       */
      const ownedAssignment = await prisma.assignment.findFirst({
        where: {
          id: data.id,

          lesson: {
            teacherId: userId,
          },
        },

        select: {
          id: true,
        },
      });

      if (!ownedAssignment) {
        return {
          success: false,

          error: true,

          message:
            "You can only update assignments belonging to your own lessons.",
        };
      }

      /*
       * Also verify that the destination lesson still
       * belongs to the same Teacher.
       */
      const destinationLesson = await prisma.lesson.findFirst({
        where: {
          id: data.lessonId,

          teacherId: userId,
        },

        select: {
          id: true,
        },
      });

      if (!destinationLesson) {
        return {
          success: false,

          error: true,

          message:
            "You can only move assignments between lessons assigned to you.",
        };
      }
    }

    /* -------------------------------------------------------------------- */
    /* ACADEMIC CONTEXT                                                     */
    /* -------------------------------------------------------------------- */

    const academicYear = data.academicYear?.trim();

    const termId = Number(data.termId);

    if (!academicYear) {
      return {
        success: false,

        error: true,

        message: "Select an academic year before updating the assignment.",
      };
    }

    if (!Number.isInteger(termId) || termId <= 0) {
      return {
        success: false,

        error: true,

        message: "Select a valid school term before updating the assignment.",
      };
    }

    /* -------------------------------------------------------------------- */
    /* UPDATE                                                               */
    /* -------------------------------------------------------------------- */

    await prisma.assignment.update({
      where: {
        id: data.id,
      },

      data: {
        title: data.title,

        startDate: data.startDate,

        dueDate: data.dueDate,

        lessonId: data.lessonId,

        academicYear,

        termId,
      },
    });

    /* -------------------------------------------------------------------- */
    /* REVALIDATION                                                         */
    /* -------------------------------------------------------------------- */

    revalidatePath("/list/assignments");

    revalidatePath("/list/results");

    revalidatePath("/list/report-cards/generate");

    return {
      success: true,

      error: false,

      message: "Assignment updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE ASSIGNMENT ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error && error.message === "UNAUTHORIZED"
          ? "You do not have permission to manage assignments."
          : error instanceof Error && error.message === "UNAUTHENTICATED"
            ? "You must be signed in to manage assignments."
            : "The assignment could not be updated.",
    };
  }
};
/* -------------------------------------------------------------------------- */
/*                             DELETE ASSIGNMENT                              */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                             DELETE ASSIGNMENT                              */
/* -------------------------------------------------------------------------- */

export const deleteAssignment = async (
  _currentState: CurrentState,

  data: FormData,
) => {
  try {
    /* -------------------------------------------------------------------- */
    /* AUTHORIZATION                                                        */
    /* -------------------------------------------------------------------- */

    const { userId, scope } = await requireAssignmentManager();

    /* -------------------------------------------------------------------- */
    /* VALIDATE ID                                                          */
    /* -------------------------------------------------------------------- */

    const assignmentId = Number(data.get("id"));

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return {
        success: false,

        error: true,

        message: "Select a valid assignment.",
      };
    }

    /* -------------------------------------------------------------------- */
    /* OWNERSHIP                                                            */
    /* -------------------------------------------------------------------- */

    if (scope === "OWN_LESSONS") {
      const assignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,

          lesson: {
            teacherId: userId,
          },
        },

        select: {
          id: true,
        },
      });

      if (!assignment) {
        return {
          success: false,

          error: true,

          message:
            "You can only delete assignments belonging to your own lessons.",
        };
      }
    }

    /* -------------------------------------------------------------------- */
    /* DELETE                                                               */
    /* -------------------------------------------------------------------- */

    await prisma.assignment.delete({
      where: {
        id: assignmentId,
      },
    });

    /* -------------------------------------------------------------------- */
    /* REVALIDATION                                                         */
    /* -------------------------------------------------------------------- */

    revalidatePath("/list/assignments");

    revalidatePath("/list/results");

    revalidatePath("/list/report-cards");

    revalidatePath("/list/report-cards/generate");

    return {
      success: true,

      error: false,

      message: "Assignment deleted successfully.",
    };
  } catch (error) {
    console.error("DELETE ASSIGNMENT ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error && error.message === "UNAUTHORIZED"
          ? "You do not have permission to manage assignments."
          : error instanceof Error && error.message === "UNAUTHENTICATED"
            ? "You must be signed in to manage assignments."
            : "The assignment could not be deleted.",
    };
  }
};

/* ----------DELETE RESULT    ------------------------------------------------------ */
/* -------------------------------------------------------------------------- */
/*                              DELETE RESULT                                 */
/* -------------------------------------------------------------------------- */

export const deleteResult = async (
  _currentState: unknown,

  formData: FormData,
) => {
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return {
      success: false,
      error: true,

      message: "Select a valid result.",
    };
  }

  try {
    const access = await requireResultsManagementAccess();

    await requireMutableManualResult({
      resultId: id,

      teacherId: access.userId,

      scope: access.scope,
    });

    const deletion = await prisma.$transaction(
      async (tx) =>
        deleteAcademicResultWithTransaction({
          tx,

          resultId: id,
        }),

      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    const resultLabel =
      deletion.resultType === "EXAM"
        ? "Examination"
        : deletion.resultType === "ASSIGNMENT"
          ? "Assignment"
          : "Assessment";
    /* ------------------------------------------------------------------ */
    /*                          REVALIDATION                              */
    /* ------------------------------------------------------------------ */

    revalidatePath("/list/results");

    revalidatePath("/list/results/legacy");

    revalidatePath("/list/report-cards");

    revalidatePath("/list/report-cards/generate");

    /* ------------------------------------------------------------------ */
    /*                             RESULT                                */
    /* ------------------------------------------------------------------ */

    return {
      success: true,
      error: false,

      data: deletion,

      message:
        deletion.invalidatedReportCardCount > 0
          ? `${resultLabel} result deleted. The affected draft report card now requires regeneration.`
          : `${resultLabel} result deleted successfully.`,
    };
  } catch (error) {
    console.error("DELETE RESULT ERROR:", error);

    return {
      success: false,
      error: true,

      message:
        error instanceof Error
          ? error.message
          : "The result could not be deleted.",
    };
  }
};

/* ------------------------- CREATE RESULT ------------------------- */

/* ------------------------- CREATE RESULT ------------------------- */

export const createResult = async (
  _currentState: unknown,

  data: ResultSchema,
) => {
  try {
    const access = await requireResultsManagementAccess();

    if (access.scope === "TEACHER_OWNED") {
      if (data.type === "EXAM") {
        if (!data.examId) {
          throw new Error("Select an examination.");
        }

        await requireTeacherExamOwnership({
          teacherId: access.userId,

          examId: Number(data.examId),
        });
      }

      if (data.type === "ASSIGNMENT") {
        if (!data.assignmentId) {
          throw new Error("Select an assignment.");
        }

        await requireTeacherAssignmentOwnership({
          teacherId: access.userId,

          assignmentId: Number(data.assignmentId),
        });
      }
    }
    const synced = await prisma.$transaction(
      async (tx) => {
        /* ------------------------------------------------------------ */
        /*                    EXAMINATION RESULT                        */
        /* ------------------------------------------------------------ */

        if (data.type === "EXAM") {
          if (!data.examId) {
            throw new Error("Select an examination.");
          }

          return syncExamResult({
            tx,

            studentId: data.studentId,

            examId: Number(data.examId),

            score: Number(data.score),

            totalMarks: Number(data.totalMarks),
          });
        }

        /* ------------------------------------------------------------ */
        /*                      ASSIGNMENT RESULT                       */
        /* ------------------------------------------------------------ */

        if (data.type === "ASSIGNMENT") {
          if (!data.assignmentId) {
            throw new Error("Select an assignment.");
          }

          return syncAssignmentResult({
            tx,

            studentId: data.studentId,

            assignmentId: Number(data.assignmentId),

            score: Number(data.score),

            totalMarks: Number(data.totalMarks),
          });
        }

        throw new Error("The selected result type is not supported.");
      },

      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    /* ------------------------------------------------------------------ */
    /*                          REVALIDATION                              */
    /* ------------------------------------------------------------------ */

    revalidatePath("/list/results");

    revalidatePath("/list/results/legacy");

    revalidatePath("/list/report-cards");

    revalidatePath("/list/report-cards/generate");

    /* ------------------------------------------------------------------ */
    /*                             RESULT                                */
    /* ------------------------------------------------------------------ */

    return {
      success: true,
      error: false,

      data: synced,

      message:
        synced.invalidatedReportCardCount > 0
          ? "Result saved successfully. The affected draft report card now requires regeneration."
          : "Result saved successfully.",
    };
  } catch (error) {
    console.error("CREATE RESULT ERROR:", error);

    return {
      success: false,
      error: true,

      message:
        error instanceof Error
          ? error.message
          : "The result could not be saved.",
    };
  }
};

/* -------------------------------------------------------------------------- */

/* ------------------------- UPDATE RESULT ------------------------- */

export const updateResult = async (
  _currentState: unknown,

  data: ResultSchema,
) => {
  try {
    /* ------------------------------------------------------------------ */
    /*                         VALIDATE RESULT ID                         */
    /* ------------------------------------------------------------------ */

    if (!data.id) {
      return {
        success: false,
        error: true,

        message: "The result could not be resolved.",
      };
    }

    const resultId = Number(data.id);

    if (!Number.isInteger(resultId) || resultId <= 0) {
      return {
        success: false,
        error: true,

        message: "The result ID is invalid.",
      };
    }

    const access = await requireResultsManagementAccess();

    await requireMutableManualResult({
      resultId,

      teacherId: access.userId,

      scope: access.scope,
    });

    if (access.scope === "TEACHER_OWNED") {
      if (data.type === "EXAM") {
        if (!data.examId) {
          throw new Error("Select an examination.");
        }

        await requireTeacherExamOwnership({
          teacherId: access.userId,

          examId: Number(data.examId),
        });
      }

      if (data.type === "ASSIGNMENT") {
        if (!data.assignmentId) {
          throw new Error("Select an assignment.");
        }

        await requireTeacherAssignmentOwnership({
          teacherId: access.userId,

          assignmentId: Number(data.assignmentId),
        });
      }
    }
    /* ------------------------------------------------------------------ */
    /*                     SYNCHRONISE RESULT UPDATE                      */
    /* ------------------------------------------------------------------ */

    const synced = await prisma.$transaction(
      async (tx) => {
        /* ------------------------------------------------------------ */
        /*                    EXAMINATION RESULT                        */
        /* ------------------------------------------------------------ */

        if (data.type === "EXAM") {
          if (!data.examId) {
            throw new Error("Select an examination.");
          }

          return syncExamResult({
            tx,

            resultId,

            studentId: data.studentId,

            examId: Number(data.examId),

            score: Number(data.score),

            totalMarks: Number(data.totalMarks),
          });
        }

        /* ------------------------------------------------------------ */
        /*                      ASSIGNMENT RESULT                       */
        /* ------------------------------------------------------------ */

        if (data.type === "ASSIGNMENT") {
          if (!data.assignmentId) {
            throw new Error("Select an assignment.");
          }

          return syncAssignmentResult({
            tx,

            resultId,

            studentId: data.studentId,

            assignmentId: Number(data.assignmentId),

            score: Number(data.score),

            totalMarks: Number(data.totalMarks),
          });
        }

        throw new Error("The selected result type is not supported.");
      },

      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    /* ------------------------------------------------------------------ */
    /*                          REVALIDATION                              */
    /* ------------------------------------------------------------------ */

    revalidatePath("/list/results");

    revalidatePath("/list/results/legacy");

    revalidatePath("/list/report-cards");

    revalidatePath("/list/report-cards/generate");

    /* ------------------------------------------------------------------ */
    /*                             RESULT                                */
    /* ------------------------------------------------------------------ */

    return {
      success: true,
      error: false,

      data: synced,

      message: synced.resultChanged
        ? synced.invalidatedReportCardCount > 0
          ? "Result updated successfully. The affected draft report card now requires regeneration."
          : "Result updated successfully."
        : "No score changes were detected.",
    };
  } catch (error) {
    console.error("UPDATE RESULT ERROR:", error);

    return {
      success: false,
      error: true,

      message:
        error instanceof Error
          ? error.message
          : "The result could not be updated.",
    };
  }
};

/* -------------------------------------------------------------------------- */
/*                              EVENT HELPERS                                 */
/* -------------------------------------------------------------------------- */

const EVENT_NOTIFICATION_TYPES = [
  "EVENT_PUBLISHED",
  "EVENT_UPDATED",
  "EVENT_UPCOMING",
  "EVENT_STARTING_SOON",
] as const;

async function archiveExistingEventReminders({
  tx,
  eventId,
}: {
  tx: Prisma.TransactionClient;

  eventId: number;
}) {
  const now = new Date();

  /*
   * Keep NotificationEvent as historical/audit data,
   * but hide deliveries that describe an obsolete
   * event schedule.
   */
  await tx.notification.updateMany({
    where: {
      archivedAt: null,

      event: {
        is: {
          entityType: "EVENT",

          entityId: String(eventId),

          type: {
            in: [...EVENT_NOTIFICATION_TYPES],
          },
        },
      },
    },

    data: {
      archivedAt: now,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                              CREATE EVENT                                  */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                              CREATE EVENT                                  */
/* -------------------------------------------------------------------------- */

export const createEvent = async (
  _currentState: CurrentState,

  data: EventSchema,
) => {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    const { userId, actorRole, actorName } = await requireEventManager();

    /* ---------------------------------------------------------------------- */
    /* VALIDATION                                                             */
    /* ---------------------------------------------------------------------- */

    const parsed = eventSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,

        error: true,

        message:
          parsed.error.issues[0]?.message ?? "Enter valid event details.",
      };
    }

    const values = parsed.data;

    /* ---------------------------------------------------------------------- */
    /* CLASS VALIDATION                                                       */
    /* ---------------------------------------------------------------------- */

    /*
     * Validate an optional class instead of
     * trusting the submitted class ID.
     */
    if (values.classId) {
      const classExists = await prisma.class.findUnique({
        where: {
          id: values.classId,
        },

        select: {
          id: true,
        },
      });

      if (!classExists) {
        return {
          success: false,

          error: true,

          message: "The selected class could not be found.",
        };
      }
    }

    /* ---------------------------------------------------------------------- */
    /* TRANSACTION                                                            */
    /* ---------------------------------------------------------------------- */

    const event = await prisma.$transaction(
      async (tx) => {
        const created = await tx.event.create({
          data: {
            title: values.title,

            description: values.description,

            date: values.date,

            startTime: values.startTime,

            endTime: values.endTime,

            classId: values.classId ?? null,
          },

          include: {
            class: {
              select: {
                name: true,
              },
            },
          },
        });

        await notifyEventPublished({
          tx,

          eventId: created.id,

          title: created.title,

          description: created.description,

          startTime: created.startTime,

          endTime: created.endTime,

          classId: created.classId,

          className: created.class?.name ?? null,

          notificationRevision: created.notificationRevision,

          actorId: userId,

          actorRole,

          actorName,
        });

        return created;
      },

      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    /* ---------------------------------------------------------------------- */
    /* REVALIDATION                                                           */
    /* ---------------------------------------------------------------------- */

    revalidatePath("/list/events");

    revalidatePath("/student");

    revalidatePath("/teacher");

    revalidatePath("/parent");

    revalidatePath("/notifications");

    return {
      success: true,

      error: false,

      data: {
        id: event.id,
      },

      message: "Event created successfully.",
    };
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error && error.message === "UNAUTHENTICATED"
          ? "You must be signed in to manage school events."
          : error instanceof Error && error.message === "UNAUTHORIZED"
            ? "You do not have permission to manage school events."
            : error instanceof Error
              ? error.message
              : "The event could not be created.",
    };
  }
};

/* -------------------------------------------------------------------------- */
/*                              UPDATE EVENT                                  */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                              UPDATE EVENT                                  */
/* -------------------------------------------------------------------------- */

export const updateEvent = async (
  _currentState: CurrentState,

  data: EventSchema,
) => {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    const { userId, actorRole, actorName } = await requireEventManager();

    /* ---------------------------------------------------------------------- */
    /* BASIC VALIDATION                                                       */
    /* ---------------------------------------------------------------------- */

    if (!data.id) {
      return {
        success: false,

        error: true,

        message: "Select a valid event.",
      };
    }

    const parsed = eventSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,

        error: true,

        message:
          parsed.error.issues[0]?.message ?? "Enter valid event details.",
      };
    }

    const values = parsed.data;

    const eventId = Number(values.id);

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return {
        success: false,

        error: true,

        message: "Select a valid event.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* TRANSACTION                                                            */
    /* ---------------------------------------------------------------------- */

    const result = await prisma.$transaction(
      async (tx) => {
        const existing = await tx.event.findUnique({
          where: {
            id: eventId,
          },

          select: {
            id: true,

            title: true,

            description: true,

            date: true,

            startTime: true,

            endTime: true,

            classId: true,
          },
        });

        if (!existing) {
          throw new Error("The event could not be found.");
        }

        /* -------------------------------------------------------------- */
        /* CLASS VALIDATION                                               */
        /* -------------------------------------------------------------- */

        if (values.classId) {
          const classExists = await tx.class.findUnique({
            where: {
              id: values.classId,
            },

            select: {
              id: true,
            },
          });

          if (!classExists) {
            throw new Error("The selected class could not be found.");
          }
        }

        /* -------------------------------------------------------------- */
        /* NOTIFICATION RELEVANCE                                        */
        /* -------------------------------------------------------------- */

        const notificationRelevantChange =
          existing.title !== values.title ||
          existing.description !== values.description ||
          existing.startTime.getTime() !== values.startTime.getTime() ||
          existing.endTime.getTime() !== values.endTime.getTime() ||
          existing.classId !== (values.classId ?? null);

        /* -------------------------------------------------------------- */
        /* UPDATE                                                         */
        /* -------------------------------------------------------------- */

        const updated = await tx.event.update({
          where: {
            id: eventId,
          },

          data: {
            title: values.title,

            description: values.description,

            date: values.date,

            startTime: values.startTime,

            endTime: values.endTime,

            classId: values.classId ?? null,

            ...(notificationRelevantChange
              ? {
                  notificationRevision: {
                    increment: 1,
                  },
                }
              : {}),
          },

          include: {
            class: {
              select: {
                name: true,
              },
            },
          },
        });

        /* -------------------------------------------------------------- */
        /* REMOVE OBSOLETE REMINDERS                                     */
        /* -------------------------------------------------------------- */

        if (notificationRelevantChange) {
          await archiveExistingEventReminders({
            tx,

            eventId,
          });
        }

        /* -------------------------------------------------------------- */
        /* UPDATED EVENT NOTIFICATION                                    */
        /* -------------------------------------------------------------- */

        if (notificationRelevantChange) {
          await notifyEventUpdated({
            tx,

            eventId: updated.id,

            title: updated.title,

            description: updated.description,

            startTime: updated.startTime,

            endTime: updated.endTime,

            previousClassId: existing.classId,

            classId: updated.classId,

            className: updated.class?.name ?? null,

            notificationRevision: updated.notificationRevision,

            actorId: userId,

            actorRole,

            actorName,
          });
        }

        return {
          event: updated,

          notificationRelevantChange,
        };
      },

      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    /* ---------------------------------------------------------------------- */
    /* REVALIDATION                                                           */
    /* ---------------------------------------------------------------------- */

    revalidatePath("/list/events");

    revalidatePath("/student");

    revalidatePath("/teacher");

    revalidatePath("/parent");

    revalidatePath("/notifications");

    return {
      success: true,

      error: false,

      data: {
        id: result.event.id,

        notificationRelevantChange: result.notificationRelevantChange,
      },

      message: result.notificationRelevantChange
        ? "Event updated successfully. Scheduled reminders will use the new event details."
        : "Event updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error && error.message === "UNAUTHENTICATED"
          ? "You must be signed in to manage school events."
          : error instanceof Error && error.message === "UNAUTHORIZED"
            ? "You do not have permission to manage school events."
            : error instanceof Error
              ? error.message
              : "The event could not be updated.",
    };
  }
};

/* -------------------------------------------------------------------------- */
/*                              DELETE EVENT                                  */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                              DELETE EVENT                                  */
/* -------------------------------------------------------------------------- */

export const deleteEvent = async (
  _currentState: CurrentState,

  data: FormData,
) => {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    const { userId, actorRole, actorName } = await requireEventManager();

    /* ---------------------------------------------------------------------- */
    /* EVENT ID                                                               */
    /* ---------------------------------------------------------------------- */

    const eventId = Number(data.get("id"));

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return {
        success: false,

        error: true,

        message: "Select a valid event.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* TRANSACTION                                                            */
    /* ---------------------------------------------------------------------- */

    await prisma.$transaction(
      async (tx) => {
        const existing = await tx.event.findUnique({
          where: {
            id: eventId,
          },

          include: {
            class: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!existing) {
          throw new Error("The event could not be found.");
        }

        /*
         * Archive reminders before deleting the
         * source event.
         *
         * NotificationEvent remains available as
         * historical notification/audit evidence.
         */
        await archiveExistingEventReminders({
          tx,

          eventId,
        });

        /*
         * Notify affected recipients before the
         * source Event row disappears.
         */
        await notifyEventCancelled({
          tx,

          eventId: existing.id,

          title: existing.title,

          description: existing.description,

          startTime: existing.startTime,

          endTime: existing.endTime,

          classId: existing.classId,

          className: existing.class?.name ?? null,

          notificationRevision: existing.notificationRevision,

          actorId: userId,

          actorRole,

          actorName,
        });

        await tx.event.delete({
          where: {
            id: eventId,
          },
        });
      },

      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    /* ---------------------------------------------------------------------- */
    /* REVALIDATION                                                           */
    /* ---------------------------------------------------------------------- */

    revalidatePath("/list/events");

    revalidatePath("/student");

    revalidatePath("/teacher");

    revalidatePath("/parent");

    revalidatePath("/notifications");

    return {
      success: true,

      error: false,

      message: "Event deleted successfully.",
    };
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error && error.message === "UNAUTHENTICATED"
          ? "You must be signed in to manage school events."
          : error instanceof Error && error.message === "UNAUTHORIZED"
            ? "You do not have permission to manage school events."
            : error instanceof Error
              ? error.message
              : "The event could not be deleted.",
    };
  }
};

/* -------------------------------------------------------------------------- */
/*                  CREATE ANNOUNCEMENT                                  */
/* -------------------------------------------------------------------------- */

export const createAnnouncement = async (
  _currentState: CurrentState,

  data: AnnouncementSchema,
) => {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    await requireAnnouncementManager();

    /* ---------------------------------------------------------------------- */
    /* CLASS VALIDATION                                                       */
    /* ---------------------------------------------------------------------- */

    if (data.classId) {
      const classExists = await prisma.class.findUnique({
        where: {
          id: data.classId,
        },

        select: {
          id: true,
        },
      });

      if (!classExists) {
        return {
          success: false,

          error: true,

          message: "The selected class could not be found.",
        };
      }
    }

    /* ---------------------------------------------------------------------- */
    /* CREATE                                                                 */
    /* ---------------------------------------------------------------------- */

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,

        description: data.description,

        date: new Date(data.date),

        classId: data.classId ?? null,
      },
    });

    revalidatePath("/list/announcements");

    revalidatePath("/student");

    revalidatePath("/teacher");

    revalidatePath("/parent");

    return {
      success: true,

      error: false,

      data: {
        id: announcement.id,
      },

      message: "Announcement created successfully.",
    };
  } catch (error) {
    console.error("CREATE ANNOUNCEMENT ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error && error.message === "UNAUTHENTICATED"
          ? "You must be signed in to manage announcements."
          : error instanceof Error && error.message === "UNAUTHORIZED"
            ? "You do not have permission to manage announcements."
            : error instanceof Error
              ? error.message
              : "The announcement could not be created.",
    };
  }
};

export const updateAnnouncement = async (
  _currentState: CurrentState,

  data: AnnouncementSchema,
) => {
  if (!data.id) {
    return {
      success: false,

      error: true,

      message: "Select a valid announcement.",
    };
  }

  try {
    await requireAnnouncementManager();

    const announcementId =
      typeof data.id === "string" ? Number(data.id) : data.id;

    if (!Number.isInteger(announcementId) || announcementId <= 0) {
      return {
        success: false,

        error: true,

        message: "Select a valid announcement.",
      };
    }

    if (data.classId) {
      const classExists = await prisma.class.findUnique({
        where: {
          id: data.classId,
        },

        select: {
          id: true,
        },
      });

      if (!classExists) {
        return {
          success: false,

          error: true,

          message: "The selected class could not be found.",
        };
      }
    }

    const existing = await prisma.announcement.findUnique({
      where: {
        id: announcementId,
      },

      select: {
        id: true,
      },
    });

    if (!existing) {
      return {
        success: false,

        error: true,

        message: "The announcement could not be found.",
      };
    }

    await prisma.announcement.update({
      where: {
        id: announcementId,
      },

      data: {
        title: data.title,

        description: data.description,

        date: new Date(data.date),

        classId: data.classId ?? null,
      },
    });

    revalidatePath("/list/announcements");

    revalidatePath("/student");

    revalidatePath("/teacher");

    revalidatePath("/parent");

    return {
      success: true,

      error: false,

      message: "Announcement updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE ANNOUNCEMENT ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error && error.message === "UNAUTHENTICATED"
          ? "You must be signed in to manage announcements."
          : error instanceof Error && error.message === "UNAUTHORIZED"
            ? "You do not have permission to manage announcements."
            : error instanceof Error
              ? error.message
              : "The announcement could not be updated.",
    };
  }
};

export const deleteAnnouncement = async (
  _currentState: CurrentState,

  data: FormData,
) => {
  try {
    await requireAnnouncementManager();

    const announcementId = Number(data.get("id"));

    if (!Number.isInteger(announcementId) || announcementId <= 0) {
      return {
        success: false,

        error: true,

        message: "Select a valid announcement.",
      };
    }

    const existing = await prisma.announcement.findUnique({
      where: {
        id: announcementId,
      },

      select: {
        id: true,
      },
    });

    if (!existing) {
      return {
        success: false,

        error: true,

        message: "The announcement could not be found.",
      };
    }

    await prisma.announcement.delete({
      where: {
        id: announcementId,
      },
    });

    revalidatePath("/list/announcements");

    revalidatePath("/student");

    revalidatePath("/teacher");

    revalidatePath("/parent");

    return {
      success: true,

      error: false,

      message: "Announcement deleted successfully.",
    };
  } catch (error) {
    console.error("DELETE ANNOUNCEMENT ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error && error.message === "UNAUTHENTICATED"
          ? "You must be signed in to manage announcements."
          : error instanceof Error && error.message === "UNAUTHORIZED"
            ? "You do not have permission to manage announcements."
            : error instanceof Error
              ? error.message
              : "The announcement could not be deleted.",
    };
  }
};

// FEE MANAGEMENT SYSTEM ACTIONS
// FEE MANAGEMENT SYSTEM ACTIONS
// FEE MANAGEMENT SYSTEM ACTIONS
// FEE MANAGEMENT SYSTEM ACTIONS

export const createFeeCategory = async (
  _currentState: any,

  data: FeeCategorySchema,
) => {
  try {
    await requireFinancePermission("finance.structure.manage");

    await prisma.feeCategory.create({
      data: {
        name: data.name,
      },
    });

    return {
      success: true,

      error: false,
    };
  } catch (error) {
    console.error("CREATE FEE CATEGORY ERROR:", error);

    return {
      success: false,

      error: true,
    };
  }
};

export const updateFeeCategory = async (
  currentState: any,
  data: FeeCategorySchema,
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await requireFinancePermission("finance.structure.manage");

    await prisma.feeCategory.update({
      where: { id: data.id },
      data: { name: data.name },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("UPDATE FEE CATEGORY ERROR:", err);
    return { success: false, error: true };
  }
};

export const deleteFeeCategory = async (currentState: any, data: FormData) => {
  const id = data.get("id") as string;
  if (!id) return { success: false, error: true };

  try {
    await requireFinancePermission("finance.structure.manage");

    await prisma.feeCategory.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.log("DELETE FEE CATEGORY ERROR:", err);
    return { success: false, error: true };
  }
};

export const createFeeType = async (currentState: any, data: FeeTypeSchema) => {
  try {
    await requireFinancePermission("finance.structure.manage");

    await prisma.feeType.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("CREATE FEE TYPE ERROR:", err);
    return { success: false, error: true };
  }
};

export const updateFeeType = async (currentState: any, data: FeeTypeSchema) => {
  if (!data.id) return { success: false, error: true };

  try {
    await requireFinancePermission("finance.structure.manage");

    await prisma.feeType.update({
      where: { id: data.id },
      data: {
        name: data.name,
        categoryId: data.categoryId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("UPDATE FEE TYPE ERROR:", err);
    return { success: false, error: true };
  }
};

export const deleteFeeType = async (currentState: any, data: FormData) => {
  const id = data.get("id") as string;
  if (!id) return { success: false, error: true };

  try {
    await requireFinancePermission("finance.structure.manage");

    await prisma.feeType.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.log("DELETE FEE TYPE ERROR:", err);
    return { success: false, error: true };
  }
};

export const createFeeStructure = async (
  currentState: any,
  data: FeeStructureSchema,
) => {
  try {
    await requireFinancePermission("finance.structure.manage");

    await prisma.feeStructure.create({
      data: {
        amount: data.amount,
        studentType: data.studentType,
        boardingType: data.boardingType,
        classId: data?.classId ?? null,
        gradeId: data?.gradeId ?? null,
        typeId: data.typeId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("CREATE FEE STRUCTURE ERROR:", err);
    return { success: false, error: true };
  }
};

export const updateFeeStructure = async (
  currentState: any,
  data: FeeStructureSchema,
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await requireFinancePermission("finance.structure.manage");

    await prisma.feeStructure.update({
      where: { id: data.id },
      data: {
        amount: data.amount,
        studentType: data.studentType,
        boardingType: data.boardingType,
        classId: data.classId ?? null,
        gradeId: data.gradeId ?? null,
        typeId: data.typeId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("UPDATE FEE STRUCTURE ERROR:", err);
    return { success: false, error: true };
  }
};

export const deleteFeeStructure = async (currentState: any, data: FormData) => {
  const id = data.get("id") as string;
  if (!id) return { success: false, error: true };

  try {
    await requireFinancePermission("finance.structure.manage");

    await prisma.feeStructure.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.log("DELETE FEE STRUCTURE ERROR:", err);
    return { success: false, error: true };
  }
};

export const createFeeMaster = async (
  currentState: any,
  data: FeeMasterSchema,
) => {
  try {
    await requireFinancePermission("finance.invoices.manage");

    await prisma.feeMaster.create({
      data: {
        studentId: data.studentId,
        term: data.term,
        academicYear: data.academicYear,
        totalAmount: data.totalAmount,
        status: data.status ?? "PENDING",
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("CREATE FEE MASTER ERROR:", err);
    return { success: false, error: true };
  }
};

export const updateFeeMaster = async (
  currentState: any,
  data: FeeMasterSchema,
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await requireFinancePermission("finance.invoices.manage");

    await prisma.feeMaster.update({
      where: { id: data.id },
      data: {
        studentId: data.studentId,
        term: data.term,
        academicYear: data.academicYear,
        totalAmount: data.totalAmount,
        status: data.status,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("UPDATE FEE MASTER ERROR:", err);
    return { success: false, error: true };
  }
};

export const deleteFeeMaster = async (currentState: any, data: FormData) => {
  const id = data.get("id") as string;
  if (!id) return { success: false, error: true };

  try {
    await requireFinancePermission("finance.invoices.manage");

    await prisma.feeMaster.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.log("DELETE FEE MASTER ERROR:", err);
    return { success: false, error: true };
  }
};

export const createFee = async (currentState: any, data: FeeSchema) => {
  try {
    await requireFinancePermission("finance.invoices.manage");

    await prisma.fee.create({
      data: {
        masterId: data.masterId,
        structureId: data.structureId,
        amount: data.amount,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("CREATE FEE ERROR:", err);
    return { success: false, error: true };
  }
};

export const updateFee = async (currentState: any, data: FeeSchema) => {
  if (!data.id) return { success: false, error: true };

  try {
    await requireFinancePermission("finance.invoices.manage");

    await prisma.fee.update({
      where: { id: data.id },
      data: {
        masterId: data.masterId,
        structureId: data.structureId,
        amount: data.amount,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("UPDATE FEE ERROR:", err);
    return { success: false, error: true };
  }
};

export const deleteFee = async (currentState: any, data: FormData) => {
  const id = data.get("id") as string;
  if (!id) return { success: false, error: true };

  try {
    await requireFinancePermission("finance.invoices.manage");

    await prisma.fee.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.log("DELETE FEE ERROR:", err);
    return { success: false, error: true };
  }
};

export const createFeePayment = async (
  _currentState: unknown,

  data: FeePaymentSchema,
) => {
  /* -------------------------------------------------------------------------- */
  /* AUTHORIZATION                                                              */
  /* -------------------------------------------------------------------------- */

  const accessActor = await getCurrentAccessActor();

  if (!accessActor) {
    return {
      success: false,

      error: true,

      message: "You must be signed in to record fee payments.",
    };
  }

  if (!accessActor.can("finance.payments.record")) {
    return {
      success: false,

      error: true,

      message: "You do not have permission to record fee payments.",
    };
  }

  /* -------------------------------------------------------------------------- */
  /* AUDIT ACTOR                                                                */
  /* -------------------------------------------------------------------------- */

  const grantingAssignment = accessActor.activeAssignments.find((assignment) =>
    assignment.role.permissions.some(
      (rolePermission) =>
        rolePermission.permission.isActive &&
        rolePermission.permission.key.trim().toLowerCase() ===
          "finance.payments.record",
    ),
  );

  const userId = accessActor.actor.id;

  const actorRole =
    grantingAssignment?.role.key?.trim().toLowerCase() ??
    accessActor.actor.legacyRole?.trim().toLowerCase() ??
    null;

  const actorName =
    accessActor.actor.displayName?.trim() ||
    accessActor.actor.username?.trim() ||
    accessActor.actor.email?.trim() ||
    "Finance Officer";

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const invoice = await tx.feeMaster.findUnique({
          where: {
            id: data.masterId,
          },

          select: {
            id: true,

            totalAmount: true,

            term: true,

            academicYear: true,

            student: {
              select: {
                id: true,

                name: true,

                surname: true,

                class: {
                  select: {
                    id: true,

                    name: true,
                  },
                },
              },
            },
          },
        });

        if (!invoice) {
          throw new Error("The fee invoice could not be found.");
        }

        if (!Number.isFinite(data.amount) || data.amount <= 0) {
          throw new Error("Enter a valid payment amount.");
        }

        /*
         * Calculate the existing balance BEFORE
         * accepting the new payment.
         */
        const existingSummary = await syncFeeMasterStatus({
          feeMasterId: invoice.id,

          tx,
        });

        if (existingSummary.balance <= 0) {
          throw new Error("This fee invoice is already fully paid.");
        }

        /*
         * Prevent accidental overpayment.
         *
         * If you later want credit balances,
         * we'll model credits explicitly rather
         * than hiding them inside a negative fee balance.
         */
        if (data.amount > existingSummary.balance) {
          throw new Error(
            `The payment exceeds the outstanding balance of GHS ${existingSummary.balance.toFixed(
              2,
            )}.`,
          );
        }

        const payment = await tx.feePayment.create({
          data: {
            masterId: data.masterId,

            amount: data.amount,

            method: data.method,

            date: data.date ?? new Date(),
          },
        });

        /*
         * Recalculate after the payment and
         * synchronize FeeMaster.status.
         */
        const summary = await syncFeeMasterStatus({
          feeMasterId: invoice.id,

          tx,
        });

        await notifyFeePaymentReceived({
          tx,

          feeMasterId: invoice.id,

          studentId: invoice.student.id,

          studentName:
            `${invoice.student.name} ${invoice.student.surname}`.trim(),

          classId: invoice.student.class.id,

          className: invoice.student.class.name,

          term: invoice.term,

          academicYear: invoice.academicYear,

          paymentId: payment.id,

          amountPaid: payment.amount,

          totalPaid: summary.paidAmount,

          balance: summary.balance,

          paymentMethod: payment.method,

          actorId: userId,

          actorRole,

          actorName,
        });

        return {
          payment,

          summary,
        };
      },

      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    revalidatePath("/list/FinanceDashboardPage");

    revalidatePath("/notifications");

    return {
      success: true,

      error: false,

      data: result,

      message:
        result.summary.balance <= 0
          ? "Payment recorded successfully. The fee account is now fully paid."
          : `Payment recorded successfully. Remaining balance: GHS ${result.summary.balance.toFixed(
              2,
            )}.`,
    };
  } catch (error) {
    console.error("CREATE FEE PAYMENT ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error
          ? error.message
          : "The fee payment could not be recorded.",
    };
  }
};

export const updateFeePayment = async (
  _currentState: any,

  data: FeePaymentSchema,
) => {
  if (!data.id) {
    return {
      success: false,

      error: true,
    };
  }

  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    await requireFinancePermission("finance.payments.modify");

    /* ---------------------------------------------------------------------- */
    /* UPDATE + BALANCE SYNC                                                  */
    /* ---------------------------------------------------------------------- */

    await prisma.$transaction(
      async (tx) => {
        /*
         * Load the existing payment first.
         *
         * This matters because the payment may be moved
         * from one FeeMaster to another.
         */
        const existingPayment = await tx.feePayment.findUnique({
          where: {
            id: data.id!,
          },

          select: {
            id: true,

            masterId: true,
          },
        });

        if (!existingPayment) {
          throw new Error("The fee payment could not be found.");
        }

        /* ------------------------------------------------------------------ */
        /* UPDATE PAYMENT                                                     */
        /* ------------------------------------------------------------------ */

        await tx.feePayment.update({
          where: {
            id: data.id!,
          },

          data: {
            masterId: data.masterId,

            amount: data.amount,

            method: data.method,

            date: data.date ?? new Date(),
          },
        });

        /* ------------------------------------------------------------------ */
        /* NEW INVOICE STATUS                                                 */
        /* ------------------------------------------------------------------ */

        await syncFeeMasterStatus({
          feeMasterId: data.masterId,

          tx,
        });

        /* ------------------------------------------------------------------ */
        /* PREVIOUS INVOICE STATUS                                            */
        /* ------------------------------------------------------------------ */

        /*
         * If the payment was moved to a different
         * FeeMaster, the previous invoice also needs
         * to have its balance/status recalculated.
         */
        if (existingPayment.masterId !== data.masterId) {
          await syncFeeMasterStatus({
            feeMasterId: existingPayment.masterId,

            tx,
          });
        }
      },

      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    /* ---------------------------------------------------------------------- */
    /* REVALIDATION                                                           */
    /* ---------------------------------------------------------------------- */

    revalidatePath("/list/fee-master");

    revalidatePath("/list/FinanceDashboardPage");

    revalidatePath("/notifications");

    return {
      success: true,

      error: false,

      message: "Fee payment updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE FEE PAYMENT ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error
          ? error.message
          : "The fee payment could not be updated.",
    };
  }
};

export const deleteFeePayment = async (
  _currentState: any,

  data: FormData,
) => {
  const paymentId = Number(data.get("id"));

  if (!Number.isInteger(paymentId) || paymentId <= 0) {
    return {
      success: false,

      error: true,
    };
  }

  try {
    await requireFinancePermission("finance.payments.modify");

    const payment = await prisma.feePayment.findUnique({
      where: {
        id: paymentId,
      },

      select: {
        id: true,

        masterId: true,
      },
    });

    if (!payment) {
      return {
        success: false,

        error: true,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.feePayment.delete({
        where: {
          id: payment.id,
        },
      });

      await syncFeeMasterStatus({
        feeMasterId: payment.masterId,

        tx,
      });
    });

    revalidatePath("/list/fee-master");

    revalidatePath("/list/FinanceDashboardPage");

    return {
      success: true,

      error: false,
    };
  } catch (error) {
    console.error("DELETE FEE PAYMENT ERROR:", error);

    return {
      success: false,

      error: true,
    };
  }
};

export const generateFeeMaster = async ({
  studentId,
  term,
  academicYear,
}: {
  studentId: string;

  term: string;

  academicYear: string;
}) => {
  /* ------------------------------------------------------------------------ */
  /* AUTHORIZATION                                                            */
  /* ------------------------------------------------------------------------ */

  await requireFinancePermission("finance.invoices.manage");

  /* ------------------------------------------------------------------------ */
  /* STUDENT                                                                  */
  /* ------------------------------------------------------------------------ */

  const student = await prisma.student.findUnique({
    where: {
      id: studentId,
    },

    include: {
      class: true,

      grade: true,
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  /* ------------------------------------------------------------------------ */
  /* FEE STRUCTURES                                                           */
  /* ------------------------------------------------------------------------ */

  const feeStructures = await prisma.feeStructure.findMany({
    where: {
      OR: [
        {
          classId: student.classId,
        },

        {
          gradeId: student.gradeId,
        },

        {
          classId: null,

          gradeId: null,
        },
      ],
    },

    include: {
      type: true,
    },
  });

  if (!feeStructures.length) {
    throw new Error("No applicable fee structures for this student");
  }

  /* ------------------------------------------------------------------------ */
  /* TOTAL                                                                    */
  /* ------------------------------------------------------------------------ */

  const totalAmount = feeStructures.reduce(
    (sum, feeStructure) => sum + feeStructure.amount,

    0,
  );

  /* ------------------------------------------------------------------------ */
  /* CREATE INVOICE                                                           */
  /* ------------------------------------------------------------------------ */

  return prisma.feeMaster.create({
    data: {
      studentId,

      term,

      academicYear,

      totalAmount,

      status: "PENDING",

      details: {
        create: feeStructures.map((feeStructure) => ({
          structureId: feeStructure.id,

          amount: feeStructure.amount,
        })),
      },
    },

    include: {
      details: true,
    },
  });
};

export const createAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema,
) => {
  try {
    await prisma.attendance.create({
      data: {
        date: data.date,
        present: data.present,
        day: data.day,
        studentId: data.studentId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema,
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await prisma.attendance.update({
      where: { id: data.id },
      data: {
        date: data.date,
        present: data.present,
        day: data.day,
        studentId: data.studentId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const saveTermSettings = async (data: {
  id?: number;

  academicYearId: number;

  name: "FIRST" | "SECOND" | "THIRD";

  startDate: string;

  endDate: string;

  daysSchoolOpened: number;

  isActive: boolean;
}) => {
  try {
    /* -------------------------------------------------------------------- */
    /* AUTHORIZATION                                                        */
    /* -------------------------------------------------------------------- */

    const accessActor = await getCurrentAccessActor();

    if (!accessActor) {
      return {
        success: false,

        error: true,

        message: "You must be signed in to manage academic calendar settings.",
      };
    }

    if (!accessActor.can("settings.manage")) {
      return {
        success: false,

        error: true,

        message:
          "You do not have permission to manage academic calendar settings.",
      };
    }

    /* -------------------------------------------------------------------- */
    /* AUDIT ACTOR                                                          */
    /* -------------------------------------------------------------------- */

    const grantingAssignment = accessActor.activeAssignments.find(
      (assignment) =>
        assignment.role.permissions.some(
          (rolePermission) =>
            rolePermission.permission.isActive &&
            rolePermission.permission.key.trim().toLowerCase() ===
              "settings.manage",
        ),
    );

    const userId = accessActor.actor.id;

    const actorRole =
      grantingAssignment?.role.key?.trim().toLowerCase() ??
      accessActor.actor.legacyRole?.trim().toLowerCase() ??
      null;

    const actorName =
      accessActor.actor.displayName?.trim() ||
      accessActor.actor.username?.trim() ||
      accessActor.actor.email?.trim() ||
      "Academic Calendar Administrator";

    /* ------------------------------------------------------------------ */
    /*                       BASIC VALIDATION                             */
    /* ------------------------------------------------------------------ */

    if (!Number.isInteger(data.academicYearId) || data.academicYearId <= 0) {
      return {
        success: false,
        error: true,

        message: "Select a valid academic year.",
      };
    }

    if (
      !Number.isInteger(data.daysSchoolOpened) ||
      data.daysSchoolOpened <= 0
    ) {
      return {
        success: false,
        error: true,

        message: "Days school opened must be a positive whole number.",
      };
    }

    if (data.daysSchoolOpened > 150) {
      return {
        success: false,
        error: true,

        message: "Days school opened appears too high for one academic term.",
      };
    }

    const startDate = new Date(data.startDate);

    const endDate = new Date(data.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return {
        success: false,
        error: true,

        message: "Enter valid term dates.",
      };
    }

    if (endDate <= startDate) {
      return {
        success: false,
        error: true,

        message: "The term end date must be after the start date.",
      };
    }

    /* ------------------------------------------------------------------ */
    /*                         TRANSACTION                                */
    /* ------------------------------------------------------------------ */

    const result = await prisma.$transaction(
      async (tx) => {
        const academicYear = await tx.schoolAcademicYear.findUnique({
          where: {
            id: data.academicYearId,
          },

          select: {
            id: true,

            name: true,

            startDate: true,

            endDate: true,
          },
        });

        if (!academicYear) {
          throw new Error("The selected academic year could not be found.");
        }

        /*
         * A term should fall within its
         * parent academic-year boundaries.
         */
        if (
          startDate < academicYear.startDate ||
          endDate > academicYear.endDate
        ) {
          throw new Error(
            `The term dates must fall within the ${academicYear.name} academic year.`,
          );
        }

        /*
         * Prevent duplicate First/Second/Third
         * Term records inside the same year.
         */
        const duplicate = await tx.schoolTerm.findFirst({
          where: {
            academicYearId: data.academicYearId,

            name: data.name,

            ...(data.id
              ? {
                  NOT: {
                    id: data.id,
                  },
                }
              : {}),
          },

          select: {
            id: true,
          },
        });

        if (duplicate) {
          throw new Error(
            `${data.name
              .toLowerCase()
              .replace(/\b\w/g, (character) =>
                character.toUpperCase(),
              )} Term already exists for ${academicYear.name}.`,
          );
        }

        /*
         * The school has one current active
         * term across the application.
         */
        if (data.isActive) {
          await tx.schoolTerm.updateMany({
            where: {
              isActive: true,

              ...(data.id
                ? {
                    NOT: {
                      id: data.id,
                    },
                  }
                : {}),
            },

            data: {
              isActive: false,
            },
          });
        }

        /* ------------------------------------------------------------ */
        /*                         UPDATE                               */
        /* ------------------------------------------------------------ */

        if (data.id) {
          const existing = await tx.schoolTerm.findUnique({
            where: {
              id: data.id,
            },

            select: {
              id: true,

              academicYearId: true,

              daysSchoolOpened: true,

              startDate: true,

              endDate: true,
            },
          });

          if (!existing) {
            throw new Error("The selected school term could not be found.");
          }

          const daysSchoolOpenedChanged =
            existing.daysSchoolOpened !== data.daysSchoolOpened;

          /*
           * Changing the academic year assigned
           * to an existing term would also change
           * report ownership semantics.
           *
           * We keep the existing safety behavior
           * and invalidate against the term's new
           * academic-year identity below.
           */
          const academicYearChanged =
            existing.academicYearId !== data.academicYearId;

          const termDateRangeChanged =
            existing.startDate.getTime() !== startDate.getTime() ||
            existing.endDate.getTime() !== endDate.getTime();

          const updated = await tx.schoolTerm.update({
            where: {
              id: data.id,
            },

            data: {
              academicYearId: data.academicYearId,

              name: data.name,

              startDate,

              endDate,

              daysSchoolOpened: data.daysSchoolOpened,

              isActive: data.isActive,
            },
          });

          /* ---------------------------------------------------------- */
          /*             CENTRAL REPORT INVALIDATION                   */
          /* ---------------------------------------------------------- */

          let invalidatedReportCardCount = 0;

          if (
            daysSchoolOpenedChanged ||
            academicYearChanged ||
            termDateRangeChanged
          ) {
            const reasonParts: string[] = [];

            if (daysSchoolOpenedChanged) {
              reasonParts.push(
                `Official school days changed from ${
                  existing.daysSchoolOpened ?? "not configured"
                } to ${data.daysSchoolOpened}.`,
              );
            }

            if (termDateRangeChanged) {
              reasonParts.push("The official term date range changed.");
            }

            if (academicYearChanged) {
              reasonParts.push("The academic-year configuration changed.");
            }

            const reason = `${academicYear.name} ${data.name.toLowerCase()} term configuration changed. ${reasonParts.join(
              " ",
            )} Attendance and report-card data must be regenerated.`;

            const invalidation = await invalidateTermReportCardsWithTransaction(
              {
                tx,

                termId: updated.id,

                /*
                 * If the term stayed in the same academic year,
                 * scope tightly to that year.
                 *
                 * If it moved to another academic year, invalidate
                 * every fresh draft attached to this term ID.
                 */
                academicYear: academicYearChanged
                  ? undefined
                  : academicYear.name,

                reason,

                actor: {
                  actorId: userId,

                  actorRole: actorRole ?? "system",

                  actorName,
                },
              },
            );

            invalidatedReportCardCount = invalidation.invalidatedCount;
          }

          return {
            term: updated,

            daysSchoolOpenedChanged,

            invalidatedReportCardCount,
          };
        }

        /* ------------------------------------------------------------ */
        /*                         CREATE                               */
        /* ------------------------------------------------------------ */

        const created = await tx.schoolTerm.create({
          data: {
            academicYearId: data.academicYearId,

            name: data.name,

            startDate,

            endDate,

            daysSchoolOpened: data.daysSchoolOpened,

            isActive: data.isActive,
          },
        });

        /*
         * A newly created term cannot have
         * existing report cards that need
         * invalidation.
         */
        return {
          term: created,

          daysSchoolOpenedChanged: false,

          invalidatedReportCardCount: 0,
        };
      },

      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    /* ------------------------------------------------------------------ */
    /*                       REVALIDATION                                 */
    /* ------------------------------------------------------------------ */

    revalidatePath("/list/settings/academic-calendar");

    revalidatePath("/list/settings");

    revalidatePath("/list/report-cards");

    revalidatePath("/list/report-cards/generate");

    revalidatePath("/list/report-cards/review");

    /* ------------------------------------------------------------------ */
    /*                           RESPONSE                                 */
    /* ------------------------------------------------------------------ */

    const invalidated = result.invalidatedReportCardCount;

    return {
      success: true,
      error: false,

      data: result.term,

      daysSchoolOpenedChanged: result.daysSchoolOpenedChanged,

      invalidatedReportCardCount: invalidated,

      message: data.id
        ? invalidated > 0
          ? `Term updated successfully. ${invalidated} draft report card${
              invalidated === 1 ? "" : "s"
            } now require regeneration.`
          : "Term updated successfully."
        : "Term created successfully.",
    };
  } catch (error) {
    console.error("TERM SAVE ERROR:", error);

    return {
      success: false,
      error: true,

      message:
        error instanceof Error ? error.message : "The term could not be saved.",
    };
  }
};

/* -------------------------------------------------------------------------- */
/*                        CREATE ACADEMIC YEAR                                */
/* -------------------------------------------------------------------------- */

export const createSchoolAcademicYear = async (data: {
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}) => {
  try {
    await requirePermission("settings.manage");

    const name = data.name.trim();

    if (!name) {
      return {
        success: false,

        error: true,

        message: "Enter an academic year.",
      };
    }

    if (data.endDate <= data.startDate) {
      return {
        success: false,

        error: true,

        message: "The academic year end date must be after the start date.",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      /*
       * Only one academic year should
       * be active at a time.
       */
      if (data.isActive) {
        await tx.schoolAcademicYear.updateMany({
          where: {
            isActive: true,
          },

          data: {
            isActive: false,
          },
        });
      }

      return tx.schoolAcademicYear.create({
        data: {
          name,

          startDate: data.startDate,

          endDate: data.endDate,

          isActive: data.isActive,
        },
      });
    });

    revalidatePath("/list/settings/academic-calendar");
    revalidatePath("/list/settings");

    return {
      success: true,

      error: false,

      data: result,

      message: "Academic year created successfully.",
    };
  } catch (error) {
    console.error("CREATE ACADEMIC YEAR ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error
          ? error.message
          : "The academic year could not be created.",
    };
  }
};

/* -------------------------------------------------------------------------- */
/*                        UPDATE ACADEMIC YEAR                                */
/* -------------------------------------------------------------------------- */

export const updateSchoolAcademicYear = async (data: {
  id?: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}) => {
  try {
    await requirePermission("settings.manage");

    if (!data.id || !Number.isInteger(data.id) || data.id <= 0) {
      return {
        success: false,

        error: true,

        message: "The academic year could not be resolved.",
      };
    }

    const name = data.name.trim();

    if (!name) {
      return {
        success: false,

        error: true,

        message: "Enter an academic year.",
      };
    }

    if (data.endDate <= data.startDate) {
      return {
        success: false,

        error: true,

        message: "The academic year end date must be after the start date.",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.schoolAcademicYear.findUnique({
        where: {
          id: data.id,
        },

        select: {
          id: true,
        },
      });

      if (!existing) {
        throw new Error("The academic year could not be found.");
      }

      if (data.isActive) {
        await tx.schoolAcademicYear.updateMany({
          where: {
            isActive: true,

            NOT: {
              id: data.id,
            },
          },

          data: {
            isActive: false,
          },
        });
      }

      return tx.schoolAcademicYear.update({
        where: {
          id: data.id,
        },

        data: {
          name,

          startDate: data.startDate,

          endDate: data.endDate,

          isActive: data.isActive,
        },
      });
    });

    revalidatePath("/list/settings/academic-calendar");
    revalidatePath("/list/settings");

    revalidatePath("/list/report-cards");

    revalidatePath("/list/report-cards/generate");

    return {
      success: true,

      error: false,

      data: result,

      message: "Academic year updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE ACADEMIC YEAR ERROR:", error);

    return {
      success: false,

      error: true,

      message:
        error instanceof Error
          ? error.message
          : "The academic year could not be updated.",
    };
  }
};
