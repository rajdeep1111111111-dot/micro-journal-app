# Reflecto

A mobile-first micro-journaling app with AI reflections and social sharing.

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: OpenAI gpt-4o-mini
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI account
- Vercel account

### Setup

1. Clone the repo:

```bash
git clone https://github.com/rajdeep1111111111-dot/micro-journal-app.git
cd micro-journal-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

8 tables: `users`, `journal_entries`, `ai_reflections`, `friendships`, `shared_entries`, `reactions`, `comments`, `streaks`.

RLS enabled on all tables. See Supabase dashboard for full schema.

## Features

- Email/password and magic link authentication
- Daily journaling with optional title
- AI reflection powered by GPT-4o-mini
- Streak tracking and calendar view
- Friends system with mutual accept
- Share journal entries with friends
- Reactions and comments on shared entries

## Known Limitations

- Friends page uses mock data (real Supabase wiring coming in v2)
- OpenAI API requires paid credits
- Dark mode toggle is UI only (not fully implemented yet)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `OPENAI_API_KEY` | OpenAI API key for AI reflections |
