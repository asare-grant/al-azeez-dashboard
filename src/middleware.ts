import { clerkMiddleware, createRouteMatcher, auth } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";

const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}));

export default clerkMiddleware(async (auth, req) => {
  // ✅ Directly access sessionClaims
  const { sessionClaims } = await auth();

  // ✅ Get role from publicMetadata or metadata
  const role =
    (sessionClaims?.publicMetadata as { role?: string })?.role ||
    (sessionClaims?.metadata as { role?: string })?.role ||
    ""; // fallback

  console.log("Detected role:", role);

  // ✅ Route restriction check
  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req) && !allowedRoles.includes(role)) {
      // Redirect unauthorized users to their dashboard
      return NextResponse.redirect(new URL(`/${role}`, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};







// import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
// import { routeAccessMap } from "./lib/settings";
// import { NextResponse } from "next/server";

// const matchers = Object.keys(routeAccessMap).map((route) => ({
//   matcher: createRouteMatcher([route]),
//   allowedRoles: routeAccessMap[route],
// }));

// export default clerkMiddleware(async (auth, req) => {
  // // ✅ Call auth() properly (since we’re inside clerkMiddleware)
  // const { userId } = auth();

//   if (!userId) {
//     console.warn("⚠️ No user found, redirecting to /sign-in");
//     return NextResponse.redirect(new URL("/sign-in", req.url));
//   }

//   // ✅ Fetch user info from Clerk to access metadata
//   const user = await clerkClient.users.getUser(userId);

//   const role =
//     (user.publicMetadata?.role as string) ||
//     (user.privateMetadata?.role as string) ||
//     "student"; // fallback

//   console.log(`✅ Detected role: ${role} | Path: ${req.nextUrl.pathname}`);

//   // ✅ Protect routes
//   for (const { matcher, allowedRoles } of matchers) {
//     if (matcher(req) && !allowedRoles.includes(role)) {
//       console.warn(`🚫 Access denied for role "${role}" on path "${req.nextUrl.pathname}"`);
//       return NextResponse.redirect(new URL(`/${role}`, req.url));
//     }
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     "/(api|trpc)(.*)",
//   ],
// };