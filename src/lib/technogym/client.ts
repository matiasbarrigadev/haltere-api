/**
 * Technogym Mywellness Cloud API Client
 * Server-to-Server Integration
 * Documentation: https://apidocs.mywellness.com
 * 
 * AUTHENTICATION FLOW (based on working Wix implementation):
 * 1. POST /{facilityUrl}/application/{applicationId}/AccessIntegration
 * 2. Token is returned in response.token
 * 3. Token is passed in body of subsequent requests
 */

// Environment configuration - DEFAULT TO DEV for testing
const API_BASE_URL = process.env.TECHNOGYM_ENV === 'production' 
  ? 'https://api.mywellness.com'
  : 'https://api-dev.mywellness.com';

// Application ID for third party integrations (fixed value from Technogym)
const APPLICATION_ID = '69295ed5-a53c-434b-8518-f2e0b5f05b28';

// Credentials from environment
const API_KEY = process.env.TECHNOGYM_API_KEY || '';
const USERNAME = process.env.TECHNOGYM_USERNAME || '';
const PASSWORD = process.env.TECHNOGYM_PASSWORD || '';
const FACILITY_URL = process.env.TECHNOGYM_FACILITY_URL || '';

// Token cache
let sessionToken: string | null = null;
let tokenExpiry: Date | null = null;
let cachedFacilityId: string | null = null;

// =============================================================================
// TYPES
// =============================================================================

interface TechnogymAuthResponse {
  data: {
    facilities: Array<{
      id: string;
      url: string;
      name: string;
    }>;
    accountConfirmed: boolean;
    result: string;
  };
  token: string;
  expireIn: number;
}

export interface CreateUserResponse {
  data: {
    result: 'Created' | 'MatchFound' | 'UserEmailAndDataMatchFound' | 'AlreadyExists';
    userId?: string;
    facilityUserId?: string;
    permanentToken?: string;
    matchedUsers?: Array<{
      userId: string;
      facilityUserId: string;
      email: string;
    }>;
  };
  token?: string;
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
  token?: string;
}

export interface SaveMembershipResponse {
  data: {
    result: 'Success' | 'Error';
  };
  token?: string;
}

