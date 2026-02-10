import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Lazy-init supabase to avoid build-time errors
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${timestamp}-${random}`;
}

// POST - Create a booking as admin (can be free, bonos, or fiat)
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const body = await request.json();
    const { 
      userId,
      serviceId,
      zoneId,
      locationId,
      professionalId,
      startDatetime,
      endDatetime,
      paymentMethod,
      notes,
      internalNotes
    } = body;

    if (!userId || !serviceId || !zoneId || !locationId || !startDatetime || !endDatetime) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: userId, serviceId, zoneId, locationId, startDatetime, endDatetime' },
        { status: 400 }
      );
    }

    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name, price_bonos, price_fiat')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
    }

    const method = paymentMethod || 'free';
    let bonosCharged = 0;
    let fiatCharged = 0;

    if (method === 'bonos') {
      bonosCharged = service.price_bonos || 0;
      
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id, bonus_balance')
        .eq('user_id', userId)
        .single();

      if (!wallet || (wallet.bonus_balance || 0) < bonosCharged) {
        return NextResponse.json(
          { error: `Saldo insuficiente. Se requieren ${bonosCharged} bonos.` },
          { status: 400 }
        );
      }

      const newBalance = (wallet.bonus_balance || 0) - bonosCharged;
      await supabase
        .from('wallets')
        .update({ 
          bonus_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);
    } else if (method === 'fiat') {
      fiatCharged = service.price_fiat || 0;
    }

    const bookingNumber = generateBookingNumber();
    const userType = user.role === 'member' || user.role === 'admin' || user.role === 'superadmin' ? 'member' : 'guest';

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_number: bookingNumber,
        user_id: userId,
        user_type: userType,
        service_id: serviceId,
        zone_id: zoneId,
        location_id: locationId,
        professional_id: professionalId || null,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        status: 'confirmed',
        payment_method: method,
        bonos_charged: bonosCharged,
        fiat_charged: fiatCharged,
        notes: notes || null,
        internal_notes: internalNotes || 'Reserva creada por administrador',
        source: 'admin'
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: 'Error al crear la reserva: ' + bookingError.message },
        { status: 500 }
      );
    }

    // If bonos were charged, create wallet transaction
    if (method === 'bonos' && bonosCharged > 0) {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id, bonus_balance')
        .eq('user_id', userId)
        .single();

      if (wallet) {
        await supabase
          .from('wallet_transactions')
          .insert({
            wallet_id: wallet.id,
            type: 'consumption',
            amount: -bonosCharged,
            balance_after: wallet.bonus_balance,
            reference_type: 'booking',
            reference_id: booking.id,
            description: `Reserva ${bookingNumber} - ${service.name}`
          });
      }
    }

    // If professional is assigned, create commission record
    if (professionalId && method !== 'free') {
      const { data: prof } = await supabase
        .from('professional_profiles')
        .select('commission_rate')
        .eq('id', professionalId)
        .single();

      const { data: profService } = await supabase
        .from('professional_services')
        .select('commission_override')
        .eq('professional_id', professionalId)
        .eq('service_id', serviceId)
        .single();

      const commissionRate = profService?.commission_override ?? prof?.commission_rate ?? 50;
      const bookingValue = method === 'bonos' ? bonosCharged * 1000 : fiatCharged;
      const commissionAmount = (bookingValue * commissionRate) / 100;

      await supabase
        .from('commission_records')
        .insert({
          professional_id: professionalId,
          booking_id: booking.id,
          booking_date: new Date(startDatetime).toISOString().split('T')[0],
          service_id: serviceId,
          service_name: service.name,
          booking_value_bonos: bonosCharged,
          booking_value_fiat: fiatCharged,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          status: 'pending',
          period_year: new Date(startDatetime).getFullYear(),
          period_month: new Date(startDatetime).getMonth() + 1
        });
    }

    return NextResponse.json({
      success: true,
      booking: { ...booking, user, service }
    });
  } catch (error) {
    console.error('Error in POST admin booking:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// GET - Get bookings list or options for admin
export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const locationId = searchParams.get('location_id');

    // Return options for booking form
    if (type === 'options') {
      const [
        { data: services },
        { data: locations },
        { data: zones },
        { data: professionals },
        { data: users }
      ] = await Promise.all([
        supabase.from('services').select('id, name, slug, price_bonos, price_fiat, duration_minutes, requires_professional').eq('is_active', true).order('name'),
        supabase.from('locations').select('id, name, slug').eq('is_active', true).order('name'),
        supabase.from('zones').select('id, name, slug, location_id, zone_type, capacity').eq('is_active', true).order('name'),
        supabase.from('professional_profiles').select(`
          id,
          specialty,
          is_available,
          user:user_profiles!professional_profiles_user_id_fkey (
            id,
            full_name,
            email
          )
        `).eq('is_available', true),
        supabase.from('user_profiles').select('id, full_name, email, role').in('role', ['member', 'admin', 'superadmin']).order('full_name')
      ]);

      return NextResponse.json({
        services: services || [],
        locations: locations || [],
        zones: zones || [],
        professionals: professionals || [],
        users: users || []
      });
    }

    // List bookings
    let query = supabase
      .from('bookings')
      .select(`
        *,
        user:user_profiles!bookings_user_id_fkey(id, full_name, email, phone),
        service:services!bookings_service_id_fkey(id, name, slug, price_bonos, price_fiat),
        location:locations!bookings_location_id_fkey(id, name, slug),
        zone:zones!bookings_zone_id_fkey(id, name, zone_type),
        professional:professional_profiles!bookings_professional_id_fkey(
          id,
          user:user_profiles!professional_profiles_user_id_fkey(id, full_name)
        )
      `)
      .order('start_datetime', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    if (dateFrom) {
      query = query.gte('start_datetime', dateFrom);
    }

    if (dateTo) {
      query = query.lte('start_datetime', dateTo);
    }

    const { data: bookings, error } = await query.limit(100);

    if (error) throw error;

    return NextResponse.json({ 
      bookings: bookings || [],
      error: null 
    });
  } catch (error) {
    console.error('Error in GET admin bookings:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}