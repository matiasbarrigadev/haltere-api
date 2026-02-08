/**
 * Technogym Mywellness Cloud API Client
 * Server-to-Server Integration
 * Documentation: https://apidocs.mywellness.com
 */

// Environment-based URLs
const API_BASE_URL = process.env.TECHNOGYM_ENV === 'production' 
  ? 'https://api.mywellness.com'
  : 'https://api-dev.mywellness.com';

// Credentials from environment
const API_KEY = process.env.TECHNOGYM_API_KEY!;
const USERNAME = process.env.TECHNOGYM_USERNAME!;
const PASSWORD = process.env.TECHNOGYM_PASSWORD!;
const FACILITY_URL = process.env.TECHNOGYM_FACILITY_URL!;

// Token cache
let accessToken: string | null = null;
let tokenExpiry: Date | null = null;
let facilityId: string | null = null;

// Types
export interface TechnogymUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string;
  gender?: string;
  membershipNumber?: string;
  customerLogicalId?: string;
}

export interface WorkoutResult {
  id: string;
  startDate: string;
  endDate: string;
  duration: number; // seconds
  calories: number;
  distance?: number; // meters
  avgHeartRate?: number;
  maxHeartRate?: number;
  equipmentType?: string;
  equipmentName?: string;
}

export interface BiometricData {
  date: string;
  weight?: number; // kg
  height?: number; // cm
  bodyFat?: number; // percentage
  muscleMass?: number; // kg
  bmi?: number;
  visceralFat?: number;
  metabolicAge?: number;
}

export interface TrainingProgram {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  completionPercentage?: number;
}

export interface UserStats {
  totalWorkouts: number;
  totalCalories: number;
  totalDuration: number; // seconds
  avgWorkoutDuration: number;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate?: string;
  favoriteEquipment?: string;
}

/**
 * Authenticate and get access token
 */
