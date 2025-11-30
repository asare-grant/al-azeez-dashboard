"use server";

import { revalidatePath } from "next/cache";
import {
  AnnouncementSchema,
  announcementSchema,
  AssignmentSchema,
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

type CurrentState = { success: boolean; error: boolean };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
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
  data: SubjectSchema
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
  data: FormData
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
  data: ClassSchema
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
  data: ClassSchema
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
  data: FormData
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
  data: TeacherSchema
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
        bloodType: data.bloodType,
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
  data: TeacherSchema
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
        bloodType: data.bloodType,
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
  data: FormData
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
  data: StudentSchema
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
        bloodType: data.bloodType,
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

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
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
        bloodType: data.bloodType,
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
  data: FormData
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
  data: ParentSchema
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
  data: ParentSchema
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
          connect: data.studentIds?.map((id) => ({ id: id })) || [],
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
  data: FormData
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
        "⚠️ Parent not found in Clerk. Continuing with Prisma deletion."
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
  data: ExamSchema
) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    if (role === "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,
          id: data.lessonId,
        },
      });

      if (!teacherLesson) {
        return { success: false, error: true };
      }
    }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    if (role === "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,
          id: data.lessonId,
        },
      });

      if (!teacherLesson) {
        return { success: false, error: true };
      }
    }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
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
  data: LessonSchema
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
   data: LessonSchema
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
  data: FormData
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
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // Teachers can only create assignments for their own lessons
    if (role === "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: { teacherId: userId!, id: data.lessonId },
      });
      if (!teacherLesson) {
        console.warn(
          "Unauthorized: Teacher tried to create assignment for another lesson"
        );
        return { success: false, error: true };
      }
    }

    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("❌ Error creating assignment:", err);
    return { success: false, error: true };
  }
};

/* ------------------------- UPDATE ASSIGNMENT ------------------------- */
export const updateAssignment = async (data: AssignmentSchema) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    if (!data.id) return { success: false, error: true };

    // Teachers can only update assignments for their own lessons
    if (role === "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: { teacherId: userId!, id: data.lessonId },
      });
      if (!teacherLesson) {
        console.warn(
          "Unauthorized: Teacher tried to update assignment for another lesson"
        );
        return { success: false, error: true };
      }
    }

    await prisma.assignment.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("❌ Error updating assignment:", err);
    return { success: false, error: true };
  }
};
/* -------------------------------------------------------------------------- */
/*                             DELETE ASSIGNMENT                              */
/* -------------------------------------------------------------------------- */
export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
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

// export const createAssignment = async (
//   currentState: CurrentState,
//   data: AssignmentSchema
// ) => {
//   const { userId, sessionClaims } = await auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   try {
//     // Teachers can only create assignments for their own lessons
//     if (role === "teacher") {
//       const teacherLesson = await prisma.lesson.findFirst({
//         where: {
//           teacherId: userId!,
//           id: data.lessonId,
//         },
//       });

//       if (!teacherLesson) {
//         console.warn("Unauthorized: Teacher tried to create assignment for another class");
//         return { success: false, error: true };
//       }
//     }

//     await prisma.assignment.create({
//       data: {
//         title: data.title,
//         startDate: data.startDate,
//         dueDate: data.dueDate,
//         lessonId: data.lessonId,
//       },
//     });

//     // revalidatePath("/list/assignments"); // uncomment if you have that page
//     return { success: true, error: false };
//   } catch (err) {
//     console.error("❌ Error creating assignment:", err);
//     return { success: false, error: true };
//   }
// };

// /* ------------------------- UPDATE ASSIGNMENT ------------------------- */
// export const updateAssignment = async (
//   currentState: CurrentState,
//   data: AssignmentSchema
// ) => {
//   const { userId, sessionClaims } = await auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   try {
//     if (!data.id) return { success: false, error: true };

//     if (role === "teacher") {
//       const teacherLesson = await prisma.lesson.findFirst({
//         where: {
//           teacherId: userId!,
//           id: data.lessonId,
//         },
//       });

//       if (!teacherLesson) {
//         console.warn("Unauthorized: Teacher tried to edit assignment for another class");
//         return { success: false, error: true };
//       }
//     }

//     await prisma.assignment.update({
//       where: { id: data.id },
//       data: {
//         title: data.title,
//         startDate: data.startDate,
//         dueDate: data.dueDate,
//         lessonId: data.lessonId,
//       },
//     });

//     // revalidatePath("/list/assignments");
//     return { success: true, error: false };
//   } catch (err) {
//     console.error("❌ Error updating assignment:", err);
//     return { success: false, error: true };
//   }
// };

