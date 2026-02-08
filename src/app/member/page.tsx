'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UserSession {
  id: string;
  email: string;
  full_name: string;
  role: string;
  member_status: string;
  bonus_balance: number;
}

export default function MemberDashboardPage() {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const session = sessionStorage.getItem('haltere_user_session');
    if (session) setUser(JSON.parse(session));
  }, []);

  // Demo data
  const upcomingBookings = [
    { id: 1, service: 'Personal Training', date: 'Hoy', time: '10:00 - 11:00', location: 'Vitacura', status: 'confirmed', professional: 'Carlos López' },
    { id: 2, service: 'Clase de Yoga', date: 'Mañana', time: '08:00 - 09:00', location: 'Las Condes', status: 'confirmed', professional: 'María García' },
  ];

  const recentActivity = [
    { type: 'booking', description: 'Reservaste Personal Training', date: 'Hace 2 días', icon: '📅' },
    { type: 'purchase', description: 'Compraste 50 bonos', date: 'Hace 5 días', icon: '💰' },
    { type: 'completed', description: 'Completaste sesión de Pilates', date: 'Hace 1 semana', icon: '✅' },
  ];

  const quickStats = [
    { label: 'Citas este mes', value: '8', icon: '📅', color: '#3b82f6' },
    { label: 'Bonos gastados', value: '45', icon: '💸', color: '#ef4444' },
    { label: 'Sesiones completadas', value: '24', icon: '✅', color: '#22c55e' },
    { label: 'Días como miembro', value: '156', icon: '⭐', color: '#eab308' },
  ];

  if (!user) return null;

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>
          ¡Hola, {user.full_name.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: '#888888', fontSize: '15px' }}>
          Bienvenido a tu panel personal. Aquí puedes gestionar tus citas y servicios.
        </p>
      </div>

      {/* Alert Banner for Today */}
      {upcomingBookings.some(b => b.date === 'Hoy') && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'rgba(212, 175, 55, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🔔
            </div>
            <div>
              <div style={{ color: '#d4af37', fontSize: '16px', fontWeight: 600 }}>Tienes una cita hoy</div>
              <div style={{ color: '#888888', fontSize: '14px' }}>Personal Training a las 10:00 en Vitacura</div>
            </div>
          </div>
          <Link href="/member/bookings" style={{
            padding: '10px 20px',
            backgroundColor: '#d4af37',
            color: '#0a0a0a',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600
          }}>
            Ver Detalles
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {quickStats.map((stat, i) => (
          <div key={i} style={{
            backgroundColor: '#111111',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #1a1a1a',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: `${stat.color}15`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px'
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>{stat.value}</div>
              <div style={{ color: '#888888', fontSize: '12px' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
      }}>
        {/* Upcoming Bookings */}
        <div style={{
          backgroundColor: '#111111',
          borderRadius: '20px',
          border: '1px solid #1a1a1a',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>📅</span>
              <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>Próximas Citas</span>
            </div>
            <Link href="/member/bookings" style={{ color: '#d4af37', fontSize: '13px', textDecoration: 'none' }}>
              Ver todas →
            </Link>
          </div>
          <div style={{ padding: '16px' }}>
            {upcomingBookings.map((booking) => (
              <div key={booking.id} style={{
                padding: '16px',
                backgroundColor: '#0a0a0a',
                borderRadius: '12px',
                marginBottom: '12px',
                border: '1px solid #1a1a1a'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ color: '#ffffff', fontSize: '15px', fontWeight: 500 }}>{booking.service}</div>
                    <div style={{ color: '#888888', fontSize: '13px', marginTop: '4px' }}>con {booking.professional}</div>
                  </div>
                  <span style={{
                    backgroundColor: booking.date === 'Hoy' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    color: booking.date === 'Hoy' ? '#d4af37' : '#22c55e',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    {booking.date}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>🕐</span>
                    <span style={{ color: '#888888', fontSize: '13px' }}>{booking.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>📍</span>
                    <span style={{ color: '#888888', fontSize: '13px' }}>{booking.location}</span>
                  </div>
                </div>
              </div>
            ))}
            <Link href="/member/schedule" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              border: '1px dashed rgba(212, 175, 55, 0.3)',
              borderRadius: '12px',
              color: '#d4af37',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500
            }}>
              <span>➕</span> Agendar Nueva Cita
            </Link>
          </div>
        </div>

        {/* Wallet & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Wallet Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1510 0%, #111111 100%)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ color: '#888888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  Balance Disponible
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ color: '#d4af37', fontSize: '40px', fontWeight: 700 }}>{user.bonus_balance}</span>
                  <span style={{ color: '#888888', fontSize: '16px' }}>bonos</span>
                </div>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #d4af37 0%, #b8963a 100%)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)'
              }}>
                💰
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link href="/member/bonos" style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#d4af37',
                color: '#0a0a0a',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                Comprar Bonos
              </Link>
              <Link href="/member/wallet" style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                textAlign: 'center',
                border: '1px solid #2a2a2a'
              }}>
                Ver Historial
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            backgroundColor: '#111111',
            borderRadius: '20px',
            border: '1px solid #1a1a1a',
            padding: '20px 24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '20px' }}>⏱️</span>
              <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>Actividad Reciente</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentActivity.map((activity, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px',
                  backgroundColor: '#0a0a0a',
                  borderRadius: '10px'
                }}>
                  <span style={{ fontSize: '18px' }}>{activity.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#ffffff', fontSize: '13px' }}>{activity.description}</div>
                    <div style={{ color: '#666666', fontSize: '11px', marginTop: '2px' }}>{activity.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Acciones Rápidas
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {[
            { icon: '📅', label: 'Agendar Cita', href: '/member/schedule', color: '#3b82f6' },
            { icon: '🎟️', label: 'Comprar Bonos', href: '/member/bonos', color: '#d4af37' },
            { icon: '📊', label: 'Ver Resultados', href: '/member/technogym', color: '#22c55e' },
            { icon: '💰', label: 'Mi Wallet', href: '/member/wallet', color: '#8b5cf6' },
          ].map((action, i) => (
            <Link key={i} href={action.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 20px',
              backgroundColor: '#111111',
              borderRadius: '14px',
              border: '1px solid #1a1a1a',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}>
              <span style={{
                width: '40px',
                height: '40px',
                backgroundColor: `${action.color}15`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                {action.icon}
              </span>
              <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}