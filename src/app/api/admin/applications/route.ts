import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET - Listar todas las solicitudes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending_approval, active, rejected, interview

    let query = supabaseAdmin
      .from('user_profiles')
      .select('id, full_name, email, phone, member_status, application_notes, application_date, approved_by, approved_at, created_at')
      .not('application_date', 'is', null)
      .order('application_date', { ascending: false });

    // Filtrar por estado si se especifica
    if (status && status !== 'all') {
      query = query.eq('member_status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json({ error: 'Error fetching applications' }, { status: 500 });
    }

    // Parsear application_notes de cada solicitud
    const applications = data.map(app => {
      let parsedNotes = null;
      if (app.application_notes) {
        try {
          parsedNotes = JSON.parse(app.application_notes);
        } catch (e) {
          parsedNotes = { raw: app.application_notes };
        }
      }
      return {
        ...app,
        application_notes: parsedNotes
      };
    });

    return NextResponse.json({ data: applications }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error in GET applications:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT - Actualizar estado de una solicitud
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, member_status, approved_by } = body;

    if (!id || !member_status) {
      return NextResponse.json({ error: 'Missing required fields: id, member_status' }, { status: 400 });
    }

    // Validar estados permitidos
    const validStatuses = ['pending_approval', 'interview', 'active', 'rejected'];
    if (!validStatuses.includes(member_status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      member_status,
      updated_at: new Date().toISOString()
    };

    // Si se aprueba o rechaza, registrar quién y cuándo
    if (member_status === 'active' || member_status === 'rejected') {
      updateData.approved_at = new Date().toISOString();
      if (approved_by) {
        updateData.approved_by = approved_by;
      }
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating application:', error);
      return NextResponse.json({ error: 'Error updating application' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Application ${member_status === 'active' ? 'approved' : member_status === 'rejected' ? 'rejected' : 'updated'}`,
      data
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error in PUT application:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}