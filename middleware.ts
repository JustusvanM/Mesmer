import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const url = request.nextUrl;

  if (host.toLowerCase().startsWith("www.")) {
    const newHost = host.replace(/^www\./i, "");
    const canonicalUrl = new URL(request.url);
    canonicalUrl.host = newHost;
    canonicalUrl.protocol = "https:";
    return NextResponse.redirect(canonicalUrl, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
