import { NextRequest, NextResponse } from 'next/server';
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
  type MembershipOperation
} from '@/lib/technogym/client';

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
        
        return NextResponse.json({
          success: true,
          data: result
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
          
          return NextResponse.json({
            success: true,
            action: 'onboard_member',
            data: result
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
          
          return NextResponse.json({
            success: true,
            action: 'create_contact',
            data: result
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