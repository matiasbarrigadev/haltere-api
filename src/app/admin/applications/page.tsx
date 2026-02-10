'use client';

import { useEffect, useState, useCallback } from 'react';

interface ApplicationNotes {
  occupation?: string;
  linkedin_url?: string;
  referral_source?: string;
  referral_name?: string;
  fitness_goals?: string;
  preferred_location?: string;
  schedule_preference?: string;
  additional_notes?: string;
  raw?: string;
}

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  member_status: 'pending_approval' | 'interview' | 'active' | 'rejected';
  application_notes: ApplicationNotes | null;
  application_date: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

type FilterStatus = 'all' | 'pending_approval' | 'interview' | 'active' | 'rejected';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/admin/applications');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar solicitudes');
      }
      
      setApplications(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.member_status === filter;
  });

  const getStatusBadge = (status: string) => {
    const baseStyle: React.CSSProperties = {
      padding: '6px 12px',
      fontSize: '12px',
      borderRadius: '8px',
      fontWeight: 500,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    };
    
    switch (status) {
      case 'pending_approval':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>● Pendiente</span>;
      case 'interview':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>● Entrevista</span>;
      case 'active':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>● Aprobada</span>;
      case 'rejected':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>● Rechazada</span>;
      default:
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}>● {status}</span>;
    }
  };

  const handleStatusChange = async (appId: string, newStatus: Application['member_status']) => {
    try {
      setUpdating(appId);
      const response = await fetch('/api/admin/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, member_status: newStatus })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar');
      }

      // Actualizar estado local
      setApplications(applications.map(app => 
        app.id === appId 
          ? { ...app, member_status: newStatus, approved_at: newStatus === 'active' || newStatus === 'rejected' ? new Date().toISOString() : app.approved_at }
          : app
      ));
      setSelectedApp(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setUpdating(null);
    }
  };

  const getLocationLabel = (location: string | undefined) => {
    const locations: Record<string, string> = {
      'lo_barnechea': 'Lo Barnechea',
      'las_condes': 'Las Condes',
      'vitacura': 'Vitacura'
    };
    return location ? locations[location] || location : 'No especificado';
  };

  const getScheduleLabel = (schedule: string | undefined) => {
    const schedules: Record<string, string> = {
      'early_morning': 'Mañana temprano (6-9 AM)',
      'morning': 'Mañana (9-12 PM)',
      'afternoon': 'Tarde (12-6 PM)',
      'evening': 'Noche (6-10 PM)',
      'flexible': 'Flexible'
    };
    return schedule ? schedules[schedule] || schedule : 'No especificado';
  };

  const getReferralLabel = (source: string | undefined) => {
    const sources: Record<string, string> = {
      'member_referral': 'Referido por miembro',
      'google': 'Google',
      'instagram': 'Instagram',
      'linkedin': 'LinkedIn',
      'other': 'Otro'
    };
    return source ? sources[source] || source : 'No especificado';
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(212, 175, 55, 0.2)',
          borderTop: '4px solid #d4af37',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#ef4444', margin: 0, marginBottom: '16px' }}>Error: {error}</p>
          <button
            onClick={fetchApplications}
            style={{
              backgroundColor: '#d4af37',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              color: '#0a0a0a',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const pendingCount = applications.filter(a => a.member_status === 'pending_approval').length;
  const interviewCount = applications.filter(a => a.member_status === 'interview').length;
  const approvedCount = applications.filter(a => a.member_status === 'active').length;

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', margin: 0, marginBottom: '4px' }}>
            Solicitudes
          </h1>
          <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>
            Gestiona las solicitudes de nuevos miembros
          </p>
        </div>
        <button
          onClick={fetchApplications}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #333333',
            borderRadius: '8px',
            padding: '10px 20px',
            color: '#999999',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total', value: applications.length, icon: '📋', color: '#ffffff' },
          { label: 'Pendientes', value: pendingCount, icon: '⏳', color: '#eab308' },
          { label: 'En Entrevista', value: interviewCount, icon: '🎤', color: '#8b5cf6' },
          { label: 'Aprobadas', value: approvedCount, icon: '✓', color: '#22c55e' },
        ].map((stat, i) => (
          <div key={i} style={{
            backgroundColor: '#111111',
            border: '1px solid #222222',
            borderRadius: '16px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</span>
              <span style={{ fontSize: '18px' }}>{stat.icon}</span>
            </div>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', overflow: 'hidden' }}>
          {([
            { key: 'all', label: 'Todas' },
            { key: 'pending_approval', label: 'Pendientes' },
            { key: 'interview', label: 'Entrevista' },
            { key: 'active', label: 'Aprobadas' },
            { key: 'rejected', label: 'Rechazadas' }
          ] as const).map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: filter === item.key ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: filter === item.key ? '#d4af37' : '#666666'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredApplications.length > 0 ? (
          filteredApplications.map((app) => (
            <div
              key={app.id}
              style={{
                backgroundColor: '#111111',
                border: selectedApp?.id === app.id ? '1px solid #d4af37' : '1px solid #222222',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'border-color 0.2s'
              }}
            >
              {/* Application Header */}
              <div
                onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                style={{
                  padding: '20px 24px',
                  cursor: 'pointer',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                  alignItems: 'center',
                  gap: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d4af37',
                    fontWeight: 600,
                    fontSize: '16px'
                  }}>
                    {app.full_name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ margin: 0, color: '#ffffff', fontWeight: 500 }}>{app.full_name}</p>
                    <p style={{ margin: 0, color: '#666666', fontSize: '13px' }}>{app.application_notes?.occupation || 'Sin ocupación'}</p>
                  </div>
                </div>

                <div>
                  <p style={{ margin: 0, color: '#999999', fontSize: '13px' }}>Contacto</p>
                  <p style={{ margin: 0, color: '#ffffff', fontWeight: 500, fontSize: '14px' }}>{app.email}</p>
                </div>

                <div>
                  <p style={{ margin: 0, color: '#999999', fontSize: '13px' }}>Fecha</p>
                  <p style={{ margin: 0, color: '#ffffff', fontWeight: 500 }}>
                    {new Date(app.application_date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div>
                  {getStatusBadge(app.member_status)}
                </div>

                <div style={{ color: '#666666', fontSize: '20px' }}>
                  {selectedApp?.id === app.id ? '▲' : '▼'}
                </div>
              </div>

              {/* Expanded Content */}
              {selectedApp?.id === app.id && (
                <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid #222222' }}>
                  <div style={{ paddingTop: '20px' }}>
                    {/* Info Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Teléfono</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#ffffff' }}>{app.phone || 'No especificado'}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Cómo nos conoció</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#ffffff' }}>{getReferralLabel(app.application_notes?.referral_source)}</p>
                      </div>
                      {app.application_notes?.referral_name && (
                        <div>
                          <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Referido por</p>
                          <p style={{ margin: 0, fontSize: '14px', color: '#ffffff' }}>{app.application_notes.referral_name}</p>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Ubicación Preferida</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#ffffff' }}>{getLocationLabel(app.application_notes?.preferred_location)}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Horario Preferido</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#ffffff' }}>{getScheduleLabel(app.application_notes?.schedule_preference)}</p>
                      </div>
                      {app.application_notes?.linkedin_url && (
                        <div>
                          <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '8px' }}>LinkedIn</p>
                          <a 
                            href={app.application_notes.linkedin_url.startsWith('http') ? app.application_notes.linkedin_url : `https://${app.application_notes.linkedin_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#d4af37', fontSize: '14px', textDecoration: 'none' }}
                          >
                            Ver perfil →
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Objetivos */}
                    {app.application_notes?.fitness_goals && (
                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Objetivos de Fitness</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#999999', lineHeight: '1.6' }}>{app.application_notes.fitness_goals}</p>
                      </div>
                    )}

                    {/* Notas adicionales */}
                    {app.application_notes?.additional_notes && (
                      <div style={{ marginBottom: '24px' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Notas Adicionales</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#999999', lineHeight: '1.6' }}>{app.application_notes.additional_notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {app.member_status === 'pending_approval' && (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => handleStatusChange(app.id, 'interview')}
                          disabled={updating === app.id}
                          style={{
                            flex: 1,
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '8px',
                            padding: '12px 20px',
                            color: '#8b5cf6',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: updating === app.id ? 'not-allowed' : 'pointer',
                            opacity: updating === app.id ? 0.5 : 1
                          }}
                        >
                          🎤 Agendar Entrevista
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'active')}
                          disabled={updating === app.id}
                          style={{
                            flex: 1,
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '8px',
                            padding: '12px 20px',
                            color: '#22c55e',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: updating === app.id ? 'not-allowed' : 'pointer',
                            opacity: updating === app.id ? 0.5 : 1
                          }}
                        >
                          ✓ Aprobar
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                          disabled={updating === app.id}
                          style={{
                            flex: 1,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            padding: '12px 20px',
                            color: '#ef4444',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: updating === app.id ? 'not-allowed' : 'pointer',
                            opacity: updating === app.id ? 0.5 : 1
                          }}
                        >
                          ✕ Rechazar
                        </button>
                      </div>
                    )}

                    {app.member_status === 'interview' && (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => handleStatusChange(app.id, 'active')}
                          disabled={updating === app.id}
                          style={{
                            flex: 1,
                            backgroundColor: '#d4af37',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 20px',
                            color: '#0a0a0a',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: updating === app.id ? 'not-allowed' : 'pointer',
                            opacity: updating === app.id ? 0.5 : 1
                          }}
                        >
                          ✓ Aprobar Membresía
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                          disabled={updating === app.id}
                          style={{
                            flex: 1,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            padding: '12px 20px',
                            color: '#ef4444',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: updating === app.id ? 'not-allowed' : 'pointer',
                            opacity: updating === app.id ? 0.5 : 1
                          }}
                        >
                          ✕ Rechazar
                        </button>
                      </div>
                    )}

                    {(app.member_status === 'active' || app.member_status === 'rejected') && app.approved_at && (
                      <div style={{
                        backgroundColor: '#0a0a0a',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ color: '#666666', fontSize: '13px' }}>
                          {app.member_status === 'active' ? '✓' : '✕'} Revisado el {new Date(app.approved_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{
            backgroundColor: '#111111',
            border: '1px solid #222222',
            borderRadius: '16px',
            padding: '64px 32px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ fontSize: '20px', color: '#ffffff', margin: 0, marginBottom: '8px' }}>No hay solicitudes</h3>
            <p style={{ color: '#666666', margin: 0 }}>No se encontraron solicitudes con este filtro</p>
          </div>
        )}
      </div>
    </div>
  );
}