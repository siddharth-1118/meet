import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, template, data } = body;

    // Simulation / local dispatch logger for NexMeet invitations
    console.log(`[Notification Engine] Queued email to ${to}: "${subject}" (Template: ${template})`);

    return NextResponse.json({
      success: true,
      message: `Notification dispatched for template: ${template || "default"}`,
      recipient: to,
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process notification" },
      { status: 500 }
    );
  }
}
