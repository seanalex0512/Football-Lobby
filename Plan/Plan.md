# Football Lobby - Project Plan

## Overview

A mobile-first web app for organizing football games with friends. Admin creates games, shares a join link, players sign up and join. Tracks attendance and payments.

## Tech Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | Next.js + Tailwind CSS | Mobile-first UI, SSR |
| Backend | Next.js API Routes | Same codebase, no separate server |
| Database | Supabase (PostgreSQL) | Cloud database, free tier |
| Hosting | Vercel | Free tier, auto-deploy from git |

## Hosting Setup

- **Vercel** (free tier) - Hosts the Next.js app (frontend + API routes). 100GB bandwidth/month. Auto-deploys from GitHub.
- **Supabase** (free tier) - PostgreSQL database. 500MB storage, 50k monthly active users.
- **GitHub** - Source code repository, connected to Vercel for auto-deploy.

---

## Phase 1 - MVP

### Game Creation (Admin Only)

- Create a game with: date, time, venue name, venue address, max players
- Cost is NOT set at creation — only calculated after the game is finalized
- Admin finalizes a game after it's played, entering the total cost
- Auto-split cost: total cost / number of joined players (calculated only after finalization)
- Edit game details after creation
- Cancel a game
- Generate a shareable join link per game

### Player Accounts

- Sign up with **name + password only** (local auth, no OAuth, no email/phone required)
- Simple login/logout
- No profile page needed

### Game Joining

- Players open shared link, sign up (or log in), and join the game
- Players can leave a game after joining
- Admin can add or remove players from a game
- Player list visible to everyone: who's in, how many spots remaining

### Payment Tracking

- Admin marks each player as paid or unpaid
- Track payment amount and date per player
- Show per-game summary: total cost, per-player cost, total collected vs total owed
- No partial payments

### Game History

- Past games remain visible (not deleted)
- Can view player list and payment status of past games

### UI/UX

- Mobile-first responsive design
- Clean, minimal, functional
- **No AI slop**: no gradient blobs, no generic hero sections, no excessive rounded cards with shadows everywhere, no stock illustration energy, no "unlock your potential" copy, no decorative illustrations
- Simple typography, clear hierarchy, real utility
- One main view per game: game details + player list + payment status

### Not in Phase 1

- No admin dashboard
- No notifications (in-app or push)
- No TNG payment integration
- No OAuth / social login
- No desktop-optimized layout (responsive is fine, no dedicated desktop design)
- No team picker
- No waitlist
- No player stats

---

## Phase 2 - Payments & Notifications

- TNG payment integration (generate payment link/QR, auto-split)
- In-app notifications (game created, spots filling up, reminders)
- WhatsApp share button (pre-formatted message with join link)

## Phase 3 - Future Features

- Team picker (random or manual assignment)
- Waitlist system (when games are full)
- Player stats (attendance history, games played)
- Recurring games (auto-create weekly games)
- Desktop-optimized layout
- OAuth login (Google, etc.)

---

## Database Schema (Phase 1)

### players

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| name | text | Required |
| password_hash | text | Hashed password |
| created_at | timestamp | Auto-set |

### games

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| date | date | Game date |
| time | time | Game time |
| venue_name | text | Required |
| venue_address | text | Optional |
| total_cost | decimal | Nullable, set when finalized |
| max_players | integer | Player cap |
| status | text | active / finalized / cancelled |
| join_code | text | Unique, for shareable link |
| created_by | uuid | FK to players (admin) |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-set |

### game_players

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| game_id | uuid | FK to games |
| player_id | uuid | FK to players |
| payment_status | text | paid / unpaid |
| payment_amount | decimal | Nullable, set when paid |
| payment_date | timestamp | Nullable, set when paid |
| joined_at | timestamp | Auto-set |

### Indexes

- games.join_code (unique)
- game_players (game_id, player_id) unique constraint

---

## API Routes (Phase 1)

### Auth
- `POST /api/auth/signup` - Create account (name + password)
- `POST /api/auth/login` - Login, return session token
- `POST /api/auth/logout` - Logout

### Games
- `POST /api/games` - Create game (admin only)
- `GET /api/games` - List all games (upcoming + past)
- `GET /api/games/[id]` - Get game details + player list + payment info
- `PUT /api/games/[id]` - Edit game (admin only)
- `DELETE /api/games/[id]` - Cancel game (admin only)
- `POST /api/games/[id]/finalize` - Finalize game + set total cost (admin only)
- `GET /api/games/join/[code]` - Get game by join code

### Game Players
- `POST /api/games/[id]/join` - Join a game
- `DELETE /api/games/[id]/leave` - Leave a game
- `DELETE /api/games/[id]/players/[playerId]` - Admin removes a player
- `POST /api/games/[id]/players/[playerId]` - Admin adds a player

### Payments
- `PUT /api/games/[id]/players/[playerId]/payment` - Update payment status (admin only)

---

## Pages (Phase 1)

- `/` - Home: list of upcoming and past games
- `/login` - Login page
- `/signup` - Signup page
- `/games/[id]` - Game detail: info, player list, payment tracking
- `/games/new` - Create game form (admin only)
- `/games/[id]/edit` - Edit game form (admin only)
- `/join/[code]` - Join game via shared link (redirects to game after joining)

---

## UI Design Prompt

For use in Claude design / Figma generation:

> Design a mobile-first web app called "Football Lobby" for organizing pickup football games.
>
> **Pages needed:**
> 1. **Home** - List of upcoming games (date, time, venue, spots left) and past games below
> 2. **Game Detail** - Game info at top (date, time, venue, spots). Cost per player + payment tracking only visible after game is finalized
> 3. **Create Game** - Simple form: date, time, venue name, venue address, max players (no cost field — cost is set when finalizing)
> 4. **Login / Signup** - Minimal, name + password only
> 5. **Join via Link** - Landing page when opening a shared game link
>
> **Design direction:**
> - Mobile-first (375px primary viewport)
> - Clean, utilitarian, no decoration. Think sports scoreboard meets a simple booking app
> - Monochrome or near-monochrome with one accent color (green or your pick)
> - System font stack, no custom fonts
> - Dense information display — no wasted space, no hero sections, no illustrations
> - Flat design, minimal shadows, no gradients, no blobs, no rounded card grids
> - Functional over pretty. Every element earns its space
> - Admin actions (edit, cancel, mark paid) are inline, not buried in menus
> - Player list is a compact table/list showing: name, payment status, payment amount
> - Spots remaining shown prominently on game cards and detail page
