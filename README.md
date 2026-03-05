# Period Tracker

A full-stack Progressive Web App (PWA) for tracking menstrual cycles, symptoms, and predicting future periods and ovulation windows. Built with React, TypeScript, Supabase, and Tailwind CSS — deployed on Vercel.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Data Models](#data-models)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Data Flow](#data-flow)
- [Prediction Algorithm](#prediction-algorithm)
- [Symptom Tracking](#symptom-tracking)
- [PWA Features](#pwa-features)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Design Decisions](#design-decisions)

---

## What It Does

The app has four main tabs:

| Tab | Purpose |
|---|---|
| **Dashboard** | Shows current cycle status, days since period started, predicted next period date, ovulation window, and average cycle length |
| **Calendar** | Visual monthly calendar with color-coded period days, predicted days, ovulation window, and symptom log indicators |
| **Cycles** | Log and manage period start/end dates; view cycle history |
| **Symptoms** | Log daily symptoms, flow level, and notes; view symptom history |

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Language | TypeScript 5.5 |
| Styling | Tailwind CSS 4.0 (custom theme) |
| Backend & Auth | Supabase (PostgreSQL + Auth) |
| Date Utilities | date-fns |
| Build Tool | Vite 5 |
| PWA | vite-plugin-pwa (Workbox) |
| Deployment | Vercel |

---

## Architecture

```
src/
├── components/
│   ├── Auth/
│   │   └── AuthScreen.tsx       # Sign in / sign up UI
│   ├── Calendar/
│   │   ├── Calendar.tsx         # Monthly calendar view
│   │   └── CalendarDay.tsx      # Individual day cell
│   ├── CycleLog/
│   │   ├── CycleLog.tsx         # Cycle history list
│   │   └── CycleForm.tsx        # Add/edit cycle modal
│   ├── SymptomLog/
│   │   ├── SymptomLog.tsx       # Symptom history list
│   │   └── SymptomForm.tsx      # Add/edit symptom modal
│   └── layout/
│       ├── NavBar.tsx           # Top navigation bar
│       └── Layout.tsx           # Page wrapper
├── constants/
│   └── symptoms.ts              # 9 symptom categories (~80 symptoms)
├── context/
│   └── AppContext.tsx           # Global state + all Supabase calls
├── hooks/
│   ├── useCyclePredictions.ts   # Prediction logic
│   └── useLocalStorage.ts       # (legacy, not in active use)
├── lib/
│   └── supabase.ts              # Supabase client initialization
├── types/
│   └── index.ts                 # TypeScript interfaces
└── utils/
    └── dateUtils.ts             # Date helper functions
```

The app uses a **single React Context** (`AppContext`) as the global state layer. All components read data from context and call context methods to mutate it — no prop drilling, no external state library needed.

---

## Data Models

Defined in `src/types/index.ts`:

```ts
// Represents one menstrual period
interface CycleEntry {
  id: string;
  startDate: string;  // "YYYY-MM-DD"
  endDate?: string;   // Optional — omitted if period is ongoing
}

// Represents one day's log entry
interface DailyLog {
  id: string;
  date: string;                          // "YYYY-MM-DD"
  flow?: 'light' | 'medium' | 'heavy';
  symptoms: string[];                    // e.g. ["Cramps", "Fatigue", "Bloating"]
  notes?: string;
}
```

---

## Database Schema

Two tables in Supabase PostgreSQL, both protected by **Row Level Security (RLS)** so users can only access their own data.

```sql
-- Menstrual period records
create table cycles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  start_date date not null,
  end_date   date
);

-- Daily symptom/flow logs
create table daily_logs (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid references auth.users(id) on delete cascade not null,
  date     date not null,
  flow     text check (flow in ('light', 'medium', 'heavy')),
  symptoms text[] default '{}',
  notes    text
);

-- Row Level Security policies
alter table cycles enable row level security;
alter table daily_logs enable row level security;

create policy "own cycles"
  on cycles for all using (auth.uid() = user_id);

create policy "own logs"
  on daily_logs for all using (auth.uid() = user_id);
```

The database uses snake_case (`start_date`, `end_date`) while the app uses camelCase (`startDate`, `endDate`). The context layer maps between them with `dbToCycle()` and `dbToLog()` functions.

---

## Authentication

Supabase Auth handles authentication with email and password. The flow:

1. User signs up → Supabase sends a confirmation email
2. User clicks the link → account activated
3. User signs in → Supabase returns a JWT session
4. The Supabase client automatically attaches the JWT to all database requests
5. RLS policies on the DB validate the JWT and restrict access to the user's own rows

Session persistence is handled automatically by the Supabase client (stored in localStorage). On app load, `supabase.auth.getSession()` restores the session silently — the user stays logged in across browser refreshes.

The app subscribes to `onAuthStateChange` to reactively update UI when the session changes (e.g., after sign out or token expiry).

---

## Data Flow

```
Supabase DB
    ↕  (SQL queries via Supabase JS SDK)
AppContext (AppProvider)
    ↕  (useAppContext() hook)
Components (Dashboard, Calendar, CycleLog, SymptomLog)
```

**On login:**
1. `useEffect` fires when `user` state changes from `null` to a User object
2. Two parallel Supabase queries fetch `cycles` and `daily_logs` for that user
3. Results are stored in `useState` arrays inside AppContext
4. All components re-render with the fetched data

**On add/update/delete:**
1. Component calls a context method (e.g., `addDailyLog(data)`)
2. Context sends the Supabase query
3. On success, context **optimistically updates local state** — no refetch needed
4. UI updates instantly; Supabase DB is the source of truth

**State does not persist in localStorage** — all data lives in Supabase. When the user opens the app on a different device, data is freshly fetched from the database.

---

## Prediction Algorithm

Defined in `src/hooks/useCyclePredictions.ts` and memoized with `useMemo`.

**Average cycle length:**
- Takes all recorded cycles sorted by start date
- Calculates the gap in days between each consecutive pair of start dates
- Averages those gaps
- Falls back to 28 days if fewer than 2 cycles exist

**Average period length:**
- Takes only completed cycles (those with an `endDate`)
- Averages the number of days between start and end
- Falls back to 5 days if no completed cycles

**Next period prediction:**
- Takes the most recent cycle's start date
- Adds the average cycle length

**Ovulation window:**
- Ovulation typically occurs ~14 days before the next period
- Window = predicted next period date minus 14 days, ±2 days
- Displayed as a 5-day range on the calendar in green

**Current cycle day:**
- Days elapsed since the most recent period's start date + 1

These predictions appear on the Dashboard as text and on the Calendar as color highlights.

---

## Symptom Tracking

Symptoms are stored as a plain `string[]` on each `DailyLog`. The predefined library is organized into 9 categories in `src/constants/symptoms.ts`:

| Category | Examples |
|---|---|
| Pain & Body 🩹 | Cramps, Headache, Back pain, Breast tenderness |
| Energy ⚡ | Fatigue, Insomnia, Dizziness, Hot flashes |
| Digestive 🫃 | Bloating, Nausea, Food cravings, Constipation |
| Skin ✨ | Acne, Oily skin, Water retention |
| Mood 💭 | Happy, Irritable, Anxious, Mood swings |
| Mental 🧠 | Brain fog, Difficulty concentrating |
| Reproductive 💖 | Spotting, High libido, Cervical mucus changes |
| Lifestyle 🌿 | Exercised, High stress, Took medication |
| Wellness 😌 | Meditation, Good sleep, Self-care day |

The form uses collapsible category rows. A summary box at the top shows all selected symptoms as removable chips. Users can also type in a custom symptom not in the list.

---

## PWA Features

Configured via `vite-plugin-pwa` in `vite.config.ts`:

- **Installable** — users can add to home screen on iOS/Android/desktop
- **Standalone mode** — launches without browser UI (looks like a native app)
- **Offline support** — Workbox caches all JS, CSS, and HTML assets
- **Auto-updates** — service worker updates silently in the background
- **Portrait lock** — optimized for mobile portrait orientation

---

## Running Locally

```bash
# 1. Clone the repo
git clone https://github.com/saum26/period-tracker.git
cd period-tracker

# 2. Install dependencies
npm install

# 3. Create environment file
echo "VITE_SUPABASE_URL=your_project_url" > .env
echo "VITE_SUPABASE_ANON_KEY=your_anon_key" >> .env

# 4. Start the dev server
npm run dev
```

Open `http://localhost:5173`.

---

## Deployment

The app is deployed on **Vercel** with automatic deployments on every push to `main`.

Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are configured in Vercel's dashboard under **Settings → Environment Variables** — they are never committed to the repository.

---

## Design Decisions

**Why React Context instead of Redux/Zustand?**
The app's state is simple — two arrays (`cycles`, `dailyLogs`) with straightforward CRUD. A full state management library would add unnecessary complexity. Context + `useCallback` is sufficient and keeps the codebase lean.

**Why Supabase?**
Supabase provides a hosted PostgreSQL database, authentication, and a JavaScript SDK in one service — no need to build or host a separate backend. Row Level Security at the database level means data isolation is enforced server-side, not just in application code.

**Why store symptoms as `string[]` instead of a separate table?**
Symptoms don't need to be queried or filtered independently — they're always loaded and displayed as part of a daily log. Storing them as a PostgreSQL `text[]` array keeps the schema simple and avoids unnecessary joins.

**Why Vite instead of Create React App?**
Vite's build times are significantly faster than CRA, and it has native support for Tailwind CSS 4, TypeScript, and PWA plugins without ejecting.

**Why date-fns instead of moment.js or Day.js?**
date-fns is tree-shakeable (only the functions you import are bundled), immutable by design, and has full TypeScript support. This keeps the bundle size small.

**Why no `useEffect` for syncing state after mutations?**
After each add/update/delete, the context updates local state directly using the data returned from the Supabase insert/update response. This avoids an extra round-trip to the database and makes the UI feel instant.
