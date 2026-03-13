'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#0a0a1a] to-[#05050f] flex flex-col items-center justify-center px-6 gap-6">
      <div className="text-5xl">⚠️</div>
      <div className="text-center">
        <h1 className="text-white text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-white/40 text-sm">LifeModo couldn't load this screen</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={reset}
          className="w-full rounded-2xl px-6 py-4 font-semibold text-base text-center bg-blue-600 text-white shadow-lg active:scale-95 transition-all"
        >
          Try again
        </button>
        <Link
          href="/c/fob-a"
          className="w-full rounded-2xl px-6 py-4 font-semibold text-base text-center bg-transparent border-2 border-white/20 text-white/70 active:scale-95 transition-all"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
