'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
}

interface Service {
  id: string;
  name: string;
  slug: string;
  price_bonos: number;
  price_fiat: number;
  duration_minutes: number;
  requires_professional?: boolean;
}

interface ProfessionalService {
  id: string;
  professional_id: string;
  service_id: string;
  commission_override?: number;
  service: Service;
}

interface Professional {
  id: string;
  user_id: string;
  specialty: string[];
  bio?: string;
  commission_rate: number;
  is_available: boolean;
  user: User;
  services: ProfessionalService[];
  stats?: {
    total: number;
    pending: number;
    count: number;
  };
}

interface MemberUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [members, setMembers] = useState<MemberUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  
  // Form state
  const [formUserId, setFormUserId] = useState('');
  const [formSpecialty, setFormSpecialty] = useState<string[]>([]);
  const [formBio, setFormBio] = useState('');
  const [formCommissionRate, setFormCommissionRate] = useState(50);
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formServices, setFormServices] = useState<{ serviceId: string; commissionOverride?: number }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load professionals
      const profRes = await fetch(`${API_BASE}/api/admin/professionals?includeStats=true`);
      const profData = await profRes.json();
      setProfessionals(profData.professionals || []);
      setAllServices(profData.allServices || []);

      // Load members for assigning new professionals
      const membersRes = await fetch(`${API_BASE}/api/admin/members`);
      const membersData = await membersRes.json();
      setMembers(membersData.members || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProfessional(null);
    setFormUserId('');
    setFormSpecialty([]);
    setFormBio('');
    setFormCommissionRate(50);
    setFormIsAvailable(true);
    setFormServices([]);
    setShowModal(true);
  };

  const openEditModal = (prof: Professional) => {
    setEditingProfessional(prof);
    setFormUserId(prof.user_id);
    setFormSpecialty(prof.specialty || []);
    setFormBio(prof.bio || '');
    setFormCommissionRate(prof.commission_rate);
    setFormIsAvailable(prof.is_available);
    setFormServices(prof.services.map(s => ({
      serviceId: s.service_id,
      commissionOverride: s.commission_override
    })));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formUserId) return;
    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/professionals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formUserId,
          specialty: formSpecialty,
          bio: formBio,
          commissionRate: formCommissionRate,
          isAvailable: formIsAvailable,
          services: formServices
        })
      });

      if (res.ok) {
        setShowModal(false);
        loadData();
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este profesional?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/professionals?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadData();
        setSelectedProfessional(null);
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const toggleService = (serviceId: string) => {
    const exists = formServices.find(s => s.serviceId === serviceId);
    if (exists) {
      setFormServices(formServices.filter(s => s.serviceId !== serviceId));
    } else {
      setFormServices([...formServices, { serviceId }]);
    }
  };

  const updateServiceCommission = (serviceId: string, override?: number) => {
    setFormServices(formServices.map(s => 
      s.serviceId === serviceId ? { ...s, commissionOverride: override } : s
    ));
  };

  const specialties = ['Entrenamiento Personal', 'Yoga', 'Pilates', 'CrossFit', 'Fisioterapia', 'Nutrición', 'Box'];

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', margin: 0, marginBottom: '4px' }}>
            Profesionales
          </h1>
          <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>
            Gestión de profesionales y comisiones
          </p>
        </div>
        <button
          onClick={openAddModal}
          style={{
            backgroundColor: '#d4af37',
            color: '#0a0a0a',
            fontWeight: 600,
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '18px' }}>+</span>
          Agregar Profesional
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '16px', padding: '24px' }}>
          <div style={{ fontSize: '12px', color: '#666666', textTransform: 'uppercase', marginBottom: '8px' }}>Total Profesionales</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff' }}>{professionals.length}</div>
        </div>
        <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '16px', padding: '24px' }}>
          <div style={{ fontSize: '12px', color: '#666666', textTransform: 'uppercase', marginBottom: '8px' }}>Disponibles</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#22c55e' }}>
            {professionals.filter(p => p.is_available).length}
          </div>
        </div>
        <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '16px', padding: '24px' }}>
          <div style={{ fontSize: '12px', color: '#666666', textTransform: 'uppercase', marginBottom: '8px' }}>Comisiones Pendientes</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#d4af37' }}>
            {formatCurrency(professionals.reduce((acc, p) => acc + (p.stats?.pending || 0), 0))}
          </div>
        </div>
        <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '16px', padding: '24px' }}>
          <div style={{ fontSize: '12px', color: '#666666', textTransform: 'uppercase', marginBottom: '8px' }}>Total Sesiones</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff' }}>
            {professionals.reduce((acc, p) => acc + (p.stats?.count || 0), 0)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedProfessional ? '1fr 400px' : '1fr', gap: '24px' }}>
        {/* Professionals List */}
        <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #222222' }}>
                <th style={{ padding: '16px', textAlign: 'left', color: '#666666', fontSize: '12px', textTransform: 'uppercase' }}>Profesional</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#666666', fontSize: '12px', textTransform: 'uppercase' }}>Especialidad</th>
                <th style={{ padding: '16px', textAlign: 'center', color: '#666666', fontSize: '12px', textTransform: 'uppercase' }}>Comisión Base</th>
                <th style={{ padding: '16px', textAlign: 'center', color: '#666666', fontSize: '12px', textTransform: 'uppercase' }}>Servicios</th>
                <th style={{ padding: '16px', textAlign: 'center', color: '#666666', fontSize: '12px', textTransform: 'uppercase' }}>Estado</th>
                <th style={{ padding: '16px', textAlign: 'center', color: '#666666', fontSize: '12px', textTransform: 'uppercase' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {professionals.map((prof) => (
                <tr 
                  key={prof.id} 
                  style={{ 
                    borderBottom: '1px solid #1a1a1a', 
                    cursor: 'pointer',
                    backgroundColor: selectedProfessional?.id === prof.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent'
                  }}
                  onClick={() => setSelectedProfessional(prof)}
                >
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#d4af37',
                        fontWeight: 600
                      }}>
                        {prof.user?.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div style={{ color: '#ffffff', fontWeight: 500 }}>{prof.user?.full_name}</div>
                        <div style={{ color: '#666666', fontSize: '12px' }}>{prof.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {prof.specialty?.slice(0, 2).map((s, i) => (
                        <span key={i} style={{
                          backgroundColor: '#1a1a1a',
                          color: '#999999',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}>{s}</span>
                      ))}
                      {(prof.specialty?.length || 0) > 2 && (
                        <span style={{ color: '#666666', fontSize: '11px' }}>+{prof.specialty.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ color: '#d4af37', fontWeight: 600 }}>{prof.commission_rate}%</span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ color: '#ffffff' }}>{prof.services?.length || 0}</span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 500,
                      backgroundColor: prof.is_available ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: prof.is_available ? '#22c55e' : '#ef4444'
                    }}>
                      {prof.is_available ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(prof); }}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #333333',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        color: '#999999',
                        cursor: 'pointer',
                        marginRight: '8px',
                        fontSize: '12px'
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(prof.id); }}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {professionals.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#666666' }}>
                    No hay profesionales registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Details Panel */}
        {selectedProfessional && (
          <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600, margin: 0 }}>Detalle</h2>
              <button
                onClick={() => setSelectedProfessional(null)}
                style={{ background: 'none', border: 'none', color: '#666666', cursor: 'pointer', fontSize: '20px' }}
              >×</button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d4af37',
                  fontWeight: 700,
                  fontSize: '24px'
                }}>
                  {selectedProfessional.user?.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '18px' }}>{selectedProfessional.user?.full_name}</div>
                  <div style={{ color: '#666666', fontSize: '13px' }}>{selectedProfessional.user?.email}</div>
                </div>
              </div>
              {selectedProfessional.bio && (
                <p style={{ color: '#888888', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{selectedProfessional.bio}</p>
              )}
            </div>

            {/* Stats */}
            <div style={{ backgroundColor: '#0a0a0a', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: '#666666', textTransform: 'uppercase', marginBottom: '12px' }}>Estadísticas</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ color: '#888888', fontSize: '12px' }}>Total Comisiones</div>
                  <div style={{ color: '#d4af37', fontWeight: 600, fontSize: '18px' }}>{formatCurrency(selectedProfessional.stats?.total || 0)}</div>
                </div>
                <div>
                  <div style={{ color: '#888888', fontSize: '12px' }}>Pendiente</div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '18px' }}>{formatCurrency(selectedProfessional.stats?.pending || 0)}</div>
                </div>
                <div>
                  <div style={{ color: '#888888', fontSize: '12px' }}>Sesiones</div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '18px' }}>{selectedProfessional.stats?.count || 0}</div>
                </div>
                <div>
                  <div style={{ color: '#888888', fontSize: '12px' }}>Comisión Base</div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '18px' }}>{selectedProfessional.commission_rate}%</div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <div style={{ fontSize: '12px', color: '#666666', textTransform: 'uppercase', marginBottom: '12px' }}>Servicios Asignados</div>
              {selectedProfessional.services?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedProfessional.services.map((ps) => (
                    <div key={ps.id} style={{
                      backgroundColor: '#0a0a0a',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ color: '#ffffff', fontSize: '13px' }}>{ps.service?.name}</div>
                        <div style={{ color: '#666666', fontSize: '11px' }}>{ps.service?.price_bonos} bonos</div>
                      </div>
                      <div style={{ color: '#d4af37', fontWeight: 600, fontSize: '13px' }}>
                        {ps.commission_override ?? selectedProfessional.commission_rate}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666666', fontSize: '13px' }}>Sin servicios asignados</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#111111',
            borderRadius: '16px',
            padding: '32px',
            width: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
              {editingProfessional ? 'Editar Profesional' : 'Agregar Profesional'}
            </h2>

            {/* User Select */}
            {!editingProfessional && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Usuario *</label>
                <select
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #333333',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Seleccionar usuario...</option>
                  {members
                    .filter(m => !professionals.find(p => p.user_id === m.id))
                    .map(m => (
                      <option key={m.id} value={m.id}>{m.full_name} ({m.email})</option>
                    ))
                  }
                </select>
              </div>
            )}

            {/* Commission Rate */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>
                Comisión Base: {formCommissionRate}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formCommissionRate}
                onChange={(e) => setFormCommissionRate(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Specialty */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Especialidades</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {specialties.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => {
                      if (formSpecialty.includes(spec)) {
                        setFormSpecialty(formSpecialty.filter(s => s !== spec));
                      } else {
                        setFormSpecialty([...formSpecialty, spec]);
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '20px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      backgroundColor: formSpecialty.includes(spec) ? '#d4af37' : '#222222',
                      color: formSpecialty.includes(spec) ? '#0a0a0a' : '#888888'
                    }}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Bio</label>
              <textarea
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333333',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Available */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formIsAvailable}
                  onChange={(e) => setFormIsAvailable(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ color: '#ffffff', fontSize: '14px' }}>Disponible para reservas</span>
              </label>
            </div>

            {/* Services */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Servicios y Comisiones</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflow: 'auto' }}>
                {allServices.filter(s => s.requires_professional).map((service) => {
                  const isSelected = formServices.find(fs => fs.serviceId === service.id);
                  return (
                    <div key={service.id} style={{
                      backgroundColor: '#0a0a0a',
                      borderRadius: '8px',
                      padding: '12px',
                      border: isSelected ? '1px solid #d4af37' : '1px solid #222222'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}>
                          <input
                            type="checkbox"
                            checked={!!isSelected}
                            onChange={() => toggleService(service.id)}
                          />
                          <div>
                            <div style={{ color: '#ffffff', fontSize: '13px' }}>{service.name}</div>
                            <div style={{ color: '#666666', fontSize: '11px' }}>{service.price_bonos} bonos • {service.duration_minutes}min</div>
                          </div>
                        </label>
                        {isSelected && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={isSelected.commissionOverride ?? ''}
                              placeholder={formCommissionRate.toString()}
                              onChange={(e) => updateServiceCommission(service.id, e.target.value ? Number(e.target.value) : undefined)}
                              style={{
                                width: '60px',
                                padding: '4px 8px',
                                backgroundColor: '#111111',
                                border: '1px solid #333333',
                                borderRadius: '4px',
                                color: '#d4af37',
                                fontSize: '12px',
                                textAlign: 'center'
                              }}
                            />
                            <span style={{ color: '#666666', fontSize: '12px' }}>%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  border: '1px solid #333333',
                  borderRadius: '8px',
                  color: '#999999',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || (!editingProfessional && !formUserId)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#d4af37',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0a0a0a',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px',
                  opacity: saving || (!editingProfessional && !formUserId) ? 0.5 : 1
                }}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
