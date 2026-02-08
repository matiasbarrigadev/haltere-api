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

  const gradientId = `gradient-${color.replace('#', '')}`;

  return (
    <svg width="100%" height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
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
        fill={`url(#${gradientId})`}
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
  <div className={`rounded-xl border border-[#d4af37]/20 p-5 transition-all hover:border-[#d4af37]/40 ${
    large 
      ? 'bg-gradient-to-br from-[#d4af37]/15 to-[#d4af37]/5' 
      : 'bg-[#111]'
  }`}>
    <div className="flex justify-between items-start">
      <div>
        <div className={`font-semibold ${
          large 
            ? 'text-4xl text-[#d4af37]' 
            : 'text-2xl text-white'
        }`}>
          {value}
        </div>
        <div className="text-xs text-[#666] uppercase tracking-wider mt-2">
          {title}
        </div>
      </div>
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] text-xl">
          {icon}
        </div>
      )}
    </div>
    {chartData && (
      <div className="mt-3">
        <SparkLine data={chartData} color="#d4af37" height={50} />
      </div>
    )}
    {growth !== undefined && (
      <div className={`flex items-center gap-1 text-sm mt-3 ${
        growth >= 0 ? 'text-green-400' : 'text-red-400'
      }`}>
        <span>{growth >= 0 ? '↑' : '↓'}</span>
        <span>{Math.abs(growth)}%</span>
        {subtitle && (
          <span className="text-[#666] ml-1">{subtitle}</span>
        )}
      </div>
    )}
  </div>
);

// Circular progress indicator
const CircleProgress: React.FC<{ value: number; max: number; label: string }> = ({ value, max, label }) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center gap-2 relative">
      <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="rgba(212, 175, 55, 0.1)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="#d4af37"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-xl font-semibold text-white">{value}</div>
      </div>
      <div className="text-xs text-[#666] uppercase tracking-wider -mt-2">
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

  useEffect(() => {
    // La autenticación ya se maneja en el layout
    // Solo cargamos los datos
    const loadData = async () => {
      // TODO: Reemplazar con llamadas reales a la API
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

  // Sample data for charts
  const sessionsData = [120, 145, 130, 160, 175, 155, 190, 210, 185, 220, 240, 235];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-[#666]">
            Resumen general del club
          </p>
        </div>
        <div className="flex gap-3">
          <select className="bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-[#999] text-sm focus:outline-none focus:border-[#d4af37]">
            <option>Últimos 30 días</option>
            <option>Últimos 7 días</option>
            <option>Este mes</option>
            <option>Este año</option>
          </select>
          <button className="bg-[#d4af37] text-[#0a0a0a] font-medium rounded-lg px-5 py-2 text-sm hover:bg-[#b8962f] transition-colors flex items-center gap-2">
            <span>↓</span> Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats and Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-semibold text-white mb-1">
                  Sesiones de Entrenamiento
                </h3>
                <p className="text-xs text-[#666]">
                  📅 Últimos 12 meses
                </p>
              </div>
              <div className="flex gap-2">
                {['7d', '1m', '3m', '12m'].map((period, i) => (
                  <button 
                    key={period} 
                    className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                      i === 3 
                        ? 'bg-[#d4af37]/15 border-[#d4af37]/30 text-[#d4af37]' 
                        : 'border-[#333] text-[#666] hover:text-white hover:border-[#444]'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-48 relative">
              <SparkLine data={sessionsData} color="#d4af37" height={180} />
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-[#444] pt-2">
                {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map(m => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '👤', label: 'Nuevo Miembro', href: '/admin/members' },
              { icon: '📋', label: 'Ver Solicitudes', href: '/admin/applications' },
              { icon: '📊', label: 'Reportes', href: '#' },
              { icon: '📧', label: 'Notificaciones', href: '#' },
            ].map((action, i) => (
              <a
                key={i}
                href={action.href}
                className="bg-[#111] border border-[#222] rounded-xl p-5 flex flex-col items-center gap-3 hover:border-[#d4af37]/30 hover:bg-[#1a1a1a] transition-all cursor-pointer"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-xs text-[#999]">{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Right Column - Additional Stats */}
        <div className="space-y-6">
          {/* Capacity */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-semibold text-white">
                Capacidad del Club
              </h3>
              <span className="text-[#444] cursor-pointer hover:text-[#666]">⋮</span>
            </div>
            
            <div className="flex justify-around">
              <CircleProgress value={stats.totalMembers} max={28} label="Miembros" />
              <CircleProgress value={4} max={28} label="Disponibles" />
            </div>

            <div className="mt-6 p-4 bg-[#d4af37]/5 border border-[#d4af37]/10 rounded-lg text-center">
              <span className="text-[#d4af37] text-sm">
                {Math.round((stats.totalMembers / 28) * 100)}% de capacidad
              </span>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-semibold text-white">
                Estadísticas
              </h3>
              <span className="text-[#444] cursor-pointer hover:text-[#666]">⋮</span>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Sesiones Online', value: 312, max: 512, icon: '💻' },
                { label: 'Nuevos Leads', value: 136, max: 381, icon: '👤' },
                { label: 'Ingresos Prom.', value: '$3,076', growth: 21, icon: '📈' },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    i === 2 ? 'bg-[#d4af37]/5' : 'bg-[#0a0a0a]'
                  }`}
                >
                  <span className="text-xl">{stat.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs text-[#666] mb-1">{stat.label}</div>
                    {stat.max && typeof stat.value === 'number' && (
                      <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#d4af37] rounded-full transition-all"
                          style={{ width: `${(stat.value / stat.max) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">
                      {stat.value}
                    </div>
                    {stat.max && (
                      <div className="text-xs text-[#444]">MAX {stat.max}</div>
                    )}
                    {stat.growth && (
                      <div className="text-xs text-green-400">+{stat.growth}%</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h3 className="text-base font-semibold text-white mb-5">
              Actividad Reciente
            </h3>
            
            <div className="space-y-0">
              {[
                { action: 'Nueva solicitud', user: 'Carlos M.', time: 'Hace 5 min', type: 'new' },
                { action: 'Reserva confirmada', user: 'Ana P.', time: 'Hace 15 min', type: 'success' },
                { action: 'Pago recibido', user: 'Jorge L.', time: 'Hace 1 hora', type: 'payment' },
              ].map((activity, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-3 py-3 ${
                    i < 2 ? 'border-b border-[#1a1a1a]' : ''
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'new' ? 'bg-blue-400' : 
                    activity.type === 'success' ? 'bg-green-400' : 'bg-[#d4af37]'
                  }`} />
                  <div className="flex-1">
                    <div className="text-sm text-white/80">{activity.action}</div>
                    <div className="text-xs text-[#666]">{activity.user}</div>
                  </div>
                  <div className="text-xs text-[#444]">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}