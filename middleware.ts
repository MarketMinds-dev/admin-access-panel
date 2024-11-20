import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("sessionToken")?.value;

  if (!sessionToken && request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionToken) {
    try {
      const session = JSON.parse(atob(sessionToken));
      if (
        session.role !== "ADMIN" &&
        request.nextUrl.pathname.startsWith("/admin")
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch {
      // If the session token is invalid, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
