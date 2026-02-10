import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  getFacilityUsers, 
  getFullUserProfile,
  getFacilityId 
} from '@/lib/technogym/client';

// Create Supabase admin client safely (only when needed, not at module level)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(url, key);
}

/**
 * Verify admin role
 */
async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return false;
    
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    return profile?.role === 'admin' || profile?.role === 'superadmin';
  } catch {
    return false;
  }
}

/**
 * GET /api/admin/technogym
 * List all facility users or get specific user details
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
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