import { createClient } from '@supabase/supabase-js'

// These env vars are set in Vercel → Settings → Environment Variables
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
