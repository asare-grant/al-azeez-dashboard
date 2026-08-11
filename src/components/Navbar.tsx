import {
  currentUser,
} from "@clerk/nextjs/server";

import NavbarClient from "@/components/NavbarClient";

import NotificationBell from "@/components/notifications/NotificationBell";

const Navbar = async () => {
  const user =
    await currentUser();

  if (!user) {
    return null;
  }

  const role =
    (user.publicMetadata.role as string) ||
    "guest";

  const name =
    user.firstName
      ? `${user.firstName} ${
          user.lastName || ""
        }`.trim()
      : user.username ||
        "Unknown User";
    
  const firstName =
        user.firstName 
        ? `${user.firstName}`.trim()
        : user.username ||
        "Unknown User";

  return (
    <NavbarClient
      username={
        user.username ||
        ""
      }
      name={name}
      firstName = {firstName}
      role={role}
      imageUrl={
        user.imageUrl ||
        "/noAvatar.png"
      }
      notificationBell={
        <NotificationBell />
      }
    />
  );
};

export default Navbar;