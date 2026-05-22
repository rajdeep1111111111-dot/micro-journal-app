# Reflecto

A warm, private micro-journaling app with AI reflections, streak tracking, and a friends feed.

**Live:** [reflecto.it.com](https://reflecto.it.com)

---

## What it does

Reflecto gives you a low-friction space to write a few lines about your day. It tracks your streak, generates an AI reflection on each entry, and lets you share moments with friends — all in a mobile-first interface designed to feel calm and personal.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Database + Auth | Supabase |
| Deployment | Vercel |
| AI | OpenAI gpt-4o-mini |
| Email | Resend (SMTP) |
| Styling | Tailwind CSS |
| Icons | Lucide React |

---

## Running locally

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/micro-journal-app.git
cd micro-journal-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> Never commit `.env.local` — it's in `.gitignore`.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database schema

### Tables

| Table | Purpose |
|---|---|
| `users` | Extended profile — username, avatar, is_public flag |
| `journal_entries` | User entries. `is_private` defaults to `true` |
| `ai_reflections` | One AI reflection per journal entry |
| `friendships` | Friendship requests — status: `pending`, `accepted`, `rejected` |
| `shared_entries` | Entries a user has explicitly shared to their feed |
| `reactions` | Emoji reactions on shared entries |
| `comments` | Comments on shared entries |
| `streaks` | Per-user streak count and last active date |

### RLS

Row-Level Security is enabled on all tables. Anonymous users cannot read any table. Access rules:

- `journal_entries` — users can only read/write their own entries
- `ai_reflections` — readable only by the entry owner
- `friendships` — readable by either party in the friendship
- `shared_entries` / `reactions` / `comments` — readable by accepted friends and public accounts
- `streaks` — readable only by the owning user
- `users` — public profiles readable by anyone; private data only by owner

All policies were tested against the anonymous role in Supabase Studio.

### Triggers

- On new user signup → auto-creates a row in `users` and `streaks`

---

## Auth flows

- Email + password signup with email confirmation
- Magic link login
- Password reset via email
- All emails sent from `hello@reflecto.it.com` via Resend SMTP

---

## Deployment

Deployed on Vercel. All environment variables are set in the Vercel project dashboard.

Production domain: `reflecto.it.com`
Vercel default: `micro-journal-app-six.vercel.app`

To deploy:
```bash
git push origin main
```
Vercel auto-deploys on every push to `main`.

---

## Known limitations

- Share tab and Feed post button are currently wired to placeholder UI — real Supabase integration is planned for v1.1
- No push notifications yet
- No dark mode yet
- Sentry error monitoring not yet set up

---

## Roadmap (v1.1)

- [ ] Wire Share tab to real Supabase data
- [ ] Wire Feed post button
- [ ] Marketing landing page at root domain (app moves to `/app`)
- [ ] Dark mode
- [ ] Push notifications
- [ ] Sentry error monitoring
