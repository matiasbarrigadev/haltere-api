import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase/client';
import {
  getUserFitnessProfile,
  getWorkoutResults,
} from '@/lib/technogym/client';

/**
 * GET /api/technogym/stats
 * Get user's Technogym fitness stats
 * Query params: userId (Haltere user ID), period (week/month/year)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const period = searchParams.get('period') || 'month';
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get user profile from Haltere DB
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, user_id, full_name, technogym_user_id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if Technogym is linked
    const technogymId = (profile as any).technogym_user_id;
    
    if (!technogymId) {
      return NextResponse.json({
        linked: false,
        message: 'Technogym account not linked. Link your account in the app settings.',
        stats: null,
        workouts: [],
        biometrics: null,
        activeProgram: null,
      });
    }

    // Calculate date range based on period
    const now = new Date();
    let fromDate: Date;
    
    switch (period) {
      case 'week':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
      default:
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get fitness profile and recent workouts from Technogym
    const [fitnessProfile, recentWorkouts] = await Promise.all([
      getUserFitnessProfile(technogymId),
      getWorkoutResults(technogymId, {
        from: fromDate.toISOString(),
        to: now.toISOString(),
        limit: 50,
      }),
    ]);

    return NextResponse.json({
      linked: true,
      stats: fitnessProfile.stats,
      biometrics: fitnessProfile.biometrics,
      activeProgram: fitnessProfile.activeProgram,
      recentWorkouts: recentWorkouts.map(w => ({
        id: w.id,
        date: w.startDate,
        duration: w.duration,
        calories: w.calories,
        distance: w.distance,
        avgHeartRate: w.avgHeartRate,
        equipment: w.equipmentName || w.equipmentType,
      })),
      period,
    });
  } catch (error: any) {
    console.error('Technogym stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Technogym stats' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/technogym/stats
 * Link Haltere user to Technogym account
 * Body: { userId, technogymUserId }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, technogymUserId } = body;

    if (!userId || !technogymUserId) {
      return NextResponse.json(
        { error: 'userId and technogymUserId are required' },
        { status: 400 }
      );
    }

    // Update user profile with Technogym ID
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ technogym_user_id: technogymUserId } as any)
      .eq('user_id', userId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to link Technogym account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Technogym account linked successfully',
      technogymUserId,
    });
  } catch (error: any) {
    console.error('Technogym link error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to link Technogym account' },
      { status: 500 }
    );
  }
}