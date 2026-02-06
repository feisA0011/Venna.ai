import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) {
    return;
  }

  const session = await auth();
  if (!session.userId) {
    return session.redirectToSignIn();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
