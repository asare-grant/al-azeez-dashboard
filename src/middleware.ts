// // src/middleware.ts
// import { clerkMiddleware, createRouteMatcher, auth } from "@clerk/nextjs/server";
// import { routeAccessMap } from "./lib/settings";
// import { NextResponse } from "next/server";

// const matchers = Object.keys(routeAccessMap).map((route) => ({
//   matcher: createRouteMatcher([route]),
//   allowedRoles: routeAccessMap[route],
// }));

// export default clerkMiddleware(async (auth, req) => {
//   // ✅ Directly access sessionClaims
//   const { sessionClaims } = await auth();

//   // ✅ Get role from publicMetadata or metadata
//   const role =
//     (sessionClaims?.publicMetadata as { role?: string })?.role ||
//     (sessionClaims?.metadata as { role?: string })?.role ||
//     ""; // fallback

//   console.log("Detected role:", role);

//   // ✅ Route restriction check
//   for (const { matcher, allowedRoles } of matchers) {
//     if (matcher(req) && !allowedRoles.includes(role)) {
//       // Redirect unauthorized users to their dashboard
//       return NextResponse.redirect(new URL(`/${role}`, req.url));
//     }
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     // Skip Next.js internals and static files
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     // Always run for API routes
//     "/(api|trpc)(.*)",
//   ],
// };





// src/middleware.ts

import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

import { routeAccessMap } from "./lib/settings";

/* -------------------------------------------------------------------------- */
/* ROLE-BASED ROUTES                                                          */
/* -------------------------------------------------------------------------- */

const matchers = Object.keys(
  routeAccessMap,
).map((route) => ({
  matcher:
    createRouteMatcher([
      route,
    ]),

  allowedRoles:
    routeAccessMap[
      route
    ],
}));

/* -------------------------------------------------------------------------- */
/* SESSION TASK ROUTES                                                        */
/* -------------------------------------------------------------------------- */

/*
 * IMPORTANT:
 *
 * A user whose password has been marked as compromised
 * has a PENDING Clerk session.
 *
 * The reset-password page must remain reachable while
 * that session is pending.
 */
const isSessionTaskRoute =
  createRouteMatcher([
    "/session-tasks(.*)",
  ]);

/* -------------------------------------------------------------------------- */
/* SIGN-IN ROUTE                                                              */
/* -------------------------------------------------------------------------- */

const isSignInRoute =
  createRouteMatcher([
    "/sign-in(.*)",
  ]);

/* -------------------------------------------------------------------------- */
/* CLERK MIDDLEWARE                                                           */
/* -------------------------------------------------------------------------- */

export default clerkMiddleware(
  async (
    auth,
    req,
  ) => {
    const {
      sessionClaims,
      sessionStatus,
    } =
      await auth();

    /* ---------------------------------------------------------------------- */
    /* SESSION TASK PAGE                                                      */
    /* ---------------------------------------------------------------------- */

    /*
     * NEVER redirect a pending user away from
     * /session-tasks/reset-password.
     *
     * This is the page they must be allowed to use
     * to complete the pending Clerk task.
     */
    if (
      isSessionTaskRoute(
        req,
      )
    ) {
      return NextResponse.next();
    }

    /* ---------------------------------------------------------------------- */
    /* PENDING SESSION                                                        */
    /* ---------------------------------------------------------------------- */

    /*
     * Authentication succeeded, but Clerk has a required
     * session task that must be completed.
     *
     * In our current application the pending task we support
     * is reset-password.
     */
    if (
      sessionStatus ===
      "pending"
    ) {
      const url =
        req.nextUrl.clone();

      url.pathname =
        "/session-tasks/reset-password";

      return NextResponse.redirect(
        url,
      );
    }

    /* ---------------------------------------------------------------------- */
    /* NORMAL ROLE                                                            */
    /* ---------------------------------------------------------------------- */

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
      "";

    console.log(
      "Detected role:",
      role,
    );

    /* ---------------------------------------------------------------------- */
    /* SIGN-IN                                                                */
    /* ---------------------------------------------------------------------- */

    /*
     * Let the sign-in page itself handle normal signed-in
     * navigation. Do not apply dashboard role matching here.
     */
    if (
      isSignInRoute(
        req,
      )
    ) {
      return NextResponse.next();
    }

    /* ---------------------------------------------------------------------- */
    /* ROLE RESTRICTION                                                       */
    /* ---------------------------------------------------------------------- */

    for (
      const {
        matcher,
        allowedRoles,
      } of matchers
    ) {
      if (
        matcher(req) &&
        !allowedRoles.includes(
          role,
        )
      ) {
        /*
         * Only redirect when we actually know the role.
         *
         * This prevents redirects such as "/" caused by:
         *
         * new URL(`/${role}`, ...)
         *
         * when role === "".
         */
        if (
          role
        ) {
          return NextResponse.redirect(
            new URL(
              `/${role}`,
              req.url,
            ),
          );
        }

        return NextResponse.redirect(
          new URL(
            "/sign-in",
            req.url,
          ),
        );
      }
    }

    return NextResponse.next();
  },
);

/* -------------------------------------------------------------------------- */
/* CONFIG                                                                     */
/* -------------------------------------------------------------------------- */

export const config = {
  matcher: [
    /*
     * Skip Next.js internals and static files.
     */
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    /*
     * Always run for API routes.
     */
    "/(api|trpc)(.*)",

    /*
     * Clerk frontend API routes.
     *
     * Recommended by current Clerk Next.js configuration.
     */
    "/__clerk/(.*)",
  ],
};