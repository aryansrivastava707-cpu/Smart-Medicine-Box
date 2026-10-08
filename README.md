# Smart Medical Box Web

A production-ready React/Vite dashboard for the college mini project **“IoT-Based Smart Medical Box for Medication Reminder and Monitoring.”**

The web app is designed around:

**Smart Medical Box → ESP32 → Wi-Fi → Supabase/API → Web Dashboard**

It includes a complete **Demo Mode** so the project can be presented without an ESP32 or backend connection.

> **Important:** This is a student prototype designed to assist with medication scheduling and organization. It is **not a certified medical device** and does not provide medical advice.

## Features

- Responsive desktop, tablet and mobile dashboard
- Demo Mode with realistic medicine, schedule, history, notification and device data
- Dashboard with taken/pending/missed/upcoming states
- Next Medicine actions: Mark as Taken and Snooze
- Medicine CRUD UI with validation and delete confirmation
- Schedule CRUD UI with frequency and day selection
- Visual 8-compartment smart-box layout
- Medication history with search, time ranges and adherence statistic
- Notifications with read/unread state and deletion
- Device telemetry dashboard with simulated ESP32 values
- Demo controls for medicine acknowledgement and compartment opening
- Settings for profile, reminders, device and local demo data
- Local persistence using browser localStorage in Demo Mode
- Supabase-ready service layer and authentication-ready login
- Supabase SQL schema with Row Level Security
- No API keys hardcoded
- Vercel/Netlify/GitHub-friendly Vite build

## Technologies

- React 18
- Vite
- JavaScript
- React Router
- Lucide React
- Supabase JS
- Plain CSS

No backend server is required to run the Demo Mode.

## Installation

Requirements:

- Node.js 18+ recommended
- npm

Extract the ZIP and run:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, normally:

```text
http://localhost:5173
```

## Production build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The output is generated in `dist/`.

## Demo Mode

Demo Mode is the default when Supabase environment variables are absent.

1. Run `npm install`
2. Run `npm run dev`
3. Open the site
4. Click **Enter Demo Mode**
5. Explore every navigation item
6. On Dashboard or Device, use:
   - **Test reminder**
   - **Mark as Taken**
   - **Simulate Medicine Taken**
   - **Simulate Compartment Open**
7. Demo data persists in browser localStorage.
8. Settings → Data → **Restore demo data** resets the presentation dataset.

The top navigation displays **DEMO MODE** and the Device page identifies the data source as Local Demo Data.

## Supabase setup

The application is prepared for Supabase but does not require it for the demonstration.

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Copy and run:

```text
supabase/supabase_schema.sql
```

4. In Supabase Authentication, configure your preferred email/password sign-in settings.
5. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

6. Add your Supabase project values:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

Only the public Supabase anon key belongs in the frontend. Never place a Supabase service-role key in this project.

### Current integration boundary

The UI and service layer are intentionally separated:

- `src/services/supabase.js` — Supabase client/configuration
- `src/services/dataService.js` — database service functions
- `src/hooks/useDemoData.js` — complete local Demo Mode state

This makes the demo reliable without a backend while keeping the data access boundary ready for the real implementation.

For a full production hardware deployment, replace or extend the demo state layer so authenticated users read/write the Supabase tables through `dataService.js`, and add a secure device ingestion endpoint for ESP32 telemetry.

## Environment variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

If either value is empty, the app remains Demo Mode.

## Database tables

`supabase/supabase_schema.sql` creates:

- `profiles`
- `medicines`
- `medicine_schedules`
- `medicine_logs`
- `compartments`
- `notifications`
- `device_status`
- `device_events`

RLS policies restrict rows to the authenticated user's `user_id`.

## Future ESP32 integration

Recommended event flow:

```text
ESP32
  |
  | Wi-Fi
  v
Secure API / Edge Function
  |
  v
Supabase
  |
  +--> device_status
  +--> device_events
  +--> medicine_logs
  +--> notifications
  |
  v
React Dashboard
```

Suggested event types:

- `heartbeat`
- `temperature`
- `humidity`
- `battery`
- `compartment_opened`
- `medicine_taken`
- `reminder_acknowledged`

The web dashboard should not directly expose privileged database credentials to the ESP32. Use a secure server-side/Edge Function ingestion layer for real hardware.

## GitHub

Create a repository and push the extracted project:

```bash
git init
git add .
git commit -m "Initial Smart Medical Box dashboard"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/smart-medical-box-web.git
git push -u origin main
```

Do not commit `.env`. The `.gitignore` below excludes it.

## Vercel deployment

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Framework preset: **Vite**.
4. Build command:

```text
npm run build
```

5. Output directory:

```text
dist
```

6. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Vercel environment variables if using Supabase.
7. Deploy.

Without Supabase variables, the deployed site automatically runs in Demo Mode.

## Netlify deployment

1. Import the GitHub repository.
2. Build command:

```text
npm run build
```

3. Publish directory:

```text
dist
```

4. Add the same environment variables in Netlify if Supabase is enabled.
5. Deploy.

## GitHub Pages

Vite static output can also be hosted from `dist/`. For GitHub Pages, configure the repository's Pages deployment to publish the Vite build output, or use a GitHub Actions workflow that runs:

```bash
npm ci
npm run build
```

For an uncomplicated college demonstration, Vercel or Netlify is recommended because they automatically build Vite projects and handle SPA hosting more conveniently.

## Accessibility

The UI uses semantic labels, keyboard-accessible buttons, focusable controls, status badges, dialog semantics and responsive layouts.

## Project limitations

- Demo Mode is simulated and does not represent live ESP32 telemetry.
- Browser localStorage is not a secure database and is intended only for the demonstration path.
- Supabase authentication is prepared, but the current dashboard state deliberately remains local Demo Mode when credentials are not configured.
- Real ESP32 communication requires a secure ingestion/API layer.
- The project does not diagnose conditions, prescribe medicines or replace professional medical advice.
- Environmental readings and battery values in Demo Mode are illustrative.

## Project structure

```text
smart-medical-box-web/
├── public/
├── src/
│   ├── components/
│   ├── data/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   └── supabase_schema.sql
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

## Render deployment

For Render Static Site:

- Build Command: `npm run build`
- Publish Directory: `dist`
- Root Directory: leave blank

This repository includes `render.yaml` with the React Router SPA rewrite:

```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

If the existing Render service was created from the Dashboard rather than the Blueprint, add the same rule under **Redirects/Rewrites**: Source `/*`, Destination `/index.html`, Action **Rewrite**.

Render documents this rewrite as the required pattern for React Router client-side routes. citeturn1search0turn1search2

## Authentication vs dashboard data

Supabase email/password authentication is supported when Supabase is configured. Demo Mode remains available without Supabase.

The current college-demo dashboard state is intentionally local and clearly labeled as Demo Data. The Supabase schema and service layer are prepared for the next integration step, but the browser does not pretend that local demo state is live database telemetry.

## Password recovery

When Supabase Auth is configured, **Forgot password?** sends a recovery email and opens `/reset-password` so the user can set a new password.

## Verification checklist

Before publishing a new build:

```bash
npm install
npm run build
```

Then test:

- Demo Mode login
- Dashboard timer and reminder actions
- Medicine add/edit/delete/search/filter
- Schedule add/edit/delete and today's schedule sync
- Compartment simulation
- Medication history filters and custom dates
- Notification read/delete actions
- Device telemetry simulation
- Settings persistence, dark mode and export
- Logout/login
- Direct refresh of `/medicines`, `/schedule`, `/device`, etc. on Render
