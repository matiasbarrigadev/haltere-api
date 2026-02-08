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

// Area Chart Component with axes
const AreaChart: React.FC<{ data: number[] }> = ({ data }) => {
  const max = Math.max(...data);
  const min = 0;
  const height = 280;
  const width = 100;
  
  // Create smooth curve points
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / (max - min)) * height;
    return { x, y, value: v };
  });
  
  // Create path for smooth curve
  const linePath = points.map((p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  ).join(' ');
  
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const yLabels = [800, 600, 400, 200, 0];

  return (
    <div className="relative">
      {/* Y Axis Labels */}
      <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-[#555] w-10">
        {yLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      
      {/* Chart Area */}
      <div className="ml-12">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#d4af37" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="0"
              y1={(i / 4) * height}
              x2={width}
              y2={(i / 4) * height}
              stroke="#222"
              strokeWidth="0.3"
            />
          ))}
          
          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGradient)" />
          
          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#d4af37"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="0.8"
              fill="#d4af37"
            />
          ))}
        </svg>
        
        {/* X Axis Labels */}
        <div className="flex justify-between text-xs text-[#555] mt-2">
          {months.map((month) => (
            <span key={month}>{month}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Circular Progress Ring
const CapacityRing: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx="90"
          cy="90"
          r="80"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="8"
        />
        {/* Progress ring */}
        <circle
          cx="90"
          cy="90"
          r="80"
          fill="none"
          stroke="#d4af37"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-bold text-white">{value}</div>
        <div className="text-xs text-[#666] uppercase tracking-wider">Miembros</div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  label: string;
  value: string | number;
  subtitle: string;
  growth?: number;
  icon: React.ReactNode;
}> = ({ label, value, subtitle, growth, icon }) => (
  <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#333] transition-colors">
    <div className="flex justify-between items-start mb-4">
      <span className="text-xs text-[#666] uppercase tracking-wider">{label}</span>
      <span className="text-[#444]">{icon}</span>
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-[#666]">{subtitle}</div>
    {growth !== undefined && (
      <div className={`text-sm mt-2 ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}%
        <span className="text-[#555] ml-1">vs mes anterior</span>
      </div>
    )}
  </div>
);

// Progress Stat Component  
const ProgressStat: React.FC<{
  label: string;
  value: number;
  max: number;
  icon: string;
}> = ({ label, value, max, icon }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0a0a0a]">
    <span className="text-xl">{icon}</span>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-[#999]">{label}</span>
        <span className="text-sm font-medium text-white">{value}</span>
      </div>
      <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#d4af37] rounded-full transition-all duration-500"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <div className="text-xs text-[#555] mt-1">MAX {max}</div>
    </div>
  </div>
);

// Quick Action Button
const QuickAction: React.FC<{
  icon: string;
  label: string;
  color: string;
  href: string;
}> = ({ icon, label, color, href }) => (
  <a
    href={href}
    className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6 flex flex-col items-center gap-3 hover:border-[#333] hover:bg-[#0d0d0d] transition-all group"
  >
    <div 
      className="w-10 h-10 rounded-full flex items-center justify-center"
      style={{ backgroundColor: `${color}20` }}
    >
      <span className="text-lg" style={{ color }}>{icon}</span>
    </div>
    <span className="text-sm text-[#888] group-hover:text-white transition-colors">{label}</span>
  </a>
);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-[#666]">Resumen general del club</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-[#111] border border-[#222] rounded-xl px-4 py-2.5 text-[#999] text-sm focus:outline-none focus:border-[#d4af37] transition-colors">
            <option>Últimos 30 días</option>
            <option>Últimos 7 días</option>
            <option>Este mes</option>
            <option>Este año</option>
          </select>
          <button className="bg-[#d4af37] text-[#0a0a0a] font-semibold rounded-xl px-6 py-2.5 text-sm hover:bg-[#b8962f] transition-colors">
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats.totalMembers}
          subtitle="MIEMBROS ACTIVOS"
          growth={stats.membersGrowth}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <StatCard
          label="Pendientes"
          value={stats.pendingApplications}
          subtitle="SOLICITUDES"
          growth={stats.applicationsGrowth}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard
          label="Agenda"
          value={stats.activeBookings}
          subtitle="RESERVAS HOY"
          growth={stats.bookingsGrowth}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          label="Finanzas"
          value={`$${(stats.monthlyRevenue / 1000).toFixed(1)}k`}
          subtitle="INGRESOS"
          growth={stats.revenueGrowth}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-[#111] border border-[#1a1a1a] rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-1">Sesiones de Entrenamiento</h2>
            <p className="text-sm text-[#666]">Últimos 12 meses</p>
          </div>
          <AreaChart data={chartData} />
        </div>

        {/* Capacity Section */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Capacidad del Club</h2>
          <div className="flex justify-center mb-6">
            <CapacityRing value={stats.totalMembers} max={28} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-center mb-4">
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalMembers}</div>
              <div className="text-xs text-[#666] uppercase tracking-wider">Miembros</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{28 - stats.totalMembers}</div>
              <div className="text-xs text-[#666] uppercase tracking-wider">Disponibles</div>
            </div>
          </div>
          <div className="text-center py-3 bg-[#d4af37]/10 rounded-xl">
            <span className="text-[#d4af37] font-medium">
              {Math.round((stats.totalMembers / 28) * 100)}% de capacidad
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction icon="●" label="Nuevo Miembro" color="#3b82f6" href="/admin/members" />
            <QuickAction icon="●" label="Ver Solicitudes" color="#f97316" href="/admin/applications" />
            <QuickAction icon="●" label="Reportes" color="#8b5cf6" href="#" />
            <QuickAction icon="●" label="Notificaciones" color="#ec4899" href="#" />
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Estadísticas</h2>
          <div className="space-y-3">
            <ProgressStat label="Sesiones Online" value={312} max={500} icon="💻" />
            <ProgressStat label="Nuevos Leads" value={136} max={300} icon="👤" />
            <ProgressStat label="Conversiones" value={89} max={150} icon="📈" />
          </div>
        </div>
      </div>
    </div>
  );
}