import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

export const sqlite = new Database("nexmeet.db");

// Auto-initialize SQLite tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar TEXT,
    timezone TEXT DEFAULT 'UTC',
    availability TEXT DEFAULT '',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
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

  CREATE TABLE IF NOT EXISTS memberships (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    networkId TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    status TEXT DEFAULT 'active',
    joinedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    networkId TEXT NOT NULL,
    hostId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    agenda TEXT,
    type TEXT DEFAULT 'scheduled',
    startsAt TEXT NOT NULL,
    endsAt TEXT NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    recurrence TEXT,
    status TEXT DEFAULT 'pending',
    waitingRoom INTEGER DEFAULT 1,
    recording INTEGER DEFAULT 0,
    captions INTEGER DEFAULT 0,
    meetLink TEXT,
    provider TEXT DEFAULT 'nexmeet',
    googleEventId TEXT,
    creatorEmail TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );


  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    meetingId TEXT NOT NULL,
    userId TEXT,
    email TEXT,
    role TEXT DEFAULT 'attendee',
    status TEXT DEFAULT 'waiting',
    joinedAt TEXT,
    leftAt TEXT
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

  CREATE TABLE IF NOT EXISTS availability (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    dayOfWeek INTEGER NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    timezone TEXT DEFAULT 'UTC'
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    metadata TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS recordings (
    id TEXT PRIMARY KEY,
    meetingId TEXT NOT NULL,
    url TEXT NOT NULL,
    duration INTEGER,
    transcriptUrl TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

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

  INSERT OR IGNORE INTO users (id, name, email, timezone)
  VALUES ('user-default', 'Siddharth V', 'siddharth@nexmeet.local', 'UTC');

  INSERT OR IGNORE INTO networks (id, name, slug, description, ownerId)
  VALUES ('design-guild', 'Design Guild', 'design-guild', 'Core UX & Product Design team', 'user-default');
`);

export const db = drizzle(sqlite, { schema });
export const client = db;