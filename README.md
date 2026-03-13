# LifeModo Glance — NFC Demo PWA

> **Tier 1 of the LifeModo V6.0 Architecture** — The zero-friction NFC entry point to scnd-brain.

## What This Is

The Glance PWA is the physical-digital interface of the LifeModo system. NFC tags embedded in Arcus Circles trigger contextual iOS screens with no login, no app install, no friction. Tap a tag → see your data → act.

**Saturday demo use case:** Investor presentation. Tap physical NFC fobs → see LifeModo working in the real world.

## Live URLs

| Screen | NFC URL |
|--------|---------|
| 🏠 Live App | https://lifemodo-glance-demo.vercel.app |
| Fob Side A | https://lifemodo-glance-demo.vercel.app/c/fob-a |
| Dashboard | https://lifemodo-glance-demo.vercel.app/c/fob-b |
| Booze Nag | https://lifemodo-glance-demo.vercel.app/c/wine |
| Weights | https://lifemodo-glance-demo.vercel.app/c/weights |
| Story Circle | https://lifemodo-glance-demo.vercel.app/c/story |

## Architecture Context (V6.0)

```
Interface Layer (Tier 1 — this repo)
  └── Glance PWA — NFC/PWA, no auth, zero friction

Compute Layer
  └── CleverClaw (OpenClaw fork) — 6 specialized agents

Memory Layer
  └── scnd-brain — Supabase Postgres + pgvector per client
```

The Glance screens project from scnd-brain's Life Item Taxonomy (8 types: Task, Fact, Preference, Method, Observation, Season, Open Loop, Project). Currently uses hardcoded fallback data for the demo.

## Design

**iOS 26 Liquid Glass** — dark navy gradient (`#0a0f2c` → `#05050f`), frosted glass cards (`backdrop-blur-md bg-white/10`), per-screen accent colors:
- Fob-A: Blue (`#0d1b3e`)
- Dashboard: Green (`#051b0d`)
- Booze Nag: Crimson (`#2d0a12`)
- Weights: Orange (`#1f0d00`)
- Story: Purple (`#12002d`)

## Screens

| Route | Screen | Purpose |
|-------|--------|---------|
| `/c/fob-a` | Glance Home | Greeting + health pill + 4 action tiles |
| `/c/fob-b` | Home Status | Full household + health dashboard |
| `/c/wine` | Booze Nag | Drink logging with HRV correlation insight |
| `/c/weights` | Home Gym | HRV-gated workout readiness |
| `/c/story` | Storytelling Circle | Family archive playback |

## Running Locally

```bash
npm install
npm run dev
# Open http://localhost:3000 → redirects to /c/fob-a
```

## Connecting Live Data (Supabase)

1. Create a free Supabase project at https://supabase.com
2. Run this SQL:

```sql
CREATE TABLE health_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  sleep_hours NUMERIC DEFAULT 7.2,
  hrv_ms INTEGER DEFAULT 58,
  readiness_pct INTEGER DEFAULT 89,
  resting_hr INTEGER DEFAULT 62,
  steps_today INTEGER DEFAULT 3240,
  glasses_wine_tonight INTEGER DEFAULT 0,
  glasses_wine_week INTEGER DEFAULT 2,
  last_workout JSONB DEFAULT '{"reps": 15, "sets": 3, "peak_hr": 122, "calories": 45}'
);
```

3. Copy your Project URL and anon key into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Add one row to `health_context` with today's data
5. Redeploy to Vercel (add env vars in Project Settings → Environment Variables)

## Demo Notes

- **No Supabase configured** = fallback data always shown (HRV 58ms, 89% ready, 7.2h sleep)
- **iOS Safari NFC behavior**: NFC tap opens URL in Safari, not the installed PWA
- **"Add to Home Screen"**: Works via PWA manifest + apple-touch-icon
- **Voice/audio features**: Shown as "coming in v1" — not implemented in demo

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Supabase (optional — graceful fallback)
- Deployed on Vercel
