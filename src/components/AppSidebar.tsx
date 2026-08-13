// // src/components/AppSidebar.tsx
// import { currentUser } from "@clerk/nextjs/server";
// import AppSidebarClient from "./AppSidebarClient";

// export default async function AppSidebar() {
//   const user = await currentUser();

//   const role = (user?.publicMetadata.role as string) || "guest";
//   const name = user?.firstName
//     ? `${user.firstName} ${user.lastName || ""}`.trim()
//     : user?.username || "Unknown User";
//   const imageUrl = user?.imageUrl || "/noAvatar.png"; // fallback avatar

//   // return <AppSidebarClient role={role} name={name} />;
//   return <AppSidebarClient role={role} name={name} imageUrl={imageUrl} />;
// }





import AppSidebarClient from "./AppSidebarClient";

import {
  getCurrentSchoolProfile,
} from "@/lib/users/current-school-profile";

export default async function AppSidebar() {
  const profile =
    await getCurrentSchoolProfile();

  if (!profile) {
    return null;
  }

  return (
    <AppSidebarClient
      role={
        profile.role
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
    />
  );
}