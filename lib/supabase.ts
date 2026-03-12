import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export const FALLBACK_DATA = {
  sleep_hours: 7.2,
  hrv_ms: 58,
  readiness_pct: 89,
  resting_hr: 62,
  steps_today: 3240,
  glasses_wine_tonight: 0,
  glasses_wine_week: 2,
  last_workout: { reps: 15, sets: 3, peak_hr: 122, calories: 45 },
}

export type HealthContext = typeof FALLBACK_DATA & { id?: string }

export async function fetchHealthContext(): Promise<HealthContext> {
  if (!supabase) return FALLBACK_DATA
  try {
    const { data, error } = await supabase
      .from('health_context')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()
    if (error || !data) return FALLBACK_DATA
    return { ...FALLBACK_DATA, ...data }
  } catch {
    return FALLBACK_DATA
  }
}

export async function incrementWineGlass(
  current: HealthContext
): Promise<boolean> {
  if (!supabase || !current.id) return false
  try {
    const { error } = await supabase
      .from('health_context')
      .update({
        glasses_wine_tonight: (current.glasses_wine_tonight || 0) + 1,
        glasses_wine_week: (current.glasses_wine_week || 0) + 1,
      })
      .eq('id', current.id)
    return !error
  } catch {
    return false
  }
}
