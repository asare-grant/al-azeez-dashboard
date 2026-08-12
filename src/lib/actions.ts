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
import { Prisma } from "@prisma/client";
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

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema,
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema,
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema,
) => {
  try {
    await prisma.class.create({
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema,
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema,
) => {
  try {
    const client = await clerkClient();

    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" },
    });

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
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema,
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const client = await clerkClient();

    const user = await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
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
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;
  try {
    const client = await clerkClient();

    await client.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema,
) => {
  console.log(data);
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const client = await clerkClient();

    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
    });

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
        parentId: data.parentId || "",
        studentType: data.studentType,
        boardingType: data.boardingType,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema,
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const client = await clerkClient();

    const user = await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
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
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;
  try {
    const client = await clerkClient();

    await client.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

/* ------------------------- CREATE PARENT ------------------------- */
export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema,
) => {
  try {
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
export const deleteParent = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;

  if (!id) {
    console.error("❌ No parent id provided for deletion.");
    return { success: false, error: true };
  }

  try {
    const client = await clerkClient();

    // 1️⃣ Delete associated students first (if any)
    await prisma.student.deleteMany({
      where: { parentId: id },
    });

    // 2️⃣ Delete parent from Prisma
    await prisma.parent.delete({
      where: { id },
    });

    // 3️⃣ Delete parent from Clerk
    await client.users.deleteUser(id);

    // Success
    return { success: true, error: false };
  } catch (err: any) {
    console.error("❌ Error deleting parent:", err);

    // Optional: handle Clerk-specific 404 (user already deleted)
    if (err.code === "api_response_error" && err.status === 404) {
      console.warn(
        "⚠️ Parent not found in Clerk. Continuing with Prisma deletion.",
      );
      try {
        await prisma.parent.delete({ where: { id } });
        return { success: true, error: false };
      } catch (prismaErr) {
        console.error("❌ Error deleting parent from Prisma:", prismaErr);
      }
    }

    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,

  data: ExamSchema,
) => {
  const { userId, sessionClaims } = await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  try {
    const academicYear = data.academicYear.trim();

    if (role === "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,

          id: data.lessonId,
        },

        select: {
          id: true,
        },
      });

      if (!teacherLesson) {
        return {
          success: false,

          error: true,
        };
      }
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
      };
    }

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
    };
  } catch (error) {
    console.error("CREATE EXAM ERROR:", error);

    return {
      success: false,

      error: true,
    };
  }
};

export const updateExam = async (
  currentState: CurrentState,

  data: ExamSchema,
) => {
  const { userId, sessionClaims } = await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  try {
    if (!data.id) {
      return {
        success: false,

        error: true,
      };
    }

    if (role === "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,

          id: data.lessonId,
        },

        select: {
          id: true,
        },
      });

      if (!teacherLesson) {
        return {
          success: false,

          error: true,
        };
      }
    }

    const academicYear = data.academicYear.trim();

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
    };
  } catch (error) {
    console.error("UPDATE EXAM ERROR:", error);

    return {
      success: false,

      error: true,
    };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema,
) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    if (role === "teacher" && userId !== data.teacherId) {
      return { success: false, error: true };
    }

    // Convert "08:30" → Date object (using arbitrary base date)
    const startTime = new Date(`1970-01-01T${data.startTime}:00Z`);
    const endTime = new Date(`1970-01-01T${data.endTime}:00Z`);

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

    return { success: true, error: false };
  } catch (err) {
    console.error("❌ Error creating lesson:", err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema,
) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    if (!data.id) return { success: false, error: true };

    // Teachers can only update their own lessons
    if (role === "teacher") {
      const existingLesson = await prisma.lesson.findUnique({
        where: { id: data.id },
      });

      if (!existingLesson || existingLesson.teacherId !== userId) {
        return { success: false, error: true };
      }
    }

    // Both fields REQUIRED → Convert to Date always
    const startTime = new Date(`1970-01-01T${data.startTime}:00Z`);
    const endTime = new Date(`1970-01-01T${data.endTime}:00Z`);

    await prisma.lesson.update({
      where: { id: data.id },
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

    return { success: true, error: false };
  } catch (err) {
    console.error("❌ Error updating lesson:", err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) },
    });

    if (!lesson) return { success: false, error: true };

    // Teachers can only delete their own lessons
    if (role === "teacher" && lesson.teacherId !== userId) {
      return { success: false, error: true };
    }

    await prisma.lesson.delete({
      where: { id: parseInt(id) },
    });

    // revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.error("❌ Error deleting lesson:", err);
    return { success: false, error: true };
  }
};

