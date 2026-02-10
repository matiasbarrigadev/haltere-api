import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Lazy-init client to avoid build-time errors
let _supabase: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Durante el build/SSG, las variables pueden no estar disponibles
    if (!supabaseUrl || !supabaseAnonKey) {
      // Retornar un cliente dummy que no hace nada durante el build
      // Esto previene errores de prerendering
      return {
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          signOut: async () => ({ error: null }),
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Build mode' } }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: null }),
              maybeSingle: async () => ({ data: null, error: null }),
            }),
            order: () => ({
              limit: async () => ({ data: [], error: null }),
            }),
          }),
          insert: async () => ({ data: null, error: null }),
          update: async () => ({ data: null, error: null }),
          delete: async () => ({ data: null, error: null }),
        }),
      } as unknown as SupabaseClient<Database>;
    }
    
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
