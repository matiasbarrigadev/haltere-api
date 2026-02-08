import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('location_id');
    const serviceType = searchParams.get('type');

    let query = supabaseAdmin
      .from('services_full')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (serviceType) {
      query = query.eq('service_type', serviceType);
    }

    const { data: services, error } = await query;
    if (error) throw error;

    // Filter by location if specified
    let filteredServices = services;
    if (locationId && services) {
      filteredServices = services.filter((s: any) => {
        const zones = s.available_zones || [];
        return zones.some((z: any) => z.location_id === locationId);
      });
    }

    return NextResponse.json({ data: filteredServices, error: null });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch services' }, { status: 500 });
  }
}