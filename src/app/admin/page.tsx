'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  totalMembers: number;
  pendingApplications: number;
  activeBookings: number;
  monthlyRevenue: number;
  membersGrowth: number;
  applicationsGrowth: number;
  bookingsGrowth: number;
  revenueGrowth: number;
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    pendingApplications: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    membersGrowth: 0,
    applicationsGrowth: 0,
    bookingsGrowth: 0,
    revenueGrowth: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setStats({
        totalMembers: 24,
        pendingApplications: 8,
        activeBookings: 15,
        monthlyRevenue: 48500,
        membersGrowth: 14,
        applicationsGrowth: -3,
        bookingsGrowth: 21,
        revenueGrowth: 18,
      });
      setIsLoading(false);
    };
    loadData();
  }, []);

  const chartData = [120, 180, 150, 220, 280, 350, 420, 480, 520, 580, 650, 720];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 700, 
            color: '#ffffff',
            margin: 0,
            marginBottom: '4px'
          }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>
            Resumen general del club
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select style={{
            backgroundColor: '#111111',
            border: '1px solid #333333',
            borderRadius: '8px',
            padding: '10px 16px',
            color: '#999999',
            fontSize: '14px',
            cursor: 'pointer',
            outline: 'none'
          }}>
            <option>Últimos 30 días</option>
            <option>Últimos 7 días</option>
            <option>Este mes</option>
            <option>Este año</option>
          </select>
          <button style={{
            backgroundColor: '#d4af37',
            color: '#0a0a0a',
            fontWeight: 600,
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer'
          }}>
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Total Members Card */}
        <div style={{
          backgroundColor: '#111111',
          border: '1px solid #222222',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total
            </span>
            <svg width="20" height="20" fill="none" stroke="#444444" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
            {stats.totalMembers}
          </div>
          <div style={{ fontSize: '13px', color: '#666666', marginBottom: '12px' }}>
            MIEMBROS ACTIVOS
          </div>
          <div style={{ fontSize: '13px', color: stats.membersGrowth >= 0 ? '#22c55e' : '#ef4444' }}>
            {stats.membersGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.membersGrowth)}%
            <span style={{ color: '#555555', marginLeft: '6px' }}>vs mes anterior</span>
          </div>
        </div>

        {/* Pending Applications Card */}
        <div style={{
          backgroundColor: '#111111',
          border: '1px solid #222222',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pendientes
            </span>
            <svg width="20" height="20" fill="none" stroke="#444444" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
            {stats.pendingApplications}
          </div>
          <div style={{ fontSize: '13px', color: '#666666', marginBottom: '12px' }}>
            SOLICITUDES
          </div>
          <div style={{ fontSize: '13px', color: stats.applicationsGrowth >= 0 ? '#22c55e' : '#ef4444' }}>
            {stats.applicationsGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.applicationsGrowth)}%
            <span style={{ color: '#555555', marginLeft: '6px' }}>vs mes anterior</span>
          </div>
        </div>

        {/* Bookings Card */}
        <div style={{
          backgroundColor: '#111111',
          border: '1px solid #222222',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Agenda
            </span>
            <svg width="20" height="20" fill="none" stroke="#444444" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
            {stats.activeBookings}
          </div>
          <div style={{ fontSize: '13px', color: '#666666', marginBottom: '12px' }}>
            RESERVAS HOY
          </div>
          <div style={{ fontSize: '13px', color: stats.bookingsGrowth >= 0 ? '#22c55e' : '#ef4444' }}>
            {stats.bookingsGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.bookingsGrowth)}%
            <span style={{ color: '#555555', marginLeft: '6px' }}>vs semana pasada</span>
          </div>
        </div>

        {/* Revenue Card */}
        <div style={{
          backgroundColor: '#111111',
          border: '1px solid #222222',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Finanzas
            </span>
            <svg width="20" height="20" fill="none" stroke="#444444" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
            ${(stats.monthlyRevenue / 1000).toFixed(1)}k
          </div>
          <div style={{ fontSize: '13px', color: '#666666', marginBottom: '12px' }}>
            INGRESOS
          </div>
          <div style={{ fontSize: '13px', color: stats.revenueGrowth >= 0 ? '#22c55e' : '#ef4444' }}>
            {stats.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.revenueGrowth)}%
            <span style={{ color: '#555555', marginLeft: '6px' }}>este mes</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Chart Section */}
        <div style={{
          backgroundColor: '#111111',
          border: '1px solid #222222',
          borderRadius: '16px',
          padding: '28px'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: 0, marginBottom: '4px' }}>
              Sesiones de Entrenamiento
            </h2>
            <p style={{ fontSize: '13px', color: '#666666', margin: 0 }}>
              Últimos 12 meses
            </p>
          </div>
          
          {/* Chart */}
          <div style={{ position: 'relative', height: '280px' }}>
            {/* Y Axis */}
            <div style={{ 
              position: 'absolute', 
              left: 0, 
              top: 0, 
              bottom: '30px', 
              width: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#555555'
            }}>
              <span>800</span>
              <span>600</span>
              <span>400</span>
              <span>200</span>
              <span>0</span>
            </div>
            
            {/* Chart Area */}
            <div style={{ marginLeft: '50px', height: '250px', position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#d4af37" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#222222" strokeWidth="0.3" />
                ))}
                
                {/* Area */}
                <path
                  d={`M 0 ${100 - (chartData[0] / 800) * 100} ${chartData.map((v, i) => 
                    `L ${(i / (chartData.length - 1)) * 100} ${100 - (v / 800) * 100}`
                  ).join(' ')} L 100 100 L 0 100 Z`}
                  fill="url(#chartGradient)"
                />
                
                {/* Line */}
                <path
                  d={`M 0 ${100 - (chartData[0] / 800) * 100} ${chartData.map((v, i) => 
                    `L ${(i / (chartData.length - 1)) * 100} ${100 - (v / 800) * 100}`
                  ).join(' ')}`}
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="0.8"
                />
                
                {/* Points */}
                {chartData.map((v, i) => (
                  <circle
                    key={i}
                    cx={(i / (chartData.length - 1)) * 100}
                    cy={100 - (v / 800) * 100}
                    r="1"
                    fill="#d4af37"
                  />
                ))}
              </svg>
              
              {/* X Axis */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '11px', 
                color: '#555555',
                marginTop: '8px'
              }}>
                {months.map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Capacity Section */}
        <div style={{
          backgroundColor: '#111111',
          border: '1px solid #222222',
          borderRadius: '16px',
          padding: '28px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: 0, marginBottom: '24px' }}>
            Capacidad del Club
          </h2>
          
          {/* Circular Progress */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ position: 'relative', width: '180px', height: '180px' }}>
              <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background ring */}
                <circle cx="90" cy="90" r="75" fill="none" stroke="#1a1a1a" strokeWidth="10" />
                {/* Progress ring */}
                <circle
                  cx="90"
                  cy="90"
                  r="75"
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 75}
                  strokeDashoffset={2 * Math.PI * 75 * (1 - stats.totalMembers / 28)}
                />
              </svg>
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#ffffff' }}>{stats.totalMembers}</div>
                <div style={{ fontSize: '11px', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Miembros
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>{stats.totalMembers}</div>
              <div style={{ fontSize: '11px', color: '#666666', textTransform: 'uppercase' }}>Miembros</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>{28 - stats.totalMembers}</div>
              <div style={{ fontSize: '11px', color: '#666666', textTransform: 'uppercase' }}>Disponibles</div>
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'rgba(212, 175, 55, 0.1)', 
            borderRadius: '12px', 
            padding: '14px',
            textAlign: 'center'
          }}>
            <span style={{ color: '#d4af37', fontWeight: 500, fontSize: '14px' }}>
              {Math.round((stats.totalMembers / 28) * 100)}% de capacidad
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { icon: '👤', label: 'Nuevo Miembro', color: '#3b82f6', href: '/admin/members' },
            { icon: '📋', label: 'Ver Solicitudes', color: '#f97316', href: '/admin/applications' },
            { icon: '📊', label: 'Reportes', color: '#8b5cf6', href: '#' },
            { icon: '🔔', label: 'Notificaciones', color: '#ec4899', href: '#' },
          ].map((action, i) => (
            <a
              key={i}
              href={action.href}
              style={{
                backgroundColor: '#111111',
                border: '1px solid #222222',
                borderRadius: '16px',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                backgroundColor: `${action.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                {action.icon}
              </div>
              <span style={{ fontSize: '13px', color: '#888888' }}>{action.label}</span>
            </a>
          ))}
        </div>

        {/* Statistics */}
        <div style={{
          backgroundColor: '#111111',
          border: '1px solid #222222',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: 0, marginBottom: '20px' }}>
            Estadísticas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Sesiones Online', value: 312, max: 500, icon: '💻' },
              { label: 'Nuevos Leads', value: 136, max: 300, icon: '👤' },
              { label: 'Conversiones', value: 89, max: 150, icon: '📈' },
            ].map((stat, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                backgroundColor: '#0a0a0a',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#999999' }}>{stat.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>{stat.value}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#1a1a1a', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${(stat.value / stat.max) * 100}%`,
                      backgroundColor: '#d4af37',
                      borderRadius: '3px'
                    }} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#555555', marginTop: '4px' }}>MAX {stat.max}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}