// /* ------------------------- DELETE ASSIGNMENT ------------------------- */
// export const deleteAssignment = async (
//   currentState: CurrentState,
//   data: FormData
// ) => {
//   const id = data.get("id") as string;
//   const { userId, sessionClaims } = await auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   try {
//     const assignment = await prisma.assignment.findUnique({
//       where: { id: parseInt(id) },
//       include: { lesson: true },
//     });

//     if (!assignment) return { success: false, error: true };

//     // Teachers can only delete their own lesson's assignments
//     if (role === "teacher" && assignment.lesson.teacherId !== userId) {
//       console.warn("Unauthorized: Teacher tried to delete another teacher's assignment");
//       return { success: false, error: true };
//     }

//     await prisma.assignment.delete({
//       where: { id: parseInt(id) },
//     });

//     // revalidatePath("/list/assignments");
//     return { success: true, error: false };
//   } catch (err) {
//     console.error("❌ Error deleting assignment:", err);
//     return { success: false, error: true };
//   }
// };

// export const createResult = async (
//   currentState: CurrentState,
//   data: ResultSchema
// ) => {
//   const { userId, sessionClaims } = await auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   try {
//     // If a teacher, verify ownership of the lesson/exam/assignment
//     if (role === "teacher") {
//       const isAuthorized = await prisma.lesson.findFirst({
//         where: {
//           teacherId: userId!,
//           ...(data.type === "EXAM"
//             ? { exams: { some: { id: data.examId } } }
//             : { assignments: { some: { id: data.assignmentId } } }),
//         },
//       });

//       if (!isAuthorized) return { success: false, error: true };
//     }

//     await prisma.result.create({
//       data: {
//         score: data.score,
//         type: data.type,
//         studentId: data.studentId,
//         examId: data.type === "EXAM" ? data.examId : null,
//         assignmentId: data.type === "ASSIGNMENT" ? data.assignmentId : null,
//       },
//     });

//     // revalidatePath("/list/results");
//     return { success: true, error: false };
//   } catch (err) {
//     console.error(err);
//     return { success: false, error: true };
//   }
// };

// export const updateResult = async (
//   currentState: CurrentState,
//   data: ResultSchema
// ) => {
//   const { userId, sessionClaims } = await auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   try {
//     if (!data.id) return { success: false, error: true };

//     // Optional: authorization for teachers
//     if (role === "teacher") {
//       const isAuthorized = await prisma.lesson.findFirst({
//         where: {
//           teacherId: userId!,
//           ...(data.type === "EXAM"
//             ? { exams: { some: { id: data.examId } } }
//             : { assignments: { some: { id: data.assignmentId } } }),
//         },
//       });
//       if (!isAuthorized) return { success: false, error: true };
//     }

//     await prisma.result.update({
//       where: { id: data.id },
//       data: {
//         score: data.score,
//         type: data.type,
//         studentId: data.studentId,
//         examId: data.type === "EXAM" ? data.examId : null,
//         assignmentId: data.type === "ASSIGNMENT" ? data.assignmentId : null,
//       },
//     });

//     // revalidatePath("/list/results");
//     return { success: true, error: false };
//   } catch (err) {
//     console.error(err);
//     return { success: false, error: true };
//   }
// };

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    if (role === "teacher") {
      // Verify that teacher owns the lesson related to this result
      const result = await prisma.result.findUnique({
        where: { id: parseInt(id) },
        include: {
          exam: { include: { lesson: true } },
          assignment: { include: { lesson: true } },
        },
      });

      const teacherId =
        result?.exam?.lesson.teacherId || result?.assignment?.lesson.teacherId;

      if (teacherId !== userId) return { success: false, error: true };
    }

    await prisma.result.delete({ where: { id: parseInt(id) } });

    // revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// export const createResult = async (_: any, data: ResultSchema) => {
//   try {
//     await prisma.result.create({
//       data: {
//         studentId: data.studentId,
//         type: data.type,
//         score: data.score,
//         examId: data.type === "EXAM" ? data.examId ?? null : null,
//         assignmentId: data.type === "ASSIGNMENT" ? data.assignmentId ?? null : null,
//       },
//     });

//     return { success: true, error: false };
//   } catch (err) {
//     console.error("❌ Error creating result:", err);
//     return { success: false, error: true };
//   }
// };