/* -------------------------------------------------------------------------- */
/*                             CREATE ASSIGNMENT                              */
/* -------------------------------------------------------------------------- */
export const getLessonsForUser = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Admin: fetch all lessons
  if (role === "admin") {
    return await prisma.lesson.findMany({
      select: { id: true, name: true },
    });
  }

  // Teacher: fetch only lessons they teach
  return await prisma.lesson.findMany({
    where: { teacherId: userId! },
    select: { id: true, name: true },
  });
};

/* ------------------------- CREATE ASSIGNMENT ------------------------- */
export const createAssignment = async (data: AssignmentSchema) => {
  const { userId, sessionClaims } = await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  const academicYear = data.academicYear.trim();

  try {
    if (role === "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,

          id: data.lessonId,
        },

        select: {
          id: true,
        },
      });

      if (!teacherLesson) {
        return {
          success: false,

          error: true,
        };
      }
    }

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

    revalidatePath("/list/assignments");

    revalidatePath("/list/results");

    revalidatePath("/list/report-cards/generate");

    return {
      success: true,

      error: false,
    };
  } catch (error) {
    console.error("CREATE ASSIGNMENT ERROR:", error);

    return {
      success: false,

      error: true,
    };
  }
};

/* ------------------------- UPDATE ASSIGNMENT ------------------------- */
export const updateAssignment = async (data: AssignmentSchema) => {
  const { userId, sessionClaims } = await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  try {
    if (!data.id) {
      return {
        success: false,

        error: true,
      };
    }

    if (role === "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,

          id: data.lessonId,
        },

        select: {
          id: true,
        },
      });

      if (!teacherLesson) {
        return {
          success: false,

          error: true,
        };
      }
    }

    const academicYear = data.academicYear?.trim();

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

    revalidatePath("/list/assignments");

    revalidatePath("/list/results");

    revalidatePath("/list/report-cards/generate");

    return {
      success: true,

      error: false,
    };
  } catch (error) {
    console.error("UPDATE ASSIGNMENT ERROR:", error);

    return {
      success: false,

      error: true,
    };
  }
};
/* -------------------------------------------------------------------------- */
/*                             DELETE ASSIGNMENT                              */
/* -------------------------------------------------------------------------- */
export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // Only allow teachers to delete their own lesson's assignments
    if (role === "teacher") {
      const assignment = await prisma.assignment.findUnique({
        where: { id: parseInt(id) },
        include: { lesson: true },
      });

      if (!assignment || assignment.lesson.teacherId !== userId) {
        return { success: false, error: true };
      }
    }

    await prisma.assignment.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log("❌ Error deleting assignment:", err);
    return { success: false, error: true };
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
/*                              UPDATE RESULT                                 */
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

export const createEvent = async (
  _currentState: CurrentState,

  data: EventSchema,
) => {
  const { userId, sessionClaims } = await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  if (!userId || role !== "admin") {
    return {
      success: false,

      error: true,

      message: "You are not authorized to create school events.",
    };
  }

  try {
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

          actorRole: "admin",

          actorName: null,
        });

        return created;
      },

      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

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
        error instanceof Error
          ? error.message
          : "The event could not be created.",
    };
  }
};

/* -------------------------------------------------------------------------- */
/*                              UPDATE EVENT                                  */
/* -------------------------------------------------------------------------- */

