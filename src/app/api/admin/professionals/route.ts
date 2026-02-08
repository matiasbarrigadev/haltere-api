import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Lazy-init supabase to avoid build-time errors
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - List all professionals with their services and commissions
export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';

    const { data: professionals, error: profError } = await supabase
      .from('professional_profiles')
      .select(`
        *,
        user:user_profiles!professional_profiles_user_id_fkey (
          id,
          email,
          full_name,
          phone,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (profError) {
      console.error('Error fetching professionals:', profError);
      return NextResponse.json({ error: 'Error al obtener profesionales' }, { status: 500 });
    }

    const { data: professionalServices, error: servError } = await supabase
      .from('professional_services')
      .select(`
        *,
        service:services (
          id,
          name,
          slug,
          price_bonos,
          price_fiat,
          duration_minutes
        )
      `);

    if (servError) {
      console.error('Error fetching professional services:', servError);
    }

    const { data: allServices } = await supabase
      .from('services')
      .select('id, name, slug, price_bonos, price_fiat, duration_minutes, requires_professional')
      .eq('is_active', true)
      .order('name');

    let commissionStats: Record<string, { total: number; pending: number; count: number }> = {};
    if (includeStats) {
      const { data: commissions } = await supabase
        .from('commission_records')
        .select('professional_id, commission_amount, status');

      if (commissions) {
        commissions.forEach((c: { professional_id: string; commission_amount: string | number; status: string }) => {
          if (!commissionStats[c.professional_id]) {
            commissionStats[c.professional_id] = { total: 0, pending: 0, count: 0 };
          }
          commissionStats[c.professional_id].count++;
          const amount = parseFloat(c.commission_amount as string) || 0;
          commissionStats[c.professional_id].total += amount;
          if (c.status === 'pending' || c.status === 'approved') {
            commissionStats[c.professional_id].pending += amount;
          }
        });
      }
    }

    const professionalsWithServices = professionals?.map((prof: { id: string }) => {
      const services = professionalServices?.filter((ps: { professional_id: string }) => ps.professional_id === prof.id) || [];
      return {
        ...prof,
        services,
        stats: includeStats ? commissionStats[prof.id] || { total: 0, pending: 0, count: 0 } : null
      };
    });

    return NextResponse.json({
      professionals: professionalsWithServices,
      allServices: allServices || []
    });
  } catch (error) {
    console.error('Error in GET professionals:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Create a new professional or update existing
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const body = await request.json();
    const { userId, specialty, bio, commissionRate, isAvailable, services } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('professional_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    let professionalId: string;

    if (existing) {
      const { error: updateError } = await supabase
        .from('professional_profiles')
        .update({
          specialty: specialty || [],
          bio: bio || null,
          commission_rate: commissionRate ?? 50,
          is_available: isAvailable ?? true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Error updating professional:', updateError);
        return NextResponse.json({ error: 'Error al actualizar profesional' }, { status: 500 });
      }
      professionalId = existing.id;
    } else {
      const { data: created, error: createError } = await supabase
        .from('professional_profiles')
        .insert({
          user_id: userId,
          specialty: specialty || [],
          bio: bio || null,
          commission_rate: commissionRate ?? 50,
          is_available: isAvailable ?? true
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating professional:', createError);
        return NextResponse.json({ error: 'Error al crear profesional' }, { status: 500 });
      }
      professionalId = created.id;

      await supabase
        .from('user_profiles')
        .update({ role: 'professional' })
        .eq('id', userId);
    }

    if (services && Array.isArray(services)) {
      await supabase
        .from('professional_services')
        .delete()
        .eq('professional_id', professionalId);

      if (services.length > 0) {
        const serviceInserts = services.map((s: { serviceId: string; commissionOverride?: number }) => ({
          professional_id: professionalId,
          service_id: s.serviceId,
          commission_override: s.commissionOverride ?? null,
          is_active: true
        }));

        const { error: serviceError } = await supabase
          .from('professional_services')
          .insert(serviceInserts);

        if (serviceError) {
          console.error('Error inserting services:', serviceError);
        }
      }
    }

    const { data: professional } = await supabase
      .from('professional_profiles')
      .select(`
        *,
        user:user_profiles!professional_profiles_user_id_fkey (
          id,
          email,
          full_name,
          phone,
          avatar_url
        )
      `)
      .eq('id', professionalId)
      .single();

    return NextResponse.json({ success: true, professional });
  } catch (error) {
    console.error('Error in POST professional:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Remove professional profile
export async function DELETE(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('id');

    if (!professionalId) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 });
    }

    const { data: prof } = await supabase
      .from('professional_profiles')
      .select('user_id')
      .eq('id', professionalId)
      .single();

    await supabase.from('professional_services').delete().eq('professional_id', professionalId);
    await supabase.from('professional_availability').delete().eq('professional_id', professionalId);
    await supabase.from('professional_time_blocks').delete().eq('professional_id', professionalId);

    const { error } = await supabase
      .from('professional_profiles')
      .delete()
      .eq('id', professionalId);

    if (error) {
      console.error('Error deleting professional:', error);
      return NextResponse.json({ error: 'Error al eliminar profesional' }, { status: 500 });
    }

    if (prof?.user_id) {
      await supabase
        .from('user_profiles')
        .update({ role: 'member' })
        .eq('id', prof.user_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE professional:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}