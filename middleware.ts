import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Redirect apex (gomesmer.com) to www so one canonical URL: https://www.gomesmer.com
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  if (host === "gomesmer.com") {
    const url = request.nextUrl.clone();
    url.host = "www.gomesmer.com";
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
