import { NextResponse } from "next/server";
import {
  createGoogleMeetEvent,
  getStoredGoogleTokens,
  isGoogleOAuthConfigured,
} from "@/lib/google";
import { db } from "@/drizzle/db";
import { meetings, participants, invitations } from "@/drizzle/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title = "New Google Meet Session",
      description = "",
      agenda = "",
      startTime,
      duration = 60,
      timezone = "UTC",
      attendees = [],
      networkId = "design-guild",
      hostId = "user-default",
      meetingType = "scheduled",
      allowFallback = false,
      sendNotifications = true,
      guestsCanInviteOthers = false,
    } = body;

    const start = startTime ? new Date(startTime) : new Date();
    const end = new Date(start.getTime() + Number(duration) * 60 * 1000);

    const isConfigured = isGoogleOAuthConfigured();
    const tokens = getStoredGoogleTokens();
    const isConnected = Boolean(tokens && (tokens.accessToken || tokens.refreshToken));

    let meetLink = "";
    let googleEventId: string | null = null;
    let htmlLink: string | null = null;
    let usedRealGoogleApi = false;

    if (isConnected) {
      try {
        const attendeeList: string[] = Array.isArray(attendees)
          ? attendees
          : typeof attendees === "string"
          ? attendees.split(",").map((s) => s.trim()).filter(Boolean)
          : [];

        const gEvent = await createGoogleMeetEvent({
          title,
          description,
          agenda,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          timezone,
          attendees: attendeeList,
          sendNotifications,
          guestsCanInviteOthers,
        });

        meetLink = gEvent.meetLink;
        googleEventId = gEvent.eventId;
        htmlLink = gEvent.htmlLink;
        usedRealGoogleApi = true;
      } catch (err: any) {
        console.error("Google Calendar API create error:", err);
        if (!allowFallback) {
          return NextResponse.json(
            {
              error: "google_api_error",
              message: err?.message || "Failed to create event in Google Calendar",
            },
            { status: 500 }
          );
        }
      }
    }

    // Fallback if not connected or test mode
    if (!meetLink) {
      if (!allowFallback && !isConnected) {
        return NextResponse.json(
          {
            error: "google_not_connected",
            message: "Google account is not connected. Please connect your Google account to create real Google Meet sessions.",
            isConfigured,
          },
          { status: 400 }
        );
      }

      // Generate a simulated Google Meet link format for dev/preview
      const chars = "abcdefghijklmnopqrstuvwxyz";
      const randPart = (len: number) =>
        Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      meetLink = `https://meet.google.com/${randPart(3)}-${randPart(4)}-${randPart(3)}`;
    }

    const meetingId = `meet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    db.insert(meetings)
      .values({
        id: meetingId,
        networkId,
        hostId,
        title,
        description,
        agenda,
        type: meetingType,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        timezone,
        status: "scheduled",
        waitingRoom: true,
        recording: false,
        captions: true,
        meetLink,
        provider: "google",
        googleEventId,
      })
      .run();

    // Insert invitations if attendees were provided
    const attendeeList: string[] = Array.isArray(attendees)
      ? attendees
      : typeof attendees === "string"
      ? attendees.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    for (const email of attendeeList) {
      db.insert(invitations)
        .values({
          id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          meetingId,
          inviterId: hostId,
          inviteeEmail: email,
          status: "pending",
        })
        .run();
    }

    return NextResponse.json({
      success: true,
      meeting: {
        id: meetingId,
        title,
        meetLink,
        htmlLink,
        googleEventId,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        timezone,
        provider: "google",
        usedRealGoogleApi,
      },
    });
  } catch (error: any) {
    console.error("Error creating Google meeting:", error);
    return NextResponse.json(
      { error: "server_error", message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
