/**
 * Technogym Mywellness Cloud API Client
 * Server-to-Server Integration
 * Documentation: https://apidocs.mywellness.com
 * 
 * IMPORTANT: This client implements the Third Party Server-to-Server integration
 * according to the official Technogym Postman collection (MANDATORY STEPS + INTERACTION EXAMPLES)
 */

// Environment configuration - ALWAYS use production
// api-dev.mywellness.com for testing, api.mywellness.com for production
const API_BASE_URL = process.env.TECHNOGYM_ENV === 'development' 
  ? 'https://api-dev.mywellness.com'
  : 'https://api.mywellness.com';

// The application ID is fixed for third-party integrations
const APPLICATION_ID = '69295ed5-a53c-434b-8518-f2e0b5f05b28';

// Credentials from environment
const API_KEY = process.env.TECHNOGYM_API_KEY || '';
const USERNAME = process.env.TECHNOGYM_USERNAME || '';
const PASSWORD = process.env.TECHNOGYM_PASSWORD || '';
const FACILITY_URL = process.env.TECHNOGYM_FACILITY_URL || '';

// Token cache
let sessionToken: string | null = null;
let tokenExpiry: Date | null = null;
let facilityId: string | null = null;

// =============================================================================
// TYPES
// =============================================================================

export interface TechnogymAuthResponse {
  data: {
    facilities: Array<{
      id: string;
      url: string;
      name: string;
      companyName: string;
      logoUrl: string;
      isDemo: boolean;
    }>;
    accountConfirmed: boolean;
    userContext: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    result: string;
    credentialId: string;
  };
  token: string;
  expireIn: number;
}

export interface CreateUserResponse {
  data: {
    result: 'Created' | 'AlreadyExists';
    userId: string;
    facilityUserId: string;
    permanentToken: string;
  };
  token: string;
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
  token: string;
}

export interface SaveMembershipResponse {
  data: {
    result: 'Success' | 'Error';
  };
  token: string;
}

