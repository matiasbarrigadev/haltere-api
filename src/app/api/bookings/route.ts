import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { addMinutes, parseISO } from 'date-fns';

// GET: List bookings for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!userId) {
      return NextResponse.json({ data: null, error: 'user_id is required' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        service:services(name, slug, duration_minutes, service_type),
        zone:zones(name, zone_type),
        location:locations(name, slug),
        professional:professional_profiles(id, user_id, specialty)
      `)
      .eq('user_id', userId)
      .order('start_datetime', { ascending: true });

    if (status) query = query.eq('status', status);
    if (from) query = query.gte('start_datetime', from);
    if (to) query = query.lte('start_datetime', to);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// POST: Create a new booking
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      user_id,
      service_id,
      zone_id,
      location_id,
      professional_id,
      start_datetime,
      payment_method, // 'bonos' | 'fiat'
      notes
    } = body;

    // 1. Get service details
    const { data: service, error: svcError } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('id', service_id)
      .single();

    if (svcError || !service) {
      return NextResponse.json({ data: null, error: 'Service not found' }, { status: 404 });
    }

    // 2. Calculate end time
    const startDt = parseISO(start_datetime);
    const endDt = addMinutes(startDt, service.duration_minutes);
    const end_datetime = endDt.toISOString();

    // 3. Check zone availability
    const { data: zoneAvail, error: zoneErr } = await supabaseAdmin
      .rpc('check_zone_availability', {
        p_zone_id: zone_id,
        p_start: start_datetime,
        p_end: end_datetime
      });

    if (zoneErr || !zoneAvail?.[0]?.is_available) {
      return NextResponse.json({ data: null, error: 'Zone not available at this time' }, { status: 409 });
    }

    // 4. Check professional availability (if applicable)
    if (professional_id) {
      const { data: proAvail, error: proErr } = await supabaseAdmin
        .rpc('check_professional_availability', {
          p_professional_id: professional_id,
          p_start: start_datetime,
          p_end: end_datetime
        });

      if (proErr || !proAvail?.[0]?.is_available) {
        return NextResponse.json({ 
          data: null, 
          error: `Professional not available: ${proAvail?.[0]?.conflict_reason || 'conflict'}` 
        }, { status: 409 });
      }
    }

    // 5. Process payment based on method
    if (payment_method === 'bonos') {
      // Use RPC to create booking with bonos (atomic transaction)
      const { data: booking, error: bookErr } = await supabaseAdmin
        .rpc('create_booking_with_bonos', {
          p_user_id: user_id,
          p_service_id: service_id,
          p_zone_id: zone_id,
          p_location_id: location_id,
          p_professional_id: professional_id,
          p_start_datetime: start_datetime,
          p_end_datetime: end_datetime,
          p_bonos_to_charge: service.price_bonos,
          p_notes: notes
        });

      if (bookErr) {
        console.error('Booking error:', bookErr);
        return NextResponse.json({ data: null, error: bookErr.message }, { status: 400 });
      }

      return NextResponse.json({ data: booking, error: null }, { status: 201 });

    } else {
      // For fiat payments, generate booking number locally
      const bookingNumber = `BK${Date.now().toString(36).toUpperCase()}`;
      
      const { data: booking, error: bookErr } = await supabaseAdmin
        .from('bookings')
        .insert({
          booking_number: bookingNumber,
          user_id,
          user_type: 'guest',
          service_id,
          zone_id,
          location_id,
          professional_id,
          start_datetime,
          end_datetime,
          status: 'pending',
          payment_method: 'fiat',
          fiat_charged: service.price_fiat,
          notes
        })
        .select()
        .single();

      if (bookErr) throw bookErr;

      return NextResponse.json({ data: booking, error: null }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ data: null, error: error.message || 'Failed to create booking' }, { status: 500 });
  }
}

// PATCH: Update booking (cancel, complete, etc.)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { booking_id, action, user_id, reason } = body;

    if (!booking_id || !action) {
      return NextResponse.json({ data: null, error: 'booking_id and action required' }, { status: 400 });
    }

    if (action === 'cancel') {
      const { data, error } = await supabaseAdmin
        .rpc('cancel_booking', {
          p_booking_id: booking_id,
          p_cancelled_by: user_id,
          p_reason: reason,
          p_refund_bonos: true
        });

      if (error) throw error;
      return NextResponse.json({ data, error: null });
    }

    if (action === 'complete') {
      const { data, error } = await supabaseAdmin
        .rpc('complete_booking', {
          p_booking_id: booking_id,
          p_completed_by: user_id
        });

      if (error) throw error;
      return NextResponse.json({ data, error: null });
    }

    return NextResponse.json({ data: null, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }
}