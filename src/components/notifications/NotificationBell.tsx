import {
  getUnreadNotificationCount,
  getUnseenNotificationCount,
  getUserNotifications,
} from "@/lib/notifications";

import NotificationBellClient from "./NotificationBellClient";

export default async function NotificationBell() {
  const [
    notifications,
    unreadCount,
    unseenCount,
  ] =
    await Promise.all([
      getUserNotifications({
        limit:
          8,
      }),

      getUnreadNotificationCount(),

      getUnseenNotificationCount(),
    ]);

  return (
    <NotificationBellClient
      notifications={
        notifications
      }
      unreadCount={
        unreadCount
      }
      unseenCount={
        unseenCount
      }
    />
  );
}