import { NextResponse } from "next/server";
import { getGoogleAuthUrl, isGoogleOAuthConfigured } from "@/lib/google";

function resolveRedirectUri(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    new URL(request.url).host;
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
  const origin = `${proto}://${host}`;

  // If on a public domain (e.g. gfgmeet.vercel.app), strictly use the live origin
  if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
    return `${origin}/api/auth/callback/google`;
  }

  // Otherwise fallback to GOOGLE_REDIRECT_URI or local origin
  return process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/callback/google`;
}

export async function GET(request: Request) {
  try {
    const redirectUri = resolveRedirectUri(request);
    const origin = new URL(redirectUri).origin;

    if (!isGoogleOAuthConfigured()) {
      const redirectTarget = new URL("/create-meeting", origin);
      redirectTarget.searchParams.set("google_error", "missing_credentials");
      return NextResponse.redirect(redirectTarget.toString());
    }

    const authUrl = getGoogleAuthUrl(redirectUri);
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("Error generating Google Auth URL:", error);
    const host = request.headers.get("host") || "localhost:3000";
    const origin = host.includes("localhost") ? "http://localhost:3000" : `https://${host}`;
    const redirectTarget = new URL("/create-meeting", origin);
    redirectTarget.searchParams.set("google_error", encodeURIComponent(error?.message || "auth_failed"));
    return NextResponse.redirect(redirectTarget.toString());
  }
}
