'use client';

import { useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getSupabase = (): SupabaseClient | null => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
};

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
}

interface ProfessionalProfile {
  id: string;
  user_id: string;
  specialty: string[];
  bio: string | null;
  commission_rate: number;
  is_available: boolean;
}

interface ProfessionalService {
  id: string;
  service_id: string;
  service_name: string;
  is_active: boolean;
  commission_override: number | null;
}

interface Stats {
  totalSessions: number;
  avgRating: number;
  totalEarnings: number;
  thisMonthSessions: number;
}

const specialtyLabels: Record<string, { label: string; icon: string; color: string }> = {
  'personal_training': { label: 'Personal Training', icon: '💪', color: '#F2BB6A' },
  'yoga': { label: 'Yoga', icon: '🧘', color: '#8b5cf6' },
  'pilates': { label: 'Pilates', icon: '🤸', color: '#ec4899' },
  'crossfit': { label: 'CrossFit', icon: '🏋️', color: '#ef4444' },
  'spinning': { label: 'Spinning', icon: '🚴', color: '#3b82f6' },
  'nutrition': { label: 'Nutrición', icon: '🥗', color: '#22c55e' },
  'massage': { label: 'Masajes', icon: '💆', color: '#06b6d4' },
  'physiotherapy': { label: 'Fisioterapia', icon: '🩺', color: '#f97316' },
};

