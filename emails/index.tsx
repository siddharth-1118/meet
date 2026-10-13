import React from "react";

export interface MeetingEmailProps {
  title: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  meetingLink: string;
  agenda?: string;
  networkName?: string;
}

export const MeetingInvitationEmail = ({
  title,
  description,
  startTime,
  endTime,
  meetingLink,
  agenda,
  networkName,
}: MeetingEmailProps) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#2563eb", color: "white", padding: "30px", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "24px" }}>NexMeet Invitation</h1>
      </div>
      <div style={{ padding: "30px", background: "#f9fafb" }}>
        <h2 style={{ color: "#2563eb", marginTop: 0 }}>You&apos;re invited to a meeting!</h2>

        <div style={{ background: "white", padding: "20px", margin: "20px 0", borderRadius: "8px" }}>
          <h3 style={{ marginTop: 0 }}>{title}</h3>
          <p style={{ color: "#6b7280", marginBottom: "16px" }}>{description || "No description provided"}</p>

          {agenda && (
            <div style={{ margin: "16px 0" }}>
              <p style={{ fontWeight: 500, marginBottom: "8px", color: "#374151" }}>Agenda:</p>
              <p style={{ color: "#6b7280", lineHeight: 1.5 }}>{agenda}</p>
            </div>
          )}

          {startTime && endTime && (
            <div style={{ margin: "16px 0" }}>
              <p style={{ fontWeight: 500, marginBottom: "8px", color: "#374151" }}>When:</p>
              <p style={{ color: "#6b7280" }}>
                {startTime.toLocaleDateString()} at {startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          )}

          <div style={{ margin: "16px 0" }}>
            <p style={{ fontWeight: 500, marginBottom: "8px", color: "#374151" }}>Network:</p>
            <p style={{ color: "#6b7280" }}>{networkName || "Your organization"}</p>
          </div>
        </div>

        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <a
            href={meetingLink}
            style={{
              background: "#2563eb",
              color: "white",
              padding: "12px 24px",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: 500,
              display: "inline-block",
            }}
          >
            Join Meeting
          </a>
        </div>

        <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.5 }}>
          If you can&apos;t click the button above, copy and paste this link into your browser:
          <br />
          {meetingLink}
        </p>

        <hr style={{ margin: "30px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Best regards,<br />
          The NexMeet Team
        </p>
      </div>
    </div>
  );
};

export const MeetingReminderEmail = ({ title, startTime, meetingLink }: MeetingEmailProps) => {
  const days = startTime ? Math.ceil((startTime.getTime() - new Date().getTime()) / 86400000) : 0;
  const hours = startTime ? Math.ceil((startTime.getTime() - new Date().getTime()) / 3600000) : 1;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#f59e0b", color: "white", padding: "30px", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "24px" }}>Meeting Reminder</h1>
      </div>
      <div style={{ padding: "30px", background: "#f9fafb" }}>
        <h2 style={{ color: "#f59e0b", marginTop: 0 }}>Reminder: {title}</h2>

        <div style={{ background: "white", padding: "20px", margin: "20px 0", borderRadius: "8px" }}>
          <p style={{ color: "#6b7280", marginBottom: "16px" }}>
            This is a reminder about your upcoming meeting.
          </p>

          <p style={{ fontWeight: 500, marginBottom: "8px", color: "#374151" }}>
            {days > 0 ? `${days} day${days > 1 ? "s" : ""} ` : ""}
            {hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""} ` : ""}
            before the meeting starts
          </p>

          <p style={{ color: "#6b7280", lineHeight: 1.5 }}>
            <a
              href={meetingLink}
              style={{
                background: "#2563eb",
                color: "white",
                padding: "12px 24px",
                textDecoration: "none",
                borderRadius: "6px",
                fontWeight: 500,
                display: "inline-block",
              }}
            >
              Join Meeting
            </a>
          </p>
        </div>

        <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.5 }}>
          Don&apos;t forget to join on time!
        </p>

        <hr style={{ margin: "30px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          The NexMeet Team
        </p>
      </div>
    </div>
  );
};

export const MeetingStartedEmail = ({ title, meetingLink }: MeetingEmailProps) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#10b981", color: "white", padding: "30px", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "24px" }}>Meeting Started</h1>
      </div>
      <div style={{ padding: "30px", background: "#f9fafb" }}>
        <h2 style={{ color: "#10b981", marginTop: 0 }}>{title} has started!</h2>

        <div style={{ background: "white", padding: "20px", margin: "20px 0", borderRadius: "8px" }}>
          <p style={{ color: "#6b7280", marginBottom: "16px" }}>
            The meeting is now live. Join using the link below.
          </p>

          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <a
              href={meetingLink}
              style={{
                background: "#2563eb",
                color: "white",
                padding: "12px 24px",
                textDecoration: "none",
                borderRadius: "6px",
                fontWeight: 500,
                display: "inline-block",
              }}
            >
              Join Meeting
            </a>
          </div>
        </div>

        <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.5 }}>
          The meeting has begun. Please join promptly.
        </p>

        <hr style={{ margin: "30px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          The NexMeet Team
        </p>
      </div>
    </div>
  );
};

export const MeetingCancelledEmail = ({ title }: { title: string }) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#ef4444", color: "white", padding: "30px", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "24px" }}>Meeting Cancelled</h1>
      </div>
      <div style={{ padding: "30px", background: "#f9fafb" }}>
        <h2 style={{ color: "#ef4444", marginTop: 0 }}>{title} has been cancelled</h2>

        <div style={{ background: "white", padding: "20px", margin: "20px 0", borderRadius: "8px" }}>
          <p style={{ color: "#6b7280", marginBottom: "16px" }}>
            The meeting has been cancelled by the host. You&apos;ll be notified if it&apos;s rescheduled.
          </p>
        </div>

        <hr style={{ margin: "30px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          The NexMeet Team
        </p>
      </div>
    </div>
  );
};