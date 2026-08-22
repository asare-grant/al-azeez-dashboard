// // src/components/AppSidebar.tsx
// import AppSidebarClient from "./AppSidebarClient";

// import {
//   getCurrentSchoolProfile,
// } from "@/lib/users/current-school-profile";

// export default async function AppSidebar() {
//   const profile =
//     await getCurrentSchoolProfile();

//   if (!profile) {
//     return null;
//   }

//   return (
//     <AppSidebarClient
//       role={
//         profile.role
//       }
//       name={
//         profile.name
//       }
//       username={
//         profile.username
//       }
//       imageUrl={
//         profile.imageUrl
//       }
//     />
//   );
// }





// src/components/AppSidebar.tsx

import AppSidebarClient from "./AppSidebarClient";

import {
  getCurrentSchoolProfile,
} from "@/lib/users/current-school-profile";

import {
  getCurrentAccessContext,
} from "@/lib/access-control";

export default async function AppSidebar() {
  const [
    profile,
    accessContext,
  ] =
    await Promise.all([
      getCurrentSchoolProfile(),
      getCurrentAccessContext(),
    ]);

  if (!profile) {
    return null;
  }

  return (
    <AppSidebarClient
      role={
        profile.role
      }
      roleKey={
        profile.roleKey
      }
      name={
        profile.name
      }
      username={
        profile.username
      }
      imageUrl={
        profile.imageUrl
      }
      permissions={
        Array.from(
          accessContext.permissions,
        )
      }
    />
  );
}