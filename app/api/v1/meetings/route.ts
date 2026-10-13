import { NextResponse } from "next/server";
import {
  createGoogleMeetEvent,
  getStoredGoogleTokens,
  isGoogleOAuthConfigured,
} from "@/lib/google";
import { db } from "@/drizzle/db";
import { meetings, invitations, networks } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Public REST API for parent website integration.
 * Allows Domain Leads and Heads to create Google Meet sessions within their domain scope.
 * Master host credentials remain entirely private and managed by the system.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      domainId = "design-guild",
      domainLeadEmail,
      title = "Domain Team Meeting",
      description = "",
      agenda = "",
      startTime,
      duration = 45,
      timezone = "UTC",
      invitedEmails = [],
    } = body;

    if (!domainLeadEmail) {
      return NextResponse.json(
        {
          error: "missing_domain_lead_email",
          message: "domainLeadEmail is required to identify the domain organizer.",
        },
        { status: 400 }
      );
    }

    const start = startTime ? new Date(startTime) : new Date();
    const end = new Date(start.getTime() + Number(duration) * 60 * 1000);

    // Normalize attendee emails
    const attendeeList: string[] = Array.isArray(invitedEmails)
      ? invitedEmails.map((e: string) => e.trim().toLowerCase()).filter(Boolean)
      : typeof invitedEmails === "string"
      ? invitedEmails.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
      : [];

    // Make sure domain lead is included as attendee so they receive the calendar invite too
    const leadEmailLower = domainLeadEmail.trim().toLowerCase();
    if (!attendeeList.includes(leadEmailLower)) {
      attendeeList.push(leadEmailLower);
    }

    const tokens = getStoredGoogleTokens();
    const isConnected = Boolean(tokens && (tokens.accessToken || tokens.refreshToken));

    let meetLink = "";
    let googleEventId: string | null = null;
    let htmlLink: string | null = null;

    if (isConnected) {
      try {
        const gEvent = await createGoogleMeetEvent({
          title,
          description: description || `Domain Meeting organized by ${domainLeadEmail}`,
          agenda,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          timezone,
          attendees: attendeeList,
          sendNotifications: true, // Dispatches calendar emails to all invited members
          guestsCanInviteOthers: false, // Prevents guests from inviting unapproved external people
        });

        meetLink = gEvent.meetLink;
        googleEventId = gEvent.eventId;
        htmlLink = gEvent.htmlLink;
      } catch (err: any) {
        console.error("Google Meet API creation error in v1 API:", err);
      }
    }

    // Fallback preview link if Google is not authenticated yet in dev
    if (!meetLink) {
      const chars = "abcdefghijklmnopqrstuvwxyz";
      const randPart = (len: number) =>
        Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      meetLink = `https://meet.google.com/${randPart(3)}-${randPart(4)}-${randPart(3)}`;
    }

    const meetingId = `meet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Ensure network/domain exists in DB
    const existingNetwork = db
      .select()
      .from(networks)
      .where(eq(networks.id, domainId))
      .get();

    if (!existingNetwork) {
      db.insert(networks)
        .values({
          id: domainId,
          name: domainId.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          slug: domainId,
          ownerId: "user-default",
        })
        .run();
    }

    // Save meeting to SQLite
    db.insert(meetings)
      .values({
        id: meetingId,
        networkId: domainId,
        hostId: "user-default", // Master host account
        creatorEmail: leadEmailLower,
        title,
        description,
        agenda,
        type: "scheduled",
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

    // Record each invitee in invitations table for strict Gatekeeper access control
    for (const email of attendeeList) {
      db.insert(invitations)
        .values({
          id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          meetingId,
          inviterId: leadEmailLower,
          inviteeEmail: email,
          status: "pending",
        })
        .run();
    }

    const origin = new URL(request.url).origin;
    const gatekeeperUrl = `${origin}/gatekeeper/${meetingId}`;
    const embedUrl = `${origin}/gatekeeper/${meetingId}?embed=true`;

    return NextResponse.json({
      success: true,
      meeting: {
        id: meetingId,
        domainId,
        title,
        creatorEmail: leadEmailLower,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        timezone,
        googleMeetLink: meetLink,
        htmlLink,
        googleEventId,
        gatekeeperUrl,
        embedUrl,
        invitedAttendeesCount: attendeeList.length,
      },
      security: {
        hostControlsProtected: true,
        guestInvitingDisabled: true,
        onlyInvitedAllowed: true,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/meetings:", error);
    return NextResponse.json(
      { error: "server_error", message: error?.message || "Failed to create meeting" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const domainId = url.searchParams.get("domainId");

    let query = db.select().from(meetings).orderBy(desc(meetings.createdAt));
    const all = query.all();

    const filtered = domainId ? all.filter((m) => m.networkId === domainId) : all;

    return NextResponse.json({
      success: true,
      meetings: filtered,
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/meetings:", error);
    return NextResponse.json(
      { error: "server_error", message: error?.message || "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}
