'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { fetchHealthContext, incrementWineGlass, hasSupabase, FALLBACK_DATA, type HealthContext } from '@/lib/supabase'

// ── Toast Notification ────────────────────────────────────────────────────────
function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [onDismiss])
  return (
    <div className="fixed bottom-8 left-4 right-4 z-50 transition-all duration-300">
      <div className="backdrop-blur-md bg-white/15 border border-white/25 rounded-2xl px-5 py-4 text-white text-sm font-medium text-center shadow-2xl">
        {message}
      </div>
    </div>
  )
}

function useToast() {
  const [toast, setToast] = useState<string | null>(null)
  const show = useCallback((msg: string) => setToast(msg), [])
  const dismiss = useCallback(() => setToast(null), [])
  const ToastEl = toast ? <Toast message={toast} onDismiss={dismiss} /> : null
  return { show, ToastEl }
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}

function getDayLabel() {
  return new Date().toLocaleDateString('en-GB', { weekday: 'long' })
}

// ── Shared UI Primitives ──────────────────────────────────────────────────────

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-6 ${className}`}>
      {children}
    </div>
  )
}

function Screen({ children, gradient }: { children: React.ReactNode; gradient: string }) {
  return (
    <div
      className={`min-h-dvh w-full flex flex-col px-4 pb-safe ${gradient}`}
      style={{ paddingTop: 'max(env(safe-area-inset-top, 44px), 44px)' }}
    >
      {children}
    </div>
  )
}

function NavBar({ back, title, accent }: { back?: string; title: string; accent: string }) {
  return (
    <div className="flex items-center gap-3 mb-6 pt-2">
      {back && (
        <Link href={back} className={`text-2xl leading-none ${accent} opacity-80 hover:opacity-100`}>
          ←
        </Link>
      )}
      <span className="text-white/50 text-sm font-medium tracking-widest uppercase">{title}</span>
    </div>
  )
}

function ActionButton({
  href,
  onClick,
  children,
  accent,
  outline,
}: {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  accent: string
  outline?: boolean
}) {
  const base = `w-full rounded-2xl px-6 py-4 font-semibold text-base text-center transition-all active:scale-95 ${
    outline
      ? `bg-transparent border-2 ${accent} text-white/80`
      : `${accent} text-white shadow-lg`
  }`
  if (href)
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    )
  return (
    <button onClick={onClick} className={base}>
      {children}
    </button>
  )
}

// ── FOB-A ─────────────────────────────────────────────────────────────────────

function FobAScreen({ data }: { data: HealthContext }) {
  const { show: showToast, ToastEl } = useToast()
  return (
    <Screen gradient="bg-gradient-to-b from-[#0d1b3e] via-[#0a0f2c] to-[#05050f]">
      <NavBar title="LifeModo · Glance" accent="text-blue-400" />

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-white leading-tight" suppressHydrationWarning>
          Good {getGreeting()},<br />Roderic.
        </h1>
        <p className="text-white/50 text-sm mt-1" suppressHydrationWarning>{getDayLabel()} · Home · 3 people in</p>
      </div>

      {/* Health Pill */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 text-sm text-blue-200 font-medium">
          <span>⚡</span>
          <span>
            {data.readiness_pct}% Ready · HRV {data.hrv_ms}ms ↑ · {data.sleep_hours}h sleep
          </span>
        </div>
      </div>

      {/* 2×2 Action Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {[
          {
            icon: '📞',
            label: 'Call your Coach',
            sub: 'Available now',
            href: 'tel:+33600000000',
            color: 'from-blue-600/40 to-blue-800/40',
            border: 'border-blue-400/30',
          },
          {
            icon: '🎤',
            label: 'Voice note',
            sub: 'Capture a thought',
            href: null,
            color: 'from-indigo-600/40 to-indigo-800/40',
            border: 'border-indigo-400/30',
          },
          {
            icon: '💪',
            label: 'Start workout',
            sub: `HRV ${data.hrv_ms}ms ready`,
            href: '/c/weights',
            color: 'from-orange-600/40 to-orange-800/40',
            border: 'border-orange-400/30',
          },
          {
            icon: '🍷',
            label: 'Log a drink',
            sub: `${data.glasses_wine_week} this week`,
            href: '/c/wine',
            color: 'from-rose-600/40 to-rose-800/40',
            border: 'border-rose-400/30',
          },
        ].map((card) => {
          const inner = (
            <div
              className={`backdrop-blur-md bg-gradient-to-br ${card.color} rounded-3xl border ${card.border} p-5 h-full flex flex-col justify-between min-h-[140px] active:scale-95 transition-transform`}
            >
              <span className="text-3xl">{card.icon}</span>
              <div>
                <div className="text-white font-semibold text-base leading-snug">{card.label}</div>
                <div className="text-white/50 text-xs mt-0.5">{card.sub}</div>
              </div>
            </div>
          )
          if (card.href && card.href.startsWith('/'))
            return (
              <Link key={card.label} href={card.href}>
                {inner}
              </Link>
            )
          if (card.href && card.href.startsWith('tel:'))
            return (
              <button key={card.label} onClick={() => showToast('📞 Coach — available at Saturday demo')} className="text-left">
                {inner}
              </button>
            )
          return (
            <button
              key={card.label}
              onClick={() => showToast('🎤 Voice capture — coming in v1')}
              className="text-left"
            >
              {inner}
            </button>
          )
        })}
      </div>

      <div className="mt-6 pb-6">
        <Link href="/c/fob-b" className="text-center block text-white/30 text-sm">
          View dashboard →
        </Link>
      </div>
      {ToastEl}
    </Screen>
  )
}

// ── FOB-B ─────────────────────────────────────────────────────────────────────

function FobBScreen({ data }: { data: HealthContext }) {
  const statusCards: Array<{ icon: string; label: string; value: string; color: string; href?: string }> = [
    {
      icon: '🏠',
      label: 'Household',
      value: '3 people in · Staff: off today',
      color: 'text-sky-300',
    },
    {
      icon: '❤️',
      label: 'Health',
      value: `${data.sleep_hours}h sleep · HRV ${data.hrv_ms}ms ${data.hrv_ms > 50 ? '↑' : '↓'} · ${data.readiness_pct}% ready`,
      color: 'text-green-300',
    },
    {
      icon: '📅',
      label: 'Tonight',
      value: 'Investor dinner · 20:00',
      color: 'text-yellow-300',
    },
    {
      icon: '🍷',
      label: 'Booze Nag',
      value: `${data.glasses_wine_week} glasses this week (avg: 3.1)`,
      color: 'text-rose-300',
    },
    {
      icon: '📞',
      label: 'Coach',
      value: 'Available · Tap to connect',
      color: 'text-blue-300',
    },
  ]

  return (
    <Screen gradient="bg-gradient-to-b from-[#051b0d] via-[#050f0a] to-[#05050f]">
      <NavBar back="/c/fob-a" title="Home Status" accent="text-green-400" />

      <h1 className="text-2xl font-bold text-white mb-1">Your Home · Right Now</h1>
      <p className="text-white/40 text-sm mb-6" suppressHydrationWarning>{getDayLabel()} · {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>

      <div className="flex flex-col gap-3 flex-1">
        {statusCards.map((card) => {
          const inner = (
            <GlassCard className="flex items-start gap-4">
              <span className="text-2xl mt-0.5">{card.icon}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold tracking-widest uppercase mb-1 ${card.color}`}>
                  {card.label}
                </div>
                <div className="text-white text-sm leading-snug">{card.value}</div>
              </div>
              {card.href && <span className="text-white/30 text-lg">→</span>}
            </GlassCard>
          )
          if (card.href)
            return (
              <a key={card.label} href={card.href}>
                {inner}
              </a>
            )
          return <div key={card.label}>{inner}</div>
        })}
      </div>

      <div className="mt-6 pb-4 flex gap-3">
        <Link href="/c/weights" className="flex-1 text-center text-white/30 text-sm py-2">
          💪 Weights
        </Link>
        <Link href="/c/wine" className="flex-1 text-center text-white/30 text-sm py-2">
          🍷 Wine
        </Link>
        <Link href="/c/story" className="flex-1 text-center text-white/30 text-sm py-2">
          🎨 Story
        </Link>
      </div>
    </Screen>
  )
}