export const createResult = async (_: any, data: ResultSchema) => {
  try {
    // Validate that at least one assessment is selected
    if (data.type === "EXAM" && !data.examId) {
      throw new Error("Exam must be selected for EXAM results.");
    }
    if (data.type === "ASSIGNMENT" && !data.assignmentId) {
      throw new Error("Assignment must be selected for ASSIGNMENT results.");
    }

    // Ensure the selected exam or assignment exists and has a lesson
    let lessonId: number | null = null;

    if (data.type === "EXAM") {
      const exam = await prisma.exam.findUnique({
        where: { id: Number(data.examId) },
        select: { lessonId: true },
      });
      if (!exam) throw new Error("Selected exam does not exist.");
      lessonId = exam.lessonId;
    }

    if (data.type === "ASSIGNMENT") {
      const assignment = await prisma.assignment.findUnique({
        where: { id: Number(data.assignmentId) },
        select: { lessonId: true },
      });
      if (!assignment) throw new Error("Selected assignment does not exist.");
      lessonId = assignment.lessonId;
    }

    // Create the result
    const result = await prisma.result.create({
      data: {
        studentId: data.studentId,
        score: Number(data.score),
        type: data.type, // EXAM or ASSIGNMENT
        examId: data.type === "EXAM" ? Number(data.examId) : null,
        assignmentId:
          data.type === "ASSIGNMENT" ? Number(data.assignmentId) : null,
      },
    });

    return result;
  } catch (error) {
    console.error("❌ Error creating result:", error);
    throw error;
  }
};

export const updateResult = async (_: any, data: ResultSchema) => {
  try {
    await prisma.result.update({
      where: { id: data.id },
      data: {
        studentId: data.studentId,
        type: data.type,
        score: data.score,
        examId: data.type === "EXAM" ? data.examId ?? null : null,
        assignmentId:
          data.type === "ASSIGNMENT" ? data.assignmentId ?? null : null,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("❌ Error updating result:", err);
    return { success: false, error: true };
  }
};

/* ------------------------- CREATE EVENT ------------------------- */
export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date), // NEW
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        classId: data.classId ? parseInt(data.classId) : null,
      },
    });

    // revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  try {
    await prisma.event.update({
      where: { id: typeof data.id === "string" ? parseInt(data.id) : data.id },
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        classId: data.classId ? parseInt(data.classId) : null,
      },
    });

    // revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log("UPDATE EVENT ERROR:", err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  if (!id) {
    return { success: false, error: true };
  }
  try {
    await prisma.event.delete({
      where: { id: parseInt(id) },
    });

    // revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
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
  data: AnnouncementSchema
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
  data: FormData
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
  data: FeeCategorySchema
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
  data: FeeCategorySchema
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

export const deleteFeeCategory = async (
  currentState: any, 
  data: FormData
) => {
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

export const createFeeType = async (
  currentState: any, 
  data: FeeTypeSchema
) => {
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

export const updateFeeType = async (
  currentState: any, 
  data: FeeTypeSchema
) => {
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

export const deleteFeeType = async (
  currentState: any, 
  data: FormData
) => {
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
  data: FeeStructureSchema
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
  data: FeeStructureSchema
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

export const deleteFeeStructure = async (
  currentState: any, 
  data: FormData) => {
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
  data: FeeMasterSchema
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
  data: FeeMasterSchema
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

export const deleteFeeMaster = async (
  currentState: any, 
  data: FormData) => {
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

export const createFee = async (
  currentState: any, 
  data: FeeSchema) => {
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

export const updateFee = async (
  currentState: any, 
  data: FeeSchema) => {
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

export const deleteFee = async (
  currentState: any, 
  data: FormData) => {
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
  currentState: any, 
  data: FeePaymentSchema) => {
  try {
    await prisma.feePayment.create({
      data: {
        masterId: data.masterId,
        amount: data.amount,
        method: data.method,
        date: data.date ?? new Date(),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("CREATE FEE PAYMENT ERROR:", err);
    return { success: false, error: true };
  }
};

export const updateFeePayment = async (
  currentState: any, 
  data: FeePaymentSchema) => {
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

export const deleteFeePayment = async (
  currentState: any, 
  data: FormData) => {
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

// export const createFeePayment = async (state: any, data: FeePaymentSchema) => {
//   try {
//     const payment = await prisma.feePayment.create({
//       data: {
//         masterId: data.masterId,
//         amount: data.amount,
//         method: data.method,
//         date: data.date || new Date(),
//       },
//     });

//     // Optional: Update FeeMaster status automatically
//     const feeMaster = await prisma.feeMaster.findUnique({
//       where: { id: data.masterId },
//       include: { details: true, payments: true },
//     });

//     if (feeMaster) {
//       const totalPaid =
//         feeMaster.payments.reduce((sum, p) => sum + p.amount, 0) + data.amount;
//       const status =
//         totalPaid >= feeMaster.totalAmount
//           ? "PAID"
//           : totalPaid > 0
//           ? "PARTIAL"
//           : "PENDING";

//       await prisma.feeMaster.update({
//         where: { id: data.masterId },
//         data: { status },
//       });
//     }

//     return { success: true, data: payment };
//   } catch (err) {
//     console.error("Create FeePayment Error:", err);
//     return { success: false, error: err };
//   }
// };
