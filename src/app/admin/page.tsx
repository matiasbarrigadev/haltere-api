'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

interface ChartData {
  label: string;
  value: number;
}

// Mini line chart component
const SparkLine: React.FC<{ data: number[]; color: string; height?: number }> = ({ 
  data, 
  color, 
  height = 40 
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polygon
        fill={`url(#gradient-${color})`}
        points={`0,${height} ${points} 100,${height}`}
      />
    </svg>
  );
};

// Stat card component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  growth?: number;
  chartData?: number[];
  icon?: React.ReactNode;
  large?: boolean;
}> = ({ title, value, subtitle, growth, chartData, icon, large }) => (
  <div style={{
    background: large ? 'linear-gradient(135deg, rgba(242, 187, 106, 0.15) 0%, rgba(242, 187, 106, 0.05) 100%)' : 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(242, 187, 106, 0.1)',
    borderRadius: 12,
    padding: large ? '24px' : '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'all 0.3s ease',
    cursor: 'default',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{
          fontSize: large ? '2.5rem' : '1.75rem',
          fontWeight: 600,
          color: large ? '#F2BB6A' : 'rgba(255, 255, 255, 0.95)',
          lineHeight: 1,
        }}>
          {value}
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginTop: 8,
        }}>
          {title}
        </div>
      </div>
      {icon && (
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: 'rgba(242, 187, 106, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F2BB6A',
          fontSize: '1.25rem',
        }}>
          {icon}
        </div>
      )}
    </div>
    {chartData && (
      <div style={{ marginTop: 8 }}>
        <SparkLine data={chartData} color="#F2BB6A" height={50} />
      </div>
    )}
    {growth !== undefined && (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: '0.8rem',
        color: growth >= 0 ? '#4ade80' : '#f87171',
      }}>
        <span>{growth >= 0 ? '↑' : '↓'}</span>
        <span>{Math.abs(growth)}%</span>
        {subtitle && (
          <span style={{ color: 'rgba(255, 255, 255, 0.4)', marginLeft: 4 }}>
            {subtitle}
          </span>
        )}
      </div>
    )}
  </div>
);

// Sidebar icon button
const SidebarButton: React.FC<{
  icon: React.ReactNode;
  active?: boolean;
  href: string;
  label: string;
}> = ({ icon, active, href, label }) => (
  <Link
    href={href}
    title={label}
    style={{
      width: 48,
      height: 48,
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: active ? 'rgba(242, 187, 106, 0.15)' : 'transparent',
      color: active ? '#F2BB6A' : 'rgba(255, 255, 255, 0.5)',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
    }}
  >
    {icon}
  </Link>
);

