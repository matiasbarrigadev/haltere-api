'use client';

import { useEffect, useState } from 'react';

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  occupation: string;
  motivation: string;
  referral_source: string;
  status: 'pending' | 'approved' | 'rejected' | 'interview';
  created_at: string;
  reviewed_at?: string;
}

// Mock data para demostración
const mockApplications: Application[] = [
  { id: '1', full_name: 'Alejandro Torres', email: 'atorres@email.com', phone: '+56 9 8765 4321', occupation: 'CEO Startup Tech', motivation: 'Busco un espacio exclusivo para mantener mi rutina de ejercicios con equipamiento de primera calidad.', referral_source: 'Recomendación', status: 'pending', created_at: '2026-02-07T10:00:00' },
  { id: '2', full_name: 'Isabella Vega', email: 'ivega@empresa.cl', phone: '+56 9 1234 5678', occupation: 'Directora de Marketing', motivation: 'Me interesa el concepto de club privado y las 6 dimensiones del bienestar.', referral_source: 'Instagram', status: 'interview', created_at: '2026-02-06T14:00:00' },
  { id: '3', full_name: 'Sebastián Muñoz', email: 'smunoz@corp.com', phone: '+56 9 8888 7777', occupation: 'Inversionista', motivation: 'Quiero un lugar tranquilo sin las aglomeraciones de un gimnasio tradicional.', referral_source: 'LinkedIn', status: 'pending', created_at: '2026-02-05T09:00:00' },
  { id: '4', full_name: 'Valentina Rojas', email: 'vrojas@mail.com', phone: '+56 9 5555 4444', occupation: 'Médica Cardióloga', motivation: 'Priorizo mi salud y busco un ambiente profesional para entrenar.', referral_source: 'Google', status: 'approved', created_at: '2026-02-04T11:00:00', reviewed_at: '2026-02-05T15:00:00' },
  { id: '5', full_name: 'Matías Herrera', email: 'mherrera@test.com', phone: '+56 9 3333 2222', occupation: 'Abogado Corporativo', motivation: 'Necesito flexibilidad de horarios y privacidad.', referral_source: 'Amigo miembro', status: 'rejected', created_at: '2026-02-03T16:00:00', reviewed_at: '2026-02-04T10:00:00' },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'interview' | 'approved' | 'rejected'>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setApplications(mockApplications);
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.status === filter;
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
      case 'pending':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>● Pendiente</span>;
      case 'interview':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>● Entrevista</span>;
      case 'approved':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>● Aprobada</span>;
      case 'rejected':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>● Rechazada</span>;
      default:
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}>● {status}</span>;
    }
  };

  const handleStatusChange = (appId: string, newStatus: Application['status']) => {
    setApplications(applications.map(app => 
      app.id === appId 
        ? { ...app, status: newStatus, reviewed_at: new Date().toISOString() }
        : app
    ));
    setSelectedApp(null);
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

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const interviewCount = applications.filter(a => a.status === 'interview').length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;

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
        <button style={{
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
        }}>
          📊 Exportar Lista
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
          {(['all', 'pending', 'interview', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: filter === status ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: filter === status ? '#d4af37' : '#666666'
              }}
            >
              {status === 'all' ? 'Todas' : status === 'pending' ? 'Pendientes' : status === 'interview' ? 'Entrevista' : status === 'approved' ? 'Aprobadas' : 'Rechazadas'}
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
                    <p style={{ margin: 0, color: '#666666', fontSize: '13px' }}>{app.occupation}</p>
                  </div>
                </div>

                <div>
                  <p style={{ margin: 0, color: '#999999', fontSize: '13px' }}>Contacto</p>
                  <p style={{ margin: 0, color: '#ffffff', fontWeight: 500, fontSize: '14px' }}>{app.email}</p>
                </div>

                <div>
                  <p style={{ margin: 0, color: '#999999', fontSize: '13px' }}>Fecha</p>
                  <p style={{ margin: 0, color: '#ffffff', fontWeight: 500 }}>
                    {new Date(app.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                  </p>
                </div>

                <div>
                  {getStatusBadge(app.status)}
                </div>

                <div style={{ color: '#666666', fontSize: '20px' }}>
                  {selectedApp?.id === app.id ? '▲' : '▼'}
                </div>
              </div>

              {/* Expanded Content */}
              {selectedApp?.id === app.id && (
                <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid #222222' }}>
                  <div style={{ paddingTop: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Teléfono</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#ffffff' }}>{app.phone}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Cómo nos conoció</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#ffffff' }}>{app.referral_source}</p>
                      </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Motivación</p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#999999', lineHeight: '1.6' }}>{app.motivation}</p>
                    </div>

                    {/* Actions */}
                    {app.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => handleStatusChange(app.id, 'interview')}
                          style={{
                            flex: 1,
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '8px',
                            padding: '12px 20px',
                            color: '#8b5cf6',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          🎤 Agendar Entrevista
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'approved')}
                          style={{
                            flex: 1,
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '8px',
                            padding: '12px 20px',
                            color: '#22c55e',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          ✓ Aprobar
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                          style={{
                            flex: 1,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            padding: '12px 20px',
                            color: '#ef4444',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          ✕ Rechazar
                        </button>
                      </div>
                    )}

                    {app.status === 'interview' && (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => handleStatusChange(app.id, 'approved')}
                          style={{
                            flex: 1,
                            backgroundColor: '#d4af37',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 20px',
                            color: '#0a0a0a',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          ✓ Aprobar Membresía
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                          style={{
                            flex: 1,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            padding: '12px 20px',
                            color: '#ef4444',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          ✕ Rechazar
                        </button>
                      </div>
                    )}

                    {(app.status === 'approved' || app.status === 'rejected') && app.reviewed_at && (
                      <div style={{
                        backgroundColor: '#0a0a0a',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ color: '#666666', fontSize: '13px' }}>
                          {app.status === 'approved' ? '✓' : '✕'} Revisado el {new Date(app.reviewed_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
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