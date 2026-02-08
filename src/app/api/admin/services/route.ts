import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Función para obtener cliente de Supabase (lazy init)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - Listar todos los servicios con detalles
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('location_id');
    const serviceType = searchParams.get('type');
    const includeInactive = searchParams.get('include_inactive') === 'true';

    // Obtener servicios con categoría
    let query = supabase
      .from('services')
      .select(`
        *,
        category:service_categories(id, name, slug, color, icon)
      `)
      .order('sort_order', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    if (serviceType) {
      query = query.eq('service_type', serviceType);
    }

    const { data: services, error: servicesError } = await query;
    if (servicesError) throw servicesError;

    // Obtener disponibilidad por zona para cada servicio
    const { data: zoneAvailability, error: zoneError } = await supabase
      .from('service_zone_availability')
      .select(`
        *,
        zone:zones(id, name, location_id, zone_type),
        location:locations(id, name, city, country)
      `)
      .eq('is_active', true);

    if (zoneError) throw zoneError;

    // Obtener profesionales asociados a servicios
    const { data: professionalServices, error: psError } = await supabase
      .from('professional_services')
      .select(`
        *,
        professional:professional_profiles(
          id,
          specialty,
          user:user_profiles(id, full_name, email)
        )
      `)
      .eq('is_active', true);

    if (psError) throw psError;

    // Obtener clases programadas
    const { data: scheduledClasses, error: scError } = await supabase
      .from('scheduled_classes')
      .select(`
        *,
        professional:professional_profiles(
          id,
          user:user_profiles(id, full_name)
        ),
        location:locations(id, name, city),
        zone:zones(id, name)
      `)
      .eq('is_active', true);

    if (scError) throw scError;

    // Enriquecer servicios con datos adicionales
    const enrichedServices = services?.map((service: any) => {
      const zones = zoneAvailability?.filter((z: any) => z.service_id === service.id) || [];
      const professionals = professionalServices?.filter((ps: any) => ps.service_id === service.id) || [];
      const classes = scheduledClasses?.filter((sc: any) => sc.service_id === service.id) || [];
      
      // Obtener locations únicas donde el servicio está disponible
      const uniqueLocations = [...new Set(zones.map((z: any) => z.location_id))].map(locId => {
        const zone = zones.find((z: any) => z.location_id === locId);
        return zone?.location;
      }).filter(Boolean);

      return {
        ...service,
        available_zones: zones,
        available_locations: uniqueLocations,
        assigned_professionals: professionals,
        scheduled_classes: classes,
        total_professionals: professionals.length,
        total_locations: uniqueLocations.length,
        total_scheduled_classes: classes.length
      };
    });

    // Filtrar por location si se especifica
    let filteredServices = enrichedServices;
    if (locationId) {
      filteredServices = enrichedServices?.filter((s: any) => 
        s.available_locations?.some((loc: any) => loc?.id === locationId)
      );
    }

    return NextResponse.json({ data: filteredServices, error: null });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch services' }, { status: 500 });
  }
}

