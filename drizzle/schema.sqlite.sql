-- ==============================================================================
-- NexMeet Multi-Domain Meeting Schema for SQLite / Turso / Cloudflare D1
-- ==============================================================================

CREATE TABLE IF NOT EXISTS google_tokens (
    id TEXT PRIMARY KEY,
    accessToken TEXT,
    refreshToken TEXT,
    expiryDate INTEGER,
    tokenType TEXT,
    scope TEXT,
    userEmail TEXT,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS networks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo TEXT,
    accentColor TEXT DEFAULT '#3b82f6',
    ownerId TEXT NOT NULL,
    policies TEXT DEFAULT '{}',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    networkId TEXT NOT NULL,
    hostId TEXT NOT NULL,
    creatorEmail TEXT,
    title TEXT NOT NULL,
    description TEXT,
    agenda TEXT,
    type TEXT DEFAULT 'scheduled',
    startsAt TEXT NOT NULL,
    endsAt TEXT NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    recurrence TEXT,
    status TEXT DEFAULT 'scheduled',
    waitingRoom INTEGER DEFAULT 1,
    recording INTEGER DEFAULT 0,
    captions INTEGER DEFAULT 1,
    meetLink TEXT,
    provider TEXT DEFAULT 'google',
    googleEventId TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    meetingId TEXT NOT NULL,
    inviterId TEXT NOT NULL,
    inviteeEmail TEXT NOT NULL,
    inviteeUserId TEXT,
    role TEXT DEFAULT 'attendee',
    canInviteOthers INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_meetings_network ON meetings(networkId);
CREATE INDEX IF NOT EXISTS idx_invitations_meeting ON invitations(meetingId);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(inviteeEmail);
