import { createClient } from '@supabase/supabase-js';

// Supabase client created using the same NEXT_PUBLIC_* env vars you have locally.
// Your `.env.local` contains:
// - NEXT_PUBLIC_SUPABASE_URL
// - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
// We'll use those so server code runs without requiring a service role key.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !publishableKey) {
  console.warn('Supabase client not fully configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY');
}

// Create a Supabase client using the publishable key (matches .env.local). This client may have limited privileges depending on RLS.
export const supabaseServer = createClient(supabaseUrl, publishableKey);
