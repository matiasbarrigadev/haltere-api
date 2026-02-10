'use client';

import { useEffect, useState } from 'react';

interface Zone {
  id: string;
  name: string;
  zone_type: 'private' | 'shared';
  capacity: number;
  is_active: boolean;
}

interface Location {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  country: string;
  phone: string | null;
  email: string | null;
  is_24_hours: boolean;
  opening_time: string | null;
  closing_time: string | null;
  amenities: string[];
  is_active: boolean;
  zones: Zone[];
  created_at: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    is_24_hours: true,
    opening_time: '06:00',
    closing_time: '22:00',
    amenities: [] as string[]
  });

  const amenityOptions = ['Gym Premium', 'Spa', 'Sauna', 'Pilates Studio', 'Yoga Studio', 'Café', 'Estacionamiento', 'Duchas', 'Lockers'];

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/locations?include_inactive=true');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLocations(data.data || []);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar sedes');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingLocation(null);
    setForm({
      name: '',
      description: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      is_24_hours: true,
      opening_time: '06:00',
      closing_time: '22:00',
      amenities: []
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (location: Location) => {
    setEditingLocation(location);
    setForm({
      name: location.name,
      description: location.description || '',
      address: location.address,
      city: location.city,
      phone: location.phone || '',
      email: location.email || '',
      is_24_hours: location.is_24_hours,
      opening_time: location.opening_time || '06:00',
      closing_time: location.closing_time || '22:00',
      amenities: location.amenities || []
    });
    setError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.address || !form.city) {
      setError('Nombre, dirección y ciudad son requeridos');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const method = editingLocation ? 'PUT' : 'POST';
      const body = editingLocation
        ? { id: editingLocation.id, ...form }
        : form;

      const res = await fetch('/api/admin/locations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowModal(false);
      fetchLocations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desactivar esta sede?')) return;

    try {
      const res = await fetch(`/api/admin/locations?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchLocations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleReactivate = async (location: Location) => {
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: location.id, is_active: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchLocations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al reactivar');
    }
  };

  const toggleAmenity = (amenity: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const getStatusBadge = (isActive: boolean) => {
    const baseStyle: React.CSSProperties = {
      padding: '6px 12px',
      fontSize: '12px',
      borderRadius: '8px',
      fontWeight: 500,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    };
    
    if (isActive) {
      return <span style={{ ...baseStyle, backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>● Activa</span>;
    }
    return <span style={{ ...baseStyle, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>● Inactiva</span>;
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

  const activeLocations = locations.filter(l => l.is_active);
  const totalZones = locations.reduce((acc, l) => acc + (l.zones?.length || 0), 0);

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', margin: 0, marginBottom: '4px' }}>
            Sedes
          </h1>
          <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>
            Gestiona las ubicaciones del club
          </p>
        </div>
        <button
          onClick={openAddModal}
          style={{
            backgroundColor: '#d4af37',
            color: '#0a0a0a',
            fontWeight: 600,
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '16px' }}>+</span>
          Nueva Sede
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Sedes', value: locations.length, icon: '🏢', color: '#ffffff' },
          { label: 'Activas', value: activeLocations.length, icon: '✓', color: '#22c55e' },
          { label: 'Total Zonas', value: totalZones, icon: '📍', color: '#d4af37' },
          { label: 'Inactivas', value: locations.length - activeLocations.length, icon: '⏸', color: '#ef4444' },
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

      {/* Locations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
        {locations.map((location) => (
          <div
            key={location.id}
            style={{
              backgroundColor: '#111111',
              border: '1px solid #222222',
              borderRadius: '16px',
              overflow: 'hidden',
              opacity: location.is_active ? 1 : 0.6
            }}
          >
            {/* Location Header */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)',
              padding: '24px',
              borderBottom: '1px solid #222222'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#ffffff' }}>{location.name}</h3>
                  <p style={{ margin: 0, marginTop: '4px', fontSize: '14px', color: '#999999' }}>{location.city}</p>
                </div>
                {getStatusBadge(location.is_active)}
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#666666' }}>
                📍 {location.address}
              </p>
            </div>

            {/* Location Body */}
            <div style={{ padding: '24px' }}>
              {/* Zones count */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#999999' }}>Zonas</span>
                  <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 500 }}>
                    {location.zones?.length || 0} zonas configuradas
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '4px' }}>Horario</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#ffffff' }}>
                    {location.is_24_hours ? '24 horas' : `${location.opening_time} - ${location.closing_time}`}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '4px' }}>Teléfono</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#ffffff' }}>{location.phone || '-'}</p>
                </div>
              </div>

              {/* Amenities */}
              {location.amenities && location.amenities.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Amenidades</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {location.amenities.slice(0, 4).map((amenity, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#0a0a0a',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#999999'
                        }}
                      >
                        {amenity}
                      </span>
                    ))}
                    {location.amenities.length > 4 && (
                      <span style={{ padding: '6px 12px', fontSize: '12px', color: '#666666' }}>
                        +{location.amenities.length - 4} más
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => openEditModal(location)}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    color: '#d4af37',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Editar
                </button>
                {location.is_active ? (
                  <button
                    onClick={() => handleDelete(location.id)}
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      color: '#ef4444',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Desactivar
                  </button>
                ) : (
                  <button
                    onClick={() => handleReactivate(location)}
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      color: '#22c55e',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Reactivar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {locations.length === 0 && (
        <div style={{
          backgroundColor: '#111111',
          border: '1px solid #222222',
          borderRadius: '16px',
          padding: '64px 32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
          <h3 style={{ fontSize: '20px', color: '#ffffff', margin: 0, marginBottom: '8px' }}>No hay sedes</h3>
          <p style={{ color: '#666666', margin: 0 }}>Crea tu primera sede para comenzar</p>
        </div>
      )}

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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#111111',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
              {editingLocation ? 'Editar Sede' : 'Nueva Sede'}
            </h2>

            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {/* Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Haltere Las Condes"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333333',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Address */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Dirección *</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Av. Apoquindo 4500, Piso 12"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333333',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* City */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Ciudad *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Las Condes"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333333',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
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

            {/* Contact */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Teléfono</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+56 2 2345 6789"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #333333',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="lascondes@haltere.cl"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #333333',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Hours */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  checked={form.is_24_hours}
                  onChange={(e) => setForm({ ...form, is_24_hours: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ color: '#ffffff', fontSize: '14px' }}>Abierto 24 horas</span>
              </label>
              {!form.is_24_hours && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Apertura</label>
                    <input
                      type="time"
                      value={form.opening_time}
                      onChange={(e) => setForm({ ...form, opening_time: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#0a0a0a',
                        border: '1px solid #333333',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Cierre</label>
                    <input
                      type="time"
                      value={form.closing_time}
                      onChange={(e) => setForm({ ...form, closing_time: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#0a0a0a',
                        border: '1px solid #333333',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Amenidades</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {amenityOptions.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '20px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      backgroundColor: form.amenities.includes(amenity) ? '#d4af37' : '#222222',
                      color: form.amenities.includes(amenity) ? '#0a0a0a' : '#888888'
                    }}
                  >
                    {amenity}
                  </button>
                ))}
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
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#d4af37',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0a0a0a',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px',
                  opacity: saving ? 0.5 : 1
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