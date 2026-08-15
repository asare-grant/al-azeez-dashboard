import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  parentProvisioningProfileSchema,
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

export async function createParentProvisioningProfile({
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
    parentProvisioningProfileSchema.safeParse(
      profile,
    );

  if (
    !parsed.success
  ) {
    throw new Error(
      parsed.error.issues[0]
        ?.message ??
        "Invalid parent profile.",
    );
  }

  if (
    !identity.username
  ) {
    throw new Error(
      "A username is required for parent accounts.",
    );
  }

  /*
   * Your Parent model requires phone String,
   * not String?.
   */
  if (
    !identity.phone
  ) {
    throw new Error(
      "A phone number is required for parent accounts.",
    );
  }

  const {
    address,
    studentIds,
  } =
    parsed.data;

  const uniqueStudentIds =
    Array.from(
      new Set(
        studentIds,
      ),
    );

  /* ---------------------------------------------------------------------- */
  /*                         VALIDATE STUDENTS                              */
  /* ---------------------------------------------------------------------- */

  if (
    uniqueStudentIds.length >
    0
  ) {
    const students =
      await tx.student.findMany({
        where: {
          id: {
            in:
              uniqueStudentIds,
          },
        },

        select: {
          id:
            true,

          parentId:
            true,
        },
      });

    if (
      students.length !==
      uniqueStudentIds.length
    ) {
      throw new Error(
        "One or more selected students could not be found.",
      );
    }

    /*
     * Do not silently transfer a child from
     * an existing parent account.
     */
    const alreadyLinked =
      students.find(
        (
          student,
        ) =>
          student.parentId &&
          student.parentId !==
            userId,
      );

    if (
      alreadyLinked
    ) {
      throw new Error(
        "One or more selected students are already linked to another parent account.",
      );
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                            DUPLICATES                                  */
  /* ---------------------------------------------------------------------- */

  const duplicate =
    await tx.parent.findFirst({
      where: {
        OR: [
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

          {
            phone:
              identity.phone,
          },
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
      "A parent with this username, email or phone already exists.",
    );
  }

  await tx.parent.create({
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

      students: {
        connect:
          uniqueStudentIds.map(
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
      "parent" as const,

    linkedStudents:
      uniqueStudentIds.length,
  };
}