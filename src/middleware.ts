// src/middleware.ts

import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

import {
  NextResponse,
} from "next/server";

import {
  routeAccessMap,
} from "./lib/settings";

/* ========================================================================== */
/* LEGACY ROLE-BASED ROUTES                                                   */
/* ========================================================================== */

/*
 * Transitional only.
 *
 * New RBAC authorization should be enforced close to
 * the page, service or API resource itself.
 */
const matchers =
  Object.keys(
    routeAccessMap,
  ).map(
    (
      route,
    ) => ({
      matcher:
        createRouteMatcher([
          route,
        ]),

      allowedRoles:
        routeAccessMap[
          route
        ],
    }),
  );

/* ========================================================================== */
/* SPECIAL ROUTES                                                             */
/* ========================================================================== */

const isSessionTaskRoute =
  createRouteMatcher([
    "/session-tasks(.*)",
  ]);

const isSignInRoute =
  createRouteMatcher([
    "/sign-in(.*)",
  ]);

/*
 * Universal authenticated landing route.
 *
 * We will create this next.
 */
const isDashboardGateway =
  createRouteMatcher([
    "/dashboard(.*)",
  ]);

/* ========================================================================== */
/* NORMALIZE ROLE                                                             */
/* ========================================================================== */

function normalizeRole(
  value:
    unknown,
) {
  return typeof value ===
    "string"
    ? value
        .trim()
        .toLowerCase()
    : "";
}

/* ========================================================================== */
/* CLERK MIDDLEWARE                                                           */
/* ========================================================================== */

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
    /* SESSION TASK                                                           */
    /* ---------------------------------------------------------------------- */

    if (
      isSessionTaskRoute(
        req,
      )
    ) {
      return NextResponse.next();
    }

    /* ---------------------------------------------------------------------- */
    /* PENDING CLERK SESSION                                                  */
    /* ---------------------------------------------------------------------- */

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
    /* ROLE CLAIM                                                             */
    /* ---------------------------------------------------------------------- */

    const rawRole =
      (
        sessionClaims
          ?.publicMetadata as
          | {
              role?:
                unknown;
            }
          | undefined
      )?.role ??
      (
        sessionClaims
          ?.metadata as
          | {
              role?:
                unknown;
            }
          | undefined
      )?.role;

    const role =
      normalizeRole(
        rawRole,
      );

    console.log(
      "Detected role:",
      role,
    );

    /* ---------------------------------------------------------------------- */
    /* AUTH ROUTES                                                            */
    /* ---------------------------------------------------------------------- */

    /*
     * Do not apply dashboard-role restrictions to
     * sign-in itself.
     */
    if (
      isSignInRoute(
        req,
      )
    ) {
      return NextResponse.next();
    }

    /*
     * The universal dashboard gateway must remain
     * reachable for any authenticated identity.
     */
    if (
      isDashboardGateway(
        req,
      )
    ) {
      return NextResponse.next();
    }

    /* ---------------------------------------------------------------------- */
    /* TRANSITIONAL ROUTE CHECK                                               */
    /* ---------------------------------------------------------------------- */

    for (
      const {
        matcher,
        allowedRoles,
      } of matchers
    ) {
      if (
        !matcher(
          req,
        )
      ) {
        continue;
      }

      if (
        allowedRoles.includes(
          role,
        )
      ) {
        continue;
      }

      /*
       * IMPORTANT:
       *
       * Never redirect to:
       *
       * /${role}
       *
       * A Clerk/RBAC role does NOT need to have its own
       * physical Next.js dashboard.
       *
       * Instead, send the authenticated identity through
       * the universal dashboard resolver.
       */
      if (
        role
      ) {
        return NextResponse.redirect(
          new URL(
            "/dashboard",
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

    return NextResponse.next();
  },
);

/* ========================================================================== */
/* CONFIG                                                                     */
/* ========================================================================== */

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    "/(api|trpc)(.*)",

    "/__clerk/(.*)",
  ],
};






// // src/middleware.ts

// import {
//   clerkMiddleware,
//   createRouteMatcher,
// } from "@clerk/nextjs/server";

// import { NextResponse } from "next/server";

// import { routeAccessMap } from "./lib/settings";

// /* -------------------------------------------------------------------------- */
// /* ROLE-BASED ROUTES                                                          */
// /* -------------------------------------------------------------------------- */

// const matchers = Object.keys(
//   routeAccessMap,
// ).map((route) => ({
//   matcher:
//     createRouteMatcher([
//       route,
//     ]),

