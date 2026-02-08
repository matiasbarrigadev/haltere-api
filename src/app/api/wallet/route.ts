import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET: Get user wallet and balance
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ data: null, error: 'user_id is required' }, { status: 400 });
    }

    // Ensure wallet exists
    await supabaseAdmin.rpc('ensure_wallet_exists', { p_user_id: userId });

    // Get wallet with recent transactions
    const { data: wallet, error } = await supabaseAdmin
      .from('wallets')
      .select(`
        *,
        transactions:wallet_transactions(
          id, type, amount, balance_after, description, reference_type, created_at
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return NextResponse.json({ data: wallet, error: null });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch wallet' }, { status: 500 });
  }
}

// POST: Purchase bonus package
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, package_id, stripe_payment_id } = body;

    if (!user_id || !package_id) {
      return NextResponse.json(
        { data: null, error: 'user_id and package_id are required' },
        { status: 400 }
      );
    }

    // Verify package exists and is active
    const { data: pkg, error: pkgError } = await supabaseAdmin
      .from('bonus_packages')
      .select('*')
      .eq('id', package_id)
      .eq('is_active', true)
      .single();

    if (pkgError || !pkg) {
      return NextResponse.json({ data: null, error: 'Package not found or inactive' }, { status: 404 });
    }

    // Process purchase via RPC (atomic)
    const { data, error } = await supabaseAdmin
      .rpc('purchase_bonos', {
        p_user_id: user_id,
        p_package_id: package_id,
        p_stripe_payment_id: stripe_payment_id || null
      });

    if (error) throw error;

    return NextResponse.json({
      data: {
        ...data?.[0],
        package: pkg
      },
      error: null
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error purchasing bonos:', error);
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }
}