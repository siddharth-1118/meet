import { NextResponse } from "next/server";
import { getOAuth2Client, saveGoogleTokens } from "@/lib/google";
import { google } from "googleapis";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const errorParam = url.searchParams.get("error");

  const redirectTarget = new URL("/create-meeting", url.origin);

  if (errorParam) {
    redirectTarget.searchParams.set("google_error", errorParam);
    return NextResponse.redirect(redirectTarget.toString());
  }

  if (!code) {
    redirectTarget.searchParams.set("google_error", "no_code_provided");
    return NextResponse.redirect(redirectTarget.toString());
  }

  try {
    const oauth2Client = getOAuth2Client();
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
