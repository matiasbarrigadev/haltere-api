import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// POST - Setup inicial: Crear usuario admin (solo funciona si no hay admins)
// Este endpoint es para el setup inicial del sistema
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, fullName, password, setupKey } = body;

    // Verificar setup key (para prevenir uso no autorizado)
    if (setupKey !== 'HALTERE_SETUP_2026') {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 });
    }

    if (!email || !fullName || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Actualizar perfil con rol admin
    if (authData.user) {
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          full_name: fullName,
          email: email,
          role: 'admin',
          member_status: 'active'
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      userId: authData.user?.id 
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Error in setup:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}