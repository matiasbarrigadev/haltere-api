/**
 * Technogym Mywellness Cloud API Client
 * Server-to-Server Integration
 * Documentation: https://apidocs.mywellness.com
 * 
 * AUTHENTICATION FLOW (as per official docs):
 * 1. POST /bridge/access/AccessIntegration -> Returns accessToken
 * 2. Use Authorization: Bearer {accessToken} for subsequent calls
 */

// Environment configuration - ALWAYS use production
const API_BASE_URL = process.env.TECHNOGYM_ENV === 'development' 
  ? 'https://api-dev.mywellness.com'
  : 'https://api.mywellness.com';

// Credentials from environment
const API_KEY = process.env.TECHNOGYM_API_KEY || '';
const USERNAME = process.env.TECHNOGYM_USERNAME || '';
const PASSWORD = process.env.TECHNOGYM_PASSWORD || '';
const FACILITY_URL = process.env.TECHNOGYM_FACILITY_URL || '';

// Token cache
let accessToken: string | null = null;
let tokenExpiry: Date | null = null;
let facilityId: string | null = null;

// =============================================================================
// TYPES
// =============================================================================

interface TechnogymAuthResponse {
  data: {
    accessToken: string;
    facilities: Array<{
      id: string;
      url: string;
      name: string;
    }>;
  };
}

export interface CreateUserResponse {
  data: {
    result: 'Created' | 'AlreadyExists';
    userId: string;
    facilityUserId: string;
    permanentToken: string;
  };
}

export interface GetUserResponse {
  data: {
    userId: string;
    facilityUserId: string;
    firstName: string;
    lastName: string;
    nickName?: string;
    email: string;
    birthDate?: string;
    gender?: string;
    notes?: string;
    address1?: string;
    city?: string;
    zipCode?: string;
    phoneNumber?: string;
    mobilePhoneNumber?: string;
    levelOfInterest?: string;
    measurementSystem?: string;
    externalId?: string;
    createdOn?: string;
    modifiedOn?: string;
  };
}

export interface SaveMembershipResponse {
  data: {
    result: 'Success' | 'Error';
  };
}

export interface VisitResponse {
  data: {
    result: 'Success' | 'Error';
  };
}

export interface TechnogymUser {
  userId: string;
  facilityUserId: string;
  permanentToken?: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string;
  gender?: string;
  externalId?: string;
  notes?: string;
  createdOn?: string;
}

export type MembershipOperation = 
  | 'Subscribe' 
  | 'Renew' 
  | 'UnSubscribe' 
  | 'Update' 
  | 'Froze' 
  | 'UnFroze';

// =============================================================================
// AUTHENTICATION (Official Documentation)
// =============================================================================

/**
 * Authenticate with Technogym API
 * 
 * Endpoint: POST /bridge/access/AccessIntegration
 * Headers: X-MWAPPS-CLIENT: thirdParties
 * Body: { ApiKey, Username, Password }
 * Response: { data: { accessToken, facilities[] } }
 */
