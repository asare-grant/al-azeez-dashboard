import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  studentProvisioningProfileSchema,
} from "./profile-validation";

type ProvisioningIdentity = {
  username:
    string | null;

  firstName:
    string;

  lastName:
    string;

  email:
    string;

  phone:
    string | null;

  imageUrl:
    string | null;
};

export async function createStudentProvisioningProfile({
  userId,
  identity,
  profile,
  tx,
}: {
  userId:
    string;

  identity:
    ProvisioningIdentity;

  profile:
    unknown;

  tx:
    Prisma.TransactionClient;
}) {
  const parsed =
    studentProvisioningProfileSchema.safeParse(
      profile,
    );

  if (
    !parsed.success
  ) {
    throw new Error(
      parsed.error.issues[0]
        ?.message ??
        "Invalid student profile.",
    );
  }

  if (
    !identity.username
  ) {
    throw new Error(
      "A username is required for student accounts.",
    );
  }

  const {
    address,
    studentID,
    birthday,
    sex,
    classId,
    parentId,
    studentType,
    boardingType,
  } =
    parsed.data;

  /* ---------------------------------------------------------------------- */
  /*                            CLASS + GRADE                               */
  /* ---------------------------------------------------------------------- */

  const classItem =
    await tx.class.findUnique({
      where: {
        id:
          classId,
      },

      select: {
        id:
          true,

        name:
          true,

        capacity:
          true,

        gradeId:
          true,

        _count: {
          select: {
            students:
              true,
          },
        },
      },
    });

  if (
    !classItem
  ) {
    throw new Error(
      "The selected class could not be found.",
    );
  }

  /*
   * Your old action only rejected when count === capacity.
   * Using >= is safer if historical data ever exceeds
   * configured capacity.
   */
  if (
    classItem._count
      .students >=
    classItem.capacity
  ) {
    throw new Error(
      `${classItem.name} has reached its student capacity.`,
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                               PARENT                                   */
  /* ---------------------------------------------------------------------- */

  let resolvedParentId:
    string | null =
    null;

  if (
    parentId
  ) {
    const parent =
      await tx.parent.findUnique({
        where: {
          id:
            parentId,
        },

        select: {
          id:
            true,
        },
      });

    if (
      !parent
    ) {
      throw new Error(
        "The selected parent or guardian could not be found.",
      );
    }

    resolvedParentId =
      parent.id;
  }

  /* ---------------------------------------------------------------------- */
  /*                             DUPLICATES                                 */
  /* ---------------------------------------------------------------------- */

  const duplicate =
    await tx.student.findFirst({
      where: {
        OR: [
          {
            studentID,
          },

          {
            username:
              identity.username,
          },

          ...(identity.email
            ? [
                {
                  email:
                    identity.email,
                },
              ]
            : []),

          ...(identity.phone
            ? [
                {
                  phone:
                    identity.phone,
                },
              ]
            : []),
        ],
      },

      select: {
        id:
          true,
      },
    });

  if (
    duplicate
  ) {
    throw new Error(
      "A student with this Student ID, username, email or phone already exists.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                                CREATE                                  */
  /* ---------------------------------------------------------------------- */

  await tx.student.create({
    data: {
      id:
        userId,

      username:
        identity.username,

      name:
        identity.firstName,

      surname:
        identity.lastName,

      email:
        identity.email ||
        null,

      phone:
        identity.phone,

      address,

      img:
        identity.imageUrl,

      studentID,

      sex,

      birthday,

      /*
       * Derived from the selected class.
       */
      classId:
        classItem.id,

      gradeId:
        classItem.gradeId,

      parentId:
        resolvedParentId,

      studentType,

      boardingType,
    },
  });

  return {
    type:
      "student" as const,

    studentID,

    classId:
      classItem.id,

    gradeId:
      classItem.gradeId,
  };
}