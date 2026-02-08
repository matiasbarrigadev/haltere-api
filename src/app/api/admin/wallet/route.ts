import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Lazy-init supabase to avoid build-time errors
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST - Add bonos to a user's wallet (admin function)
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const body = await request.json();
    const { userId, amount, description, adminNote } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'amount debe ser mayor a 0' }, { status: 400 });
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Check if wallet exists, create if not
    let { data: wallet } = await supabase
      .from('wallets')
      .select('id, bonus_balance')
      .eq('user_id', userId)
      .single();

    if (!wallet) {
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({
          user_id: userId,
          bonus_balance: 0,
          lifetime_purchased: 0,
          lifetime_spent: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating wallet:', createError);
        return NextResponse.json({ error: 'Error al crear wallet' }, { status: 500 });
      }
      wallet = newWallet;
    }

    const previousBalance = wallet!.bonus_balance || 0;
    const newBalance = previousBalance + amount;

    // Update wallet balance
    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        bonus_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet!.id);

    if (updateError) {
      console.error('Error updating wallet:', updateError);
      return NextResponse.json({ error: 'Error al actualizar wallet' }, { status: 500 });
    }

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet!.id,
        type: 'bonus',
        amount: amount,
        balance_after: newBalance,
        reference_type: 'admin_credit',
        description: description || `Crédito de bonos por administrador${adminNote ? ': ' + adminNote : ''}`
      })
      .select()
      .single();

    if (txError) {
      console.error('Error creating transaction:', txError);
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, full_name: user.full_name, email: user.email },
      wallet: {
        id: wallet!.id,
        previous_balance: previousBalance,
        amount_added: amount,
        new_balance: newBalance
      },
      transaction
    });
  } catch (error) {
    console.error('Error in POST admin wallet:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// GET - Get wallet info for a user
export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: transactions } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet?.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      user,
      wallet: wallet || { bonus_balance: 0 },
      transactions: transactions || []
    });
  } catch (error) {
    console.error('Error in GET admin wallet:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}