// // src/lib/users/current-school-profile.ts
// import "server-only";

// import {
//   currentUser,
// } from "@clerk/nextjs/server";

// import prisma from "@/lib/prisma";

// import type {
//   AppRole,
// } from "@/lib/navigation/roles";

// export type CurrentSchoolProfile = {
//   id: string;

//   username: string;

//   name: string;

//   firstName: string;

//   role: AppRole;

//   imageUrl: string;
// };

// export async function getCurrentSchoolProfile(): Promise<
//   CurrentSchoolProfile | null
// > {
//   const user =
//     await currentUser();

//   if (!user) {
//     return null;
//   }

//   const role =
//     (
//       user.publicMetadata
//         .role as AppRole
//     ) || "account";

//   let databaseProfile:
//     | {
//         username?:
//           string | null;

//         name?:
//           string | null;

//         surname?:
//           string | null;

//         img?:
//           string | null;
//       }
//     | null =
//     null;

//   try {
//     switch (role) {
//       /* ---------------------------------------------------------- */
//       /* ADMIN                                                      */
//       /* ---------------------------------------------------------- */

//       case "admin": {
//         databaseProfile =
//           await prisma.admin.findUnique({
//             where: {
//               id:
//                 user.id,
//             },

//             select: {
//               username:
//                 true,

//               img:
//                 true,
//             },
//           });

//         break;
//       }

//       /* ---------------------------------------------------------- */
//       /* TEACHER                                                    */
//       /* ---------------------------------------------------------- */

//       case "teacher": {
//         databaseProfile =
//           await prisma.teacher.findUnique({
//             where: {
//               id:
//                 user.id,
//             },

//             select: {
//               username:
//                 true,

//               name:
//                 true,

//               surname:
//                 true,

//               img:
//                 true,
//             },
//           });

//         break;
//       }

//       /* ---------------------------------------------------------- */
//       /* STUDENT                                                    */
//       /* ---------------------------------------------------------- */

//       case "student": {
//         databaseProfile =
//           await prisma.student.findUnique({
//             where: {
//               id:
//                 user.id,
//             },

//             select: {
//               username:
//                 true,

//               name:
//                 true,

//               surname:
//                 true,

//               img:
//                 true,
//             },
//           });

//         break;
//       }

//       /* ---------------------------------------------------------- */
//       /* PARENT                                                     */
//       /* ---------------------------------------------------------- */

//       case "parent": {
//         databaseProfile =
//           await prisma.parent.findUnique({
//             where: {
//               id:
//                 user.id,
//             },

//             select: {
//               username:
//                 true,

//               name:
//                 true,

//               surname:
//                 true,

//               img:
//                 true,
//             },
//           });

//         break;
//       }

//       default:
//         break;
//     }
//   } catch (
//     error
//   ) {
//     /*
//      * Never allow a profile-photo lookup problem
//      * to prevent the whole dashboard from rendering.
//      */
//     console.error(
//       "CURRENT SCHOOL PROFILE ERROR:",
//       error,
//     );
//   }

//   /* ------------------------------------------------------------ */
//   /* NAME                                                         */
//   /* ------------------------------------------------------------ */

//   const databaseName =
//     [
//       databaseProfile?.name,
//       databaseProfile?.surname,
//     ]
//       .filter(Boolean)
//       .join(" ")
//       .trim();

//   const clerkName =
//     user.firstName
//       ? `${user.firstName} ${
//           user.lastName || ""
//         }`.trim()
//       : user.username ||
//         "Unknown User";

//   const name =
//     databaseName ||
//     clerkName;

//   const firstName =
//     databaseProfile?.name ||
//     user.firstName ||
//     user.username ||
//     "User";

//   /* ------------------------------------------------------------ */
//   /* IMAGE                                                        */
//   /* ------------------------------------------------------------ */

//   const imageUrl =
//     databaseProfile?.img ||
//     user.imageUrl ||
//     "/noAvatar.png";

//   return {
//     id:
//       user.id,

//     username:
//       databaseProfile?.username ||
//       user.username ||
//       "",

//     name,

//     firstName,

//     role,

//     imageUrl,
//   };
// }






// src/lib/users/current-school-profile.ts

import "server-only";

import {
  currentUser,
} from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

import {
  normalizeAppRole,
} from "@/lib/navigation/roles";

import type {
  AppRole,
} from "@/lib/navigation/roles";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type CurrentSchoolProfile = {
  id:
    string;

  username:
    string;

  name:
    string;

  firstName:
    string;

  role:
    AppRole;

  /*
   * Preserve the actual Clerk/RBAC-facing role key.
   *
   * Examples:
   *
   * admin
   * super_admin
   * academic_director
   * exam_officer
   */
  roleKey:
    string;

  imageUrl:
    string;
};

type DomainProfile = {
  username?:
    string | null;

  name?:
    string | null;

  surname?:
    string | null;

  img?:
    string | null;
};

/* ========================================================================== */
/* NORMALIZE CLERK ROLE                                                       */
/* ========================================================================== */

