import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Lazy-init client to avoid build-time errors
let _supabase: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

// Keep backward compatibility with proxy
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    return (getSupabase() as any)[prop];
  }
});

export default supabase;