//   allowedRoles:
//     routeAccessMap[
//       route
//     ],
// }));

// /* -------------------------------------------------------------------------- */
// /* SESSION TASK ROUTES                                                        */
// /* -------------------------------------------------------------------------- */

// /*
//  * IMPORTANT:
//  *
//  * A user whose password has been marked as compromised
//  * has a PENDING Clerk session.
//  *
//  * The reset-password page must remain reachable while
//  * that session is pending.
//  */
// const isSessionTaskRoute =
//   createRouteMatcher([
//     "/session-tasks(.*)",
//   ]);

// /* -------------------------------------------------------------------------- */
// /* SIGN-IN ROUTE                                                              */
// /* -------------------------------------------------------------------------- */

// const isSignInRoute =
//   createRouteMatcher([
//     "/sign-in(.*)",
//   ]);

// /* -------------------------------------------------------------------------- */
// /* CLERK MIDDLEWARE                                                           */
// /* -------------------------------------------------------------------------- */

// export default clerkMiddleware(
//   async (
//     auth,
//     req,
//   ) => {
//     const {
//       sessionClaims,
//       sessionStatus,
//     } =
//       await auth();

//     /* ---------------------------------------------------------------------- */
//     /* SESSION TASK PAGE                                                      */
//     /* ---------------------------------------------------------------------- */

//     /*
//      * NEVER redirect a pending user away from
//      * /session-tasks/reset-password.
//      *
//      * This is the page they must be allowed to use
//      * to complete the pending Clerk task.
//      */
//     if (
//       isSessionTaskRoute(
//         req,
//       )
//     ) {
//       return NextResponse.next();
//     }

//     /* ---------------------------------------------------------------------- */
//     /* PENDING SESSION                                                        */
//     /* ---------------------------------------------------------------------- */

//     /*
//      * Authentication succeeded, but Clerk has a required
//      * session task that must be completed.
//      *
//      * In our current application the pending task we support
//      * is reset-password.
//      */
//     if (
//       sessionStatus ===
//       "pending"
//     ) {
//       const url =
//         req.nextUrl.clone();

//       url.pathname =
//         "/session-tasks/reset-password";

//       return NextResponse.redirect(
//         url,
//       );
//     }

//     /* ---------------------------------------------------------------------- */
//     /* NORMAL ROLE                                                            */
//     /* ---------------------------------------------------------------------- */

//     const role =
//       (
//         sessionClaims?.publicMetadata as
//           | {
//               role?: string;
//             }
//           | undefined
//       )?.role ||
//       (
//         sessionClaims?.metadata as
//           | {
//               role?: string;
//             }
//           | undefined
//       )?.role ||
//       "";

//     console.log(
//       "Detected role:",
//       role,
//     );

//     /* ---------------------------------------------------------------------- */
//     /* SIGN-IN                                                                */
//     /* ---------------------------------------------------------------------- */

//     /*
//      * Let the sign-in page itself handle normal signed-in
//      * navigation. Do not apply dashboard role matching here.
//      */
//     if (
//       isSignInRoute(
//         req,
//       )
//     ) {
//       return NextResponse.next();
//     }

//     /* ---------------------------------------------------------------------- */
//     /* ROLE RESTRICTION                                                       */
//     /* ---------------------------------------------------------------------- */

//     for (
//       const {
//         matcher,
//         allowedRoles,
//       } of matchers
//     ) {
//       if (
//         matcher(req) &&
//         !allowedRoles.includes(
//           role,
//         )
//       ) {
//         /*
//          * Only redirect when we actually know the role.
//          *
//          * This prevents redirects such as "/" caused by:
//          *
//          * new URL(`/${role}`, ...)
//          *
//          * when role === "".
//          */
//         if (
//           role
//         ) {
//           return NextResponse.redirect(
//             new URL(
//               `/${role}`,
//               req.url,
//             ),
//           );
//         }

//         return NextResponse.redirect(
//           new URL(
//             "/sign-in",
//             req.url,
//           ),
//         );
//       }
//     }

//     return NextResponse.next();
//   },
// );

// /* -------------------------------------------------------------------------- */
// /* CONFIG                                                                     */
// /* -------------------------------------------------------------------------- */

// export const config = {
//   matcher: [
//     /*
//      * Skip Next.js internals and static files.
//      */
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

//     /*
//      * Always run for API routes.
//      */
//     "/(api|trpc)(.*)",

//     /*
//      * Clerk frontend API routes.
//      *
//      * Recommended by current Clerk Next.js configuration.
//      */
//     "/__clerk/(.*)",
//   ],
// };