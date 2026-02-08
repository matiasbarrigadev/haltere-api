'use client';

import { useEffect, useState } from 'react';

interface Booking {
  id: string;
  member_name: string;
  service_name: string;
  location_name: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  created_at: string;
}

// Mock data para demostración
const mockBookings: Booking[] = [
  { id: '1', member_name: 'Carlos Méndez', service_name: 'Entrenamiento Personal', location_name: 'Haltere Las Condes', date: '2026-02-08', time: '09:00', status: 'confirmed', created_at: '2026-02-07T10:00:00' },
  { id: '2', member_name: 'María López', service_name: 'Yoga Privado', location_name: 'Haltere Vitacura', date: '2026-02-08', time: '10:30', status: 'confirmed', created_at: '2026-02-07T11:00:00' },
  { id: '3', member_name: 'Roberto Silva', service_name: 'Fisioterapia', location_name: 'Haltere Las Condes', date: '2026-02-08', time: '11:00', status: 'pending', created_at: '2026-02-07T14:00:00' },
  { id: '4', member_name: 'Ana Martínez', service_name: 'Nutrición', location_name: 'Haltere Vitacura', date: '2026-02-08', time: '14:00', status: 'confirmed', created_at: '2026-02-07T09:00:00' },
  { id: '5', member_name: 'Pedro González', service_name: 'Entrenamiento Personal', location_name: 'Haltere Las Condes', date: '2026-02-08', time: '16:00', status: 'cancelled', created_at: '2026-02-06T15:00:00' },
  { id: '6', member_name: 'Laura Fernández', service_name: 'Pilates', location_name: 'Haltere Vitacura', date: '2026-02-08', time: '17:30', status: 'completed', created_at: '2026-02-06T12:00:00' },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [dateFilter, setDateFilter] = useState('today');

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setBookings(mockBookings);
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
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
      case 'confirmed':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>● Confirmada</span>;
      case 'pending':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>● Pendiente</span>;
      case 'cancelled':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>● Cancelada</span>;
      case 'completed':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>● Completada</span>;
      default:
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}>● {status}</span>;
    }
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

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', margin: 0, marginBottom: '4px' }}>
            Reservas
          </h1>
          <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>
            Gestiona las reservas del club
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              backgroundColor: '#111111',
              border: '1px solid #222222',
              borderRadius: '8px',
              padding: '10px 16px',
              color: '#999999',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
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
            Nueva Reserva
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Hoy', value: filteredBookings.length, icon: '📅', color: '#ffffff' },
          { label: 'Confirmadas', value: bookings.filter(b => b.status === 'confirmed').length, icon: '✓', color: '#22c55e' },
          { label: 'Pendientes', value: bookings.filter(b => b.status === 'pending').length, icon: '⏳', color: '#eab308' },
          { label: 'Canceladas', value: bookings.filter(b => b.status === 'cancelled').length, icon: '✕', color: '#ef4444' },
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
          {(['all', 'confirmed', 'pending', 'cancelled'] as const).map((status) => (
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
              {status === 'all' ? 'Todas' : status === 'confirmed' ? 'Confirmadas' : status === 'pending' ? 'Pendientes' : 'Canceladas'}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              style={{
                backgroundColor: '#111111',
                border: '1px solid #222222',
                borderRadius: '16px',
                padding: '20px 24px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                alignItems: 'center',
                gap: '20px'
              }}
            >
              {/* Member Info */}
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
                  {booking.member_name.charAt(0)}
                </div>
                <div>
                  <p style={{ margin: 0, color: '#ffffff', fontWeight: 500 }}>{booking.member_name}</p>
                  <p style={{ margin: 0, color: '#666666', fontSize: '13px' }}>{booking.service_name}</p>
                </div>
              </div>

              {/* Location */}
              <div>
                <p style={{ margin: 0, color: '#999999', fontSize: '13px' }}>Sede</p>
                <p style={{ margin: 0, color: '#ffffff', fontWeight: 500 }}>{booking.location_name}</p>
              </div>

              {/* Time */}
              <div>
                <p style={{ margin: 0, color: '#999999', fontSize: '13px' }}>Horario</p>
                <p style={{ margin: 0, color: '#ffffff', fontWeight: 500 }}>
                  {new Date(booking.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} · {booking.time}
                </p>
              </div>

              {/* Status */}
              <div>
                {getStatusBadge(booking.status)}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #333333',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#999999',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}>
                  Ver
                </button>
                <button style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #333333',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#999999',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}>
                  ⋮
                </button>
              </div>
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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
            <h3 style={{ fontSize: '20px', color: '#ffffff', margin: 0, marginBottom: '8px' }}>No hay reservas</h3>
            <p style={{ color: '#666666', margin: 0 }}>No se encontraron reservas con este filtro</p>
          </div>
        )}
      </div>

      {/* Calendar Preview */}
      <div style={{ marginTop: '32px', backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: 0, marginBottom: '20px' }}>
          Vista Rápida - Próximas Horas
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
          {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00'].map((hour, i) => {
            const hasBooking = bookings.some(b => b.time.startsWith(hour.split(':')[0]));
            return (
              <div
                key={hour}
                style={{
                  backgroundColor: hasBooking ? 'rgba(212, 175, 55, 0.1)' : '#0a0a0a',
                  border: hasBooking ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid #222222',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}
              >
                <p style={{ margin: 0, color: '#666666', fontSize: '12px', marginBottom: '4px' }}>Hora</p>
                <p style={{ margin: 0, color: hasBooking ? '#d4af37' : '#ffffff', fontWeight: 600 }}>{hour}</p>
                {hasBooking && <p style={{ margin: 0, color: '#d4af37', fontSize: '11px', marginTop: '4px' }}>● Ocupado</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}