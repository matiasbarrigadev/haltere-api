import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      full_name,
      email,
      phone,
      occupation,
      linkedin_url,
      referral_source,
      referral_name,
      fitness_goals,
      preferred_location,
      schedule_preference,
      additional_notes
    } = body;

    // Validate required fields
    if (!full_name || !email || !phone || !occupation || !referral_source || !fitness_goals || !preferred_location || !schedule_preference) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Ya existe una solicitud con este email' }, { status: 409 });
    }

    // Create user in auth (without password - they'll set it later)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: { full_name, phone }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
    }

    // Update user profile with application data
    // Note: The profile is automatically created by the handle_new_user() trigger
    const applicationNotes = JSON.stringify({
      occupation,
      linkedin_url,
      referral_source,
      referral_name,
      fitness_goals,
      preferred_location,
      schedule_preference,
      additional_notes
    });

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        full_name,
        phone,
        role: 'member',
        member_status: 'pending_approval',
        application_date: new Date().toISOString(),
        application_notes: applicationNotes
      })
      .eq('id', authUser.user.id)
      .select()
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      // Clean up auth user if profile update fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: 'Error updating profile' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      data: { id: profile.id, email: profile.email }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Application error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}