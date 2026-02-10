import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET - Listar todos los usuarios
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let query = supabaseAdmin
      .from('user_profiles')
      .select('id, full_name, email, phone, role, member_status, created_at')
      .order('created_at', { ascending: false });

    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error in GET users:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT - Actualizar rol de usuario
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, role, adminId } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing required fields: userId, role' }, { status: 400 });
    }

    // Validar roles permitidos
    const validRoles = ['member', 'professional', 'admin', 'superadmin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }, { status: 400 });
    }

    // Verificar que el admin tiene permisos (solo superadmin puede crear otros admins)
    if (adminId && (role === 'admin' || role === 'superadmin')) {
      const { data: adminProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('role')
        .eq('id', adminId)
        .single();

      if (adminProfile?.role !== 'superadmin' && adminProfile?.role !== 'admin') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json({ error: 'Error updating user role' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `User role updated to ${role}`,
      data 
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error in PUT user:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Crear usuario admin directamente (solo para superadmins)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, fullName, role, password, adminId } = body;

    if (!email || !fullName || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Solo admins pueden crear usuarios directamente
    if (adminId) {
      const { data: adminProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('role')
        .eq('id', adminId)
        .single();

      if (!['admin', 'superadmin'].includes(adminProfile?.role || '')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Actualizar perfil con rol
    if (authData.user) {
      await supabaseAdmin
        .from('user_profiles')
        .update({
          full_name: fullName,
          role: role || 'member',
          member_status: 'active'
        })
        .eq('id', authData.user.id);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      userId: authData.user?.id 
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Error in POST user:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}