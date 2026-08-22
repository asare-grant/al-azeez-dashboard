// src/components/Navbar.tsx

import NavbarClient from "@/components/NavbarClient";

import NotificationBell from "@/components/notifications/NotificationBell";

import {
  contextHasPermission,
  getCurrentAccessContext,
} from "@/lib/access-control";

import {
  getCurrentSchoolProfile,
} from "@/lib/users/current-school-profile";

const Navbar =
  async () => {
    const [
      profile,
      accessContext,
    ] =
      await Promise.all([
        getCurrentSchoolProfile(),
        getCurrentAccessContext(),
      ]);

    if (
      !profile
    ) {
      return null;
    }

    const canViewSettings =
      Boolean(
        accessContext &&
          (
            contextHasPermission(
              accessContext,
              "settings.view",
            ) ||
            contextHasPermission(
              accessContext,
              "settings.manage",
            )
          ),
      );

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
        canViewSettings={
          canViewSettings
        }
      />
    );
  };

export default Navbar;