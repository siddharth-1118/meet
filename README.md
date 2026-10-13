# NexMeet - Domain-Specific Meeting & Scheduling Platform

## Overview

NexMeet is a domain-specific meeting and scheduling platform that works like Google Meet, but meetings are organized inside private networks/workspaces. It's designed for communities, companies, universities, teams, and domain-specific groups.

Each group has its own network/workspace with members, roles, branding, default meeting settings, and templates.

## Core Concepts

- **Network/Workspace**: A domain-specific space (e.g., "Design Guild", "CS Department", "Startup Team"). Has members, roles, branding, default meeting settings, and templates.
- **Meeting**: Instant or scheduled. Has title, description, agenda, date/time, duration, timezone, network, host, participants, waiting room, recording settings, and join link.
- **Invitation**: Host selects specific members, groups, or external emails. Can assign roles: host, co-host, presenter, attendee.
- **Room**: Live video session powered by LiveKit. Includes lobby, waiting room, chat, screen share, reactions, hand raise, captions, recording, and breakout rooms.
- **Availability**: Users set working hours, timezone, buffer time, and meeting duration preferences.
- **Notification**: In-app, email, and optional push. Invite, reminder, update, cancellation, and "meeting started" alerts.

## User Roles

- **Super Admin**: Manages platform, domains, and abuse reports.
- **Network Owner/Admin**: Creates network, manages members, roles, branding, meeting policies.
- **Member**: Creates meetings inside networks they belong to, invites allowed people, joins meetings.
- **Guest**: Joins via secure link, limited permissions.

## Tech Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Radix UI primitives
- Framer Motion for animations
- Lucide React icons
- TanStack Query (for data fetching)
- Zustand (for state management)

### Backend
- Next.js server actions/API routes
- PostgreSQL with Drizzle ORM
- Row-level security

### Realtime Video/Audio
- LiveKit (via livekit-client package)

### Data & Cache
- PostgreSQL (via Drizzle ORM)
- SQLite (via better-sqlite3 for development)
- Redis (via Upstash Redis)

### Deployment
- Vercel
- LiveKit Cloud
- Supabase/Neon (PostgreSQL)
- Upstash Redis

## Prerequisites

- Node.js 18+ (Node.js 20 recommended)
- pnpm 8+
- LiveKit server access (credentials)
- PostgreSQL database (Supabase, Neon, or self-hosted)
- Resend or Postmark account (for email)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-org/nexmeet.git
cd nexmeet
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Required environment variables:

```
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# LiveKit
NEXT_PUBLIC_LIVEKIT_URL=https://your-link.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_FROM_EMAIL=noreply@nexmeet.com

# Optional: Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### 4. Set up the database

```bash
pnpm dlx drizzle-kstudio generate
pnpm dlx drizzle-kstudio push
```

Or using the built-in migration system:

```bash
pnpm exec prisma migrate dev --name init
```

### 5. Run the development server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

### 5. Build for production

```bash
pnpm build
pnpm start
```

## Project Structure

```
E:\projects\meet\
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx          # Root layout with sidebar
│   ├── page.tsx            # Home page
│   ├── networks/           # Networks management
│   ├── create-meeting/     # Meeting creation wizard
│   ├── calendar/           # Calendar and availability
│   ├── room/               # LiveKit room page
│   ├── recordings/         # Meeting recordings
│   └── settings/           # User and admin settings
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── livekit/            # LiveKit integration
│   ├── notifications/      # Notification system
│   ├── empty-states/       # Empty state illustrations
│   └── lib/                Utility libraries
├── drizzle/                # Database schema and migrations
│   ├── schema.ts           # Drizzle ORM schema
│   └── db.ts               # Database connection
├── emails/                 # Email templates (Resend)
├── styles/                 # Tailwind CSS and design tokens
├── packages/               # Any monorepo packages
├── node_modules/           # Dependencies
├── package.json            # Project dependencies
├── pnpm-lock.yaml          # Lock file
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS config
└── next-config.mjs         # Next.js configuration
```

## Key Features

### Auth & Onboarding
- Sign up / login with email and password
- Onboarding: create or join a network, set timezone, name, avatar, and availability
- Beautiful empty states with illustrations and clear CTAs

### Main Dashboard
- Left sidebar: networks list, upcoming meetings, calendar, recordings, settings
- Top bar: search, notifications, create meeting button, profile menu
- Main content: "Upcoming", "Today", "Recent", and "Instant meeting" cards
- Widgets: next meeting countdown, availability status, invite requests

### Create Meeting Flow
A multi-step wizard:
1. Meeting type: Instant / Schedule / Recurring
2. Network: select domain-specific network
3. Details: title, description, agenda, duration, timezone
4. Invite people: searchable picker with member avatars, groups, roles, external email, permission level
5. Settings: waiting room, mute on entry, recording, captions, breakout rooms
6. Review & confirm: shows summary, sends invites, creates calendar event

### Schedule & Calendar
- Month, week, day, and agenda views
- Drag to reschedule, click to edit
- Timezone-aware
- Conflict detection and suggested times
- Google Calendar sync optional

### Meeting Room / Video Call
- Pre-join lobby: camera/mic preview, background blur, name, device selection
- In-call UI: grid view, speaker view, sidebar with chat, participants, reactions, hand raise, screen share, captions, recording indicator
- Host controls: mute all, remove participant, lock room, waiting room, breakout rooms, assign co-host
- Mobile responsive with bottom control bar

### Network Management
- Create/edit network with name, slug, description, logo, accent color, domain restrictions
- Members table with roles, invite, remove, bulk import
- Meeting templates per network
- Policies: who can create meetings, who can invite guests, default recording, retention

### Notifications & Reminders
- In-app notification center
- Email via Resend/Postmark
- Push via web push
- Reminders: 1 day, 1 hour, 10 minutes before
- "Meeting started" alert for invited users

### Settings
- Profile, timezone, availability, connected calendars
- Notification preferences
- Security (2FA, session management)
- Appearance (light/dark/system)

### Recordings & Transcripts
- Recording indicator in-call
- Recordings stored in S3-compatible storage
- Transcripts with searchable text
- Retention policies per network

## Security & Permissions

- Network-level RBAC (Role-Based Access Control)
- Only invited users can join private meetings
- Waiting room and host approval
- Meeting passwords and expiring links
- Rate limiting and abuse protection
- Audit logs for admin actions
- GDPR-friendly data export/delete

## API Endpoints

### Auth
- `POST /api/auth/signin` - Sign in with email
- `POST /api/auth/signup` - Sign up with email
- `POST /api/auth/resend` - Resend verification email
- `POST /api/auth/logout` - Sign out

### Users
- `GET /api/users` - List users
- `GET /api/users/[id]` - Get user by ID
- `POST /api/users` - Create user
- `PATCH /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Networks
- `GET /api/networks` - List networks
- `GET /api/networks/[id]` - Get network by ID
- `POST /api/networks` - Create network
- `PATCH /api/networks/[id]` - Update network
- `DELETE /api/networks/[id]` - Delete network

