import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Lazy-init admin client to avoid build-time errors
let _supabaseAdmin: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabaseAdmin;
}

// Keep backward compatibility
export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    return (getSupabaseAdmin() as any)[prop];
  }
});

export default supabaseAdmin;