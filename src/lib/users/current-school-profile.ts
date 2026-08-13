import "server-only";

import {
  currentUser,
} from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

import type {
  AppRole,
} from "@/lib/navigation/roles";

export type CurrentSchoolProfile = {
  id: string;

  username: string;

  name: string;

  firstName: string;

  role: AppRole;

  imageUrl: string;
};

export async function getCurrentSchoolProfile(): Promise<
  CurrentSchoolProfile | null
> {
  const user =
    await currentUser();

  if (!user) {
    return null;
  }

  const role =
    (
      user.publicMetadata
        .role as AppRole
    ) || "account";

  let databaseProfile:
    | {
        username?:
          string | null;

        name?:
          string | null;

        surname?:
          string | null;

        img?:
          string | null;
      }
    | null =
    null;

  try {
    switch (role) {
      /* ---------------------------------------------------------- */
      /* ADMIN                                                      */
      /* ---------------------------------------------------------- */

      case "admin": {
        databaseProfile =
          await prisma.admin.findUnique({
            where: {
              id:
                user.id,
            },

            select: {
              username:
                true,

              img:
                true,
            },
          });

        break;
      }

      /* ---------------------------------------------------------- */
      /* TEACHER                                                    */
      /* ---------------------------------------------------------- */

      case "teacher": {
        databaseProfile =
          await prisma.teacher.findUnique({
            where: {
              id:
                user.id,
            },

            select: {
              username:
                true,

              name:
                true,

              surname:
                true,

              img:
                true,
            },
          });

        break;
      }

      /* ---------------------------------------------------------- */
      /* STUDENT                                                    */
      /* ---------------------------------------------------------- */

      case "student": {
        databaseProfile =
          await prisma.student.findUnique({
            where: {
              id:
                user.id,
            },

            select: {
              username:
                true,

              name:
                true,

              surname:
                true,

              img:
                true,
            },
          });

        break;
      }

      /* ---------------------------------------------------------- */
      /* PARENT                                                     */
      /* ---------------------------------------------------------- */

      case "parent": {
        databaseProfile =
          await prisma.parent.findUnique({
            where: {
              id:
                user.id,
            },

            select: {
              username:
                true,

              name:
                true,

              surname:
                true,

              img:
                true,
            },
          });

        break;
      }

      default:
        break;
    }
  } catch (
    error
  ) {
    /*
     * Never allow a profile-photo lookup problem
     * to prevent the whole dashboard from rendering.
     */
    console.error(
      "CURRENT SCHOOL PROFILE ERROR:",
      error,
    );
  }

  /* ------------------------------------------------------------ */
  /* NAME                                                         */
  /* ------------------------------------------------------------ */

  const databaseName =
    [
      databaseProfile?.name,
      databaseProfile?.surname,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  const clerkName =
    user.firstName
      ? `${user.firstName} ${
          user.lastName || ""
        }`.trim()
      : user.username ||
        "Unknown User";

  const name =
    databaseName ||
    clerkName;

  const firstName =
    databaseProfile?.name ||
    user.firstName ||
    user.username ||
    "User";

  /* ------------------------------------------------------------ */
  /* IMAGE                                                        */
  /* ------------------------------------------------------------ */

  const imageUrl =
    databaseProfile?.img ||
    user.imageUrl ||
    "/noAvatar.png";

  return {
    id:
      user.id,

    username:
      databaseProfile?.username ||
      user.username ||
      "",

    name,

    firstName,

    role,

    imageUrl,
  };
}