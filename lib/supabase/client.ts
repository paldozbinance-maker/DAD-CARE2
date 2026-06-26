import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a no-op stub so the app doesn't crash if env vars are missing
    // (e.g. on Netlify when vars aren't configured yet)
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[Supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. ' +
        'Realtime features will be disabled.'
      )
    }
    // Return a minimal stub that satisfies the call sites
    return {
      auth: { signOut: async () => ({}) },
      channel: () => ({
        on: () => ({ subscribe: () => ({}) }),
        subscribe: () => ({}),
      }),
      removeChannel: async () => {},
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

