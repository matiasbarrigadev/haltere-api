import { NextResponse } from 'next/server';
import { getStripe, MEMBERSHIP_PRICE, BONUS_PACKAGES, PackageType } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, user_id, package_type, success_url, cancel_url } = body;

    if (!type || !user_id || !success_url || !cancel_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, full_name')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let session;

    if (type === 'membership') {
      // Create membership payment session
      session = await getStripe().checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: 'clp',
              product_data: {
                name: 'Club Haltere - Membresía Anual',
                description: 'Acceso VIP 24/7 a todas las sedes por 1 año',
              },
              unit_amount: MEMBERSHIP_PRICE,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url,
        metadata: {
          type: 'membership',
          user_id,
        },
      });
    } else if (type === 'bonos') {
      if (!package_type || !BONUS_PACKAGES[package_type as PackageType]) {
        return NextResponse.json({ error: 'Invalid package type' }, { status: 400 });
      }

      const pkg = BONUS_PACKAGES[package_type as PackageType];

      session = await getStripe().checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: 'clp',
              product_data: {
                name: `Club Haltere - ${pkg.name}`,
                description: `${pkg.bonos} bonos para reservas`,
              },
              unit_amount: pkg.price,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url,
        metadata: {
          type: 'bonos',
          user_id,
          package_type,
          bonos_amount: pkg.bonos.toString(),
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid checkout type' }, { status: 400 });
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}