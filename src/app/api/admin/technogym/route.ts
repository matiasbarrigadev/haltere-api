import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  getFacilityId,
  createUser,
  getUserByPermanentToken,
  getUserByExternalId,
  getUserByUserId,
  updateUser,
  saveMembership,
  registerVisit,
  deleteUser,
  onboardNewMember,
  isConfigured,
  getConfigStatus,
  authenticate,
  getUserHealthProfile,
  getExtendedUserProfile,
  getUserAspirations,
  getUserTrainingProgram,
  getLastBiometricsMeasurements,
  searchUsersByEmail,
  type MembershipOperation
} from '@/lib/technogym/client';

// Helper to create Supabase admin client
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

// Helper to check if string is valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Update Supabase user with Technogym user ID
async function linkTechnogymToSupabase(supabaseUserId: string, technogymUserId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.log('[Technogym] Supabase admin not configured, skipping link');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ technogym_user_id: technogymUserId })
      .eq('id', supabaseUserId);
      
    if (error) {
      console.error('[Technogym] Failed to link user:', error);
      return false;
    }
    
    console.log('[Technogym] Linked Supabase user', supabaseUserId, 'to Technogym user', technogymUserId);
    return true;
  } catch (err) {
    console.error('[Technogym] Error linking user:', err);
    return false;
  }
}

// Save pending link for users created in Technogym without a Haltere account
async function savePendingLink(params: {
  email: string;
  technogymUserId: string;
  technogymFacilityUserId?: string;
  technogymPermanentToken?: string;
  firstName?: string;
  lastName?: string;
  createdBy?: string;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.log('[Technogym] Supabase admin not configured, skipping pending link');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('technogym_pending_links')
      .upsert({
        email: params.email.toLowerCase(),
        technogym_user_id: params.technogymUserId,
        technogym_facility_user_id: params.technogymFacilityUserId,
        technogym_permanent_token: params.technogymPermanentToken,
        first_name: params.firstName,
        last_name: params.lastName,
        created_by: params.createdBy,
        status: 'pending',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email,technogym_user_id'
      });
      
    if (error) {
      console.error('[Technogym] Failed to save pending link:', error);
      return false;
    }
    
    console.log('[Technogym] Saved pending link for:', params.email);
    return true;
  } catch (err) {
    console.error('[Technogym] Error saving pending link:', err);
    return false;
  }
}

// Get admin user ID from Authorization header
async function getAdminUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  
  const token = authHeader.substring(7);
  try {
    const { data: { user } } = await supabase.auth.getUser(token);
    return user?.id || null;
  } catch {
    return null;
  }
}

