import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase/client';

/**
 * POST /api/technogym/webhook
 * Webhook endpoint to receive notifications from Technogym Mywellness
 * 
 * Events received (based on official Technogym documentation):
 * 
 * Facility User Creation Event - Fired when a new facility user is created
 * Payload fields:
 * - facility_url: Facility URL
 * - facility_name: Facility name  
 * - facility_lat: Facility latitude geo coordinate
 * - facility_lon: Facility longitude geo coordinate
 * - facility_user_status: 0=Lead, 5=Prospect, 7=Ex Member, 10=Member
 * - facility_user_id: Facility user ID
 * - facility_user_externalId: Third party external ID
 * - when_utc: Creation date
 * - by_application: Application that created the user (set to "thirdparties" if from third party)
 * 
 * Note: Webhooks need to be configured in Technogym's admin portal
 */

interface TechnogymWebhookPayload {
  // Common fields
  facility_url?: string;
  facility_name?: string;
  facility_lat?: number;
  facility_lon?: number;
  
  // User fields
  facility_user_status?: number; // 0=Lead, 5=Prospect, 7=Ex Member, 10=Member
  facility_user_id?: string;
  facility_user_externalId?: string;
  
  // Metadata
  when_utc?: string;
  by_application?: string;
  
  // Event type (if included)
  event_type?: string;
  event?: string;
}

const USER_STATUS_MAP: Record<number, string> = {
  0: 'Lead',
  5: 'Prospect', 
  7: 'Ex Member',
  10: 'Member',
};

export async function POST(request: Request) {
  try {
    const body: TechnogymWebhookPayload = await request.json();
    
    console.log('[Technogym Webhook] Received:', JSON.stringify(body, null, 2));
    
    // Determine event type
    const eventType = body.event_type || body.event || 'facility_user_created';
    
    // Log the webhook event
    logWebhookEvent(eventType, body);
    
    // Handle user creation/update event
    if (body.facility_user_id) {
      const { facility_user_id, facility_user_externalId, facility_user_status } = body;
      
      console.log('[Technogym Webhook] Processing user:', {
        facilityUserId: facility_user_id,
        externalId: facility_user_externalId,
        status: facility_user_status !== undefined ? USER_STATUS_MAP[facility_user_status] : 'Unknown',
        byApplication: body.by_application,
      });
      
      // If user was created by a third party (us), we may already have linked it
      // Check if we need to update our records
      if (facility_user_externalId) {
        // External ID matches our Haltere user ID
        // Update the user_profiles table with Technogym IDs
        const { data: existingProfile, error: lookupError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', facility_user_externalId)
          .single();
        
        if (!lookupError && existingProfile) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const profileData = existingProfile as any;
          
          // Only update if not already linked
          if (!profileData.technogym_facility_user_id) {
            await supabase
              .from('user_profiles')
              .update({
                technogym_facility_user_id: facility_user_id,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any)
              .eq('user_id', facility_user_externalId);
            
            console.log('[Technogym Webhook] Linked Haltere user to Technogym:', {
              haltereUserId: facility_user_externalId,
              technogymFacilityUserId: facility_user_id,
            });
          }
        } else {
          console.log('[Technogym Webhook] No Haltere user found with externalId:', facility_user_externalId);
        }
      } else {
        console.log('[Technogym Webhook] User created without externalId, skipping auto-link');
      }
    }
    
    // Always return 200 to acknowledge receipt
    return NextResponse.json({ 
      success: true, 
      received: eventType,
      processed: true,
    });
    
  } catch (error) {
    console.error('[Technogym Webhook] Error:', error);
    // Still return 200 to prevent retries - log the error for investigation
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      processed: false,
    });
  }
}

/**
 * Log webhook events for debugging and audit
 */
function logWebhookEvent(eventType: string, data: TechnogymWebhookPayload) {
  console.log('[Technogym Webhook Log]', {
    source: 'technogym',
    event_type: eventType,
    facility_url: data.facility_url,
    facility_user_id: data.facility_user_id,
    facility_user_externalId: data.facility_user_externalId,
    facility_user_status: data.facility_user_status !== undefined 
      ? `${data.facility_user_status} (${USER_STATUS_MAP[data.facility_user_status] || 'Unknown'})` 
      : undefined,
    when_utc: data.when_utc,
    by_application: data.by_application,
    received_at: new Date().toISOString(),
  });
}

/**
 * GET /api/technogym/webhook
 * Health check / verification endpoint for webhook setup
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/technogym/webhook',
    supported_events: [
      {
        event: 'facility_user_created',
        description: 'Fired when a new facility user is created',
        payload_fields: [
          'facility_url',
          'facility_name',
          'facility_lat',
          'facility_lon',
          'facility_user_status (0=Lead, 5=Prospect, 7=Ex Member, 10=Member)',
          'facility_user_id',
          'facility_user_externalId',
          'when_utc',
          'by_application',
        ],
      },
    ],
    notes: [
      'Configure this URL in Technogym admin portal',
      'Users created with externalId will be auto-linked to Haltere users',
      'Webhook returns 200 even on errors to prevent retries',
    ],
  });
}