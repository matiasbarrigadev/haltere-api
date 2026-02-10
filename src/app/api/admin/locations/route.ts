import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - List all locations with zones
export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';

    let query = supabase
      .from('locations')
      .select(`
        *,
        zones:zones(*)
      `)
      .order('sort_order', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: locations, error } = await query;

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

// POST - Create new location
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const body = await request.json();
    const {
      name,
      description,
      address,
      city,
      country = 'Chile',
      latitude,
      longitude,
      timezone = 'America/Santiago',
      is_24_hours = true,
      opening_time,
      closing_time,
      phone,
      email,
      image_url,
      amenities = []
    } = body;

    if (!name || !address || !city) {
      return NextResponse.json(
        { data: null, error: 'Campos requeridos: name, address, city' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data: existingLocation } = await supabase
      .from('locations')
      .select('id')
      .eq('slug', slug)
      .single();

    const finalSlug = existingLocation ? `${slug}-${Date.now()}` : slug;

    const { data: location, error } = await supabase
      .from('locations')
      .insert({
        name,
        slug: finalSlug,
        description,
        address,
        city,
        country,
        latitude,
        longitude,
        timezone,
        is_24_hours,
        opening_time: is_24_hours ? null : opening_time,
        closing_time: is_24_hours ? null : closing_time,
        phone,
        email,
        image_url,
        amenities,
        is_active: true,
        sort_order: 0
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      data: location,
      message: 'Sede creada exitosamente',
      error: null
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to create location' },
      { status: 500 }
    );
  }
}

// PUT - Update existing location
export async function PUT(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { data: null, error: 'id es requerido' },
        { status: 400 }
      );
    }

    const { data: location, error } = await supabase
      .from('locations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: location, error: null });
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete location
export async function DELETE(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { data: null, error: 'id es requerido' },
        { status: 400 }
      );
    }

    // Soft delete - just deactivate
    const { data, error } = await supabase
      .from('locations')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Also deactivate zones in this location
    await supabase
      .from('zones')
      .update({ is_active: false })
      .eq('location_id', id);

    return NextResponse.json({
      data,
      message: 'Sede desactivada',
      error: null
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}