export async function authenticate(): Promise<{ token: string; facilityId: string }> {
  // Check cached token (expires in 30 min, refresh at 25 min)
  if (accessToken && tokenExpiry && facilityId && new Date() < tokenExpiry) {
    return { token: accessToken, facilityId };
  }

  // Validate configuration before attempting auth
  if (!isConfigured()) {
    const missing = [];
    if (!API_KEY) missing.push('TECHNOGYM_API_KEY');
    if (!USERNAME) missing.push('TECHNOGYM_USERNAME');
    if (!PASSWORD) missing.push('TECHNOGYM_PASSWORD');
    if (!FACILITY_URL) missing.push('TECHNOGYM_FACILITY_URL');
    throw new Error(`Technogym configuration incomplete. Missing: ${missing.join(', ')}`);
  }

  // Official endpoint: /bridge/access/AccessIntegration
  const url = `${API_BASE_URL}/bridge/access/AccessIntegration`;
  
  console.log('[Technogym] Authenticating...', { 
    url, 
    baseUrl: API_BASE_URL,
    facilityUrl: FACILITY_URL,
    hasApiKey: !!API_KEY,
    hasUsername: !!USERNAME,
    hasPassword: !!PASSWORD,
  });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-MWAPPS-CLIENT': 'thirdParties',
    },
    body: JSON.stringify({
      ApiKey: API_KEY,
      Username: USERNAME,
      Password: PASSWORD,
    }),
  });

  const responseText = await response.text();
  console.log('[Technogym] Auth response status:', response.status);
  console.log('[Technogym] Auth response:', responseText.substring(0, 500));
  
  let data: TechnogymAuthResponse;
  
  try {
    data = JSON.parse(responseText);
  } catch {
    console.error('[Technogym] Invalid JSON response:', responseText);
    throw new Error(`Technogym authentication failed: Invalid JSON response`);
  }

  if (!response.ok) {
    console.error('[Technogym] Auth failed:', { status: response.status, data });
    throw new Error(`Technogym authentication failed: ${response.status} - ${JSON.stringify(data)}`);
  }
  
  // Token is in data.accessToken according to official docs
  if (!data.data?.accessToken) {
    console.error('[Technogym] No accessToken in response:', data);
    throw new Error(`Technogym authentication failed: No accessToken in response`);
  }
  
  if (!data.data?.facilities?.[0]?.id) {
    console.error('[Technogym] No facility found:', data);
    throw new Error('Technogym authentication failed: No facility found');
  }

  accessToken = data.data.accessToken;
  facilityId = data.data.facilities[0].id;
  // Token expires in 30 min, refresh at 25 min to be safe
  tokenExpiry = new Date(Date.now() + 25 * 60 * 1000);
  
  console.log('[Technogym] Auth successful:', {
    facilityId,
    facilityName: data.data.facilities[0].name,
    tokenLength: accessToken.length,
  });
  
  return { token: accessToken, facilityId };
}

/**
 * Make authenticated API request using Authorization: Bearer header
 */
async function apiRequest<T>(
  endpoint: string,
  body: Record<string, unknown> = {},
  method: 'GET' | 'POST' = 'POST'
): Promise<T> {
  const { token, facilityId: fId } = await authenticate();
  
  // Replace {facilityId} placeholder in endpoint
  const resolvedEndpoint = endpoint.replace('{facilityId}', fId);
  const url = `${API_BASE_URL}/${FACILITY_URL}${resolvedEndpoint}`;
  
  console.log('[Technogym] API Request:', { method, url, body });
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-MWAPPS-CLIENT': 'thirdParties',
      'X-MWAPPS-APIKEY': API_KEY,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  console.log('[Technogym] API Response status:', response.status);
  console.log('[Technogym] API Response:', responseText.substring(0, 500));
  
  let responseData: T & { errors?: Array<{ message: string }> };
  
  try {
    responseData = JSON.parse(responseText);
  } catch {
    console.error('[Technogym] Invalid JSON response:', responseText);
    throw new Error(`Technogym API error: Invalid JSON response`);
  }

  // Check for errors in response
  if (responseData.errors && responseData.errors.length > 0) {
    const errorMsg = responseData.errors.map((e: { message: string }) => e.message).join(', ');
    console.error('[Technogym] API Error:', errorMsg);
    throw new Error(`Technogym API error: ${errorMsg}`);
  }

  if (!response.ok) {
    throw new Error(`Technogym API error: ${response.status} - ${responseText}`);
  }

  return responseData;
}

// =============================================================================
// USER MANAGEMENT (CORE LAYER)
// =============================================================================

/**
 * Create a new user in Technogym facility
 * Endpoint: POST /core/facility/{facilityId}/CreateFacilityUserFromThirdParty
 */
export async function createUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string; // Format: YYYY-MM-DD
  gender?: 'M' | 'F';
  externalId?: string; // Your internal user ID
}): Promise<{
  userId: string;
  facilityUserId: string;
  permanentToken: string;
  result: 'Created' | 'AlreadyExists';
}> {
  const response = await apiRequest<CreateUserResponse>(
    '/core/facility/{facilityId}/CreateFacilityUserFromThirdParty',
    {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      externalId: userData.externalId,
    }
  );

  console.log('[Technogym] User created:', {
    userId: response.data.userId,
    facilityUserId: response.data.facilityUserId,
    result: response.data.result,
  });

  return {
    userId: response.data.userId,
    facilityUserId: response.data.facilityUserId,
    permanentToken: response.data.permanentToken,
    result: response.data.result,
  };
}

/**
 * Get user by permanent token
 * Endpoint: POST /core/facility/{facilityId}/GetFacilityUserFromPermanentToken
 */
