import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// POST - Verificar si un email tiene solicitud aprobada
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Buscar en user_profiles si hay un miembro aprobado con ese email
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, full_name, email, member_status, application_date')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !profile) {
      return NextResponse.json({ 
        approved: false, 
        message: 'No se encontró una solicitud con este email' 
      }, { status: 200 });
    }

    // Verificar si está aprobado
    if (profile.member_status === 'active') {
      return NextResponse.json({
        approved: true,
        profileId: profile.id,
        fullName: profile.full_name,
        message: 'Solicitud aprobada - puede crear cuenta'
      }, { status: 200 });
    }

    // Otros estados
    const statusMessages: Record<string, string> = {
      pending_approval: 'Tu solicitud está pendiente de aprobación',
      interview: 'Tu solicitud está en proceso de entrevista',
      rejected: 'Tu solicitud ha sido rechazada',
    };

    return NextResponse.json({
      approved: false,
      status: profile.member_status,
      message: profile.member_status ? statusMessages[profile.member_status] : 'Estado desconocido'
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error checking member:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}