export const updateEvent = async (
  _currentState: CurrentState,

  data: EventSchema,
) => {
  const { userId, sessionClaims } = await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  if (!userId || role !== "admin") {
    return {
      success: false,

      error: true,

      message: "You are not authorized to update school events.",
    };
  }

  if (!data.id) {
    return {
      success: false,

      error: true,

      message: "Select a valid event.",
    };
  }

  try {
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

        /*
         * Determine whether anything that affects
         * previously generated notifications changed.
         */
        const notificationRelevantChange =
          existing.title !== values.title ||
          existing.description !== values.description ||
          existing.startTime.getTime() !== values.startTime.getTime() ||
          existing.endTime.getTime() !== values.endTime.getTime() ||
          existing.classId !== (values.classId ?? null);

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

        /*
         * If an already-reminded event is modified,
         * hide the obsolete reminder deliveries.
         *
         * The scheduler can then generate a reminder
         * describing the new event configuration.
         */
        if (notificationRelevantChange) {
          await archiveExistingEventReminders({
            tx,

            eventId,
          });
        }

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

            actorRole: "admin",

            actorName: null,
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
        error instanceof Error
          ? error.message
          : "The event could not be updated.",
    };
  }
};

/* -------------------------------------------------------------------------- */
/*                              DELETE EVENT                                  */
/* -------------------------------------------------------------------------- */

export const deleteEvent = async (
  _currentState: CurrentState,

  data: FormData,
) => {
  const { userId, sessionClaims } = await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  if (!userId || role !== "admin") {
    return {
      success: false,

      error: true,

      message: "You are not authorized to delete school events.",
    };
  }

  const eventId = Number(data.get("id"));

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return {
      success: false,

      error: true,

      message: "Select a valid event.",
    };
  }

  try {
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
         * source event. NotificationEvent stays
         * available as historical notification data.
         */
        await archiveExistingEventReminders({
          tx,

          eventId,
        });

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

          actorRole: "admin",

          actorName: null,
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

    revalidatePath("/list/events");

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
        error instanceof Error
          ? error.message
          : "The event could not be deleted.",
    };
  }
};

/* -------------------------------------------------------------------------- */
/*                  CREATE ANNOUNCEMENT                                  */
/* -------------------------------------------------------------------------- */

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema,
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date), // NEW
        classId: data.classId ?? null, // ✅ no parseInt
      },
    });

    // revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.error("CREATE ANNOUNCEMENT ERROR:", err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema,
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  try {
    await prisma.announcement.update({
      where: { id: typeof data.id === "string" ? parseInt(data.id) : data.id },
      data: {
        title: data.title,
        description: data.description,
        classId: data.classId ?? null, // ✅ no parseInt
      },
    });

    // revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.error("UPDATE ANNOUNCEMENT ERROR:", err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;
  if (!id) {
    return { success: false, error: true };
  }
  try {
    await prisma.announcement.delete({
      where: { id: parseInt(id) },
    });
    // revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.error("DELETE ANNOUNCEMENT ERROR:", err);
    return { success: false, error: true };
  }
};

// FEE MANAKEMENT SYSTEM ACTIONS
// FEE MANAKEMENT SYSTEM ACTIONS
// FEE MANAKEMENT SYSTEM ACTIONS
// FEE MANAKEMENT SYSTEM ACTIONS

