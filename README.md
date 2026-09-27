# Find Me

A community-assisted platform that helps reconnect lost, missing, elderly, confused, or unidentified people with their families.

## Overview

Find Me is NOT a people-tracking application. A person who is found does not need a phone, account, or the Find Me app. Helpers can report people they have found, and families searching for missing loved ones can discover relevant cases within a configurable geographic radius.

The application prioritizes **privacy, safety, moderation, and secure communication** above all else.

## Features

- **Report Found Person** — Upload a photo, approximate age, gender, clothing, description, approximate location, and date/time found.
- **Report Missing Person** — Report a missing person with photo, details, last known location, and optional police reference.
- **Nearby Cases Search** — PostGIS-powered geographic search with configurable radius (2, 5, 10, 25, 50 km).
- **Privacy-First Locations** — Exact coordinates are never exposed to normal users. Only approximate labels and distances are shown.
- **Potential Matching** — Rule-based matching using geographic distance, age similarity, gender, description, clothing, and time. No facial recognition. Human confirmation always required.
- **Secure In-App Chat** — Contact helpers without revealing phone numbers or emails. All communication stays in-app.
- **Notifications** — In-app notification center with realtime updates (nearby found, potential match, case update, chat message, case closed, admin message).
- **Report & Abuse System** — Report cases for fake content, wrong person, harassment, privacy concerns, inappropriate images, scams, or other reasons.
- **Admin Dashboard** — Review pending cases, manage reports, suspend/restore users, and view audit logs.
- **Role-Based Access Control** — USER, MODERATOR, ADMIN, SUPER_ADMIN roles with appropriate permissions.
- **Child Safety** — Stricter moderation, minimized public information, and additional review for cases involving children.
- **Internationalization** — Prepared for English, Tamil, and Hindi with a translation structure.
- **PWA Support** — Installable, responsive, with offline app shell and push notification support where available.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Supabase (Auth, PostgreSQL, Storage, Realtime)
- **Database:** PostgreSQL with PostGIS extension for geographic queries
- **Validation:** Zod
- **Routing:** React Router
- **PWA:** vite-plugin-pwa (Workbox)

## Architecture

```
src/
  components/     Reusable UI components (CaseCard, Modal, States, etc.)
  contexts/       React contexts (AuthContext)
  features/       Feature-specific logic (future)
  layouts/        Layout wrappers (MainLayout, AdminLayout)
  lib/            Utilities, constants, i18n, validation, supabase client
  pages/          Page components
    admin/        Admin-specific pages
  services/       API service layer (caseService, general API)
  types/          TypeScript type definitions
```

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:
- `VITE_SUPABASE_URL` — Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Your Supabase anon key

Optional:
- `VITE_MAP_API_KEY` — For future map integration
- `VITE_FCM_*` — Firebase Cloud Messaging config for push notifications

## Database Setup

The database schema is managed via Supabase migrations. The following tables are created:

- `profiles` — User profiles with roles
- `cases` — Found and missing person cases
- `case_locations` — Geographic locations (exact internal, approximate public)
- `case_photos` — Photo metadata (images stored in Supabase Storage)
- `case_matches` — Potential matches between cases
- `notifications` — In-app notifications
- `conversations` — Secure in-app conversations
- `conversation_participants` — Conversation membership
- `messages` — Chat messages
- `reports` — Abuse/inappropriate content reports
- `audit_logs` — Audit trail for sensitive actions
- `consents` — User consent records

### PostGIS

The PostGIS extension is used for geographic distance queries. The `find_nearby_cases` function uses `ST_DWithin` and `ST_Distance` for radius-based search.

### Storage

A public storage bucket named `case-photos` is created for storing case photos. Storage policies allow authenticated users to upload and all users to read.

### Row Level Security

RLS is enabled on all tables with appropriate policies:
- Users can only see their own data and public active cases
- Exact location coordinates are hidden from non-owners
- Conversations and messages are only visible to participants
- Admin actions require MODERATOR/ADMIN/SUPER_ADMIN roles
- Audit logs are only visible to ADMIN/SUPER_ADMIN

## Local Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Type Check

```bash
npm run typecheck
```

## Lint

```bash
npm run lint
```

## Deployment

The app can be deployed to any static hosting provider. Build with `npm run build` and serve the `dist/` directory.

## Demo Accounts

For development, you can create accounts through the registration page. The first registered user gets the USER role by default. To create moderator/admin accounts, update the `role` column in the `profiles` table directly in Supabase.

## Privacy

- Exact coordinates are never exposed to normal users
- Phone numbers and emails are never shared between users
- EXIF metadata is stripped from uploaded images where possible
- Child cases receive extra protection
- Cases are removed from public discovery when closed
- This is NOT a tracking app and does NOT use facial recognition

## Emergency

**If a person is in immediate danger or requires urgent assistance, contact the appropriate local emergency or police service.** Find Me does not dispatch police or emergency services.
