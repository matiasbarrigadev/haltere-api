'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MemberBookingsPage() {
  const [filter, setFilter] = useState('all');

  const bookings = [
    { id: 1, service: 'Personal Training', date: '2026-02-08', time: '10:00 - 11:00', location: 'Vitacura', status: 'confirmed', professional: 'Carlos López', bonos: 15 },
    { id: 2, service: 'Clase de Yoga', date: '2026-02-09', time: '08:00 - 09:00', location: 'Las Condes', status: 'confirmed', professional: 'María García', bonos: 8 },
    { id: 3, service: 'Masaje Deportivo', date: '2026-02-12', time: '15:00 - 16:00', location: 'Vitacura', status: 'pending', professional: 'Ana Martínez', bonos: 20 },
    { id: 4, service: 'Personal Training', date: '2026-02-01', time: '10:00 - 11:00', location: 'Vitacura', status: 'completed', professional: 'Carlos López', bonos: 15 },
    { id: 5, service: 'Pilates', date: '2026-01-28', time: '09:00 - 10:00', location: 'Las Condes', status: 'completed', professional: 'María García', bonos: 10 },
    { id: 6, service: 'Nutrición', date: '2026-01-25', time: '11:00 - 11:30', location: 'Online', status: 'cancelled', professional: 'Dr. Rodríguez', bonos: 12 },
  ];

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      confirmed: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', label: 'Confirmada' },
      pending: { bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308', label: 'Pendiente' },
      completed: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', label: 'Completada' },
      cancelled: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: 'Cancelada' },
    };
    return styles[status] || styles.pending;
  };

  const isUpcoming = (dateStr: string) => new Date(dateStr) >= new Date();

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Mis Citas</h1>
          <p style={{ color: '#888888', fontSize: '15px' }}>Gestiona tus reservas y citas programadas</p>
        </div>
        <Link href="/member/schedule" style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #d4af37 0%, #b8963a 100%)',
          color: '#0a0a0a',
          borderRadius: '12px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>➕</span> Nueva Cita
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Todas' },
          { key: 'confirmed', label: 'Confirmadas' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'completed', label: 'Completadas' },
          { key: 'cancelled', label: 'Canceladas' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '10px 20px',
              backgroundColor: filter === f.key ? 'rgba(212, 175, 55, 0.15)' : '#111111',
              border: filter === f.key ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid #1a1a1a',
              borderRadius: '10px',
              color: filter === f.key ? '#d4af37' : '#888888',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredBookings.map((booking) => {
          const status = getStatusStyle(booking.status);
          const upcoming = isUpcoming(booking.date);
          
          return (
            <div key={booking.id} style={{
              backgroundColor: '#111111',
              borderRadius: '16px',
              border: upcoming ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid #1a1a1a',
              padding: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: upcoming ? 'rgba(212, 175, 55, 0.1)' : '#0a0a0a',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {booking.service.includes('Training') ? '💪' :
                   booking.service.includes('Yoga') ? '🧘' :
                   booking.service.includes('Masaje') ? '💆' :
                   booking.service.includes('Pilates') ? '🤸' :
                   booking.service.includes('Nutrición') ? '🥗' : '📅'}
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                    {booking.service}
                  </div>
                  <div style={{ color: '#888888', fontSize: '13px', marginBottom: '8px' }}>
                    con {booking.professional}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#666666', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📅 {new Date(booking.date).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <span style={{ color: '#666666', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🕐 {booking.time}
                    </span>
                    <span style={{ color: '#666666', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📍 {booking.location}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#d4af37', fontSize: '18px', fontWeight: 600 }}>{booking.bonos}</div>
                  <div style={{ color: '#666666', fontSize: '11px' }}>bonos</div>
                </div>
                <span style={{
                  backgroundColor: status.bg,
                  color: status.color,
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: '8px'
                }}>
                  {status.label}
                </span>
                {upcoming && booking.status !== 'cancelled' && (
                  <button style={{
                    padding: '10px 16px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '10px',
                    color: '#ef4444',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBookings.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#111111',
          borderRadius: '16px',
          border: '1px solid #1a1a1a'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
          <div style={{ color: '#888888', fontSize: '16px' }}>No tienes citas en esta categoría</div>
          <Link href="/member/schedule" style={{
            display: 'inline-block',
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#d4af37',
            color: '#0a0a0a',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600
          }}>
            Agendar una cita
          </Link>
        </div>
      )}
    </div>
  );
}