// POST - Crear nuevo servicio
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const {
      name,
      description,
      service_type,
      category_id,
      duration_minutes,
      buffer_minutes = 0,
      price_bonos,
      price_fiat,
      currency = 'CLP',
      max_participants = 1,
      min_advance_hours = 0,
      max_advance_days = 30,
      cancellation_hours = 24,
      specialty_required,
      members_only = false,
      is_featured = false,
      image_url,
      location_ids = [],
      zone_ids = [],
      professional_id,
      scheduled_classes = []
    } = body;

    // Validaciones
    if (!name || !service_type || !duration_minutes || price_bonos === undefined || price_fiat === undefined) {
      return NextResponse.json({
        data: null,
        error: 'Campos requeridos faltantes: name, service_type, duration_minutes, price_bonos, price_fiat'
      }, { status: 400 });
    }

    if ((service_type === 'appointment' || service_type === 'class') && !professional_id) {
      return NextResponse.json({
        data: null,
        error: 'professional_id es requerido para servicios tipo appointment o class'
      }, { status: 400 });
    }

    if (service_type === 'class' && (!scheduled_classes || scheduled_classes.length === 0)) {
      return NextResponse.json({
        data: null,
        error: 'Para servicios tipo class, debe definir al menos una clase programada'
      }, { status: 400 });
    }

    // Generar slug único
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data: existingService } = await supabase
      .from('services')
      .select('id')
      .eq('slug', slug)
      .single();

    const finalSlug = existingService ? `${slug}-${Date.now()}` : slug;

    // Crear el servicio
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert({
        name,
        slug: finalSlug,
        description,
        service_type,
        category_id,
        duration_minutes,
        buffer_minutes,
        price_bonos,
        price_fiat,
        currency,
        max_participants: service_type === 'class' ? max_participants : 1,
        min_advance_hours,
        max_advance_days,
        cancellation_hours,
        requires_professional: service_type === 'appointment' || service_type === 'class',
        specialty_required,
        members_only,
        is_featured,
        image_url,
        is_active: true
      })
      .select()
      .single();

    if (serviceError) throw serviceError;

    // Crear disponibilidad por zona/location
    if (zone_ids.length > 0 || location_ids.length > 0) {
      if (zone_ids.length > 0) {
        const { data: zones } = await supabase
          .from('zones')
          .select('id, location_id')
          .in('id', zone_ids);

        if (zones && zones.length > 0) {
          const zoneAvailabilityData = zones.map((zone: any) => ({
            service_id: service.id,
            zone_id: zone.id,
            location_id: zone.location_id,
            is_active: true
          }));

          await supabase
            .from('service_zone_availability')
            .insert(zoneAvailabilityData);
        }
      } else if (location_ids.length > 0) {
        const { data: zones } = await supabase
          .from('zones')
          .select('id, location_id')
          .in('location_id', location_ids)
          .eq('is_active', true);

        if (zones && zones.length > 0) {
          const zoneAvailabilityData = zones.map((zone: any) => ({
            service_id: service.id,
            zone_id: zone.id,
            location_id: zone.location_id,
            is_active: true
          }));

          await supabase
            .from('service_zone_availability')
            .insert(zoneAvailabilityData);
        }
      }
    }

    // Asociar profesional al servicio
    if (professional_id) {
      await supabase
        .from('professional_services')
        .insert({
          professional_id,
          service_id: service.id,
          is_active: true
        });
    }

    // Crear clases programadas
    if (service_type === 'class' && scheduled_classes.length > 0) {
      const classesData = scheduled_classes.map((cls: any) => ({
        service_id: service.id,
        location_id: cls.location_id,
        zone_id: cls.zone_id || null,
        professional_id: professional_id,
        day_of_week: cls.day_of_week,
        start_time: cls.start_time,
        end_time: cls.end_time,
        max_participants: cls.max_participants || max_participants,
        is_active: true
      }));

      await supabase
        .from('scheduled_classes')
        .insert(classesData);
    }

    return NextResponse.json({
      data: service,
      message: 'Servicio creado exitosamente',
      error: null
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ data: null, error: 'Failed to create service' }, { status: 500 });
  }
}

// PUT - Actualizar servicio existente
export async function PUT(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ data: null, error: 'Service ID is required' }, { status: 400 });
    }

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (serviceError) throw serviceError;

    return NextResponse.json({ data: service, error: null });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ data: null, error: 'Failed to update service' }, { status: 500 });
  }
}

// DELETE - Desactivar servicio (soft delete)
export async function DELETE(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ data: null, error: 'Service ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('services')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('scheduled_classes')
      .update({ is_active: false })
      .eq('service_id', id);

    await supabase
      .from('service_zone_availability')
      .update({ is_active: false })
      .eq('service_id', id);

    return NextResponse.json({ data, message: 'Servicio desactivado', error: null });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ data: null, error: 'Failed to delete service' }, { status: 500 });
  }
}