async function authenticate(): Promise<string> {
  // Check if we have a valid cached token
  if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
    return accessToken;
  }

  const url = `${API_BASE_URL}/${FACILITY_URL}/application/69295ed5-a53c-434b-8518-f2e0b5f05b28/accessintegration`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: API_KEY,
      username: USERNAME,
      password: PASSWORD,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Technogym authentication failed: ${error}`);
  }

  const data = await response.json();
  
  accessToken = data.data.accessToken;
  facilityId = data.data.facilities?.[0]?.id;
  
  // Token valid for 30 minutes, refresh at 25 minutes
  tokenExpiry = new Date(Date.now() + 25 * 60 * 1000);
  
  return accessToken!;
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: object
): Promise<T> {
  const token = await authenticate();
  
  const url = `${API_BASE_URL}/${FACILITY_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle token expiration
  if (response.status === 401) {
    accessToken = null;
    tokenExpiry = null;
    return apiRequest(endpoint, method, body);
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Technogym API error: ${error}`);
  }

  return response.json();
}

// ============================================
// CORE LAYER - User Management
// ============================================

/**
 * Create a new user in Technogym
 */
export async function createUser(userData: {
  email: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  gender?: 'M' | 'F';
  customerLogicalId?: string;
}): Promise<TechnogymUser> {
  const response = await apiRequest<{ data: TechnogymUser }>(
    `/core/facility/${facilityId}/facilityuser`,
    'POST',
    {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      birthDate: userData.birthDate,
      gender: userData.gender,
      customerLogicalId: userData.customerLogicalId,
    }
  );
  return response.data;
}

/**
 * Get user by Technogym ID
 */
export async function getUser(userId: string): Promise<TechnogymUser> {
  const response = await apiRequest<{ data: TechnogymUser }>(
    `/core/facilityuser/${userId}`
  );
  return response.data;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<TechnogymUser | null> {
  try {
    const response = await apiRequest<{ data: { items: TechnogymUser[] } }>(
      `/core/facility/${facilityId}/facilityusers?email=${encodeURIComponent(email)}`
    );
    return response.data.items?.[0] || null;
  } catch {
    return null;
  }
}

/**
 * Update user data
 */
export async function updateUser(
  userId: string,
  userData: Partial<{
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: 'M' | 'F';
  }>
): Promise<TechnogymUser> {
  const response = await apiRequest<{ data: TechnogymUser }>(
    `/core/facilityuser/${userId}/update`,
    'PUT',
    userData
  );
  return response.data;
}

// ============================================
// RESULTS LAYER - Workout History
// ============================================

/**
 * Get user's workout results
 */
export async function getWorkoutResults(
  userId: string,
  options?: {
    from?: string; // ISO date
    to?: string;
    limit?: number;
    offset?: number;
  }
): Promise<WorkoutResult[]> {
  let endpoint = `/results/facilityuser/${userId}/workouts`;
  
  const params = new URLSearchParams();
  if (options?.from) params.append('from', options.from);
  if (options?.to) params.append('to', options.to);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());
  
  const queryString = params.toString();
  if (queryString) endpoint += `?${queryString}`;
  
  const response = await apiRequest<{ data: { items: WorkoutResult[] } }>(endpoint);
  return response.data.items || [];
}

/**
 * Get single workout details
 */
export async function getWorkoutDetail(
  userId: string,
  workoutId: string
): Promise<WorkoutResult> {
  const response = await apiRequest<{ data: WorkoutResult }>(
    `/results/facilityuser/${userId}/workout/${workoutId}`
  );
  return response.data;
}

// ============================================
// BIOMETRICS LAYER - Body Measurements
// ============================================

/**
 * Get user's biometric data history
 */
export async function getBiometrics(
  userId: string,
  options?: {
    from?: string;
    to?: string;
  }
): Promise<BiometricData[]> {
  let endpoint = `/biometrics/facilityuser/${userId}/measurements`;
  
  const params = new URLSearchParams();
  if (options?.from) params.append('from', options.from);
  if (options?.to) params.append('to', options.to);
  
  const queryString = params.toString();
  if (queryString) endpoint += `?${queryString}`;
  
  const response = await apiRequest<{ data: { items: BiometricData[] } }>(endpoint);
  return response.data.items || [];
}

/**
 * Get latest biometric data
 */
export async function getLatestBiometrics(userId: string): Promise<BiometricData | null> {
  const biometrics = await getBiometrics(userId, {
    from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  });
  return biometrics[0] || null;
}

// ============================================
// TRAINING PROGRAMS LAYER
// ============================================

/**
 * Get user's training programs
 */
export async function getTrainingPrograms(
  userId: string
): Promise<TrainingProgram[]> {
  const response = await apiRequest<{ data: { items: TrainingProgram[] } }>(
    `/trainingprogram/facilityuser/${userId}/programs`
  );
  return response.data.items || [];
}

/**
 * Get active training program
 */
export async function getActiveProgram(userId: string): Promise<TrainingProgram | null> {
  const programs = await getTrainingPrograms(userId);
  return programs.find(p => p.status === 'active') || null;
}

// ============================================
// AGGREGATED STATS
// ============================================

/**
 * Calculate user statistics from workout history
 */
export async function calculateUserStats(userId: string): Promise<UserStats> {
  // Get last year's workouts
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const workouts = await getWorkoutResults(userId, { from: oneYearAgo, limit: 1000 });
  
  if (workouts.length === 0) {
    return {
      totalWorkouts: 0,
      totalCalories: 0,
      totalDuration: 0,
      avgWorkoutDuration: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  // Calculate totals
  const totalWorkouts = workouts.length;
  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const avgWorkoutDuration = Math.round(totalDuration / totalWorkouts);

  // Sort by date for streak calculation
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Calculate streaks (days with at least one workout)
  const workoutDates = new Set(
    sortedWorkouts.map(w => new Date(w.startDate).toDateString())
  );
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    
    if (workoutDates.has(checkDate.toDateString())) {
      tempStreak++;
      if (i < 2 || currentStreak > 0) {
        currentStreak = tempStreak;
      }
    } else {
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      if (i > 1) {
        tempStreak = 0;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Find favorite equipment
  const equipmentCount: Record<string, number> = {};
  for (const w of workouts) {
    if (w.equipmentType) {
      equipmentCount[w.equipmentType] = (equipmentCount[w.equipmentType] || 0) + 1;
    }
  }
  const favoriteEquipment = Object.entries(equipmentCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  return {
    totalWorkouts,
    totalCalories,
    totalDuration,
    avgWorkoutDuration,
    currentStreak,
    longestStreak,
    lastWorkoutDate: sortedWorkouts[0]?.startDate,
    favoriteEquipment,
  };
}

/**
 * Get comprehensive user fitness profile
 */
export async function getUserFitnessProfile(userId: string) {
  const [stats, biometrics, activeProgram] = await Promise.all([
    calculateUserStats(userId),
    getLatestBiometrics(userId),
    getActiveProgram(userId),
  ]);

  return {
    stats,
    biometrics,
    activeProgram,
  };
}