export const createFeeCategory = async (
  currentState: any,
  data: FeeCategorySchema,
) => {
  try {
    await prisma.feeCategory.create({
      data: { name: data.name },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("CREATE FEE CATEGORY ERROR:", err);
    return { success: false, error: true };
  }
};

export const updateFeeCategory = async (
  currentState: any,
  data: FeeCategorySchema,
) => {
  if (!data.id) return { success: false, error: true };

  try {
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
    await prisma.feeCategory.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.log("DELETE FEE CATEGORY ERROR:", err);
    return { success: false, error: true };
  }
};

export const createFeeType = async (currentState: any, data: FeeTypeSchema) => {
  try {
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
    await prisma.feeMaster.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.log("DELETE FEE MASTER ERROR:", err);
    return { success: false, error: true };
  }
};

export const createFee = async (currentState: any, data: FeeSchema) => {
  try {
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
  const { userId, sessionClaims } = await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  if (!userId || role !== "admin") {
    return {
      success: false,

      error: true,

      message: "You are not authorized to record fee payments.",
    };
  }

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

          actorRole: role,

          actorName: null,
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
  currentState: any,
  data: FeePaymentSchema,
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await prisma.feePayment.update({
      where: { id: data.id },
      data: {
        masterId: data.masterId,
        amount: data.amount,
        method: data.method,
        date: data.date ?? new Date(),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("UPDATE FEE PAYMENT ERROR:", err);
    return { success: false, error: true };
  }
};

export const deleteFeePayment = async (currentState: any, data: FormData) => {
  const id = data.get("id") as string;
  if (!id) return { success: false, error: true };

  try {
    await prisma.feePayment.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.log("DELETE FEE PAYMENT ERROR:", err);
    return { success: false, error: true };
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
  // 1️⃣ Fetch student info
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { class: true, grade: true },
  });
  if (!student) throw new Error("Student not found");

  // 2️⃣ Fetch applicable FeeStructures
  const feeStructures = await prisma.feeStructure.findMany({
    where: {
      OR: [
        { classId: student.classId },
        { gradeId: student.gradeId },
        { classId: null, gradeId: null }, // generic fees
      ],
    },
    include: { type: true },
  });

  if (!feeStructures.length)
    throw new Error("No applicable fee structures for this student");

  // 3️⃣ Calculate total
  const totalAmount = feeStructures.reduce((sum, fs) => sum + fs.amount, 0);

  // 4️⃣ Create FeeMaster
  const feeMaster = await prisma.feeMaster.create({
    data: {
      studentId,
      term,
      academicYear,
      totalAmount,
      status: "PENDING",
      details: {
        create: feeStructures.map((fs) => ({
          structureId: fs.id,
          amount: fs.amount,
        })),
      },
    },
    include: { details: true },
  });

  return feeMaster;
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
  const { userId, sessionClaims } = await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  try {
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

                  actorRole: role ?? "system",

                  actorName: "Academic Calendar",
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

// export const saveTermSettings = async (data: {
//   id?: number;

//   academicYearId:
//     number;

//   name:
//     | "FIRST"
//     | "SECOND"
//     | "THIRD";

//   startDate:
//     string;

//   endDate:
//     string;

//   daysSchoolOpened:
//     number;

//   isActive:
//     boolean;
// }) => {
//   try {
//     /* ------------------------------------------------------------------ */
//     /*                       BASIC VALIDATION                             */
//     /* ------------------------------------------------------------------ */

//     if (
//       !Number.isInteger(
//         data.academicYearId,
//       ) ||
//       data.academicYearId <=
//         0
//     ) {
//       return {
//         success: false,
//         error: true,

//         message:
//           "Select a valid academic year.",
//       };
//     }

//     if (
//       !Number.isInteger(
//         data.daysSchoolOpened,
//       ) ||
//       data.daysSchoolOpened <=
//         0
//     ) {
//       return {
//         success: false,
//         error: true,

//         message:
//           "Days school opened must be a positive whole number.",
//       };
//     }

//     if (
//       data.daysSchoolOpened >
//       150
//     ) {
//       return {
//         success: false,
//         error: true,

//         message:
//           "Days school opened appears too high for one academic term.",
//       };
//     }

//     const startDate =
//       new Date(
//         data.startDate,
//       );

//     const endDate =
//       new Date(
//         data.endDate,
//       );

//     if (
//       Number.isNaN(
//         startDate.getTime(),
//       ) ||
//       Number.isNaN(
//         endDate.getTime(),
//       )
//     ) {
//       return {
//         success: false,
//         error: true,

//         message:
//           "Enter valid term dates.",
//       };
//     }

//     if (
//       endDate <=
//       startDate
//     ) {
//       return {
//         success: false,
//         error: true,

//         message:
//           "The term end date must be after the start date.",
//       };
//     }

//     /* ------------------------------------------------------------------ */
//     /*                         TRANSACTION                                */
//     /* ------------------------------------------------------------------ */

//     const result =
//       await prisma.$transaction(
//         async (tx) => {
//           const academicYear =
//             await tx.schoolAcademicYear.findUnique({
//               where: {
//                 id:
//                   data.academicYearId,
//               },

//               select: {
//                 id:
//                   true,

//                 name:
//                   true,

//                 startDate:
//                   true,

//                 endDate:
//                   true,
//               },
//             });

//           if (
//             !academicYear
//           ) {
//             throw new Error(
//               "The selected academic year could not be found.",
//             );
//           }

//           /*
//            * A term should fall within its
//            * parent academic-year boundaries.
//            */
//           if (
//             startDate <
//               academicYear.startDate ||
//             endDate >
//               academicYear.endDate
//           ) {
//             throw new Error(
//               `The term dates must fall within the ${academicYear.name} academic year.`,
//             );
//           }

//           /*
//            * Prevent duplicate First/Second/Third
//            * Term records inside the same year.
//            */
//           const duplicate =
//             await tx.schoolTerm.findFirst({
//               where: {
//                 academicYearId:
//                   data.academicYearId,

//                 name:
//                   data.name,

//                 ...(data.id
//                   ? {
//                       NOT: {
//                         id:
//                           data.id,
//                       },
//                     }
//                   : {}),
//               },

//               select: {
//                 id:
//                   true,
//               },
//             });

//           if (
//             duplicate
//           ) {
//             throw new Error(
//               `${data.name
//                 .toLowerCase()
//                 .replace(
//                   /\b\w/g,
//                   (
//                     character,
//                   ) =>
//                     character.toUpperCase(),
//                 )} Term already exists for ${academicYear.name}.`,
//             );
//           }

//           /*
//            * The school has one current active
//            * term across the application.
//            */
//           if (
//             data.isActive
//           ) {
//             await tx.schoolTerm.updateMany({
//               where: {
//                 isActive:
//                   true,

//                 ...(data.id
//                   ? {
//                       NOT: {
//                         id:
//                           data.id,
//                       },
//                     }
//                   : {}),
//               },

//               data: {
//                 isActive:
//                   false,
//               },
//             });
//           }

//           /* ------------------------------------------------------------ */
//           /*                         UPDATE                               */
//           /* ------------------------------------------------------------ */

//           if (
//             data.id
//           ) {
//             const existing =
//               await tx.schoolTerm.findUnique({
//                 where: {
//                   id:
//                     data.id,
//                 },

//                 select: {
//                   id:
//                     true,

//                   daysSchoolOpened:
//                     true,
//                 },
//               });

//             if (
//               !existing
//             ) {
//               throw new Error(
//                 "The selected school term could not be found.",
//               );
//             }

//             const updated =
//               await tx.schoolTerm.update({
//                 where: {
//                   id:
//                     data.id,
//                 },

//                 data: {
//                   academicYearId:
//                     data.academicYearId,

//                   name:
//                     data.name,

//                   startDate,

//                   endDate,

//                   daysSchoolOpened:
//                     data.daysSchoolOpened,

//                   isActive:
//                     data.isActive,
//                 },
//               });

//             return {
//               term:
//                 updated,

//               daysSchoolOpenedChanged:
//                 existing.daysSchoolOpened !==
//                 data.daysSchoolOpened,
//             };
//           }

//           /* ------------------------------------------------------------ */
//           /*                         CREATE                               */
//           /* ------------------------------------------------------------ */

//           const created =
//             await tx.schoolTerm.create({
//               data: {
//                 academicYearId:
//                   data.academicYearId,

//                 name:
//                   data.name,

//                 startDate,

//                 endDate,

//                 daysSchoolOpened:
//                   data.daysSchoolOpened,

//                 isActive:
//                   data.isActive,
//               },
//             });

//           return {
//             term:
//               created,

//             daysSchoolOpenedChanged:
//               false,
//           };
//         },
//       );

//     /* ------------------------------------------------------------------ */
//     /*                       REVALIDATION                                 */
//     /* ------------------------------------------------------------------ */

//     revalidatePath(
//       "/list/settings/academic-calendar",
//     );

//     revalidatePath(
//       "/list/settings",
//     );

//     revalidatePath(
//       "/list/report-cards",
//     );

//     revalidatePath(
//       "/list/report-cards/generate",
//     );

//     revalidatePath(
//       "/list/report-cards/review",
//     );

//     return {
//       success: true,
//       error: false,

//       data:
//         result.term,

//       daysSchoolOpenedChanged:
//         result.daysSchoolOpenedChanged,

//       message:
//         data.id
//           ? "Term updated successfully."
//           : "Term created successfully.",
//     };
//   } catch (error) {
//     console.error(
//       "TERM SAVE ERROR:",
//       error,
//     );

//     return {
//       success: false,
//       error: true,

//       message:
//         error instanceof Error
//           ? error.message
//           : "The term could not be saved.",
//     };
//   }
// };

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

    revalidatePath("/list/settings/term");

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

    revalidatePath("/list/settings/academic-calender");

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
