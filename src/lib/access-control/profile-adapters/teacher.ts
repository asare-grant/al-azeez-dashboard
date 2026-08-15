import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  teacherProvisioningProfileSchema,
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

export async function createTeacherProvisioningProfile({
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
    teacherProvisioningProfileSchema.safeParse(
      profile,
    );

  if (
    !parsed.success
  ) {
    throw new Error(
      parsed.error.issues[0]
        ?.message ??
        "Invalid teacher profile.",
    );
  }

  if (
    !identity.username
  ) {
    throw new Error(
      "A username is required for teacher accounts.",
    );
  }

  const {
    address,
    teacherID,
    birthday,
    sex,
    subjectIds,
  } =
    parsed.data;

  const uniqueSubjectIds =
    Array.from(
      new Set(
        subjectIds,
      ),
    );

  /*
   * Validate every selected subject.
   */
  if (
    uniqueSubjectIds.length >
    0
  ) {
    const subjectCount =
      await tx.subject.count({
        where: {
          id: {
            in:
              uniqueSubjectIds,
          },
        },
      });

    if (
      subjectCount !==
      uniqueSubjectIds.length
    ) {
      throw new Error(
        "One or more selected subjects could not be found.",
      );
    }
  }

  const duplicate =
    await tx.teacher.findFirst({
      where: {
        OR: [
          {
            teacherID,
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
      "A teacher with this Teacher ID, username, email or phone already exists.",
    );
  }

  await tx.teacher.create({
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

      teacherID,

      sex,

      birthday,

      subjects: {
        connect:
          uniqueSubjectIds.map(
            (
              id,
            ) => ({
              id,
            }),
          ),
      },
    },
  });

  return {
    type:
      "teacher" as const,

    teacherID,
  };
}