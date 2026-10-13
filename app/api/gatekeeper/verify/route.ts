import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { meetings, invitations } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { meetingId, email, domainId } = body;

    if (!meetingId || !email) {
      return NextResponse.json(
        { allowed: false, reason: "Meeting ID and email are required for verification." },
        { status: 400 }
      );
    }

    const meeting = db
      .select()
      .from(meetings)
      .where(eq(meetings.id, meetingId))
      .get();

    if (!meeting) {
      return NextResponse.json(
        { allowed: false, reason: "Meeting session not found or has expired." },
        { status: 404 }
      );
    }

    // Check domain boundary if specified
    if (domainId && meeting.networkId !== domainId) {
      return NextResponse.json(
        {
          allowed: false,
          reason: `Cross-domain violation: This meeting belongs to domain '${meeting.networkId}', but request is from '${domainId}'.`,
          isCrossDomain: true,
        },
        { status: 403 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if the user is the Domain Lead / Creator
    const isCreator = meeting.creatorEmail && meeting.creatorEmail.toLowerCase() === normalizedEmail;

    // Check if the user was invited in the invitations table
    const inviteRows = db
      .select()
      .from(invitations)
      .where(eq(invitations.meetingId, meetingId))
      .all();

    const isInvited = inviteRows.some(
      (inv) => inv.inviteeEmail.trim().toLowerCase() === normalizedEmail
    );

    if (!isCreator && !isInvited) {
      return NextResponse.json({
        allowed: false,
        reason: "Access Restricted: You are not on the invited guest list for this domain meeting.",
        domainId: meeting.networkId,
        meetingTitle: meeting.title,
        emailProvided: normalizedEmail,
      });
    }

    return NextResponse.json({
      allowed: true,
      meetLink: meeting.meetLink,
      title: meeting.title,
      domainId: meeting.networkId,
      creatorEmail: meeting.creatorEmail,
      role: isCreator ? "domain_lead" : "invited_member",
      startsAt: meeting.startsAt,
      endsAt: meeting.endsAt,
      timezone: meeting.timezone,
    });
  } catch (error: any) {
    console.error("Gatekeeper verification error:", error);
    return NextResponse.json(
      { allowed: false, reason: "Verification service encountered an error." },
      { status: 500 }
    );
  }
}