### Memberships
- `GET /api/memberships` - List memberships
- `POST /api/memberships` - Join network
- `PATCH /api/memberships/[id]` - Update role/status
- `DELETE /api/memberships/[id]` - Leave network / Remove member

### Meetings
- `GET /api/meetings` - List meetings
- `GET /api/meetings/[id]` - Get meeting by ID
- `POST /api/meetings` - Create meeting
- `PATCH /api/meetings/[id]` - Update meeting
- `DELETE /api/meetings/[id]` - Cancel meeting
- `POST /api/meetings/[id]/invite` - Send invitations

### Invitations
- `GET /api/invitations` - List invitations
- `POST /api/invitations` - Create invitation
- `PATCH /api/invitations/[id]` - Update invitation status
- `DELETE /api/invitations/[id]` - Cancel invitation

### Notifications
- `GET /api/notifications` - List notifications
- `PATCH /api/notifications/[id]` - Mark as read
- `POST /api/notifications` - Create notification

### Recordings
- `GET /api/recordings` - List recordings
- `GET /api/recordings/[id]` - Get recording by ID
- `POST /api/recordings` - Create recording
- `DELETE /api/recordings/[id]` - Delete recording

### Calendar
- `GET /api/calendar/events` - List calendar events
- `POST /api/calendar/events` - Create calendar event
- `PATCH /api/calendar/events/[id]` - Update calendar event

## LiveKit Integration

NexMeet uses LiveKit for browser-based video calls. Key integration points:

### Pre-join Lobby
- Camera/microphone preview
- Background blur/selection
- Device selection (mic, camera, speaker)
- Name entry and role selection
- Room connection

### In-Call Features
- Grid view / Speaker view toggle
- Participant list with avatars
- In-call chat with messaging
- Hand raise functionality
- Reactions (thumbs up, clap, etc.)
- Screen share (browser tab or window)
- Live captions (optional)
- Recording control (start/stop)
- Recording indicator for all participants

### Host Controls
- Mute all participants
- Remove participant from room
- Lock room (prevent new joins)
- Waiting room management
- Breakout room creation and management
- Assign co-host privileges
- End meeting for all participants

### Data Channels
- Text chat messages
- Reactions
- Hand raise events
- Participant join/leave events

## Performance & Accessibility

### Performance
- Code splitting and route-based lazy loading
- Image optimization with Next.js Image component
- Tailwind CSS tree-shaking
- Framer Motion animations using `will-change` and `transform`
- Efficient re-renders with React.memo where appropriate
- Critical CSS inlining for above-the-fold content

### Accessibility (WCAG AA)
- Focus-visible rings on all interactive elements
- Sufficient color contrast (design tokens provide proper contrast ratios)
- Keyboard-navigable interfaces (Tab/Shift+Tab order)
- ARIA labels on meaningful elements
- Screen reader labels for icons and components
- Respects `prefers-reduced-motion`
- Semantic HTML structure
- Proper heading hierarchy
- Focus management for modals and dialogs

### Responsive Design
- Mobile-first breakpoint strategy
- Sidebar collapsible on mobile (bottom navigation)
- Tablet adaptive layout
- All forms and modals work on touch devices
- Button and touch target minimum 44px height

## Development

### Available Scripts

```bash
pnpm dev       # Start development server (Turbopack)
pnpm build     # Build for production
pnpm start     # Start production server
pnpm lint      # Run ESLint
pnpm typecheck # Run TypeScript type check
pnpm db:push   # Push schema changes to database
pnpm db:generate # Generate Drizzle types
```

### Code Standards

- TypeScript strict mode enabled
- ESLint with Next.js recommended config
- Prettier for code formatting
- Components follow shadcn/ui patterns
- All files have JSDoc comments for public APIs
- Component props are fully typed
- Error boundaries for runtime error protection

## Deployment

### Vercel

```bash
vercel --prod
```

### Environment Variables for Production

Set the following in your Vercel dashboard or `.env.production`:

```
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_LIVEKIT_URL=https://your-link.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
DATABASE_URL=postgresql://user:password@host:port/dbname
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_FROM_EMAIL=noreply@nexmeet.com
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [LiveKit Documentation](https://docs.livekit.io)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Drizzle ORM Documentation](://orm.drizzle.dev)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Framer Motion Documentation](https://www.framer.com/motion)