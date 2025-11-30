import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "fee"
    | "fee-structure"
    | "fee-type"
    | "fee-category"
    | "fee-master"
    | "fee-payment";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  relatedData?: Record<string, any>; // <-- Add this
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = { classes: studentClasses, grades: studentGrades };
        break;
      case "parent":
        const parentStudents = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { students: parentStudents };
        break;
      case "exam":
        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: examLessons };
        break;
      case "result":
        const resultStudents = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });
        const resultClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        const resultExams = await prisma.exam.findMany({
          select: { id: true, title: true },
        });
        const resultAssignments = await prisma.assignment.findMany({
          select: { id: true, title: true },
        });
        relatedData = {
          students: resultStudents,
          classes: resultClasses,
          exams: resultExams,
          assignments: resultAssignments,
        };
        break;
      case "lesson":
        const lessonTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        const lessonSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        const lessonClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });

        relatedData = {
          teachers: lessonTeachers,
          subjects: lessonSubjects,
          classes: lessonClasses,
        };
        break;
      case "assignment":
        const assignmentLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: {
            id: true,
            name: true,
            day: true,
            subject: { select: { name: true } },
            class: { select: { name: true } },
          },
        });
        relatedData = { lessons: assignmentLessons };
        break;
      case "event":
        const eventClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: eventClasses };
        break;
      case "announcement":
        const announcementClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: announcementClasses };
        break;
      case "fee":
      case "fee-structure":
      case "fee-type":
      case "fee-category":
      case "fee-master":
      case "fee-payment":
        // Fetch related data for fee forms
        const students = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });
        const classes = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        const grades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const feeTypes = await prisma.feeType.findMany({
          select: { id: true, name: true },
        });
        const feeCategories = await prisma.feeCategory.findMany({
          select: { id: true, name: true },
        });
        const feeStructures = await prisma.feeStructure.findMany({
          select: { id: true, typeId: true, type: true },
        });
        const feeMasters = await prisma.feeMaster.findMany({
          include: { student: true },
        });

        relatedData = {
          students,
          classes,
          grades,
          feeTypes,
          categories: feeCategories,
          structures: feeStructures,
          feeMasters,
        };
        break;

      // case "assignment":
      //   const assignmentLessons = await prisma.lesson.findMany({
      //     where: {
      //       ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
      //     },
      //     select: { id: true, name: true, day: true },
      //   });
      //   relatedData = { lessons: assignmentLessons };
      //   break;

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
