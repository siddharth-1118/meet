import { NextResponse } from "next/server";
import {
  clearStoredGoogleTokens,
  getStoredGoogleTokens,
  isGoogleOAuthConfigured,
} from "@/lib/google";

export async function GET() {
  const isConfigured = isGoogleOAuthConfigured();
  const tokens = getStoredGoogleTokens();
  const isConnected = Boolean(tokens && (tokens.accessToken || tokens.refreshToken));

  return NextResponse.json({
    isConfigured,
    isConnected,
    email: tokens?.userEmail || null,
    hasRefreshToken: Boolean(tokens?.refreshToken),
  });
}

export async function DELETE() {
  clearStoredGoogleTokens();
  return NextResponse.json({
    success: true,
    isConnected: false,
    message: "Google account disconnected successfully",
  });
}
