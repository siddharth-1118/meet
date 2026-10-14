import { google } from "googleapis";
import { db, sqlite } from "@/drizzle/db";
import { googleTokens } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID.trim() !== "" &&
    process.env.GOOGLE_CLIENT_SECRET.trim() !== "" &&
    !process.env.GOOGLE_CLIENT_ID.includes("your-google-client-id")
  );
}

export function getOAuth2Client(customRedirectUri?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    customRedirectUri ||
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/api/auth/callback/google";

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getGoogleAuthUrl(customRedirectUri?: string): string {
  const oauth2Client = getOAuth2Client(customRedirectUri);

  const scopes = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });
}

export async function saveGoogleTokens(
  tokens: {
    access_token?: string | null;
    refresh_token?: string | null;
    expiry_date?: number | null;
    token_type?: string | null;
    scope?: string | null;
  },
  userEmail?: string
) {
  const existing = db
    .select()
    .from(googleTokens)
    .where(eq(googleTokens.id, "default"))
    .get();

  const refreshToken = tokens.refresh_token || existing?.refreshToken;

  if (existing) {
    db.update(googleTokens)
      .set({
        accessToken: tokens.access_token || existing.accessToken,
        refreshToken: refreshToken,
        expiryDate: tokens.expiry_date ? Math.floor(tokens.expiry_date) : existing.expiryDate,
        tokenType: tokens.token_type || existing.tokenType,
        scope: tokens.scope || existing.scope,
        userEmail: userEmail || existing.userEmail,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(googleTokens.id, "default"))
      .run();
  } else {
    db.insert(googleTokens)
      .values({
        id: "default",
        accessToken: tokens.access_token || null,
        refreshToken: tokens.refresh_token || null,
        expiryDate: tokens.expiry_date ? Math.floor(tokens.expiry_date) : null,
        tokenType: tokens.token_type || null,
        scope: tokens.scope || null,
        userEmail: userEmail || null,
        updatedAt: new Date().toISOString(),
      })
      .run();
  }
}

export function getStoredGoogleTokens() {
  try {
    const row = db
      .select()
      .from(googleTokens)
      .where(eq(googleTokens.id, "default"))
      .get();
    return row || null;
  } catch (error) {
    console.error("Error reading google tokens from DB:", error);
    return null;
  }
}

export function clearStoredGoogleTokens() {
  try {
    db.delete(googleTokens).where(eq(googleTokens.id, "default")).run();
  } catch (error) {
    console.error("Error clearing google tokens:", error);
  }
}

export async function getAuthenticatedCalendarClient() {
  const tokens = getStoredGoogleTokens();
  if (!tokens || (!tokens.accessToken && !tokens.refreshToken)) {
    throw new Error("No Google tokens available. Please connect Google Account first.");
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokens.accessToken || undefined,
    refresh_token: tokens.refreshToken || undefined,
    expiry_date: tokens.expiryDate || undefined,
    token_type: tokens.tokenType || undefined,
  });

  // Listen for refresh tokens
  oauth2Client.on("tokens", (newTokens) => {
    saveGoogleTokens(newTokens, tokens.userEmail || undefined);
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export interface CreateGoogleMeetOptions {
  title: string;
  description?: string;
  agenda?: string;
  startTime: string; // ISO string or parsable date
  endTime: string;   // ISO string or parsable date
  timezone?: string;
  attendees?: string[];
  sendNotifications?: boolean;
  guestsCanInviteOthers?: boolean;
}

export async function createGoogleMeetEvent(options: CreateGoogleMeetOptions) {
  const calendar = await getAuthenticatedCalendarClient();

  const startIso = new Date(options.startTime).toISOString();
  const endIso = new Date(options.endTime).toISOString();
  const tz = options.timezone || "UTC";

  let description = options.description || "";
  if (options.agenda) {
    description += `\n\nAgenda:\n${options.agenda}`;
  }

  const requestId = `nexmeet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const response = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    sendUpdates: options.sendNotifications === false ? "none" : "all",
    requestBody: {
      summary: options.title || "NexMeet Meeting",
      description: description.trim(),
      start: {
        dateTime: startIso,
        timeZone: tz,
      },
      end: {
        dateTime: endIso,
        timeZone: tz,
      },
      attendees: options.attendees?.filter(Boolean).map((email) => ({ email: email.trim() })),
      guestsCanInviteOthers: Boolean(options.guestsCanInviteOthers),
      guestsCanModify: false,
      guestsCanSeeOtherGuests: true,
      conferenceData: {
        createRequest: {
          requestId: requestId,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    },
  });

  const event = response.data;

  // Extract Google Meet link
  let meetLink = event.hangoutLink;
  if (!meetLink && event.conferenceData?.entryPoints) {
    const videoEntry = event.conferenceData.entryPoints.find(
      (ep) => ep.entryPointType === "video"
    );
    if (videoEntry?.uri) {
      meetLink = videoEntry.uri;
    }
  }

  return {
    eventId: event.id || "",
    meetLink: meetLink || "",
    htmlLink: event.htmlLink || "",
    summary: event.summary || options.title,
    start: event.start?.dateTime || startIso,
    end: event.end?.dateTime || endIso,
  };
}
