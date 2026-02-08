import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  
  // Test Supabase connection
  let dbStatus = 'disconnected';
  try {
    const { error } = await supabase.from('_health_check').select('*').limit(1).maybeSingle();
    // If table doesn't exist, that's fine - we just want to test the connection
    dbStatus = error && error.code !== 'PGRST116' ? 'error' : 'connected';
  } catch {
    dbStatus = 'error';
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: dbStatus,
  });
}