// ── WINE ─────────────────────────────────────────────────────────────────────

const WINE_SESSION_KEY = 'lm_wine_tonight'

function WineScreen({ data: initialData }: { data: HealthContext }) {
  // Persist wine count across navigation using sessionStorage
  const [data, setData] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(WINE_SESSION_KEY)
      if (stored !== null) {
        const count = parseInt(stored, 10) || 0 // guard against NaN if storage corrupted
        return { ...initialData, glasses_wine_tonight: count }
      }
    }
    return initialData
  })
  const [logged, setLogged] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(WINE_SESSION_KEY) !== null
    }
    return false
  })
  const [logging, setLogging] = useState(false)

  async function handleLog() {
    if (logging || logged) return // guard against double-tap
    setLogging(true)
    const newCount = (data.glasses_wine_tonight || 0) + 1
    await incrementWineGlass(data) // best-effort Supabase write
    setData((d) => ({
      ...d,
      glasses_wine_tonight: newCount,
      glasses_wine_week: (d.glasses_wine_week || 0) + 1,
    }))
    // Persist so navigating away and back shows correct count
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(WINE_SESSION_KEY, String(newCount))
    }
    setLogged(true)
    setLogging(false)
  }

  return (
    <Screen gradient="bg-gradient-to-b from-[#2d0a12] via-[#1a050d] to-[#05050f]">
      <NavBar back="/c/fob-a" title="Booze Nag" accent="text-rose-400" />

      <h1 className="text-2xl font-bold text-white mb-1">Consumption Circle</h1>
      <p className="text-rose-300 text-sm mb-6">Red Wine 🍷</p>

      {/* Wine Card */}
      <GlassCard className="mb-4 bg-rose-500/10 border-rose-400/30">
        <div className="text-white font-semibold text-lg">Château Margaux 2019</div>
        <div className="text-rose-200/70 text-sm mt-1">14.5% ABV · Bordeaux</div>
      </GlassCard>

      {/* Glass Count */}
      <GlassCard className="mb-4 text-center bg-rose-500/10 border-rose-400/20">
        <div className="text-5xl font-bold text-white mb-1">
          {data.glasses_wine_tonight || 0}
        </div>
        <div className="text-rose-200 text-sm">
          {logged
            ? `✓ Logged · ${data.glasses_wine_tonight} tonight · ${data.glasses_wine_week} this week`
            : `Tonight · Tap to log glass #${(data.glasses_wine_tonight || 0) + 1} · ${data.glasses_wine_week} this week`}
        </div>
      </GlassCard>

      {/* Insight */}
      <GlassCard className="mb-4 opacity-70 bg-white/5 border-white/10">
        <p className="text-white/70 text-sm leading-relaxed">
          📊 Your HRV drops ~22% above 3 glasses. You&apos;re at{' '}
          <span className="text-rose-300 font-medium">{data.hrv_ms}ms</span> tonight.
        </p>
        <p className="text-white/40 text-xs mt-2">Last Sat: 3 glasses → 6.2h sleep</p>
      </GlassCard>

      <div className="flex flex-col gap-3 mt-auto pb-4">
        {logged ? (
          <GlassCard className="text-center bg-green-500/20 border-green-400/30">
            <div className="text-green-300 font-semibold">✓ Logged successfully</div>
            <div className="text-white/50 text-xs mt-1">Data saved to LifeModo</div>
          </GlassCard>
        ) : (
          <ActionButton
            onClick={handleLog}
            accent={`bg-rose-600${logging ? ' opacity-60 pointer-events-none' : ''}`}
          >
            {logging ? 'Logging…' : '🍷 Log this glass'}
          </ActionButton>
        )}
        <ActionButton href="/c/story" accent="border-rose-400/50" outline>
          📖 Tell the story
        </ActionButton>
      </div>
    </Screen>
  )
}

