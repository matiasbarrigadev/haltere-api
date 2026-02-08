import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const { data: locations, error } = await supabaseAdmin
      .from('locations')
      .select(`
        *,
        zones:zones(*)
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data: locations, error: null });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}