function getClerkRole(
  value:
    unknown,
) {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .trim()
    .toLowerCase();
}

/* ========================================================================== */
/* CURRENT SCHOOL PROFILE                                                     */
/* ========================================================================== */

export async function getCurrentSchoolProfile(): Promise<
  CurrentSchoolProfile | null
> {
  const user =
    await currentUser();

  if (!user) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* CLERK ROLE                                                               */
  /* ------------------------------------------------------------------------ */

  const rawRole =
    getClerkRole(
      user.publicMetadata
        .role,
    );

  /*
   * Converts known school personas to:
   *
   * super_admin
   * admin
   * teacher
   * student
   * parent
   * account
   *
   * Unknown/custom RBAC-oriented identities become:
   *
   * custom
   */
  const role =
    normalizeAppRole(
      rawRole,
    );

  /* ------------------------------------------------------------------------ */
  /* UNIVERSAL USER ACCOUNT                                                   */
  /* ------------------------------------------------------------------------ */

  /*
   * UserAccount is now our universal local identity.
   *
   * This means Super Admin/custom identities no longer
   * need a Student/Teacher/Admin/Parent domain row simply
   * for the Navbar and Sidebar to render.
   */
  let account:
    | {
        username:
          string | null;

        displayName:
          string | null;

        imageUrl:
          string | null;

        legacyRole:
          string | null;
      }
    | null =
    null;

  try {
    account =
      await prisma.userAccount.findUnique({
        where: {
          id:
            user.id,
        },

        select: {
          username:
            true,

          displayName:
            true,

          imageUrl:
            true,

          legacyRole:
            true,
        },
      });
  } catch (
    error
  ) {
    console.error(
      "CURRENT USER ACCOUNT PROFILE ERROR:",
      error,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* OPTIONAL DOMAIN PROFILE                                                  */
  /* ------------------------------------------------------------------------ */

  /*
   * Domain records remain useful where they actually
   * exist, but they are no longer required merely to
   * render the application's authenticated shell.
   */
  let databaseProfile:
    DomainProfile | null =
    null;

  try {
    switch (
      role
    ) {
      /* -------------------------------------------------------------------- */
      /* ADMINISTRATIVE IDENTITIES                                            */
      /* -------------------------------------------------------------------- */

      case "admin":
      case "super_admin": {
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

      /* -------------------------------------------------------------------- */
      /* TEACHER                                                              */
      /* -------------------------------------------------------------------- */

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

      /* -------------------------------------------------------------------- */
      /* STUDENT                                                              */
      /* -------------------------------------------------------------------- */

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

      /* -------------------------------------------------------------------- */
      /* PARENT                                                               */
      /* -------------------------------------------------------------------- */

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

      /* -------------------------------------------------------------------- */
      /* ACCOUNT / CUSTOM                                                     */
      /* -------------------------------------------------------------------- */

      /*
       * These identities do not need a dedicated
       * domain model to render the app shell.
       *
       * UserAccount + Clerk provide the fallback.
       */
      case "account":
      case "custom":
      default:
        break;
    }
  } catch (
    error
  ) {
    /*
     * A domain-profile lookup must never prevent the
     * authenticated dashboard shell from rendering.
     */
    console.error(
      "CURRENT SCHOOL DOMAIN PROFILE ERROR:",
      error,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* NAME                                                                     */
  /* ------------------------------------------------------------------------ */

  const databaseName =
    [
      databaseProfile
        ?.name,

      databaseProfile
        ?.surname,
    ]
      .filter(
        Boolean,
      )
      .join(
        " ",
      )
      .trim();

  const clerkName =
    user.firstName
      ? `${user.firstName} ${
          user.lastName ||
          ""
        }`.trim()
      : user.username ||
        "Unknown User";

  const name =
    databaseName ||
    account
      ?.displayName ||
    clerkName;

  const firstName =
    databaseProfile
      ?.name ||
    user.firstName ||
    account
      ?.displayName
      ?.split(
        " ",
      )[0] ||
    user.username ||
    "User";

  /* ------------------------------------------------------------------------ */
  /* USERNAME                                                                 */
  /* ------------------------------------------------------------------------ */

  const username =
    databaseProfile
      ?.username ||
    account
      ?.username ||
    user.username ||
    "";

  /* ------------------------------------------------------------------------ */
  /* IMAGE                                                                    */
  /* ------------------------------------------------------------------------ */

  const imageUrl =
    databaseProfile
      ?.img ||
    account
      ?.imageUrl ||
    user.imageUrl ||
    "/noAvatar.png";

  /* ------------------------------------------------------------------------ */
  /* ROLE KEY                                                                 */
  /* ------------------------------------------------------------------------ */

  /*
   * Prefer Clerk's actual persona key.
   *
   * Fall back to our synchronized UserAccount legacy role.
   */
  const roleKey =
    rawRole ||
    account
      ?.legacyRole ||
    "account";

  return {
    id:
      user.id,

    username,

    name,

    firstName,

    role,

    roleKey,

    imageUrl,
  };
}