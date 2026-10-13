import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { meetings } from "@/drizzle/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = db.select().from(meetings).orderBy(desc(meetings.createdAt)).all();
    return NextResponse.json({ success: true, meetings: list });
  } catch (error: any) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title = "Untitled Meeting",
      description = "",
      agenda = "",
      networkId = "design-guild",
      hostId = "user-default",
      type = "scheduled",
      startTime,
      duration = 60,
      timezone = "UTC",
      waitingRoom = true,
      recording = false,
      captions = false,
    } = body;

    const start = startTime ? new Date(startTime) : new Date();
    const end = new Date(start.getTime() + Number(duration) * 60 * 1000);
    const meetingId = `meet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const meetLink = `/room?id=${meetingId}`;

    db.insert(meetings)
      .values({
        id: meetingId,
        networkId,
        hostId,
        title,
        description,
        agenda,
        type,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        timezone,
        status: "scheduled",
        waitingRoom,
        recording,
        captions,
        meetLink,
        provider: "nexmeet",
      })
      .run();

    return NextResponse.json({
      success: true,
      meeting: {
        id: meetingId,
        title,
        meetLink,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        provider: "nexmeet",
      },
    });
  } catch (error: any) {
    console.error("Error creating meeting:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
