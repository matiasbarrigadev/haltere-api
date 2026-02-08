'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingApplications: number;
  todayBookings: number;
  monthlyRevenue: number;
  technogymLinked: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats from API
      const [membersRes, applicationsRes] = await Promise.all([
        fetch('/api/admin/members?status=active'),
        fetch('/api/admin/members?status=pending_approval'),
      ]);

      const membersData = await membersRes.json();
      const applicationsData = await applicationsRes.json();

      setStats({
        totalMembers: membersData.members?.length || 0,
        activeMembers: membersData.members?.filter((m: any) => m.member_status === 'active').length || 0,
        pendingApplications: applicationsData.members?.length || 0,
        todayBookings: 0, // TODO: fetch from bookings API
        monthlyRevenue: 0, // TODO: fetch from payments
        technogymLinked: membersData.members?.filter((m: any) => m.technogym_user_id).length || 0,
      });

      setRecentApplications(applicationsData.members?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#d4af37]">Cargando dashboard...</div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Miembros Activos',
      value: stats?.activeMembers || 0,
      icon: '👥',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Solicitudes Pendientes',
      value: stats?.pendingApplications || 0,
      icon: '📝',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      href: '/admin/applications',
    },
    {
      label: 'Reservas Hoy',
      value: stats?.todayBookings || 0,
      icon: '📅',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Technogym Vinculados',
      value: stats?.technogymLinked || 0,
      icon: '🏋️',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif text-white tracking-wide">Dashboard</h1>
        <p className="text-[#666] mt-1">Resumen de Club Haltere</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-[#111] border border-[#222] rounded-xl p-6 hover:border-[#333] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#666] text-sm">{stat.label}</p>
                <p className={`text-3xl font-bold mt-2 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Applications */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Solicitudes Recientes</h2>
            <a
              href="/admin/applications"
              className="text-[#d4af37] text-sm hover:underline"
            >
              Ver todas →
            </a>
          </div>

          {recentApplications.length > 0 ? (
            <div className="space-y-3">
              {recentApplications.map((app, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-[#222] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                      {app.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-white text-sm">{app.full_name || 'Sin nombre'}</p>
                      <p className="text-[#666] text-xs">{app.phone || 'Sin teléfono'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-400 rounded">
                    Pendiente
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#666]">
              <p>No hay solicitudes pendientes</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <h2 className="text-lg font-medium text-white mb-4">Acciones Rápidas</h2>
          
          <div className="space-y-3">
            <a
              href="/admin/applications"
              className="flex items-center gap-3 p-4 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors"
            >
              <span className="text-2xl">📝</span>
              <div>
                <p className="text-white">Revisar Solicitudes</p>
                <p className="text-[#666] text-sm">Aprobar o rechazar nuevos miembros</p>
              </div>
            </a>

            <a
              href="/admin/members"
              className="flex items-center gap-3 p-4 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors"
            >
              <span className="text-2xl">👥</span>
              <div>
                <p className="text-white">Gestionar Miembros</p>
                <p className="text-[#666] text-sm">Ver y editar miembros activos</p>
              </div>
            </a>

            <a
              href="/admin/bookings"
              className="flex items-center gap-3 p-4 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors"
            >
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-white">Ver Reservas</p>
                <p className="text-[#666] text-sm">Calendario y citas del día</p>
              </div>
            </a>

            <a
              href="https://supabase.com/dashboard/project/spodghifjbqlinkgkpvs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors"
            >
              <span className="text-2xl">🗄️</span>
              <div>
                <p className="text-white">Supabase Dashboard</p>
                <p className="text-[#666] text-sm">Base de datos y configuración</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">Estado del Sistema</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-[#999] text-sm">API Haltere</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-[#999] text-sm">Supabase</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-[#999] text-sm">Stripe</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-[#999] text-sm">Technogym (Dev)</span>
          </div>
        </div>
      </div>
    </div>
  );
}