// ── WEIGHTS ──────────────────────────────────────────────────────────────────

function WeightsScreen({ data }: { data: HealthContext }) {
  const [started, setStarted] = useState(false)
  const lw = data.last_workout as { reps: number; sets: number; peak_hr: number; calories: number }
  const goodHrv = data.hrv_ms > 50

  return (
    <Screen gradient="bg-gradient-to-b from-[#1f0d00] via-[#110800] to-[#05050f]">
      <NavBar back="/c/fob-a" title="Home Gym" accent="text-orange-400" />

      <h1 className="text-2xl font-bold text-white mb-1">Strength Training</h1>
      <p className="text-orange-300 text-sm mb-6">💪 Home Gym</p>

      {/* HRV Banner */}
      <div
        className={`rounded-2xl px-5 py-3 mb-4 flex items-center gap-3 ${
          goodHrv
            ? 'bg-green-500/20 border border-green-400/30'
            : 'bg-yellow-500/20 border border-yellow-400/30'
        }`}
      >
        <span className="text-xl">{goodHrv ? '✅' : '⚠️'}</span>
        <div>
          <div className={`text-sm font-semibold ${goodHrv ? 'text-green-300' : 'text-yellow-300'}`}>
            HRV {data.hrv_ms}ms {data.hrv_ms > 50 ? '↑' : '↓'} ·{' '}
            {goodHrv ? 'Good day to push' : 'Consider light session'}
          </div>
          <div className="text-white/40 text-xs">{data.readiness_pct}% readiness</div>
        </div>
      </div>

      {/* Last Session */}
      <GlassCard className="mb-4 bg-orange-500/10 border-orange-400/20">
        <div className="text-orange-200 text-xs font-semibold uppercase tracking-widest mb-3">
          Last session
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Sets', value: `${lw.sets}` },
            { label: 'Reps', value: `${lw.reps}` },
            { label: 'Peak HR', value: `${lw.peak_hr}bpm` },
            { label: 'Calories', value: `${lw.calories}kcal` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/5 rounded-2xl p-3 text-center">
              <div className="text-white font-bold text-xl">{value}</div>
              <div className="text-white/40 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Target */}
      <GlassCard className="mb-6 bg-orange-500/10 border-orange-400/20">
        <div className="text-orange-200 text-xs font-semibold uppercase tracking-widest mb-2">
          Today&apos;s target
        </div>
        <div className="text-white text-xl font-bold">
          {lw.sets + 1} sets × {lw.reps} reps
        </div>
        <div className="text-white/40 text-sm mt-1">+1 set progression</div>
      </GlassCard>

      <div className="pb-4">
        {started ? (
          <Link href="/c/fob-a">
            <GlassCard className="text-center bg-orange-500/20 border-orange-400/30">
              <div className="text-orange-300 font-semibold text-lg">⌚ Starting on Watch…</div>
              <div className="text-white/50 text-sm mt-1">Tap to return to home</div>
            </GlassCard>
          </Link>
        ) : (
          <ActionButton onClick={() => setStarted(true)} accent="bg-orange-600">
            💪 Start workout
          </ActionButton>
        )}
      </div>
    </Screen>
  )
}

// ── STORY ────────────────────────────────────────────────────────────────────

function StoryScreen() {
  const [playing, setPlaying] = useState(false)
  const [recording, setRecording] = useState(false)
  const { show: showToast, ToastEl } = useToast()

  return (
    <Screen gradient="bg-gradient-to-b from-[#12002d] via-[#0a0019] to-[#05050f]">
      <NavBar back="/c/fob-a" title="Storytelling Circle" accent="text-purple-400" />

      <h1 className="text-2xl font-bold text-white mb-1">Storytelling Circle</h1>
      <p className="text-purple-300 text-sm mb-6">🎨 Family Archive</p>

      {/* Story Card */}
      <GlassCard className="mb-4 bg-purple-500/10 border-purple-400/30">
        <div className="text-purple-200 text-xs font-semibold uppercase tracking-widest mb-3">
          Current story
        </div>
        <h2 className="text-white text-xl font-bold mb-1">The Story of the Painting</h2>
        <p className="text-white/50 text-xs">Recorded by Roderic · 2min 14s</p>
      </GlassCard>

      {/* Transcript */}
      <GlassCard className="mb-4 bg-white/5 border-white/10 opacity-80">
        <p className="text-white/60 text-sm italic leading-relaxed">
          &ldquo;This was found at the Marché aux Puces in 1987. My mother carried it home on the
          Métro, still wrapped in newspaper…&rdquo;
        </p>
      </GlassCard>

      {/* Waveform placeholder */}
      <GlassCard className="mb-6 bg-purple-500/5 border-purple-400/20">
        <div className="flex items-center gap-1 justify-center h-10">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all ${
                playing ? 'bg-purple-400' : 'bg-purple-400/30'
              }`}
              style={{ height: `${Math.sin(i * 0.7) * 16 + 20}px` }}
            />
          ))}
        </div>
        {playing && (
          <p className="text-purple-300 text-xs text-center mt-2">Playing…</p>
        )}
      </GlassCard>

      <div className="flex flex-col gap-3 pb-4">
        <ActionButton
          onClick={() => {
            if (playing) {
              setPlaying(false)
            } else {
              setPlaying(true)
              showToast('▶ Story playback — coming in v1')
            }
          }}
          accent="bg-purple-600"
        >
          {playing ? '⏸ Pause Story' : '▶ Play Story'}
        </ActionButton>
        <ActionButton
          onClick={() => {
            setRecording(!recording)
            if (!recording) showToast('🎙 Voice recording — coming in v1')
          }}
          accent="border-purple-400/50"
          outline
        >
          {recording ? '⏺ Recording…' : '🎙 Record your version'}
        </ActionButton>
      </div>

      <p className="text-center text-white/25 text-xs pb-6 mt-2">
        Every object has a story. LifeModo remembers them all.
      </p>
      {ToastEl}
    </Screen>
  )
}

// ── NOT FOUND ─────────────────────────────────────────────────────────────────

function NotFoundScreen() {
  return (
    <Screen gradient="bg-gradient-to-b from-[#0a0a1a] to-[#05050f]">
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <div className="text-5xl">🔮</div>
        <h1 className="text-white text-2xl font-bold">Circle not found</h1>
        <Link href="/c/fob-a" className="text-blue-400 text-sm">
          → Go to Fob A
        </Link>
      </div>
    </Screen>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function CircleScreen({ circle }: { circle: string }) {
  const [data, setData] = useState<HealthContext>(FALLBACK_DATA)
  // Only show loading spinner when Supabase is configured — avoids blank screen on NFC tap
  const [loading, setLoading] = useState(hasSupabase)

  useEffect(() => {
    if (!hasSupabase) return // fallback data already loaded
    fetchHealthContext().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  // Show skeleton while loading
  if (loading) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-[#0a0a1a] to-[#05050f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
          <p className="text-white/30 text-xs">Loading LifeModo…</p>
        </div>
      </div>
    )
  }

  switch (circle) {
    case 'fob-a':
      return <FobAScreen data={data} />
    case 'fob-b':
      return <FobBScreen data={data} />
    case 'wine':
      return <WineScreen data={data} />
    case 'weights':
      return <WeightsScreen data={data} />
    case 'story':
      return <StoryScreen />
    default:
      return <NotFoundScreen />
  }
}