export interface VisitResponse {
  data: {
    result: 'Success' | 'Error';
  };
  token: string;
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
 * Authenticate with Technogym API and get session token
 * Documentation: https://apidocs.mywellness.com/#d8b453a6-b0db-4e29-9a55-44dbd79ac183
 */
export async function authenticate(): Promise<{ token: string; facilityId: string }> {
  // Check cached token (expires in 30 min, refresh at 25 min)
  if (sessionToken && tokenExpiry && facilityId && new Date() < tokenExpiry) {
    return { token: sessionToken, facilityId };
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

  const url = `${API_BASE_URL}/${FACILITY_URL}/application/${APPLICATION_ID}/AccessIntegration`;
  
  console.log('[Technogym] Authenticating...', { 
    url, 
    env: process.env.TECHNOGYM_ENV || 'development',
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
      'X-MWAPPS-APIKEY': API_KEY,
    },
    body: JSON.stringify({
      apiKey: API_KEY,
      username: USERNAME,
      password: PASSWORD,
    }),
  });

  const responseText = await response.text();
  let data: TechnogymAuthResponse;
  
  try {
    data = JSON.parse(responseText);
  } catch {
    console.error('[Technogym] Invalid JSON response:', responseText.substring(0, 500));
    throw new Error(`Technogym authentication failed: Invalid response - ${responseText.substring(0, 200)}`);
  }

  if (!response.ok) {
    console.error('[Technogym] Auth failed:', { status: response.status, data });
    const errorMsg = data && typeof data === 'object' && 'message' in data 
      ? (data as { message: string }).message 
      : responseText.substring(0, 200);
    throw new Error(`Technogym authentication failed: ${response.status} - ${errorMsg}`);
  }
  
  if (!data.token) {
    console.error('[Technogym] No token in response:', data);
    throw new Error(`Technogym authentication failed: No token in response. Result: ${data.data?.result || 'unknown'}`);
  }
  
  if (!data.data?.facilities?.[0]?.id) {
    console.error('[Technogym] No facility found:', data);
    throw new Error('Technogym authentication failed: No facility found in response');
  }

  sessionToken = data.token;
  facilityId = data.data.facilities[0].id;
  // Token expires in 30 min, refresh at 25 min to be safe
  tokenExpiry = new Date(Date.now() + 25 * 60 * 1000);
  
  console.log('[Technogym] Auth successful:', {
    facilityId,
    facilityName: data.data.facilities[0].name,
    expiresIn: data.expireIn,
  });
  
  return { token: sessionToken, facilityId };
}

/**
 * Make authenticated API request
 * Each request includes the token in the body and receives a new token in response
 */
async function apiRequest<T extends { token?: string }>(
  endpoint: string,
  body: Record<string, unknown> = {},
  method: 'GET' | 'POST' = 'POST'
): Promise<T> {
  const { token, facilityId: fId } = await authenticate();
  
  // Replace {facilityId} placeholder in endpoint
  const resolvedEndpoint = endpoint.replace('{facilityId}', fId);
  const url = `${API_BASE_URL}/${FACILITY_URL}${resolvedEndpoint}`;
  
  // Include token in request body
  const requestBody = { ...body, token };
  
  console.log('[Technogym] API Request:', { method, url, body: { ...requestBody, token: '***' } });
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-MWAPPS-CLIENT': 'thirdParties',
      'X-MWAPPS-APIKEY': API_KEY,
    },
    body: JSON.stringify(requestBody),
  });

  const responseData = await response.json() as T & { errors?: Array<{ message: string }> };
  
  // Update session token if a new one was returned
  if (responseData.token) {
    sessionToken = responseData.token;
    tokenExpiry = new Date(Date.now() + 25 * 60 * 1000);
  }

  // Check for errors in response
  if (responseData.errors && responseData.errors.length > 0) {
    const errorMsg = responseData.errors.map((e: { message: string }) => e.message).join(', ');
    console.error('[Technogym] API Error:', errorMsg);
    throw new Error(`Technogym API error: ${errorMsg}`);
  }

  if (!response.ok) {
    throw new Error(`Technogym API error: ${response.status}`);
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
 * 
 * @param userId - The Mywellness Cloud userId (not facilityUserId)
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

/**
 * Get detailed user information
 * Endpoint: POST /core/facilityuser/{facilityUserId}/details
 * 
 * Returns comprehensive user data including profile, membership status, etc.
 */
export async function getUserDetails(facilityUserId: string): Promise<{
  userId: string;
  facilityUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  nickName?: string;
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
  membershipStatus?: {
    memberSince?: string;
    startOn?: string;
    expiresOn?: string;
    isFrozen?: boolean;
  };
}> {
  interface DetailsResponse {
    data: {
      userId: string;
      facilityUserId: string;
      firstName: string;
      lastName: string;
      email: string;
      nickName?: string;
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
      memberSince?: string;
      startOn?: string;
      expiresOn?: string;
      isFrozen?: boolean;
    };
    token: string;
  }

  const response = await apiRequest<DetailsResponse>(
    `/core/facilityuser/${facilityUserId}/details`,
    {}
  );

  return {
    userId: response.data.userId,
    facilityUserId: response.data.facilityUserId,
    firstName: response.data.firstName,
    lastName: response.data.lastName,
    email: response.data.email,
    nickName: response.data.nickName,
    birthDate: response.data.birthDate,
    gender: response.data.gender,
    notes: response.data.notes,
    address1: response.data.address1,
    city: response.data.city,
    zipCode: response.data.zipCode,
    phoneNumber: response.data.phoneNumber,
    mobilePhoneNumber: response.data.mobilePhoneNumber,
    levelOfInterest: response.data.levelOfInterest,
    measurementSystem: response.data.measurementSystem,
    externalId: response.data.externalId,
    createdOn: response.data.createdOn,
    modifiedOn: response.data.modifiedOn,
    membershipStatus: response.data.memberSince ? {
      memberSince: response.data.memberSince,
      startOn: response.data.startOn,
      expiresOn: response.data.expiresOn,
      isFrozen: response.data.isFrozen,
    } : undefined,
  };
}

/**
 * Match/Find user by basic data
 * Uses CreateFacilityUserFromThirdParty - if user exists with same data, returns existing user
 * This is useful for initial sync or finding users without knowing their IDs
 * 
 * @returns User data with result 'AlreadyExists' if matched, 'Created' if new
 */
export async function matchUserByData(userData: {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  gender?: 'M' | 'F';
}): Promise<{
  userId: string;
  facilityUserId: string;
  permanentToken: string;
  wasMatched: boolean;
}> {
  const result = await createUser(userData);
  
  return {
    userId: result.userId,
    facilityUserId: result.facilityUserId,
    permanentToken: result.permanentToken,
    wasMatched: result.result === 'AlreadyExists',
  };
}

// =============================================================================
// MEMBERSHIP MANAGEMENT
// =============================================================================

/**
 * Save/Update user membership
 * Endpoint: POST /core/facilityuser/{facilityUserId}/SaveMembership
 * 
 * Operations:
 * - Subscribe: New subscription
 * - Renew: Renew existing subscription
 * - UnSubscribe: Cancel subscription
 * - Update: Update subscription details
 * - Froze: Freeze subscription
 * - UnFroze: Unfreeze subscription
 */
export async function saveMembership(
  facilityUserId: string,
  membership: {
    operation: MembershipOperation;
    memberSince?: string; // Format: YYYY-MM-DD
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
 * Subscribe user (convenience wrapper for saveMembership)
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

/**
 * Unsubscribe user (convenience wrapper for saveMembership)
 */
export async function unsubscribeUser(
  facilityUserId: string,
  expiresOn: string,
  description?: string
): Promise<void> {
  await saveMembership(facilityUserId, {
    operation: 'UnSubscribe',
    expiresOn,
    description,
  });
}

/**
 * Renew user subscription (convenience wrapper for saveMembership)
 */
export async function renewMembership(
  facilityUserId: string,
  options: {
    startOn: string;
    expiresOn: string;
    description?: string;
  }
): Promise<void> {
  await saveMembership(facilityUserId, {
    operation: 'Renew',
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
  visitDate?: string // Format: YYYY-MM-DD HH:mm:ss +HH:00
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

/**
 * Get current facility ID (authenticates if needed)
 */
export async function getFacilityId(): Promise<string> {
  const { facilityId: fId } = await authenticate();
  return fId;
}

/**
 * Check if configuration is complete
 */
export function isConfigured(): boolean {
  return !!(API_KEY && USERNAME && PASSWORD && FACILITY_URL);
}

/**
 * Get configuration status (for debugging)
 */
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
    environment: process.env.TECHNOGYM_ENV || 'development',
    baseUrl: API_BASE_URL,
  };
}

/**
 * Clear cached token (for testing/debugging)
 */
export function clearTokenCache(): void {
  sessionToken = null;
  tokenExpiry = null;
  facilityId = null;
  console.log('[Technogym] Token cache cleared');
}

// =============================================================================
// FULL WORKFLOW HELPERS
// =============================================================================

/**
 * Complete workflow: Create user, update details, and subscribe
 * This is the recommended flow for onboarding a new member
 */
export async function onboardNewMember(memberData: {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  gender?: 'M' | 'F';
  externalId: string; // Your Haltere user ID
  membershipStartOn: string;
  membershipExpiresOn: string;
  membershipDescription?: string;
  // Optional additional info
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

/**
 * Sync member status: Update membership when Haltere membership changes
 */
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

// =============================================================================
// LEGACY COMPATIBILITY - Deprecated functions
// These exist for backward compatibility but use the new implementation
// =============================================================================

/** @deprecated Use createUser instead */
export async function findUserByEmail(email: string): Promise<TechnogymUser | null> {
  console.warn('[Technogym] findUserByEmail is deprecated. Use createUser with externalId for user lookup.');
  // The new API doesn't support finding by email directly
  // Users should use externalId (Haltere user ID) for lookups
  return null;
}

/** @deprecated No longer supported in S2S integration */
export async function getWorkoutResults(): Promise<never[]> {
  console.warn('[Technogym] getWorkoutResults is not available in S2S integration. Workout data comes from equipment automatically.');
  return [];
}

/** @deprecated No longer supported in S2S integration */
export async function getBiometrics(): Promise<never[]> {
  console.warn('[Technogym] getBiometrics is not available in S2S integration. Biometric data comes from equipment automatically.');
  return [];
}

/** @deprecated No longer supported in S2S integration */
export async function getTrainingPrograms(): Promise<never[]> {
  console.warn('[Technogym] getTrainingPrograms is not available in S2S integration.');
  return [];
}

/** @deprecated No longer supported in S2S integration */
export async function calculateUserStats(): Promise<null> {
  console.warn('[Technogym] calculateUserStats is not available in S2S integration.');
  return null;
}

/** @deprecated No longer supported in S2S integration */
export async function getFacilityUsers(): Promise<{ users: never[]; total: number }> {
  console.warn('[Technogym] getFacilityUsers is not available in S2S integration. Use individual user lookups by permanentToken or externalId.');
  return { users: [], total: 0 };
}

/** @deprecated No longer supported in S2S integration */
export async function getFullUserProfile(): Promise<null> {
  console.warn('[Technogym] getFullUserProfile is not available in S2S integration.');
  return null;
}