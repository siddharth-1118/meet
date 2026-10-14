import { NextResponse } from "next/server";
import { getOAuth2Client, saveGoogleTokens } from "@/lib/google";
import { google } from "googleapis";

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

  return process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/callback/google`;
}

export async function GET(request: Request) {
  const redirectUri = resolveRedirectUri(request);
  const origin = new URL(redirectUri).origin;

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const errorParam = url.searchParams.get("error");

  const redirectTarget = new URL("/create-meeting", origin);

  if (errorParam) {
    redirectTarget.searchParams.set("google_error", errorParam);
    return NextResponse.redirect(redirectTarget.toString());
  }

  if (!code) {
    redirectTarget.searchParams.set("google_error", "no_code_provided");
    return NextResponse.redirect(redirectTarget.toString());
  }

  try {
    const oauth2Client = getOAuth2Client(redirectUri);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    let userEmail: string | undefined = undefined;
    try {
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const userinfo = await oauth2.userinfo.get();
      userEmail = userinfo.data.email || undefined;
    } catch (e) {
      console.warn("Could not fetch userinfo during Google OAuth callback:", e);
    }

    await saveGoogleTokens(tokens, userEmail);

    redirectTarget.searchParams.set("google_connected", "true");
    if (userEmail) {
      redirectTarget.searchParams.set("google_email", userEmail);
    }
    return NextResponse.redirect(redirectTarget.toString());
  } catch (error: any) {
    console.error("Google OAuth token exchange error:", error);
    redirectTarget.searchParams.set(
      "google_error",
      encodeURIComponent(error?.message || "token_exchange_failed")
    );
    return NextResponse.redirect(redirectTarget.toString());
  }
}