export async function getUserByPermanentToken(permanentToken: string): Promise<TechnogymUser> {
  const response = await apiRequest<GetUserResponse>(
    '/core/facility/{facilityId}/GetFacilityUserFromPermanentToken',
    { permanentToken }
  );

  return {
    userId: response.data.userId,
    facilityUserId: response.data.facilityUserId,
    permanentToken,
    firstName: response.data.firstName,
    lastName: response.data.lastName,
    email: response.data.email,
    birthDate: response.data.birthDate,
    gender: response.data.gender,
    externalId: response.data.externalId,
    notes: response.data.notes,
    createdOn: response.data.createdOn,
  };
}

/**
 * Get user by external ID (your internal user ID)
 * Endpoint: POST /core/facility/{facilityId}/GetFacilityUserFromExternalId
 */
export async function getUserByExternalId(externalId: string): Promise<TechnogymUser | null> {
  try {
    const response = await apiRequest<GetUserResponse>(
      '/core/facility/{facilityId}/GetFacilityUserFromExternalId',
      { externalId }
    );

    return {
      userId: response.data.userId,
      facilityUserId: response.data.facilityUserId,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      email: response.data.email,
      birthDate: response.data.birthDate,
      gender: response.data.gender,
      externalId: response.data.externalId,
    };
  } catch (error) {
    console.log('[Technogym] User not found by externalId:', externalId);
    return null;
  }
}

/**
 * Get user by Technogym userId (Mywellness Cloud user ID)
 * Endpoint: POST /core/facility/{facilityId}/GetFacilityUserFromUserId
 */
export async function getUserByUserId(userId: string): Promise<TechnogymUser | null> {
  try {
    const response = await apiRequest<GetUserResponse>(
      '/core/facility/{facilityId}/GetFacilityUserFromUserId',
      { userId }
    );

    return {
      userId: response.data.userId,
      facilityUserId: response.data.facilityUserId,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      email: response.data.email,
      birthDate: response.data.birthDate,
      gender: response.data.gender,
      externalId: response.data.externalId,
      notes: response.data.notes,
      createdOn: response.data.createdOn,
    };
  } catch (error) {
    console.log('[Technogym] User not found by userId:', userId);
    return null;
  }
}

/**
 * Update user information
 * Endpoint: POST /core/facilityuser/{facilityUserId}/Update
 */
export async function updateUser(
  facilityUserId: string,
  userData: {
    firstName?: string;
    lastName?: string;
    nickName?: string;
    birthDate?: string;
    gender?: 'M' | 'F';
    notes?: string;
    levelOfInterest?: 'NotInterested' | 'Interested' | 'VeryInterested';
    address1?: string;
    zipCode?: string;
    city?: string;
    phoneNumber?: string;
    mobilePhoneNumber?: string;
    stateProvince?: string;
    measurementSystem?: 'Metric' | 'Imperial';
  }
): Promise<void> {
  await apiRequest(
    `/core/facilityuser/${facilityUserId}/Update`,
    userData
  );
  console.log('[Technogym] User updated:', facilityUserId);
}

/**
 * Delete user from facility
 * Endpoint: POST /core/facilityuser/{facilityUserId}/Delete
 */
export async function deleteUser(facilityUserId: string): Promise<void> {
  await apiRequest(`/core/facilityuser/${facilityUserId}/Delete`, {});
  console.log('[Technogym] User deleted:', facilityUserId);
}

// =============================================================================
// MEMBERSHIP MANAGEMENT
// =============================================================================

/**
 * Save/Update user membership
 * Endpoint: POST /core/facilityuser/{facilityUserId}/SaveMembership
 */
export async function saveMembership(
  facilityUserId: string,
  membership: {
    operation: MembershipOperation;
    memberSince?: string;
    startOn?: string;
    expiresOn?: string;
    description?: string;
  }
): Promise<void> {
  const response = await apiRequest<SaveMembershipResponse>(
    `/core/facilityuser/${facilityUserId}/SaveMembership`,
    membership
  );
  
  if (response.data.result !== 'Success') {
    throw new Error(`Failed to save membership: ${response.data.result}`);
  }
  
  console.log('[Technogym] Membership saved:', { facilityUserId, operation: membership.operation });
}

/**
 * Subscribe user (convenience wrapper)
 */
