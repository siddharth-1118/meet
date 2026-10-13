-- ==============================================================================
-- NexMeet Multi-Domain Meeting Schema for PostgreSQL
-- Compatible with: Vercel Postgres, Supabase, Neon, AWS RDS, Prisma, Drizzle
-- ==============================================================================

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

-- Indexes for ultra-fast Gatekeeper lookups & domain isolation
CREATE INDEX IF NOT EXISTS idx_meetings_network ON meetings(network_id);
CREATE INDEX IF NOT EXISTS idx_invitations_meeting ON invitations(meeting_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(invitee_email);
