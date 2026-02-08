import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET: List member applications pending approval
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending_approval';

    const { data: members, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('role', 'member')
      .eq('member_status', status)
      .order('application_date', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data: members, error: null });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch members' }, { status: 500 });
  }
}

// PATCH: Approve or reject member application
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { user_id, action, admin_id, notes } = body;

    if (!user_id || !action || !admin_id) {
      return NextResponse.json(
        { data: null, error: 'user_id, action, and admin_id are required' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Approve member and create wallet
      const { data: member, error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          member_status: 'active',
          approved_at: new Date().toISOString(),
          approved_by: admin_id,
          application_notes: notes
        })
        .eq('id', user_id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Ensure wallet exists for new member
      await supabaseAdmin.rpc('ensure_wallet_exists', { p_user_id: user_id });

      return NextResponse.json({ data: member, error: null });

    } else if (action === 'reject') {
      const { data: member, error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          member_status: 'rejected',
          application_notes: notes
        })
        .eq('id', user_id)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({ data: member, error: null });

    } else if (action === 'suspend') {
      const { data: member, error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          member_status: 'suspended',
          application_notes: notes
        })
        .eq('id', user_id)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({ data: member, error: null });
    }

    return NextResponse.json({ data: null, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating member:', error);
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }
}