export interface VisitResponse {
  data: {
    result: 'Success' | 'Error';
  };
  token?: string;
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
// AUTHENTICATION
// =============================================================================

/**
 * Authenticate with Technogym API
 * 
 * Endpoint: POST /{facilityUrl}/application/{applicationId}/AccessIntegration
 * Headers: X-MWAPPS-CLIENT: thirdParties, X-MWAPPS-APIKEY: {apiKey}
 * Body: { apiKey, username, password }
 * Response: { data: { facilities[] }, token, expireIn }
 */
export async function authenticate(): Promise<{ token: string; facilityId: string }> {
  // Check cached token (expires in 30 min, refresh at 25 min)
  if (sessionToken && tokenExpiry && cachedFacilityId && new Date() < tokenExpiry) {
    return { token: sessionToken, facilityId: cachedFacilityId };
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

  // Correct endpoint: /{facilityUrl}/application/{applicationId}/AccessIntegration
  const url = `${API_BASE_URL}/${FACILITY_URL}/application/${APPLICATION_ID}/AccessIntegration`;
  
  console.log('[Technogym] Authenticating...', { 
    url, 
    baseUrl: API_BASE_URL,
    facilityUrl: FACILITY_URL,
    applicationId: APPLICATION_ID,
  });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-MWAPPS-CLIENT': 'thirdParties',
      'X-MWAPPS-APIKEY': API_KEY,
    },
    body: JSON.stringify({
      apiKey: API_KEY,
      username: USERNAME,
      password: PASSWORD,
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
  
  // Token is in response.token (not data.accessToken)
  if (!data.token) {
    console.error('[Technogym] No token in response:', data);
    throw new Error(`Technogym authentication failed: No token in response`);
  }
  
  if (!data.data?.facilities?.[0]?.id) {
    console.error('[Technogym] No facility found:', data);
    throw new Error('Technogym authentication failed: No facility found');
  }

  sessionToken = data.token;
  cachedFacilityId = data.data.facilities[0].id;
  // Token expires in 30 min (expireIn: 1800), refresh at 25 min to be safe
  tokenExpiry = new Date(Date.now() + 25 * 60 * 1000);
  
  console.log('[Technogym] Auth successful:', {
    facilityId: cachedFacilityId,
    facilityName: data.data.facilities[0].name,
    tokenLength: sessionToken.length,
    expiresIn: data.expireIn,
  });
  
  return { token: sessionToken, facilityId: cachedFacilityId };
}

/**
 * Make authenticated API request
 * Token is passed in the body of the request (not in Authorization header)
 */
async function apiRequest<T>(
  endpoint: string,
  body: Record<string, unknown> = {},
  method: 'GET' | 'POST' = 'POST'
): Promise<T> {
  const { token, facilityId } = await authenticate();
  
  // Replace {facilityId} placeholder in endpoint
  const resolvedEndpoint = endpoint.replace('{facilityId}', facilityId);
  const url = `${API_BASE_URL}/${FACILITY_URL}${resolvedEndpoint}`;
  
  // Add token to body (as per working Wix implementation)
  const requestBody = {
    ...body,
    token: token,
  };
  
  console.log('[Technogym] API Request:', { method, url, body: requestBody });
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-MWAPPS-CLIENT': 'thirdParties',
      'X-MWAPPS-APIKEY': API_KEY,
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  console.log('[Technogym] API Response status:', response.status);
  console.log('[Technogym] API Response:', responseText.substring(0, 500));
  
  let responseData: T & { errors?: Array<{ message: string }>; token?: string };
  
  try {
    responseData = JSON.parse(responseText);
  } catch {
    console.error('[Technogym] Invalid JSON response:', responseText);
    throw new Error(`Technogym API error: Invalid JSON response`);
  }

  // Update session token if a new one is returned
  if (responseData.token) {
    sessionToken = responseData.token;
    tokenExpiry = new Date(Date.now() + 25 * 60 * 1000);
    console.log('[Technogym] Session token updated');
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

export type CreateUserResult = 
  | { 
      success: true;
      result: 'Created' | 'MatchFound';
      userId: string;
      facilityUserId: string;
      permanentToken: string;
      isExisting: boolean;
    }
  | {
      success: false;
      result: 'UserEmailAndDataMatchFound';
      matchedUsers: Array<{
        userId: string;
        facilityUserId: string;
        email: string;
      }>;
      message: string;
    };

/**
 * Create a new user in Technogym facility
 * Endpoint: POST /core/facility/{facilityId}/CreateFacilityUserFromThirdParty
 * 
 * MATCHING LOGIC:
 * - If firstName + lastName + gender + dateOfBirth match existing user -> MatchFound
 * - If multiple matches -> UserEmailAndDataMatchFound (returns list to choose from)
 * - If no match -> Created (new user)
 */
export async function createUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string; // Format: YYYY-MM-DD
  gender?: 'M' | 'F';
  externalId?: string; // Your internal user ID
}): Promise<CreateUserResult> {
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

  console.log('[Technogym] CreateUser response:', {
    result: response.data.result,
    userId: response.data.userId,
    facilityUserId: response.data.facilityUserId,
    matchedUsersCount: response.data.matchedUsers?.length,
  });

  // Handle multiple matches case - requires user intervention
  if (response.data.result === 'UserEmailAndDataMatchFound' && response.data.matchedUsers) {
    return {
      success: false,
      result: 'UserEmailAndDataMatchFound',
      matchedUsers: response.data.matchedUsers,
      message: `Multiple matching users found (${response.data.matchedUsers.length}). Please select the correct one.`,
    };
  }

  // Handle Created or MatchFound (both return user data)
  if (!response.data.userId || !response.data.facilityUserId || !response.data.permanentToken) {
    throw new Error(`Technogym API error: Missing user data in response for result: ${response.data.result}`);
  }

  return {
    success: true,
    result: response.data.result === 'MatchFound' ? 'MatchFound' : 'Created',
    userId: response.data.userId,
    facilityUserId: response.data.facilityUserId,
    permanentToken: response.data.permanentToken,
    isExisting: response.data.result === 'MatchFound' || response.data.result === 'AlreadyExists',
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
 * Endpoint: POST /core/facility/{facilityId}/GetFacilityUserByExternalID
 */
export async function getUserByExternalId(externalId: string): Promise<TechnogymUser | null> {
  try {
    const response = await apiRequest<GetUserResponse>(
      '/core/facility/{facilityId}/GetFacilityUserByExternalID',
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
  const { facilityId } = await authenticate();
  return facilityId;
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
  applicationId: string;
} {
  return {
    apiKey: !!API_KEY,
    username: !!USERNAME,
    password: !!PASSWORD,
    facilityUrl: !!FACILITY_URL,
    environment: process.env.TECHNOGYM_ENV || 'development',
    baseUrl: API_BASE_URL,
    applicationId: APPLICATION_ID,
  };
}

export function clearTokenCache(): void {
  sessionToken = null;
  tokenExpiry = null;
  cachedFacilityId = null;
  console.log('[Technogym] Token cache cleared');
}

// =============================================================================
// WORKFLOW HELPERS
// =============================================================================

export type OnboardResult = 
  | {
      success: true;
      userId: string;
      facilityUserId: string;
      permanentToken: string;
      isExisting: boolean;
    }
  | {
      success: false;
      result: 'UserEmailAndDataMatchFound';
      matchedUsers: Array<{
        userId: string;
        facilityUserId: string;
        email: string;
      }>;
      message: string;
    };

/**
 * Complete workflow: Create user, update details, and subscribe
 * Handles Matching Logic for existing users
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
}): Promise<OnboardResult> {
  // Step 1: Create user (handles matching logic)
  const createResult = await createUser({
    firstName: memberData.firstName,
    lastName: memberData.lastName,
    email: memberData.email,
    dateOfBirth: memberData.dateOfBirth,
    gender: memberData.gender,
    externalId: memberData.externalId,
  });

  // If multiple matches found, return for user selection
  if (!createResult.success) {
    return createResult;
  }

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
    isExisting: createResult.isExisting,
  });

  return {
    success: true,
    userId: createResult.userId,
    facilityUserId: createResult.facilityUserId,
    permanentToken: createResult.permanentToken,
    isExisting: createResult.isExisting,
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