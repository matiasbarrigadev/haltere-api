'use client';

import { useEffect, useState } from 'react';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  capacity: number;
  currentMembers: number;
  services: string[];
  schedule: string;
  status: 'active' | 'maintenance' | 'inactive';
  imageUrl?: string;
}

export default function AdminLocationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    // TODO: Reemplazar con llamada real a la API
    setTimeout(() => {
      setLocations([
        {
          id: '1',
          name: 'Sede Vitacura',
          address: 'Av. Vitacura 2939, Of. 1201',
          city: 'Vitacura, Santiago',
          phone: '+56 2 2345 6789',
          email: 'vitacura@haltere.cl',
          capacity: 28,
          currentMembers: 24,
          services: ['Gimnasio', 'Yoga', 'Personal Training', 'Spa'],
          schedule: 'Lun-Vie: 6:00-22:00 | Sáb: 8:00-18:00 | Dom: 9:00-14:00',
          status: 'active',
        },
        {
          id: '2',
          name: 'Sede Las Condes',
          address: 'Isidora Goyenechea 3000, Piso 15',
          city: 'Las Condes, Santiago',
          phone: '+56 2 2987 6543',
          email: 'lascondes@haltere.cl',
          capacity: 35,
          currentMembers: 31,
          services: ['Gimnasio', 'Pilates', 'Personal Training', 'Nutrición'],
          schedule: 'Lun-Vie: 6:00-23:00 | Sáb: 7:00-20:00 | Dom: 8:00-16:00',
          status: 'active',
        },
        {
          id: '3',
          name: 'Sede Providencia',
          address: 'Av. Providencia 1208, Of. 301',
          city: 'Providencia, Santiago',
          phone: '+56 2 2111 2222',
          email: 'providencia@haltere.cl',
          capacity: 20,
          currentMembers: 0,
          services: ['Gimnasio', 'Yoga', 'Masajes'],
          schedule: 'Lun-Vie: 7:00-21:00 | Sáb: 9:00-15:00',
          status: 'maintenance',
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const getStatusBadge = (status: Location['status']) => {
    const styles = {
      active: 'bg-green-500/10 text-green-400 border-green-500/20',
      maintenance: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      inactive: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    const labels = {
      active: 'Activa',
      maintenance: 'En Mantenimiento',
      inactive: 'Inactiva',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
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
            Sedes
          </h1>
          <p className="text-sm text-[#666]">
            Administración de ubicaciones del club
          </p>
        </div>
        <button className="bg-[#d4af37] text-[#0a0a0a] font-medium rounded-lg px-5 py-2 text-sm hover:bg-[#b8962f] transition-colors">
          + Nueva Sede
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sedes', value: locations.length, icon: '🏢' },
          { label: 'Sedes Activas', value: locations.filter(l => l.status === 'active').length, icon: '✅' },
          { label: 'Capacidad Total', value: locations.reduce((sum, l) => sum + l.capacity, 0), icon: '👥' },
          { label: 'Miembros Totales', value: locations.reduce((sum, l) => sum + l.currentMembers, 0), icon: '💪' },
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

      {/* Locations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {locations.map((location) => (
          <div 
            key={location.id} 
            className="bg-[#111] border border-[#222] rounded-xl overflow-hidden hover:border-[#d4af37]/30 transition-all"
          >
            {/* Location Header */}
            <div className="p-6 border-b border-[#222]">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white">{location.name}</h3>
                {getStatusBadge(location.status)}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-[#999]">{location.address}</p>
                <p className="text-xs text-[#666]">{location.city}</p>
              </div>
            </div>

            {/* Capacity */}
            <div className="px-6 py-4 bg-[#0a0a0a]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-[#666] uppercase tracking-wider">Capacidad</span>
                <span className={`text-sm font-semibold ${getCapacityColor(location.currentMembers, location.capacity)}`}>
                  {location.currentMembers} / {location.capacity}
                </span>
              </div>
              <div className="h-2 bg-[#222] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#d4af37] rounded-full transition-all"
                  style={{ width: `${(location.currentMembers / location.capacity) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-[#666]">
                {location.capacity - location.currentMembers} cupos disponibles
              </div>
            </div>

            {/* Contact & Services */}
            <div className="p-6 space-y-4">
              {/* Contact */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#666]">📞</span>
                  <span className="text-[#999]">{location.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#666]">✉️</span>
                  <span className="text-[#999]">{location.email}</span>
                </div>
              </div>

              {/* Services */}
              <div>
                <div className="text-xs text-[#666] uppercase tracking-wider mb-2">Servicios</div>
                <div className="flex flex-wrap gap-2">
                  {location.services.map((service, i) => (
                    <span 
                      key={i}
                      className="px-2 py-1 text-xs bg-[#d4af37]/10 text-[#d4af37] rounded"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div>
                <div className="text-xs text-[#666] uppercase tracking-wider mb-1">Horario</div>
                <div className="text-xs text-[#999]">{location.schedule}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-[#222] flex gap-2">
              <button className="flex-1 px-4 py-2 text-sm bg-[#1a1a1a] text-white rounded-lg hover:bg-[#222] transition-colors">
                Editar
              </button>
              <button className="flex-1 px-4 py-2 text-sm border border-[#333] text-[#999] rounded-lg hover:text-white hover:border-[#444] transition-colors">
                Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}