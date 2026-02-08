'use client';

import { useEffect, useState } from 'react';

interface Booking {
  id: string;
  memberName: string;
  memberEmail: string;
  service: string;
  location: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');

  useEffect(() => {
    // TODO: Reemplazar con llamada real a la API
    setTimeout(() => {
      setBookings([
        {
          id: '1',
          memberName: 'Carlos Mendoza',
          memberEmail: 'carlos@email.com',
          service: 'Entrenamiento Personal',
          location: 'Sede Vitacura',
          date: '2026-02-08',
          time: '10:00',
          status: 'confirmed',
          createdAt: '2026-02-06T14:30:00Z'
        },
        {
          id: '2',
          memberName: 'Ana Pérez',
          memberEmail: 'ana@email.com',
          service: 'Clase de Yoga',
          location: 'Sede Las Condes',
          date: '2026-02-08',
          time: '11:30',
          status: 'pending',
          createdAt: '2026-02-07T09:15:00Z'
        },
        {
          id: '3',
          memberName: 'Jorge López',
          memberEmail: 'jorge@email.com',
          service: 'Evaluación Física',
          location: 'Sede Vitacura',
          date: '2026-02-09',
          time: '09:00',
          status: 'confirmed',
          createdAt: '2026-02-05T16:45:00Z'
        },
        {
          id: '4',
          memberName: 'María García',
          memberEmail: 'maria@email.com',
          service: 'Masaje Deportivo',
          location: 'Sede Providencia',
          date: '2026-02-07',
          time: '15:00',
          status: 'completed',
          createdAt: '2026-02-04T11:20:00Z'
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const getStatusBadge = (status: Booking['status']) => {
    const styles = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
      cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
      completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

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
            Reservas
          </h1>
          <p className="text-sm text-[#666]">
            Gestión de reservas y citas del club
          </p>
        </div>
        <button className="bg-[#d4af37] text-[#0a0a0a] font-medium rounded-lg px-5 py-2 text-sm hover:bg-[#b8962f] transition-colors">
          + Nueva Reserva
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Hoy', value: 15, icon: '📅' },
          { label: 'Pendientes', value: 3, icon: '⏳' },
          { label: 'Confirmadas', value: 10, icon: '✅' },
          { label: 'Completadas', value: 2, icon: '🎯' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111] border border-[#222] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <div className="text-2xl font-semibold text-white">{stat.value}</div>
                <div className="text-xs text-[#666]">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'confirmed', label: 'Confirmadas' },
          { key: 'completed', label: 'Completadas' },
          { key: 'cancelled', label: 'Canceladas' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              filter === f.key
                ? 'bg-[#d4af37]/15 border-[#d4af37]/30 text-[#d4af37]'
                : 'border-[#333] text-[#666] hover:text-white hover:border-[#444]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#222]">
              <th className="text-left text-xs text-[#666] uppercase tracking-wider px-6 py-4">Miembro</th>
              <th className="text-left text-xs text-[#666] uppercase tracking-wider px-6 py-4">Servicio</th>
              <th className="text-left text-xs text-[#666] uppercase tracking-wider px-6 py-4">Sede</th>
              <th className="text-left text-xs text-[#666] uppercase tracking-wider px-6 py-4">Fecha</th>
              <th className="text-left text-xs text-[#666] uppercase tracking-wider px-6 py-4">Estado</th>
              <th className="text-left text-xs text-[#666] uppercase tracking-wider px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="border-b border-[#1a1a1a] hover:bg-[#0a0a0a] transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-white font-medium">{booking.memberName}</div>
                    <div className="text-xs text-[#666]">{booking.memberEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#999]">{booking.service}</td>
                <td className="px-6 py-4 text-[#999]">{booking.location}</td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-white">{booking.date}</div>
                    <div className="text-xs text-[#666]">{booking.time}</div>
                  </div>
                </td>
                <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button className="px-3 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded hover:bg-green-500/20 transition-colors">
                          Confirmar
                        </button>
                        <button className="px-3 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors">
                          Cancelar
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button className="px-3 py-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded hover:bg-blue-500/20 transition-colors">
                        Completar
                      </button>
                    )}
                    <button className="px-3 py-1 text-xs text-[#666] hover:text-white transition-colors">
                      Ver
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}