// Circular progress indicator
const CircleProgress: React.FC<{ value: number; max: number; label: string }> = ({ value, max, label }) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="rgba(242, 187, 106, 0.1)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="#F2BB6A"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', marginTop: 28, textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
          {value}
        </div>
      </div>
      <div style={{ 
        fontSize: '0.7rem', 
        color: 'rgba(255,255,255,0.5)', 
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginTop: -8,
      }}>
        {label}
      </div>
    </div>
  );
};

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
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuth');
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    // Simulated data - replace with actual API calls
    setTimeout(() => {
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
    }, 500);
  }, [router]);

  // Sample data for charts
  const sessionsData = [120, 145, 130, 160, 175, 155, 190, 210, 185, 220, 240, 235];
  const weeklyBookings = [12, 18, 15, 22, 19, 25, 21];

  if (isLoading) {
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
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0d0c0b',
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 72,
        background: 'rgba(255, 255, 255, 0.02)',
        borderRight: '1px solid rgba(242, 187, 106, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 0',
        gap: 8,
      }}>
        {/* Logo */}
        <div style={{
          width: 40,
          height: 40,
          marginBottom: 24,
          color: '#F2BB6A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>

        <SidebarButton
          href="/admin"
          icon={<span>📊</span>}
          active={true}
          label="Dashboard"
        />
        <SidebarButton
          href="/admin/members"
          icon={<span>👥</span>}
          label="Miembros"
        />
        <SidebarButton
          href="/admin/applications"
          icon={<span>📝</span>}
          label="Solicitudes"
        />
        <SidebarButton
          href="#"
          icon={<span>📅</span>}
          label="Reservas"
        />
        <SidebarButton
          href="#"
          icon={<span>⚙️</span>}
          label="Configuración"
        />

        <div style={{ flex: 1 }} />

        <SidebarButton
          href="#"
          icon={<span>🚪</span>}
          label="Salir"
        />
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }}>
          <div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.95)',
              marginBottom: 4,
            }}>
              Dashboard
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.5)',
            }}>
              Resumen general del club
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <select style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(242, 187, 106, 0.2)',
              borderRadius: 8,
              padding: '8px 16px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
            }}>
              <option>Últimos 30 días</option>
              <option>Últimos 7 días</option>
              <option>Este mes</option>
              <option>Este año</option>
            </select>
            <button style={{
              background: '#F2BB6A',
              color: '#0d0c0b',
              border: 'none',
              borderRadius: 8,
              padding: '8px 20px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span>↓</span> Exportar
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Top Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr repeat(3, 1fr)', gap: 16 }}>
              <StatCard
                title="Miembros Activos"
                value={stats.totalMembers}
                growth={stats.membersGrowth}
                chartData={[18, 20, 19, 21, 22, 21, 23, 24]}
                large
              />
              <StatCard
                title="Solicitudes"
                value={stats.pendingApplications}
                growth={stats.applicationsGrowth}
                subtitle="vs mes anterior"
                icon={<span>📝</span>}
              />
              <StatCard
                title="Reservas Hoy"
                value={stats.activeBookings}
                growth={stats.bookingsGrowth}
                subtitle="vs semana pasada"
                icon={<span>📅</span>}
              />
              <StatCard
                title="Ingresos"
                value={`$${(stats.monthlyRevenue / 1000).toFixed(1)}k`}
                growth={stats.revenueGrowth}
                subtitle="este mes"
                icon={<span>💰</span>}
              />
            </div>

            {/* Sessions Chart */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(242, 187, 106, 0.1)',
              borderRadius: 12,
              padding: 24,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}>
                <div>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: 4,
                  }}>
                    Sesiones de Entrenamiento
                  </h3>
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}>
                    📅 Últimos 12 meses
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['7d', '1m', '3m', '12m'].map((period, i) => (
                    <button key={period} style={{
                      background: i === 3 ? 'rgba(242, 187, 106, 0.15)' : 'transparent',
                      border: '1px solid rgba(242, 187, 106, 0.2)',
                      borderRadius: 6,
                      padding: '4px 12px',
                      color: i === 3 ? '#F2BB6A' : 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}>
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ height: 200, position: 'relative' }}>
                <SparkLine data={sessionsData} color="#F2BB6A" height={180} />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.65rem',
                  color: 'rgba(255, 255, 255, 0.3)',
                  paddingTop: 8,
                }}>
                  {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map(m => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { icon: '👤', label: 'Nuevo Miembro', color: '#F2BB6A' },
                { icon: '📋', label: 'Ver Solicitudes', color: '#60a5fa' },
                { icon: '📊', label: 'Reportes', color: '#4ade80' },
                { icon: '📧', label: 'Notificaciones', color: '#f472b6' },
              ].map((action, i) => (
                <button key={i} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(242, 187, 106, 0.1)',
                  borderRadius: 12,
                  padding: '20px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{action.icon}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}>
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Capacity */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(242, 187, 106, 0.1)',
              borderRadius: 12,
              padding: 24,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.9)',
                }}>
                  Capacidad del Club
                </h3>
                <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>⋮</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                position: 'relative',
              }}>
                <CircleProgress value={stats.totalMembers} max={28} label="Miembros" />
                <CircleProgress value={4} max={28} label="Disponibles" />
              </div>

              <div style={{
                marginTop: 24,
                padding: '16px',
                background: 'rgba(242, 187, 106, 0.05)',
                borderRadius: 8,
                textAlign: 'center',
              }}>
                <span style={{ color: '#F2BB6A', fontSize: '0.875rem' }}>
                  {Math.round((stats.totalMembers / 28) * 100)}% de capacidad
                </span>
              </div>
            </div>

            {/* Statistics */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(242, 187, 106, 0.1)',
              borderRadius: 12,
              padding: 24,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.9)',
                }}>
                  Estadísticas
                </h3>
                <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>⋮</span>
              </div>

              {[
                { label: 'Sesiones Online', value: 312, max: 512, icon: '💻' },
                { label: 'Nuevos Leads', value: 136, max: 381, icon: '👤' },
                { label: 'Ingresos Prom.', value: '$3,076', growth: 21, icon: '📈' },
              ].map((stat, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px',
                  background: i === 2 ? 'rgba(242, 187, 106, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 8,
                  marginBottom: 12,
                }}>
                  <span style={{ fontSize: '1.25rem' }}>{stat.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginBottom: 4,
                    }}>
                      {stat.label}
                    </div>
                    {stat.max ? (
                      <div style={{
                        background: 'rgba(242, 187, 106, 0.1)',
                        borderRadius: 4,
                        height: 6,
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${(stat.value / stat.max) * 100}%`,
                          height: '100%',
                          background: '#F2BB6A',
                          borderRadius: 4,
                        }} />
                      </div>
                    ) : null}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'rgba(255, 255, 255, 0.9)',
                    }}>
                      {typeof stat.value === 'number' ? stat.value : stat.value}
                    </div>
                    {stat.max && (
                      <div style={{
                        fontSize: '0.65rem',
                        color: 'rgba(255, 255, 255, 0.4)',
                      }}>
                        MAX {stat.max}
                      </div>
                    )}
                    {stat.growth && (
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#4ade80',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 2,
                      }}>
                        <span>+{stat.growth}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(242, 187, 106, 0.1)',
              borderRadius: 12,
              padding: 24,
              flex: 1,
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: 20,
              }}>
                Actividad Reciente
              </h3>
              
              {[
                { action: 'Nueva solicitud', user: 'Carlos M.', time: 'Hace 5 min', type: 'new' },
                { action: 'Reserva confirmada', user: 'Ana P.', time: 'Hace 15 min', type: 'success' },
                { action: 'Pago recibido', user: 'Jorge L.', time: 'Hace 1 hora', type: 'payment' },
              ].map((activity, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: i < 2 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: activity.type === 'new' ? '#60a5fa' : 
                               activity.type === 'success' ? '#4ade80' : '#F2BB6A',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                    }}>
                      {activity.action}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.4)',
                    }}>
                      {activity.user}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255, 255, 255, 0.3)',
                  }}>
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}