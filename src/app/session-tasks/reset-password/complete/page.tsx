import {
  auth,
} from "@clerk/nextjs/server";

import {
  redirect,
} from "next/navigation";

export default async function PasswordResetCompletePage() {
  const {
    userId,
    sessionClaims,
  } = await auth({
    treatPendingAsSignedOut: false,
  });

  if (!userId) {
    redirect("/sign-in");
  }

  const role =
    (
      sessionClaims?.publicMetadata as
        | {
            role?: string;
          }
        | undefined
    )?.role ||
    (
      sessionClaims?.metadata as
        | {
            role?: string;
          }
        | undefined
    )?.role ||
    null;

  switch (
    role
      ?.trim()
      .toLowerCase()
  ) {
    case "admin":
      redirect("/admin");

    case "teacher":
      redirect("/teacher");

    case "student":
      redirect("/student");

    case "parent":
      redirect("/parent");

    case "account":
      redirect("/account");

    default:
      redirect("/");
  }
}