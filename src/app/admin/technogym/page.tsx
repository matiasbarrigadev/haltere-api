'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Types based on Technogym client
interface TechnogymUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string;
  gender?: string;
  membershipNumber?: string;
  lastActivityDate?: string;
  registrationDate?: string;
  status?: string;
}

interface WorkoutResult {
  id: string;
  startDate: string;
  endDate: string;
  duration: number;
  calories: number;
  distance?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  equipmentType?: string;
  equipmentName?: string;
}

interface BiometricData {
  date: string;
  weight?: number;
  height?: number;
  bodyFat?: number;
  muscleMass?: number;
  bmi?: number;
  visceralFat?: number;
  metabolicAge?: number;
}

interface TrainingProgram {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  completionPercentage?: number;
}

interface UserStats {
  totalWorkouts: number;
  totalCalories: number;
  totalDuration: number;
  avgWorkoutDuration: number;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate?: string;
  favoriteEquipment?: string;
}

interface FullUserProfile {
  user: TechnogymUser;
  stats: UserStats;
  biometrics: BiometricData[];
  programs: TrainingProgram[];
  recentWorkouts: WorkoutResult[];
}

// Helper Components
function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div style={{
      backgroundColor: '#111111',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid #1a1a1a',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#666666', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

function BiometricItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '20px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#666666', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export default function TechnogymAdminPage() {
  const [users, setUsers] = useState<TechnogymUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<FullUserProfile | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [facilityId, setFacilityId] = useState<string>('');
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase not initialized');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('limit', '100');
      
      const response = await fetch(`/api/admin/technogym?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch');
      }
      
      const result = await response.json();
      setUsers(result.data.users || []);
      setTotal(result.data.total || 0);
      setFacilityId(result.data.facilityId || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    fetchUsers(searchQuery);
  };

  const openUserModal = async (userId: string) => {
    setModalLoading(true);
    setSelectedUser(null);
    
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase not initialized');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');
      
      const response = await fetch(`/api/admin/technogym?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch user details');
      
      const result = await response.json();
      setSelectedUser(result.data);
    } catch (err) {
      console.error('Error fetching user details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('es-CL', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            🏋️
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Technogym
            </h1>
            <p style={{ color: '#888888', fontSize: '14px', margin: 0 }}>
              Miembros de la facility conectada
            </p>
          </div>
        </div>
        
        {facilityId && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'rgba(0, 180, 216, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(0, 180, 216, 0.2)',
            marginTop: '12px'
          }}>
            <span style={{ color: '#00b4d8', fontSize: '12px' }}>●</span>
            <span style={{ color: '#00b4d8', fontSize: '13px', fontWeight: 500 }}>
              Facility ID: {facilityId}
            </span>
            <span style={{ color: '#666', fontSize: '13px' }}>
              • {total} miembros registrados
            </span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{
            flex: 1,
            maxWidth: '400px',
            padding: '12px 16px',
            backgroundColor: '#111111',
            border: '1px solid #2a2a2a',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '12px 24px',
            backgroundColor: '#00b4d8',
            border: 'none',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Buscar
        </button>
        <button
          onClick={() => { setSearchQuery(''); fetchUsers(); }}
          style={{
            padding: '12px 16px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '10px',
            color: '#888888',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Limpiar
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div style={{
          padding: '16px 20px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          color: '#ef4444',
          marginBottom: '24px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(0, 180, 216, 0.2)',
            borderTop: '4px solid #00b4d8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: '#666666' }}>Cargando miembros de Technogym...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        /* Users Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => openUserModal(user.id)}
              style={{
                backgroundColor: '#111111',
                border: '1px solid #1a1a1a',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00b4d8';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1a1a1a';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Gradient accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #00b4d8, #0077b6)'
              }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#ffffff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.firstName} {user.lastName}
                  </h3>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: '13px',
                    color: '#888888',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.email}
                  </p>
                </div>
                
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0, 180, 216, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00b4d8',
                  fontSize: '14px'
                }}>
                  →
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                {user.membershipNumber && (
                  <span style={{
                    padding: '4px 10px',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderRadius: '6px',
                    color: '#d4af37',
                    fontSize: '11px',
                    fontWeight: 500
                  }}>
                    #{user.membershipNumber}
                  </span>
                )}
                {user.gender && (
                  <span style={{
                    padding: '4px 10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    color: '#888888',
                    fontSize: '11px'
                  }}>
                    {user.gender === 'M' ? '♂ Masculino' : '♀ Femenino'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#666666' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏋️</div>
          <p style={{ fontSize: '16px', margin: 0 }}>No se encontraron miembros</p>
          <p style={{ fontSize: '14px', marginTop: '8px', color: '#555' }}>
            Intenta con otra búsqueda o verifica la conexión con Technogym
          </p>
        </div>
      )}

      {/* User Detail Modal */}
      {(selectedUser || modalLoading) && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={closeModal}
        >
          <div 
            style={{
              backgroundColor: '#0d0d0d',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflow: 'auto',
              border: '1px solid #1a1a1a'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {modalLoading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '100px',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid rgba(0, 180, 216, 0.2)',
                  borderTop: '4px solid #00b4d8',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span style={{ color: '#666666' }}>Cargando datos del usuario...</span>
              </div>
            ) : selectedUser && (
              <>
                {/* Modal Header */}
                <div style={{
                  padding: '24px',
                  borderBottom: '1px solid #1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(180deg, rgba(0, 180, 216, 0.05) 0%, transparent 100%)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '20px'
                    }}>
                      {selectedUser.user.firstName?.[0]}{selectedUser.user.lastName?.[0]}
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>
                        {selectedUser.user.firstName} {selectedUser.user.lastName}
                      </h2>
                      <p style={{ margin: '4px 0 0', color: '#888888', fontSize: '14px' }}>
                        {selectedUser.user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: 'none',
                      color: '#888888',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Stats Cards */}
                <div style={{ padding: '24px' }}>
                  <h3 style={{ 
                    margin: '0 0 16px', 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: '#888888',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    📊 Estadísticas de Entrenamiento
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px'
                  }}>
                    <StatCard icon="🏃" label="Workouts" value={selectedUser.stats.totalWorkouts.toString()} color="#00b4d8" />
                    <StatCard icon="🔥" label="Calorías" value={selectedUser.stats.totalCalories.toLocaleString()} color="#f59e0b" />
                    <StatCard icon="⏱️" label="Tiempo Total" value={formatDuration(selectedUser.stats.totalDuration)} color="#8b5cf6" />
                    <StatCard icon="📈" label="Racha Actual" value={`${selectedUser.stats.currentStreak} días`} color="#22c55e" />
                    <StatCard icon="🏆" label="Mejor Racha" value={`${selectedUser.stats.longestStreak} días`} color="#d4af37" />
                    <StatCard icon="⚡" label="Promedio/Sesión" value={formatDuration(selectedUser.stats.avgWorkoutDuration)} color="#ec4899" />
                  </div>
                  
                  {selectedUser.stats.favoriteEquipment && (
                    <div style={{
                      marginTop: '16px',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(0, 180, 216, 0.1)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '16px' }}>💪</span>
                      <span style={{ color: '#888888', fontSize: '13px' }}>Equipo favorito:</span>
                      <span style={{ color: '#00b4d8', fontSize: '14px', fontWeight: 600 }}>
                        {selectedUser.stats.favoriteEquipment}
                      </span>
                    </div>
                  )}
                </div>

                {/* Biometrics */}
                {selectedUser.biometrics && selectedUser.biometrics.length > 0 && (
                  <div style={{ padding: '0 24px 24px' }}>
                    <h3 style={{ 
                      margin: '0 0 16px', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#888888',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      ⚖️ Datos Biométricos
                    </h3>
                    <div style={{
                      backgroundColor: '#111111',
                      borderRadius: '14px',
                      padding: '20px',
                      border: '1px solid #1a1a1a'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '16px'
                      }}>
                        {selectedUser.biometrics[0].weight && (
                          <BiometricItem label="Peso" value={`${selectedUser.biometrics[0].weight} kg`} icon="⚖️" />
                        )}
                        {selectedUser.biometrics[0].bodyFat && (
                          <BiometricItem label="Grasa Corporal" value={`${selectedUser.biometrics[0].bodyFat}%`} icon="📉" />
                        )}
                        {selectedUser.biometrics[0].muscleMass && (
                          <BiometricItem label="Masa Muscular" value={`${selectedUser.biometrics[0].muscleMass} kg`} icon="💪" />
                        )}
                        {selectedUser.biometrics[0].bmi && (
                          <BiometricItem label="IMC" value={selectedUser.biometrics[0].bmi.toFixed(1)} icon="📊" />
                        )}
                        {selectedUser.biometrics[0].visceralFat && (
                          <BiometricItem label="Grasa Visceral" value={selectedUser.biometrics[0].visceralFat.toString()} icon="🫀" />
                        )}
                        {selectedUser.biometrics[0].metabolicAge && (
                          <BiometricItem label="Edad Metabólica" value={`${selectedUser.biometrics[0].metabolicAge} años`} icon="🧬" />
                        )}
                      </div>
                      <div style={{
                        marginTop: '16px',
                        paddingTop: '12px',
                        borderTop: '1px solid #1a1a1a',
                        color: '#666666',
                        fontSize: '12px'
                      }}>
                        📅 Última medición: {formatDate(selectedUser.biometrics[0].date)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Programs */}
                {selectedUser.programs && selectedUser.programs.length > 0 && (
                  <div style={{ padding: '0 24px 24px' }}>
                    <h3 style={{ 
                      margin: '0 0 16px', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#888888',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      📋 Programas de Entrenamiento
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedUser.programs.map((program) => (
                        <div
                          key={program.id}
                          style={{
                            backgroundColor: '#111111',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid #1a1a1a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <h4 style={{ margin: 0, fontSize: '15px', color: '#ffffff', fontWeight: 600 }}>
                              {program.name}
                            </h4>
                            {program.description && (
                              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666666' }}>
                                {program.description}
                              </p>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{
                              padding: '4px 10px',
                              backgroundColor: program.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '6px',
                              color: program.status === 'active' ? '#22c55e' : '#888888',
                              fontSize: '12px',
                              fontWeight: 500
                            }}>
                              {program.status}
                            </span>
                            {program.completionPercentage !== undefined && (
                              <div style={{
                                marginTop: '8px',
                                width: '80px',
                                height: '4px',
                                backgroundColor: '#1a1a1a',
                                borderRadius: '2px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${program.completionPercentage}%`,
                                  height: '100%',
                                  backgroundColor: '#00b4d8',
                                  borderRadius: '2px'
                                }} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Workouts */}
                {selectedUser.recentWorkouts && selectedUser.recentWorkouts.length > 0 && (
                  <div style={{ padding: '0 24px 24px' }}>
                    <h3 style={{ 
                      margin: '0 0 16px', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#888888',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      🏋️ Últimos Entrenamientos
                    </h3>
                    <div style={{
                      backgroundColor: '#111111',
                      borderRadius: '14px',
                      border: '1px solid #1a1a1a',
                      overflow: 'hidden'
                    }}>
                      {selectedUser.recentWorkouts.slice(0, 10).map((workout, index) => (
                        <div
                          key={workout.id}
                          style={{
                            padding: '14px 16px',
                            borderBottom: index < Math.min(selectedUser.recentWorkouts.length, 10) - 1 ? '1px solid #1a1a1a' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(0, 180, 216, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px'
                            }}>
                              {workout.equipmentType?.toLowerCase().includes('tread') ? '🏃' :
                               workout.equipmentType?.toLowerCase().includes('bike') ? '🚴' :
                               workout.equipmentType?.toLowerCase().includes('row') ? '🚣' : '🏋️'}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 500 }}>
                                {workout.equipmentName || workout.equipmentType || 'Workout'}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666666' }}>
                                {formatDateTime(workout.startDate)}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '14px', color: '#00b4d8', fontWeight: 600 }}>
                                {formatDuration(workout.duration)}
                              </div>
                              <div style={{ fontSize: '10px', color: '#666666' }}>Duración</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '14px', color: '#f59e0b', fontWeight: 600 }}>
                                {workout.calories}
                              </div>
                              <div style={{ fontSize: '10px', color: '#666666' }}>kcal</div>
                            </div>
                            {workout.avgHeartRate && (
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '14px', color: '#ef4444', fontWeight: 600 }}>
                                  {workout.avgHeartRate}
                                </div>
                                <div style={{ fontSize: '10px', color: '#666666' }}>bpm</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
