import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase/client';
import { createUser as createTechnogymUser, findUserByEmail } from '@/lib/technogym/client';

/**
 * POST /api/technogym/admin/create-user
 * Create a Technogym user from admin panel
 * Body: { userId, email, fullName }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, fullName } = body;

    if (!userId || !email || !fullName) {
      return NextResponse.json(
        { error: 'userId, email, and fullName are required' },
        { status: 400 }
      );
    }

    // Check if user already has Technogym account
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('technogym_user_id')
      .eq('user_id', userId)
      .single();

    if ((profile as any)?.technogym_user_id) {
      return NextResponse.json({
        success: true,
        message: 'User already has Technogym account',
        technogymUserId: (profile as any).technogym_user_id,
        alreadyExists: true,
      });
    }

    // Check if email already exists in Technogym
    const existingUser = await findUserByEmail(email);
    
    if (existingUser) {
      // Link existing account
      await supabase
        .from('user_profiles')
        .update({ technogym_user_id: existingUser.id } as any)
        .eq('user_id', userId);

      return NextResponse.json({
        success: true,
        message: 'Linked to existing Technogym account',
        technogymUserId: existingUser.id,
        alreadyExists: true,
      });
    }

    // Create new Technogym user
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || 'Member';
    const lastName = nameParts.slice(1).join(' ') || '';

    const newUser = await createTechnogymUser({
      email,
      firstName,
      lastName,
      customerLogicalId: userId, // Link to Haltere user ID
    });

    // Save Technogym ID to user profile
    await supabase
      .from('user_profiles')
      .update({ technogym_user_id: newUser.id } as any)
      .eq('user_id', userId);

    return NextResponse.json({
      success: true,
      message: 'Technogym user created successfully',
      technogymUserId: newUser.id,
      alreadyExists: false,
    });
  } catch (error: any) {
    console.error('Error creating Technogym user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Technogym user' },
      { status: 500 }
    );
  }
}