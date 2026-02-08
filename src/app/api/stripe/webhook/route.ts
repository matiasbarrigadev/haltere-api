import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { type, user_id, bonos_amount } = session.metadata || {};

    if (!user_id) {
      console.error('No user_id in metadata');
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    try {
      if (type === 'membership') {
        // Update user status to active member
        await supabaseAdmin
          .from('user_profiles')
          .update({ member_status: 'active' })
          .eq('id', user_id);

        // Ensure wallet exists for member
        await supabaseAdmin.rpc('ensure_wallet_exists', { p_user_id: user_id });

        console.log(`Membership activated for user ${user_id}`);

      } else if (type === 'bonos') {
        // Add bonos to wallet using RPC
        const bonos = parseInt(bonos_amount || '0', 10);
        
        if (bonos > 0) {
          // Get package ID from database by bonus amount
          const { data: pkg } = await supabaseAdmin
            .from('bonus_packages')
            .select('id')
            .eq('bonus_amount', bonos)
            .eq('is_active', true)
            .single();

          if (pkg) {
            await supabaseAdmin.rpc('purchase_bonos', {
              p_user_id: user_id,
              p_package_id: pkg.id,
              p_stripe_payment_id: session.payment_intent as string
            });
            console.log(`${bonos} bonos added for user ${user_id}`);
          }
        }
      }

      return NextResponse.json({ received: true });
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Return 200 for unhandled event types
  return NextResponse.json({ received: true });
}
