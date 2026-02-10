import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET: List all members with their wallets
export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        member_status,
        technogym_user_id,
        created_at,
        updated_at
      `)
      .in('role', ['member', 'admin', 'superadmin', 'professional'])
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('member_status', status);
    }

    const { data: members, error } = await query;

    if (error) throw error;

    // Get wallets for all members
    const userIds = members?.map(m => m.id) || [];
    let walletsMap: Record<string, { bonus_balance: number }> = {};
    
    if (userIds.length > 0) {
      const { data: wallets } = await supabase
        .from('wallets')
        .select('user_id, bonus_balance')
        .in('user_id', userIds);
      
      if (wallets) {
        wallets.forEach(w => {
          walletsMap[w.user_id] = { bonus_balance: w.bonus_balance };
        });
      }
    }

    // Get active memberships
    const { data: memberships } = await supabase
      .from('memberships')
      .select('user_id, end_date, payment_status')
      .in('user_id', userIds)
      .gte('end_date', new Date().toISOString().split('T')[0]);

    const membershipsMap: Record<string, { end_date: string }> = {};
    memberships?.forEach(m => {
      if (m.payment_status === 'paid') {
        membershipsMap[m.user_id] = { end_date: m.end_date };
      }
    });

    // Enrich members with wallet and membership data
    const enrichedMembers = members?.map(m => ({
      ...m,
      bonus_balance: walletsMap[m.id]?.bonus_balance || 0,
      membership_expires_at: membershipsMap[m.id]?.end_date || null
    }));

    // Apply search filter if provided
    let filteredMembers = enrichedMembers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredMembers = enrichedMembers?.filter(m => 
        m.full_name?.toLowerCase().includes(searchLower) ||
        m.email?.toLowerCase().includes(searchLower) ||
        m.phone?.includes(search)
      );
    }

    return NextResponse.json({ members: filteredMembers, error: null });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ members: null, error: 'Failed to fetch members' }, { status: 500 });
  }
}

// POST: Create a new member directly (invite)
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const body = await request.json();
    const { email, fullName, phone, password, role = 'member' } = body;

    if (!email || !fullName || !password) {
      return NextResponse.json(
        { error: 'email, fullName y password son requeridos' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
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

    // Update profile with member data
    if (authData.user) {
      await supabase
        .from('user_profiles')
        .update({
          full_name: fullName,
          phone: phone || null,
          role,
          member_status: 'active'
        })
        .eq('id', authData.user.id);

      // Create wallet for new member
      await supabase
        .from('wallets')
        .insert({
          user_id: authData.user.id,
          bonus_balance: 0
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Miembro creado exitosamente',
      userId: authData.user?.id
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: 'Error al crear miembro' }, { status: 500 });
  }
}

// PATCH: Update member status (approve, reject, suspend)
export async function PATCH(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const body = await request.json();
    const { user_id, action, admin_id, notes } = body;

    if (!user_id || !action) {
      return NextResponse.json(
        { error: 'user_id y action son requeridos' },
        { status: 400 }
      );
    }

    let updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (action === 'approve') {
      updateData.member_status = 'active';
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = admin_id || null;
      if (notes) updateData.application_notes = notes;

      // Ensure wallet exists
      const { data: existingWallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', user_id)
        .single();

      if (!existingWallet) {
        await supabase
          .from('wallets')
          .insert({ user_id, bonus_balance: 0 });
      }
    } else if (action === 'reject') {
      updateData.member_status = 'rejected';
      if (notes) updateData.application_notes = notes;
    } else if (action === 'suspend') {
      updateData.member_status = 'suspended';
      if (notes) updateData.application_notes = notes;
    } else if (action === 'reactivate') {
      updateData.member_status = 'active';
    } else {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }

    const { data: member, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: member, error: null });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Error al actualizar miembro' }, { status: 500 });
  }
}

// PUT: Update member profile
export async function PUT(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 });
    }

    const { data: member, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: member, error: null });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Error al actualizar miembro' }, { status: 500 });
  }
}