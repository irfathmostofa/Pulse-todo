# Pulse — Daily Focus

A daily check-in app: log what you're doing today, set your mood, run focus sessions, and see your month at a glance.

## Stack
React + Vite, Tailwind CSS, Supabase (Postgres + Auth), deployed to Netlify.

## Features
- **Today**: date strip navigation, mood check-in (⚡😊😐😴😩), add new or recurring tasks, drag-and-drop to reprioritize.
- **Focus**: Pomodoro timer with focus/short break/long break presets, custom durations, session tracking, and browser notifications.
- **Dashboard**: summary stats — tasks completed/pending, pomodoro sessions, avg mood, completion rate, active days.
- **Activity**: GitHub-style monthly heatmap, a day-wise bar chart, and a scrollable list of the month's work — its own tab, separate from Dashboard.
- **Settings**: dark/light mode toggle, change password, sign out.
- A single sticky bottom tab bar (Today / Focus / Dashboard / Activity), app-style. Settings lives behind the gear icon in the header.
- Sign-in gate via Supabase Auth — nothing loads until you log in.

## Setup

1. Create a Supabase project, then run `supabase/schema.sql` in the SQL editor.
2. In **Authentication → Users**, manually add the one account you'll log in with (email + password). This app has no public sign-up — you create your own login once.
3. Copy `.env.example` to `.env` and fill in your project URL + anon key:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
4. Install and run:
   ```
   npm install
   npm run dev
   ```
5. Log in with the account you created in step 2. Use Settings → Change password if you want to update it later.

## Deploy
Push to GitHub and connect the repo in Netlify (or run `netlify deploy`). Build command `npm run build`, publish directory `dist`. Add the two `VITE_SUPABASE_*` env vars in Netlify's site settings.

## Notes
- RLS policies require an authenticated session (`auth.role() = 'authenticated'`) on every table — the anon key alone can't read or write anything until you sign in.
- Browser notifications need permission — click the prompt on the Focus tab once to enable them.
- Recurring tasks are templates: adding one creates today's instance and will auto-populate on future days until you stop it (the X button on a recurring task).
- Light/dark mode is saved to `localStorage` and defaults to your OS preference on first load.
- Fully responsive: bottom nav becomes a proper mobile tab bar with safe-area padding for notched phones; all grids/charts stack down to a single column on small screens.
# pulse-todo
