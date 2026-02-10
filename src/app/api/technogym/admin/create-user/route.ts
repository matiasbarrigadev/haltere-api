import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase/client';
import { 
  createUser as createTechnogymUser, 
  getUserByExternalId,
  subscribeUser,
  isConfigured 
} from '@/lib/technogym/client';

/**
 * POST /api/technogym/admin/create-user
 * Create a Technogym user from admin panel
 * Body: { userId, email, fullName, membershipStartOn?, membershipExpiresOn? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, fullName, membershipStartOn, membershipExpiresOn } = body;

    if (!userId || !email || !fullName) {
      return NextResponse.json(
        { error: 'userId, email, and fullName are required' },
        { status: 400 }
      );
    }

    // Check if Technogym is configured
    if (!isConfigured()) {
      return NextResponse.json(
        { error: 'Technogym integration not configured' },
        { status: 500 }
      );
    }

    // Check if user already has Technogym account in our DB
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileData = profile as any;
    
    if (profileData?.technogym_user_id && profileData?.technogym_facility_user_id) {
      return NextResponse.json({
        success: true,
        message: 'User already has Technogym account',
        technogymUserId: profileData.technogym_user_id,
        facilityUserId: profileData.technogym_facility_user_id,
        alreadyExists: true,
      });
    }

    // Check if user already exists in Technogym by externalId (our userId)
    const existingUser = await getUserByExternalId(userId);
    
    if (existingUser) {
      // Link existing account
      await supabase
        .from('user_profiles')
        .update({ 
          technogym_user_id: existingUser.userId,
          technogym_facility_user_id: existingUser.facilityUserId,
          technogym_permanent_token: existingUser.permanentToken,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
        .eq('user_id', userId);

      return NextResponse.json({
        success: true,
        message: 'Linked to existing Technogym account',
        technogymUserId: existingUser.userId,
        facilityUserId: existingUser.facilityUserId,
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
      externalId: userId, // Link to Haltere user ID
    });

    // If membership dates provided, subscribe the user
    if (membershipStartOn && membershipExpiresOn) {
      await subscribeUser(newUser.facilityUserId, {
        startOn: membershipStartOn,
        expiresOn: membershipExpiresOn,
        description: 'Club Haltere Membership',
      });
    }

    // Save Technogym IDs to user profile
    await supabase
      .from('user_profiles')
      .update({ 
        technogym_user_id: newUser.userId,
        technogym_facility_user_id: newUser.facilityUserId,
        technogym_permanent_token: newUser.permanentToken,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .eq('user_id', userId);

    return NextResponse.json({
      success: true,
      message: 'Technogym user created successfully',
      technogymUserId: newUser.userId,
      facilityUserId: newUser.facilityUserId,
      permanentToken: newUser.permanentToken,
      alreadyExists: newUser.result === 'AlreadyExists',
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating Technogym user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Technogym user' },
      { status: 500 }
    );
  }
}