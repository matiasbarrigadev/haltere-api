import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbStatus = 'not_configured';
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      // Dynamically import to avoid build-time errors
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });
      
      // Simple connection test
      const { error } = await supabase.from('_health_check').select('*').limit(1).maybeSingle();
      // PGRST116 means table doesn't exist, which is fine for health check
      dbStatus = error && error.code !== 'PGRST116' ? 'error' : 'connected';
    } catch {
      dbStatus = 'error';
    }
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: dbStatus,
    environment: process.env.NODE_ENV || 'unknown',
  });
}