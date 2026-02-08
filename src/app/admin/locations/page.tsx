'use client';

import { useEffect, useState } from 'react';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  status: 'active' | 'maintenance' | 'closed';
  capacity: number;
  current_members: number;
  amenities: string[];
  hours: string;
  contact_phone: string;
  image_url?: string;
}

// Mock data para demostración
const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Haltere Las Condes',
    address: 'Av. Apoquindo 4500, Piso 12',
    city: 'Las Condes',
    status: 'active',
    capacity: 15,
    current_members: 12,
    amenities: ['Gym Premium', 'Spa', 'Sauna', 'Pilates Studio'],
    hours: '06:00 - 22:00',
    contact_phone: '+56 2 2345 6789'
  },
  {
    id: '2',
    name: 'Haltere Vitacura',
    address: 'Av. Vitacura 2939, Local 101',
    city: 'Vitacura',
    status: 'active',
    capacity: 13,
    current_members: 10,
    amenities: ['Gym Premium', 'Yoga Studio', 'Café'],
    hours: '06:00 - 22:00',
    contact_phone: '+56 2 2345 6790'
  },
  {
    id: '3',
    name: 'Haltere Providencia',
    address: 'Av. Providencia 1208, Piso 5',
    city: 'Providencia',
    status: 'maintenance',
    capacity: 10,
    current_members: 0,
    amenities: ['Gym', 'Pilates'],
    hours: 'Temporalmente cerrado',
    contact_phone: '+56 2 2345 6791'
  }
];

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setLocations(mockLocations);
      setIsLoading(false);
    }, 500);
  }, []);

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
      case 'active':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>● Activa</span>;
      case 'maintenance':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>● Mantenimiento</span>;
      case 'closed':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>● Cerrada</span>;
      default:
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}>● {status}</span>;
    }
  };

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 70) return '#eab308';
    return '#22c55e';
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

  const totalCapacity = locations.reduce((acc, loc) => acc + loc.capacity, 0);
  const totalMembers = locations.reduce((acc, loc) => acc + loc.current_members, 0);
  const activeLocations = locations.filter(l => l.status === 'active').length;

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
        <button style={{
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
        }}>
          <span style={{ fontSize: '16px' }}>+</span>
          Nueva Sede
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Sedes', value: locations.length, icon: '🏢', color: '#ffffff' },
          { label: 'Activas', value: activeLocations, icon: '✓', color: '#22c55e' },
          { label: 'Capacidad Total', value: totalCapacity, icon: '👥', color: '#d4af37' },
          { label: 'Ocupación Actual', value: `${Math.round((totalMembers / totalCapacity) * 100)}%`, icon: '📊', color: '#3b82f6' },
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
              transition: 'border-color 0.2s'
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
                {getStatusBadge(location.status)}
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#666666' }}>
                📍 {location.address}
              </p>
            </div>

            {/* Location Body */}
            <div style={{ padding: '24px' }}>
              {/* Capacity Bar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#999999' }}>Capacidad</span>
                  <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 500 }}>
                    {location.current_members} / {location.capacity} miembros
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#1a1a1a', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(location.current_members / location.capacity) * 100}%`,
                    backgroundColor: getCapacityColor(location.current_members, location.capacity),
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '4px' }}>Horario</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#ffffff' }}>{location.hours}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '4px' }}>Teléfono</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#ffffff' }}>{location.contact_phone}</p>
                </div>
              </div>

              {/* Amenities */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Amenidades</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {location.amenities.map((amenity, i) => (
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
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: '1px solid #333333',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  color: '#999999',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  Ver Detalles
                </button>
                <button style={{
                  flex: 1,
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  color: '#d4af37',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  Editar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Map Placeholder */}
      <div style={{
        marginTop: '32px',
        backgroundColor: '#111111',
        border: '1px solid #222222',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: 0, marginBottom: '20px' }}>
          Mapa de Ubicaciones
        </h2>
        <div style={{
          height: '300px',
          backgroundColor: '#0a0a0a',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #333333'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
            <p style={{ color: '#666666', margin: 0 }}>Mapa interactivo próximamente</p>
          </div>
        </div>
      </div>
    </div>
  );
}