export default function ProfessionalProfilePage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile | null>(null);
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [stats, setStats] = useState<Stats>({ totalSessions: 0, avgRating: 0, totalEarnings: 0, thisMonthSessions: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const client = getSupabase();
    if (client) setSupabase(client);
  }, []);

  useEffect(() => {
    if (supabase) {
      loadData();
    }
  }, [supabase]);

  const loadData = async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get user profile
      const { data: userProfileData } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, phone, avatar_url, role')
        .eq('id', session.user.id)
        .single();

      if (userProfileData) {
        setUserProfile(userProfileData);
      }

      // Get professional profile
      const { data: profProfile } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profProfile) {
        setProfessionalProfile(profProfile);
        setEditBio(profProfile.bio || '');

        // Get assigned services
        const { data: servicesData } = await supabase
          .from('professional_services')
          .select(`
            id,
            service_id,
            is_active,
            commission_override,
            services(name)
          `)
          .eq('professional_id', profProfile.id);

        if (servicesData) {
          setServices(servicesData.map((s: any) => ({
            id: s.id,
            service_id: s.service_id,
            service_name: s.services?.name || 'Servicio',
            is_active: s.is_active,
            commission_override: s.commission_override,
          })));
        }

        // Get statistics
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('id, rating, bonos_charged, fiat_charged, completed_at')
          .eq('professional_id', profProfile.id)
          .eq('status', 'completed');

        if (bookingsData) {
          const totalSessions = bookingsData.length;
          const ratingsArray = bookingsData.filter(b => b.rating).map(b => b.rating);
          const avgRating = ratingsArray.length > 0 
            ? ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length 
            : 0;
          
          // Calculate earnings (simplified)
          const totalEarnings = bookingsData.reduce((acc, b) => {
            const bonosValue = (b.bonos_charged || 0) * 1000; // Assuming 1 bono = 1000 CLP
            const fiatValue = parseFloat(b.fiat_charged || '0');
            return acc + (bonosValue + fiatValue) * (profProfile.commission_rate / 100);
          }, 0);

          const thisMonthSessions = bookingsData.filter(b => 
            b.completed_at && new Date(b.completed_at) >= startOfMonth
          ).length;

          setStats({
            totalSessions,
            avgRating: Math.round(avgRating * 10) / 10,
            totalEarnings: Math.round(totalEarnings),
            thisMonthSessions,
          });
        }
      }

    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBio = async () => {
    if (!supabase || !professionalProfile) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('professional_profiles')
        .update({ bio: editBio, updated_at: new Date().toISOString() })
        .eq('id', professionalProfile.id);

      if (error) throw error;

      setProfessionalProfile({ ...professionalProfile, bio: editBio });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving bio:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async () => {
    if (!supabase || !professionalProfile) return;

    try {
      const newStatus = !professionalProfile.is_available;
      const { error } = await supabase
        .from('professional_profiles')
        .update({ is_available: newStatus, updated_at: new Date().toISOString() })
        .eq('id', professionalProfile.id);

      if (error) throw error;

      setProfessionalProfile({ ...professionalProfile, is_available: newStatus });
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d0c0b',
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '3px solid rgba(242, 187, 106, 0.2)',
          borderTopColor: '#F2BB6A',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!userProfile || !professionalProfile) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d0c0b',
        color: 'rgba(255,255,255,0.6)',
      }}>
        No se encontró el perfil profesional
      </div>
    );
  }

  const initials = userProfile.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>
          👤 Mi Perfil Profesional
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>
          Gestiona tu información y configuración profesional
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {[
          { label: 'Sesiones Totales', value: stats.totalSessions, icon: '📊', color: '#F2BB6A' },
          { label: 'Este Mes', value: stats.thisMonthSessions, icon: '📅', color: '#3b82f6' },
          { label: 'Rating Promedio', value: stats.avgRating > 0 ? `${stats.avgRating}/5` : '-', icon: '⭐', color: '#eab308' },
          { label: 'Comisión', value: `${professionalProfile.commission_rate}%`, icon: '💰', color: '#22c55e' },
        ].map((stat, i) => (
          <div key={i} style={{
            backgroundColor: '#111111',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(242, 187, 106, 0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: `${stat.color}15`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}>
                {stat.icon}
              </div>
            </div>
            <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>{stat.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px',
      }}>
        {/* Profile Card */}
        <div style={{
          backgroundColor: '#111111',
          borderRadius: '20px',
          border: '1px solid rgba(242, 187, 106, 0.1)',
          overflow: 'hidden',
        }}>
          {/* Profile Header */}
          <div style={{
            padding: '32px',
            background: 'linear-gradient(135deg, rgba(242, 187, 106, 0.15) 0%, rgba(242, 187, 106, 0.05) 100%)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '24px',
              backgroundColor: 'rgba(242, 187, 106, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '3px solid rgba(242, 187, 106, 0.4)',
            }}>
              {userProfile.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt={userProfile.full_name}
                  style={{ width: '100%', height: '100%', borderRadius: '21px', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: '#F2BB6A', fontSize: '36px', fontWeight: 700 }}>{initials}</span>
              )}
            </div>
            <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 600, marginBottom: '4px' }}>
              {userProfile.full_name}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
              Profesional de Fitness
            </p>
            
            {/* Availability Toggle */}
            <button
              onClick={toggleAvailability}
              style={{
                marginTop: '16px',
                padding: '10px 24px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: professionalProfile.is_available ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: professionalProfile.is_available ? '#22c55e' : '#ef4444',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: professionalProfile.is_available ? '#22c55e' : '#ef4444',
              }} />
              {professionalProfile.is_available ? 'Disponible' : 'No Disponible'}
            </button>
          </div>

          {/* Profile Details */}
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                Contacto
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '16px' }}>✉️</span>
                  <span style={{ color: '#ffffff', fontSize: '14px' }}>{userProfile.email}</span>
                </div>
                {userProfile.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '16px' }}>📞</span>
                    <span style={{ color: '#ffffff', fontSize: '14px' }}>{userProfile.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Specialties */}
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                Especialidades
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {professionalProfile.specialty.length > 0 ? (
                  professionalProfile.specialty.map((spec, i) => {
                    const info = specialtyLabels[spec] || { label: spec, icon: '🏃', color: '#6b7280' };
                    return (
                      <span key={i} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: `${info.color}15`,
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: info.color,
                        border: `1px solid ${info.color}30`,
                      }}>
                        <span>{info.icon}</span>
                        <span>{info.label}</span>
                      </span>
                    );
                  })
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                    Sin especialidades configuradas
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Bio Card */}
          <div style={{
            backgroundColor: '#111111',
            borderRadius: '20px',
            border: '1px solid rgba(242, 187, 106, 0.1)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(242, 187, 106, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>📝</span>
                <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>Biografía</span>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '6px 14px',
                    backgroundColor: 'rgba(242, 187, 106, 0.1)',
                    border: '1px solid rgba(242, 187, 106, 0.3)',
                    borderRadius: '8px',
                    color: '#F2BB6A',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Editar
                </button>
              )}
            </div>
            <div style={{ padding: '20px 24px' }}>
              {isEditing ? (
                <div>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Escribe una breve descripción sobre ti, tu experiencia y lo que te apasiona..."
                    style={{
                      width: '100%',
                      minHeight: '150px',
                      padding: '14px',
                      backgroundColor: '#0a0a0a',
                      border: '1px solid rgba(242, 187, 106, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '14px',
                      resize: 'vertical',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                    <button
                      onClick={handleSaveBio}
                      disabled={saving}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#F2BB6A',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#0a0a0a',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditBio(professionalProfile.bio || '');
                      }}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: 'transparent',
                        border: '1px solid #2a2a2a',
                        borderRadius: '10px',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{
                  color: professionalProfile.bio ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                }}>
                  {professionalProfile.bio || 'Aún no has agregado una biografía. Haz clic en "Editar" para agregar información sobre ti.'}
                </p>
              )}
            </div>
          </div>

          {/* Services Card */}
          <div style={{
            backgroundColor: '#111111',
            borderRadius: '20px',
            border: '1px solid rgba(242, 187, 106, 0.1)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(242, 187, 106, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span style={{ fontSize: '20px' }}>🏋️</span>
              <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>Mis Servicios</span>
            </div>
            <div style={{ padding: '16px' }}>
              {services.length === 0 ? (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.4)',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
                  <div>No tienes servicios asignados</div>
                  <div style={{ fontSize: '12px', marginTop: '8px' }}>
                    Contacta al administrador para asignar servicios
                  </div>
                </div>
              ) : (
                services.map(service => (
                  <div key={service.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    backgroundColor: '#0a0a0a',
                    borderRadius: '12px',
                    marginBottom: '10px',
                    border: '1px solid #1a1a1a',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: service.is_active ? '#22c55e' : '#ef4444',
                      }} />
                      <span style={{ color: '#ffffff', fontSize: '14px' }}>{service.service_name}</span>
                    </div>
                    {service.commission_override && (
                      <span style={{
                        backgroundColor: 'rgba(242, 187, 106, 0.2)',
                        color: '#F2BB6A',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '6px',
                      }}>
                        {service.commission_override}%
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}