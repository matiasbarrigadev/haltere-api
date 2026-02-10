import { NextRequest, NextResponse } from 'next/server';
import { 
  getFacilityUsers, 
  getFullUserProfile,
  getFacilityId 
} from '@/lib/technogym/client';

/**
 * GET /api/admin/technogym
 * List all facility users or get specific user details
 * 
 * Note: Authentication is handled at the admin layout level
 * This endpoint assumes the request is already authenticated as admin
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // If userId provided, get full profile for that user
    if (userId) {
      const profile = await getFullUserProfile(userId);
      return NextResponse.json({
        success: true,
        data: profile
      });
    }
    
    // Otherwise, list all facility users
    const facilityId = await getFacilityId();
    const { users, total } = await getFacilityUsers({ limit, offset, search });
    
    return NextResponse.json({
      success: true,
      data: {
        facilityId,
        users,
        total,
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('Technogym admin API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Technogym data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}