export async function subscribeUser(
  facilityUserId: string,
  options: {
    startOn: string;
    expiresOn: string;
    description?: string;
    memberSince?: string;
  }
): Promise<void> {
  await saveMembership(facilityUserId, {
    operation: 'Subscribe',
    memberSince: options.memberSince || options.startOn,
    startOn: options.startOn,
    expiresOn: options.expiresOn,
    description: options.description,
  });
}

// =============================================================================
// VISIT TRACKING
// =============================================================================

/**
 * Register a visit to the facility
 * Endpoint: POST /core/user/{userId}/Visit
 */
export async function registerVisit(
  userId: string,
  visitDate?: string
): Promise<void> {
  const date = visitDate || new Date().toISOString().replace('T', ' ').replace('Z', ' +00:00');
  
  const response = await apiRequest<VisitResponse>(
    `/core/user/${userId}/Visit`,
    { visitDate: date }
  );
  
  if (response.data.result !== 'Success') {
    throw new Error(`Failed to register visit: ${response.data.result}`);
  }
  
  console.log('[Technogym] Visit registered:', { userId, date });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export async function getFacilityId(): Promise<string> {
  const { facilityId: fId } = await authenticate();
  return fId;
}

export function isConfigured(): boolean {
  return !!(API_KEY && USERNAME && PASSWORD && FACILITY_URL);
}

export function getConfigStatus(): {
  apiKey: boolean;
  username: boolean;
  password: boolean;
  facilityUrl: boolean;
  environment: string;
  baseUrl: string;
} {
  return {
    apiKey: !!API_KEY,
    username: !!USERNAME,
    password: !!PASSWORD,
    facilityUrl: !!FACILITY_URL,
    environment: process.env.TECHNOGYM_ENV || 'production',
    baseUrl: API_BASE_URL,
  };
}

export function clearTokenCache(): void {
  accessToken = null;
  tokenExpiry = null;
  facilityId = null;
  console.log('[Technogym] Token cache cleared');
}

// =============================================================================
// WORKFLOW HELPERS
// =============================================================================

/**
 * Complete workflow: Create user, update details, and subscribe
 */
export async function onboardNewMember(memberData: {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  gender?: 'M' | 'F';
  externalId?: string;
  membershipStartOn: string;
  membershipExpiresOn: string;
  membershipDescription?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  phone?: string;
  mobilePhone?: string;
  notes?: string;
}): Promise<{
  userId: string;
  facilityUserId: string;
  permanentToken: string;
}> {
  // Step 1: Create user
  const createResult = await createUser({
    firstName: memberData.firstName,
    lastName: memberData.lastName,
    email: memberData.email,
    dateOfBirth: memberData.dateOfBirth,
    gender: memberData.gender,
    externalId: memberData.externalId,
  });

  // Step 2: Update with additional info if provided
  const hasAdditionalInfo = memberData.address || memberData.city || memberData.phone || memberData.notes;
  if (hasAdditionalInfo) {
    await updateUser(createResult.facilityUserId, {
      address1: memberData.address,
      city: memberData.city,
      zipCode: memberData.zipCode,
      phoneNumber: memberData.phone,
      mobilePhoneNumber: memberData.mobilePhone,
      notes: memberData.notes,
    });
  }

  // Step 3: Subscribe to membership
  await subscribeUser(createResult.facilityUserId, {
    startOn: memberData.membershipStartOn,
    expiresOn: memberData.membershipExpiresOn,
    description: memberData.membershipDescription || 'Club Haltere Membership',
    memberSince: memberData.membershipStartOn,
  });

  console.log('[Technogym] Member onboarded successfully:', {
    userId: createResult.userId,
    facilityUserId: createResult.facilityUserId,
    email: memberData.email,
  });

  return {
    userId: createResult.userId,
    facilityUserId: createResult.facilityUserId,
    permanentToken: createResult.permanentToken,
  };
}

export async function syncMemberStatus(
  facilityUserId: string,
  status: 'active' | 'expired' | 'frozen' | 'renewed',
  membershipExpiresOn: string,
  description?: string
): Promise<void> {
  const operationMap: Record<string, MembershipOperation> = {
    active: 'Subscribe',
    expired: 'UnSubscribe',
    frozen: 'Froze',
    renewed: 'Renew',
  };

  await saveMembership(facilityUserId, {
    operation: operationMap[status],
    expiresOn: membershipExpiresOn,
    description: description || `Status changed to ${status}`,
  });
}