import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  timezone: text("timezone").default("UTC"),
  availability: text("availability").default(""),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const networks = sqliteTable("networks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  logo: text("logo"),
  accentColor: text("accentColor").default("#3b82f6"),
  ownerId: text("ownerId").notNull(),
  policies: text("policies").default("{}"),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const memberships = sqliteTable("memberships", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  networkId: text("networkId").notNull(),
  role: text("role").default("member"),
  status: text("status").default("active"),
  joinedAt: text("joinedAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const meetings = sqliteTable("meetings", {
  id: text("id").primaryKey(),
  networkId: text("networkId").notNull(),
  hostId: text("hostId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  agenda: text("agenda"),
  type: text("type").default("scheduled"),
  startsAt: text("startsAt").notNull(),
  endsAt: text("endsAt").notNull(),
  timezone: text("timezone").default("UTC"),
  recurrence: text("recurrence"),
  status: text("status").default("pending"),
  waitingRoom: integer("waitingRoom", { mode: "boolean" }).default(true),
  recording: integer("recording", { mode: "boolean" }).default(false),
  captions: integer("captions", { mode: "boolean" }).default(false),
  meetLink: text("meetLink"),
  provider: text("provider").default("nexmeet"),
  googleEventId: text("googleEventId"),
  creatorEmail: text("creatorEmail"),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const participants = sqliteTable("participants", {
  id: text("id").primaryKey(),
  meetingId: text("meetingId").notNull(),
  userId: text("userId"),
  email: text("email"),
  role: text("role").default("attendee"),
  status: text("status").default("waiting"),
  joinedAt: text("joinedAt"),
  leftAt: text("leftAt"),
});

export const invitations = sqliteTable("invitations", {
  id: text("id").primaryKey(),
  meetingId: text("meetingId").notNull(),
  inviterId: text("inviterId").notNull(),
  inviteeEmail: text("inviteeEmail").notNull(),
  inviteeUserId: text("inviteeUserId"),
  role: text("role").default("attendee"),
  canInviteOthers: integer("canInviteOthers", { mode: "boolean" }).default(false),
  status: text("status").default("pending"),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const availability = sqliteTable("availability", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  dayOfWeek: integer("dayOfWeek").notNull(), // 0-6
  startTime: text("startTime").notNull(), // HH:MM format
  endTime: text("endTime").notNull(), // HH:MM format
  timezone: text("timezone").default("UTC"),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: integer("read", { mode: "boolean" }).default(false),
  metadata: text("metadata"),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const recordings = sqliteTable("recordings", {
  id: text("id").primaryKey(),
  meetingId: text("meetingId").notNull(),
  url: text("url").notNull(),
  duration: integer("duration"),
  transcriptUrl: text("transcriptUrl"),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
  notifications: many(notifications),
}));

export const networkRelations = relations(networks, ({ one, many }) => ({
  owner: one(users, {
    fields: [networks.ownerId],
    references: [users.id],
  }),
  memberships: many(memberships),
  meetings: many(meetings),
}));

export const membershipRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  network: one(networks, {
    fields: [memberships.networkId],
    references: [networks.id],
  }),
}));

export const meetingRelations = relations(meetings, ({ one, many }) => ({
  network: one(networks, {
    fields: [meetings.networkId],
    references: [networks.id],
  }),
  host: one(users, {
    fields: [meetings.hostId],
    references: [users.id],
  }),
  participants: many(participants),
  invitations: many(invitations),
  recordings: many(recordings),
}));

export const participantRelations = relations(participants, ({ one }) => ({
  meeting: one(meetings, {
    fields: [participants.meetingId],
    references: [meetings.id],
  }),
  user: one(users, {
    fields: [participants.userId],
    references: [users.id],
  }),
}));

export const invitationRelations = relations(invitations, ({ one }) => ({
  meeting: one(meetings, {
    fields: [invitations.meetingId],
    references: [meetings.id],
  }),
  inviter: one(users, {
    fields: [invitations.inviterId],
    references: [users.id],
  }),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  user: one(users, {
    fields: [availability.userId],
    references: [users.id],
  }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const recordingRelations = relations(recordings, ({ one }) => ({
  meeting: one(meetings, {
    fields: [recordings.meetingId],
    references: [meetings.id],
  }),
}));

export const googleTokens = sqliteTable("google_tokens", {
  id: text("id").primaryKey(), // "default" or userId
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  expiryDate: integer("expiryDate"),
  tokenType: text("tokenType"),
  scope: text("scope"),
  userEmail: text("userEmail"),
  updatedAt: text("updatedAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});