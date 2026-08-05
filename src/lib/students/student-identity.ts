// src/lib/students/student-identity.ts

export type PrismaStudentIdentity = {
  id: string;

  studentID: string;

  username?: string | null;

  name: string;
  surname: string;

  img?: string | null;
};

export type UiStudentIdentity = {
  id: string;

  /*
   * The UI always uses studentId.
   *
   * Prisma continues using studentID.
   */
  studentId: string;

  name: string;
  surname: string;

  img: string | null;
};

export function mapStudentIdentity(
  student: PrismaStudentIdentity,
): UiStudentIdentity {
  return {
    id: student.id,

    studentId:
      student.studentID,

    name:
      student.name,

    surname:
      student.surname,

    img:
      student.img ?? null,
  };
}