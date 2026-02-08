'use client';

import { useEffect, useState } from 'react';

interface Member {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  role: string;
  member_status: string;
  membership_expires_at: string | null;
  technogym_user_id: string | null;
  created_at: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [filter]);

  const fetchMembers = async () => {
    try {
      const status = filter === 'all' ? '' : `status=${filter}`;
      const res = await fetch(`/api/admin/members?${status}`);
      const data = await res.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      member.full_name?.toLowerCase().includes(search) ||
      member.phone?.includes(search) ||
      member.user_id.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 text-xs bg-green-500/10 text-green-400 rounded">
            Activo
          </span>
        );
      case 'suspended':
        return (
          <span className="px-2 py-1 text-xs bg-red-500/10 text-red-400 rounded">
            Suspendido
          </span>
        );
      case 'pending_approval':
        return (
          <span className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-400 rounded">
            Pendiente
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs bg-gray-500/10 text-gray-400 rounded">
            {status}
          </span>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 py-1 text-xs bg-purple-500/10 text-purple-400 rounded">
            Admin
          </span>
        );
      case 'professional':
        return (
          <span className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 rounded">
            Pro
          </span>
        );
      case 'member':
        return (
          <span className="px-2 py-1 text-xs bg-[#d4af37]/10 text-[#d4af37] rounded">
            VIP
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs bg-gray-500/10 text-gray-400 rounded">
            Guest
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#d4af37]">Cargando miembros...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white tracking-wide">
            Miembros
          </h1>
          <p className="text-[#666] mt-1">
            {filteredMembers.length} miembros encontrados
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <div className="flex bg-[#111] border border-[#222] rounded-lg overflow-hidden">
          {(['all', 'active', 'suspended'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm transition-colors ${
                filter === status
                  ? 'bg-[#d4af37]/20 text-[#d4af37]'
                  : 'text-[#666] hover:text-white'
              }`}
            >
              {status === 'all' ? 'Todos' : status === 'active' ? 'Activos' : 'Suspendidos'}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 bg-[#111] border border-[#222] rounded-lg text-white placeholder-[#555] focus:outline-none focus:border-[#d4af37]"
        />
      </div>

      {/* Members Table */}
      {filteredMembers.length > 0 ? (
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#0a0a0a]">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#666]">
                  Miembro
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#666]">
                  Teléfono
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#666]">
                  Rol
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#666]">
                  Estado
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#666]">
                  Technogym
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#666]">
                  Membresía
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="border-t border-[#222] hover:bg-[#1a1a1a] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] font-medium">
                        {member.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-white">{member.full_name || 'Sin nombre'}</p>
                        <p className="text-[#666] text-xs">
                          {new Date(member.created_at).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#999]">
                    {member.phone || '-'}
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(member.role)}</td>
                  <td className="px-6 py-4">{getStatusBadge(member.member_status)}</td>
                  <td className="px-6 py-4">
                    {member.technogym_user_id ? (
                      <span className="px-2 py-1 text-xs bg-green-500/10 text-green-400 rounded">
                        ✓ Vinculado
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-500/10 text-gray-400 rounded">
                        No vinculado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#999] text-sm">
                    {member.membership_expires_at
                      ? new Date(member.membership_expires_at).toLocaleDateString('es-CL')
                      : 'Sin fecha'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-xl text-white mb-2">No se encontraron miembros</h3>
          <p className="text-[#666]">
            {searchTerm
              ? 'Intenta con otro término de búsqueda'
              : 'No hay miembros en esta categoría'}
          </p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <p className="text-[#666] text-sm">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{members.length}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <p className="text-[#666] text-sm">Activos</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {members.filter((m) => m.member_status === 'active').length}
          </p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <p className="text-[#666] text-sm">Con Technogym</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">
            {members.filter((m) => m.technogym_user_id).length}
          </p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <p className="text-[#666] text-sm">Profesionales</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">
            {members.filter((m) => m.role === 'professional').length}
          </p>
        </div>
      </div>
    </div>
  );
}