import { NextResponse } from "next/server";
import { getGoogleAuthUrl, isGoogleOAuthConfigured } from "@/lib/google";

export async function GET(request: Request) {
  try {
    if (!isGoogleOAuthConfigured()) {
      const url = new URL(request.url);
      const redirectTarget = new URL("/create-meeting", url.origin);
      redirectTarget.searchParams.set("google_error", "missing_credentials");
      return NextResponse.redirect(redirectTarget.toString());
    }

    const authUrl = getGoogleAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("Error generating Google Auth URL:", error);
    const url = new URL(request.url);
    const redirectTarget = new URL("/create-meeting", url.origin);
    redirectTarget.searchParams.set("google_error", encodeURIComponent(error?.message || "auth_failed"));
    return NextResponse.redirect(redirectTarget.toString());
  }
}
