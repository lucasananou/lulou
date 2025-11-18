import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/app(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  try {
    if (isProtectedRoute(req)) {
      const authObj = await auth();
      if (!authObj?.userId) {
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set("redirect_url", req.url);
        return NextResponse.redirect(signInUrl);
      }
    }
  } catch (error) {
    console.error("Middleware error:", error);
    // En cas d'erreur, rediriger vers sign-in
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

