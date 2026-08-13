// import {
//   currentUser,
// } from "@clerk/nextjs/server";

// import NavbarClient from "@/components/NavbarClient";

// import NotificationBell from "@/components/notifications/NotificationBell";

// const Navbar = async () => {
//   const user =
//     await currentUser();

//   if (!user) {
//     return null;
//   }

//   const role =
//     (user.publicMetadata.role as string) ||
//     "guest";

//   const name =
//     user.firstName
//       ? `${user.firstName} ${
//           user.lastName || ""
//         }`.trim()
//       : user.username ||
//         "Unknown User";
    
//   const firstName =
//         user.firstName 
//         ? `${user.firstName}`.trim()
//         : user.username ||
//         "Unknown User";

//   return (
//     <NavbarClient
//       username={
//         user.username ||
//         ""
//       }
//       name={name}
//       firstName = {firstName}
//       role={role}
//       imageUrl={
//         user.imageUrl ||
//         "/noAvatar.png"
//       }
//       notificationBell={
//         <NotificationBell />
//       }
//     />
//   );
// };

// export default Navbar;








// import { currentUser } from "@clerk/nextjs/server";

// import NavbarClient from "@/components/NavbarClient";
// import NotificationBell from "@/components/notifications/NotificationBell";


// import prisma from "@/lib/prisma";

// const Navbar = async () => {
//   const user = await currentUser();

//   if (!user) {
//     return null;
//   }

//   const role =
//     (user.publicMetadata.role as string) ||
//     "guest";

//   /* ------------------------------------------------------------ */
//   /* RESOLVE PROFILE FROM SCHOOL DATABASE                          */
//   /* ------------------------------------------------------------ */

//   let databaseProfile:
//     | {
//         name?: string | null;
//         surname?: string | null;
//         img?: string | null;
//       }
//     | null = null;

//   try {
//     switch (role) {
//       case "teacher": {
//         databaseProfile = await prisma.teacher.findUnique({
//           where: {
//             id: user.id,
//           },
//           select: {
//             name: true,
//             surname: true,
//             img: true,
//           },
//         });

//         break;
//       }

//       case "student": {
//         databaseProfile = await prisma.student.findUnique({
//           where: {
//             id: user.id,
//           },
//           select: {
//             name: true,
//             surname: true,
//             img: true,
//           },
//         });

//         break;
//       }

//       /*
//        * Parent currently falls back to Clerk because the Parent
//        * code you shared does not currently persist an img field.
//        *
//        * We can enable this once Parent.img is added to Prisma.
//        */

//       default:
//         break;
//     }
//   } catch (error) {
//     /*
//      * A navbar/profile-photo failure should never crash
//      * the entire school dashboard.
//      */
//     console.error("NAVBAR PROFILE LOOKUP ERROR:", error);
//   }

//   /* ------------------------------------------------------------ */
//   /* DISPLAY NAME                                                  */
//   /* ------------------------------------------------------------ */

//   const databaseName = [
//     databaseProfile?.name,
//     databaseProfile?.surname,
//   ]
//     .filter(Boolean)
//     .join(" ")
//     .trim();

//   const clerkName = user.firstName
//     ? `${user.firstName} ${user.lastName || ""}`.trim()
//     : user.username || "Unknown User";

//   const name =
//     databaseName ||
//     clerkName;

//   const firstName =
//     databaseProfile?.name ||
//     user.firstName ||
//     user.username ||
//     "User";

//   /* ------------------------------------------------------------ */
//   /* PROFILE IMAGE                                                 */
//   /* ------------------------------------------------------------ */

//   const imageUrl =
//     databaseProfile?.img ||
//     user.imageUrl ||
//     "/noAvatar.png";

//   return (
//     <NavbarClient
//       username={user.username || ""}
//       name={name}
//       firstName={firstName}
//       role={role}
//       imageUrl={imageUrl}
//       notificationBell={
//         <NotificationBell />
//       }
//     />
//   );
// };

// export default Navbar;




import NavbarClient from "@/components/NavbarClient";

import NotificationBell from "@/components/notifications/NotificationBell";

import {
  getCurrentSchoolProfile,
} from "@/lib/users/current-school-profile";

const Navbar = async () => {
  const profile =
    await getCurrentSchoolProfile();

  if (!profile) {
    return null;
  }

  return (
    <NavbarClient
      username={
        profile.username
      }
      name={
        profile.name
      }
      firstName={
        profile.firstName
      }
      role={
        profile.role
      }
      imageUrl={
        profile.imageUrl
      }
      notificationBell={
        <NotificationBell />
      }
    />
  );
};

export default Navbar;