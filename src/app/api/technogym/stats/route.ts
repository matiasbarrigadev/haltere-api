import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase/client';
import {
  getUserByExternalId,
  getUserByPermanentToken,
  isConfigured,
} from '@/lib/technogym/client';

/**
 * GET /api/technogym/stats
 * Get user's Technogym link status
 * 
 * NOTE: In Server-to-Server (S2S) integration, workout and biometric data
 * are NOT accessible via API. They flow automatically through Technogym
 * equipment to the user's Mywellness account.
 * 
 * This endpoint checks if the user is linked to Technogym and returns
 * basic user info from Technogym if available.
 * 
 * Query params: 
 * - userId: Haltere user ID (required)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check if Technogym is configured
    if (!isConfigured()) {
      return NextResponse.json({
        linked: false,
        configured: false,
        message: 'Technogym integration not configured',
        stats: null,
      });
    }

    // Get user profile from Haltere DB
    // Note: technogym_facility_user_id and technogym_permanent_token may need to be added to the DB
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Extract Technogym fields - these may or may not exist depending on DB schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileData = profile as any;
    const technogymUserId = profileData.technogym_user_id as string | null;
    const facilityUserId = profileData.technogym_facility_user_id as string | null;
    const permanentToken = profileData.technogym_permanent_token as string | null;
    
    // If we have stored Technogym data, user is linked
    if (technogymUserId && facilityUserId) {
      // Try to get fresh user data from Technogym
      let technogymUser = null;
      
      if (permanentToken) {
        try {
          technogymUser = await getUserByPermanentToken(permanentToken);
        } catch (e) {
          console.log('Could not fetch Technogym user by permanentToken:', e);
        }
      }
      
      // Fallback: try by externalId (our userId)
      if (!technogymUser) {
        try {
          technogymUser = await getUserByExternalId(userId);
        } catch (e) {
          console.log('Could not fetch Technogym user by externalId:', e);
        }
      }

      return NextResponse.json({
        linked: true,
        configured: true,
        technogymUserId,
        facilityUserId,
        user: technogymUser ? {
          firstName: technogymUser.firstName,
          lastName: technogymUser.lastName,
          email: technogymUser.email,
        } : null,
        message: 'User is linked to Technogym. Workout data syncs automatically through equipment.',
        // Note: Workout stats are NOT available in S2S integration
        stats: null,
        workouts: [],
        biometrics: null,
        note: 'Workout and biometric data are automatically synced when using Technogym equipment. This data is visible in the Mywellness app.',
      });
    }
    
    // Try to find user in Technogym by externalId (in case it was created but not saved)
    try {
      const technogymUser = await getUserByExternalId(userId);
      
      if (technogymUser) {
        // Found user! Update our DB with their IDs
        await supabase
          .from('user_profiles')
          .update({
            technogym_user_id: technogymUser.userId,
            technogym_facility_user_id: technogymUser.facilityUserId,
            technogym_permanent_token: technogymUser.permanentToken,
          } as Record<string, unknown>)
          .eq('user_id', userId);

        return NextResponse.json({
          linked: true,
          configured: true,
          technogymUserId: technogymUser.userId,
          facilityUserId: technogymUser.facilityUserId,
          user: {
            firstName: technogymUser.firstName,
            lastName: technogymUser.lastName,
            email: technogymUser.email,
          },
          message: 'User found and linked to Technogym.',
          stats: null,
          workouts: [],
          biometrics: null,
          note: 'Workout and biometric data are automatically synced when using Technogym equipment.',
        });
      }
    } catch (e) {
      // User not found in Technogym - that's OK
      console.log('User not found in Technogym:', e);
    }

    // User is not linked to Technogym
    return NextResponse.json({
      linked: false,
      configured: true,
      message: 'Cuenta de Technogym no vinculada. El administrador debe registrarte en el panel de Technogym.',
      stats: null,
      workouts: [],
      biometrics: null,
    });
    
  } catch (error) {
    console.error('Technogym stats error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check Technogym status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/technogym/stats
 * Manually link Haltere user to Technogym account
 * 
 * Body: { userId, technogymUserId, facilityUserId, permanentToken }
 * 
 * This is typically called after creating a user in Technogym via the admin panel
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, technogymUserId, facilityUserId, permanentToken } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!technogymUserId && !facilityUserId && !permanentToken) {
      return NextResponse.json(
        { error: 'At least one of technogymUserId, facilityUserId, or permanentToken is required' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (technogymUserId) updateData.technogym_user_id = technogymUserId;
    if (facilityUserId) updateData.technogym_facility_user_id = facilityUserId;
    if (permanentToken) updateData.technogym_permanent_token = permanentToken;

    // Update user profile with Technogym IDs
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to link Technogym account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Technogym account linked successfully',
      data: {
        technogymUserId,
        facilityUserId,
        permanentToken: permanentToken ? '***' : undefined,
      },
    });
  } catch (error) {
    console.error('Technogym link error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to link Technogym account' },
      { status: 500 }
    );
  }
}