/**
 * GET /api/admin/technogym
 * 
 * Query params:
 * - action=status: Get configuration status
 * - action=test: Test authentication
 * - permanentToken: Get user by permanent token
 * - externalId: Get user by external ID (Haltere user ID)
 * - userId: Get user by Technogym userId (Mywellness Cloud ID)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const permanentToken = searchParams.get('permanentToken');
    const externalId = searchParams.get('externalId');
    const userId = searchParams.get('userId');
    
    // Check configuration status
    if (action === 'status') {
      const status = getConfigStatus();
      return NextResponse.json({
        success: true,
        data: {
          configured: isConfigured(),
          ...status
        }
      });
    }
    
    // Test authentication
    if (action === 'test') {
      if (!isConfigured()) {
        return NextResponse.json({
          success: false,
          error: 'Technogym not configured. Please set environment variables.'
        }, { status: 400 });
      }
      
      const { facilityId } = await authenticate();
      return NextResponse.json({
        success: true,
        data: {
          authenticated: true,
          facilityId
        }
      });
    }
    
    // Get user by permanent token
    if (permanentToken) {
      const user = await getUserByPermanentToken(permanentToken);
      return NextResponse.json({
        success: true,
        data: user
      });
    }
    
    // Get user by external ID (Haltere user ID)
    if (externalId) {
      const user = await getUserByExternalId(externalId);
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found by externalId'
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: user
      });
    }
    
    // Get user by Technogym userId (Mywellness Cloud ID)
    if (userId) {
      const user = await getUserByUserId(userId);
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found by userId'
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: user
      });
    }
    
    // Get user health profile (basic - just biometrics)
    if (action === 'health') {
      const healthUserId = searchParams.get('healthUserId');
      if (!healthUserId) {
        return NextResponse.json({
          success: false,
          error: 'Missing healthUserId parameter'
        }, { status: 400 });
      }
      
      const profile = await getUserHealthProfile(healthUserId);
      if (!profile) {
        return NextResponse.json({
          success: false,
          error: 'User health profile not found'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        data: profile
      });
    }
    
    // Get extended user profile (biometrics + aspirations + training program)
    if (action === 'profile') {
      const profileUserId = searchParams.get('profileUserId');
      if (!profileUserId) {
        return NextResponse.json({
          success: false,
          error: 'Missing profileUserId parameter'
        }, { status: 400 });
      }
      
      const profile = await getExtendedUserProfile(profileUserId);
      if (!profile) {
        return NextResponse.json({
          success: false,
          error: 'User extended profile not found'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        data: profile
      });
    }
    
    // Get user aspirations (fitness goals)
    if (action === 'aspirations') {
      const aspirationsUserId = searchParams.get('aspirationsUserId');
      if (!aspirationsUserId) {
        return NextResponse.json({
          success: false,
          error: 'Missing aspirationsUserId parameter'
        }, { status: 400 });
      }
      
      const aspirations = await getUserAspirations(aspirationsUserId);
      return NextResponse.json({
        success: true,
        data: { aspirations }
      });
    }
    
    // Get user training program
    if (action === 'training') {
      const trainingUserId = searchParams.get('trainingUserId');
      if (!trainingUserId) {
        return NextResponse.json({
          success: false,
          error: 'Missing trainingUserId parameter'
        }, { status: 400 });
      }
      
      const trainingProgram = await getUserTrainingProgram(trainingUserId);
      return NextResponse.json({
        success: true,
        data: { trainingProgram }
      });
    }
    
    // Get user biometrics
    if (action === 'biometrics') {
      const biometricsUserId = searchParams.get('biometricsUserId');
      if (!biometricsUserId) {
        return NextResponse.json({
          success: false,
          error: 'Missing biometricsUserId parameter'
        }, { status: 400 });
      }
      
      const measurements = await getLastBiometricsMeasurements(biometricsUserId);
      return NextResponse.json({
        success: true,
        data: { measurements }
      });
    }
    
    // Search users by email in Technogym
    if (action === 'search') {
      const email = searchParams.get('email');
      if (!email) {
        return NextResponse.json({
          success: false,
          error: 'Missing email parameter for search'
        }, { status: 400 });
      }
      
      const users = await searchUsersByEmail(email);
      return NextResponse.json({
        success: true,
        data: { users }
      });
    }
    
    // Get connected users (Haltere users with technogym_user_id)
    if (action === 'connected') {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        return NextResponse.json({
          success: false,
          error: 'Supabase not configured'
        }, { status: 500 });
      }
      
      const { data: connectedUsers, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, role, technogym_user_id, created_at')
        .not('technogym_user_id', 'is', null)
        .order('full_name');
      
      if (error) {
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch connected users'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        data: { 
          users: connectedUsers || [],
          count: connectedUsers?.length || 0
        }
      });
    }
    
    // Default: Return facility info
    const facilityId = await getFacilityId();
    return NextResponse.json({
      success: true,
      data: {
        facilityId,
        message: 'Use POST to create/update users or GET with permanentToken/externalId/userId to lookup users'
      }
    });
    
  } catch (error) {
    console.error('Technogym admin API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/technogym
 * 
 * Body: {
 *   action: 'create' | 'update' | 'delete' | 'membership' | 'visit' | 'onboard',
 *   ...params
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;
    
    if (!isConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Technogym not configured. Please set environment variables.'
      }, { status: 400 });
    }
    
    switch (action) {
      case 'create': {
        // Create a new user
        const { firstName, lastName, email, dateOfBirth, gender, externalId } = params;
        
        if (!firstName || !lastName || !email) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: firstName, lastName, email'
          }, { status: 400 });
        }
        
        const result = await createUser({
          firstName,
          lastName,
          email,
          dateOfBirth,
          gender,
          externalId
        });
        
        // If externalId is a valid UUID (Supabase user ID), link the accounts directly
        if (result.success && externalId && isValidUUID(externalId)) {
          await linkTechnogymToSupabase(externalId, result.userId);
        } 
        // If NO externalId, save as pending for future linking when user registers
        else if (result.success && !externalId) {
          const adminId = await getAdminUserId(request);
          await savePendingLink({
            email,
            technogymUserId: result.userId,
            technogymFacilityUserId: result.facilityUserId,
            technogymPermanentToken: result.permanentToken,
            firstName,
            lastName,
            createdBy: adminId || undefined
          });
        }
        
        return NextResponse.json({
          success: true,
          data: {
            ...result,
            pendingLink: !externalId // Indicate this contact needs future linking
          }
        });
      }
      
      case 'update': {
        // Update user information
        const { facilityUserId, ...userData } = params;
        
        if (!facilityUserId) {
          return NextResponse.json({
            success: false,
            error: 'Missing required field: facilityUserId'
          }, { status: 400 });
        }
        
        await updateUser(facilityUserId, userData);
        
        return NextResponse.json({
          success: true,
          data: { message: 'User updated successfully' }
        });
      }
      
      case 'delete': {
        // Delete a user
        const { facilityUserId } = params;
        
        if (!facilityUserId) {
          return NextResponse.json({
            success: false,
            error: 'Missing required field: facilityUserId'
          }, { status: 400 });
        }
        
        await deleteUser(facilityUserId);
        
        return NextResponse.json({
          success: true,
          data: { message: 'User deleted successfully' }
        });
      }
      
      case 'membership': {
        // Save membership status
        const { facilityUserId, operation, memberSince, startOn, expiresOn, description } = params;
        
        if (!facilityUserId || !operation) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: facilityUserId, operation'
          }, { status: 400 });
        }
        
        const validOperations: MembershipOperation[] = ['Subscribe', 'Renew', 'UnSubscribe', 'Update', 'Froze', 'UnFroze'];
        if (!validOperations.includes(operation)) {
          return NextResponse.json({
            success: false,
            error: `Invalid operation. Valid values: ${validOperations.join(', ')}`
          }, { status: 400 });
        }
        
        await saveMembership(facilityUserId, {
          operation: operation as MembershipOperation,
          memberSince,
          startOn,
          expiresOn,
          description
        });
        
        return NextResponse.json({
          success: true,
          data: { message: 'Membership saved successfully' }
        });
      }
      
      case 'visit': {
        // Register a visit
        const { userId, visitDate } = params;
        
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Missing required field: userId'
          }, { status: 400 });
        }
        
        await registerVisit(userId, visitDate);
        
        return NextResponse.json({
          success: true,
          data: { message: 'Visit registered successfully' }
        });
      }
      
      case 'onboard': {
        // Complete onboarding workflow: create user + update + subscribe
        // OR create contact only (if no membership dates provided)
        const {
          firstName,
          lastName,
          email,
          dateOfBirth,
          gender,
          externalId,
          membershipStartOn,
          membershipExpiresOn,
          membershipDescription,
          address,
          city,
          zipCode,
          phone,
          mobilePhone,
          notes
        } = params;
        
        if (!firstName || !lastName || !email) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: firstName, lastName, email'
          }, { status: 400 });
        }
        
        // If membership dates provided, do full onboarding
        // Otherwise just create a contact (lead/prospect)
        const hasMembership = membershipStartOn && membershipExpiresOn;
        
        if (hasMembership) {
          const result = await onboardNewMember({
            firstName,
            lastName,
            email,
            dateOfBirth,
            gender,
            externalId: externalId || undefined,
            membershipStartOn,
            membershipExpiresOn,
            membershipDescription,
            address,
            city,
            zipCode,
            phone,
            mobilePhone,
            notes
          });
          
          // If externalId is a valid UUID (Supabase user ID), link the accounts
          if (result.success && externalId && isValidUUID(externalId)) {
            await linkTechnogymToSupabase(externalId, result.userId);
          }
          // If NO externalId, save as pending for future linking
          else if (result.success && !externalId) {
            const adminId = await getAdminUserId(request);
            await savePendingLink({
              email,
              technogymUserId: result.userId,
              technogymFacilityUserId: result.facilityUserId,
              technogymPermanentToken: result.permanentToken,
              firstName,
              lastName,
              createdBy: adminId || undefined
            });
          }
          
          return NextResponse.json({
            success: true,
            action: 'onboard_member',
            data: {
              ...result,
              pendingLink: !externalId
            }
          });
        } else {
          // Just create contact without membership
          const result = await createUser({
            firstName,
            lastName,
            email,
            dateOfBirth,
            gender,
            externalId: externalId || undefined
          });
          
          // If externalId is a valid UUID (Supabase user ID), link the accounts
          if (result.success && externalId && isValidUUID(externalId)) {
            await linkTechnogymToSupabase(externalId, result.userId);
          }
          // If NO externalId, save as pending for future linking
          else if (result.success && !externalId) {
            const adminId = await getAdminUserId(request);
            await savePendingLink({
              email,
              technogymUserId: result.userId,
              technogymFacilityUserId: result.facilityUserId,
              technogymPermanentToken: result.permanentToken,
              firstName,
              lastName,
              createdBy: adminId || undefined
            });
          }
          
          return NextResponse.json({
            success: true,
            action: 'create_contact',
            data: {
              ...result,
              pendingLink: !externalId
            }
          });
        }
      }
      
      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}. Valid actions: create, update, delete, membership, visit, onboard`
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Technogym admin API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}