# NexMeet Multi-Domain Integration Guide (Vercel & Production Database)

This document explains how to merge and integrate the **NexMeet** meeting system and database into your parent website hosted on **Vercel**.

---

## 1. Architectural Highlights

- **Master Host Autonomy**: Meetings are created through your platform's Google Calendar OAuth account, but **domain leads and members can start and conduct their meetings without you ever needing to be present**.
- **Protected Host Controls**: Domain leads and attendees join as call participants; they never receive your master Google account credentials, Client ID, or host administrative powers.
- **Strict Member Whitelist**: Only email addresses explicitly added to the invitation list can join. Uninvited visitors are completely blocked.
- **Domain Isolation**: Members of Domain A cannot view or enter meetings belonging to Domain B.

---

## 2. Database Schema Setup

Your parent website on Vercel connects to a production database (e.g., **PostgreSQL**, **Supabase**, **Neon**, **Vercel Postgres**, or **Prisma**).

### If your database is PostgreSQL (Vercel Postgres, Supabase, Neon):
Run the SQL script located in [`drizzle/schema.postgres.sql`](./drizzle/schema.postgres.sql):

```sql
CREATE TABLE IF NOT EXISTS google_tokens (
    id VARCHAR(255) PRIMARY KEY,
    access_token TEXT,
    refresh_token TEXT,
    expiry_date BIGINT,
    token_type VARCHAR(50),
    scope TEXT,
    user_email VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS networks (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    logo TEXT,
    accent_color VARCHAR(50) DEFAULT '#3b82f6',
    owner_id VARCHAR(255) NOT NULL,
    policies TEXT DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS meetings (
    id VARCHAR(255) PRIMARY KEY,
    network_id VARCHAR(255) NOT NULL,
    host_id VARCHAR(255) NOT NULL,
    creator_email VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    agenda TEXT,
    type VARCHAR(50) DEFAULT 'scheduled',
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    recurrence TEXT,
    status VARCHAR(50) DEFAULT 'scheduled',
    waiting_room BOOLEAN DEFAULT TRUE,
    recording BOOLEAN DEFAULT FALSE,
    captions BOOLEAN DEFAULT TRUE,
    meet_link TEXT,
    provider VARCHAR(50) DEFAULT 'google',
    google_event_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS invitations (
    id VARCHAR(255) PRIMARY KEY,
    meeting_id VARCHAR(255) NOT NULL,
    inviter_id VARCHAR(255) NOT NULL,
    invitee_email VARCHAR(255) NOT NULL,
    invitee_user_id VARCHAR(255),
    role VARCHAR(50) DEFAULT 'attendee',
    can_invite_others BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_meetings_network ON meetings(network_id);
CREATE INDEX IF NOT EXISTS idx_invitations_meeting ON invitations(meeting_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(invitee_email);
```

### If your database is SQLite / Turso:
Use [`drizzle/schema.sqlite.sql`](./drizzle/schema.sqlite.sql).

---

## 3. Files to Copy into Your Parent Website

Copy these files and directories directly into your parent Next.js repository:

| From NexMeet | Destination in Parent Website | Description |
| :--- | :--- | :--- |
| `app/api/v1/meetings/route.ts` | `app/api/v1/meetings/route.ts` | Meeting scheduling API for Domain Leads |
| `app/api/gatekeeper/verify/route.ts` | `app/api/gatekeeper/verify/route.ts` | Gatekeeper security check API |
| `app/api/auth/google/` | `app/api/auth/google/` | One-time Google OAuth authorization |
| `app/gatekeeper/[meetingId]/page.tsx` | `app/gatekeeper/[meetingId]/page.tsx` | Secure Lobby page (supports iframe embed) |
| `lib/google.ts` | `lib/google.ts` | Google Meet & Calendar API engine |

### Package Dependency:
Add `googleapis` to your parent website's `package.json`:
```bash
npm install googleapis
# or
pnpm add googleapis
```

---

## 4. Vercel Environment Variables

Go to your **Vercel Project Dashboard > Settings > Environment Variables** and add:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://<your-domain>.vercel.app/api/auth/callback/google
```

### Google Cloud Console Update:
In [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials):
Under your OAuth 2.0 Client ID, add your production Vercel domain to **Authorized redirect URIs**:
```
https://<your-domain>.vercel.app/api/auth/callback/google
```

---

## 5. How Your Parent Website Interacts with the System

### Step 1: Scheduling a Meeting (Domain Lead / Head Action)
When a domain lead clicks "Schedule Call" on your parent website, their browser or your backend makes a request:

```ts
const response = await fetch("https://<your-domain>.vercel.app/api/v1/meetings", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    domainId: "engineering",               // The domain/circle identifier
    domainLeadEmail: "lead@company.com",   // The domain lead email
    title: "Sprint Planning",
    duration: 60,                          // Minutes
    invitedEmails: [                       // Whitelisted attendees
      "dev1@company.com",
      "dev2@company.com"
    ]
  })
});

const data = await response.json();
console.log(data.meeting.gatekeeperUrl); // URL to share with attendees
console.log(data.meeting.embedUrl);      // URL for iframe embed
```

### Step 2: Attendees Joining (Gatekeeper Protection)

You can embed the Gatekeeper directly inside your parent website UI using an `iframe`:

```html
<iframe
  src="https://<your-domain>.vercel.app/gatekeeper/MEETING_ID?embed=true&email=CURRENT_USER_EMAIL&domain=USER_DOMAIN"
  allow="camera; microphone; display-capture"
  width="100%"
  height="600px"
  style="border: none; border-radius: 12px;"
></iframe>
```

**What happens automatically:**
1. The Gatekeeper checks if `CURRENT_USER_EMAIL` is in the invitation list for that meeting.
2. Checks if the user belongs to the meeting's domain.
3. If valid: Allows the user to launch and join Google Meet immediately.
4. If invalid (e.g. stranger or user from another domain): Shows **Access Denied** and blocks access to the Google Meet link.
