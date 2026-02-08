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
    const baseStyle: React.CSSProperties = {
      padding: '4px 10px',
      fontSize: '12px',
      borderRadius: '6px',
      fontWeight: 500
    };
    
    switch (status) {
      case 'active':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>Activo</span>;
      case 'suspended':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Suspendido</span>;
      case 'pending_approval':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>Pendiente</span>;
      default:
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}>{status}</span>;
    }
  };

  const getRoleBadge = (role: string) => {
    const baseStyle: React.CSSProperties = {
      padding: '4px 10px',
      fontSize: '12px',
      borderRadius: '6px',
      fontWeight: 500
    };
    
    switch (role) {
      case 'admin':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>Admin</span>;
      case 'professional':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>Pro</span>;
      case 'member':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#d4af37' }}>VIP</span>;
      default:
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}>Guest</span>;
    }
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', margin: 0, marginBottom: '4px' }}>
            Miembros
          </h1>
          <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>
            {filteredMembers.length} miembros encontrados
          </p>
        </div>
        <button style={{
          backgroundColor: '#d4af37',
          color: '#0a0a0a',
          fontWeight: 600,
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>+</span>
          Nuevo Miembro
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        {/* Status Filter */}
        <div style={{ display: 'flex', backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', overflow: 'hidden' }}>
          {(['all', 'active', 'suspended'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: filter === status ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: filter === status ? '#d4af37' : '#666666'
              }}
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
          style={{
            flex: 1,
            minWidth: '250px',
            padding: '10px 16px',
            backgroundColor: '#111111',
            border: '1px solid #222222',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>

      {/* Members Table */}
      {filteredMembers.length > 0 ? (
        <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#0a0a0a' }}>
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Miembro</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Teléfono</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rol</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Technogym</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Membresía</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, index) => (
                <tr key={member.id} style={{ borderTop: '1px solid #222222' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#d4af37',
                        fontWeight: 600,
                        fontSize: '16px'
                      }}>
                        {member.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p style={{ margin: 0, color: '#ffffff', fontWeight: 500 }}>{member.full_name || 'Sin nombre'}</p>
                        <p style={{ margin: 0, color: '#666666', fontSize: '12px' }}>
                          {new Date(member.created_at).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#999999' }}>{member.phone || '-'}</td>
                  <td style={{ padding: '16px 20px' }}>{getRoleBadge(member.role)}</td>
                  <td style={{ padding: '16px 20px' }}>{getStatusBadge(member.member_status)}</td>
                  <td style={{ padding: '16px 20px' }}>
                    {member.technogym_user_id ? (
                      <span style={{ padding: '4px 10px', fontSize: '12px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '6px' }}>✓ Vinculado</span>
                    ) : (
                      <span style={{ padding: '4px 10px', fontSize: '12px', backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', borderRadius: '6px' }}>No vinculado</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#999999', fontSize: '14px' }}>
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
        <div style={{
          backgroundColor: '#111111',
          border: '1px solid #222222',
          borderRadius: '16px',
          padding: '64px 32px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <h3 style={{ fontSize: '20px', color: '#ffffff', margin: 0, marginBottom: '8px' }}>No se encontraron miembros</h3>
          <p style={{ color: '#666666', margin: 0 }}>
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'No hay miembros en esta categoría'}
          </p>
        </div>
      )}

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total', value: members.length, color: '#ffffff' },
          { label: 'Activos', value: members.filter((m) => m.member_status === 'active').length, color: '#22c55e' },
          { label: 'Con Technogym', value: members.filter((m) => m.technogym_user_id).length, color: '#8b5cf6' },
          { label: 'Profesionales', value: members.filter((m) => m.role === 'professional').length, color: '#3b82f6' },
        ].map((stat, i) => (
          <div key={i} style={{
            backgroundColor: '#111111',
            border: '1px solid #222222',
            borderRadius: '16px',
            padding: '20px'
          }}>
            <p style={{ margin: 0, color: '#666666', fontSize: '13px', marginBottom: '8px' }}>{stat.label}</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}