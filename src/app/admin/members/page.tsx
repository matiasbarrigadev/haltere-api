'use client';

import { useEffect, useState } from 'react';

interface Member {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  member_status: string;
  technogym_user_id: string | null;
  created_at: string;
  bonus_balance: number;
  membership_expires_at: string | null;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending_approval' | 'suspended'>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: '',
    fullName: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    fetchMembers();
  }, [filter]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      const res = await fetch(`/api/admin/members?${params}`);
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.email || !form.fullName || !form.password) {
      setError('Email, nombre y contraseña son requeridos');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowModal(false);
      setForm({ email: '', fullName: '', phone: '', password: '' });
      fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusAction = async (memberId: string, action: 'suspend' | 'reactivate') => {
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: memberId, action })
      });
      if (!res.ok) throw new Error('Error');
      fetchMembers();
    } catch (err) {
      alert('Error al actualizar');
    }
  };

  const filteredMembers = members.filter(m => {
    if (search) {
      const searchLower = search.toLowerCase();
      return m.full_name?.toLowerCase().includes(searchLower) ||
             m.email?.toLowerCase().includes(searchLower) ||
             m.phone?.includes(search);
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      active: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', label: 'Activo' },
      pending_approval: { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', label: 'Pendiente' },
      suspended: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Suspendido' },
      rejected: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', label: 'Rechazado' },
      interview: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', label: 'Entrevista' }
    };
    const s = styles[status] || styles.pending_approval;
    return <span style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', fontWeight: 500, backgroundColor: s.bg, color: s.color }}>● {s.label}</span>;
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid rgba(212, 175, 55, 0.2)', borderTop: '4px solid #d4af37', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const stats = {
    total: members.length,
    active: members.filter(m => m.member_status === 'active').length,
    pending: members.filter(m => m.member_status === 'pending_approval').length,
    suspended: members.filter(m => m.member_status === 'suspended').length
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', margin: 0, marginBottom: '4px' }}>Miembros</h1>
          <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>Gestiona los miembros del club</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ backgroundColor: '#d4af37', color: '#0a0a0a', fontWeight: 600, borderRadius: '8px', padding: '10px 20px', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
          + Nuevo Miembro
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total', value: stats.total, color: '#ffffff' },
          { label: 'Activos', value: stats.active, color: '#22c55e' },
          { label: 'Pendientes', value: stats.pending, color: '#eab308' },
          { label: 'Suspendidos', value: stats.suspended, color: '#ef4444' }
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '16px', padding: '20px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#666666', textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '250px', padding: '12px 16px', backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'active', 'pending_approval', 'suspended'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '10px 16px', fontSize: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              backgroundColor: filter === f ? 'rgba(212, 175, 55, 0.15)' : '#111111', color: filter === f ? '#d4af37' : '#666666'
            }}>
              {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : f === 'pending_approval' ? 'Pendientes' : 'Suspendidos'}
            </button>
          ))}
        </div>
      </div>

      {/* Members List */}
      <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '16px', overflow: 'hidden' }}>
        {filteredMembers.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #222222' }}>
                <th style={{ padding: '16px', textAlign: 'left', color: '#666666', fontSize: '12px', textTransform: 'uppercase' }}>Miembro</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#666666', fontSize: '12px', textTransform: 'uppercase' }}>Contacto</th>
                <th style={{ padding: '16px', textAlign: 'center', color: '#666666', fontSize: '12px', textTransform: 'uppercase' }}>Bonos</th>
                <th style={{ padding: '16px', textAlign: 'center', color: '#666666', fontSize: '12px', textTransform: 'uppercase' }}>Estado</th>
                <th style={{ padding: '16px', textAlign: 'center', color: '#666666', fontSize: '12px', textTransform: 'uppercase' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontWeight: 600 }}>
                        {member.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div style={{ color: '#ffffff', fontWeight: 500 }}>{member.full_name || 'Sin nombre'}</div>
                        <div style={{ color: '#666666', fontSize: '12px' }}>Desde {new Date(member.created_at).toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ color: '#ffffff', fontSize: '14px' }}>{member.email}</div>
                    <div style={{ color: '#666666', fontSize: '12px' }}>{member.phone || 'Sin teléfono'}</div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ color: '#d4af37', fontWeight: 600 }}>{member.bonus_balance || 0}</span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {getStatusBadge(member.member_status)}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {member.member_status === 'active' && (
                      <button onClick={() => handleStatusAction(member.id, 'suspend')} style={{
                        padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'transparent', color: '#ef4444', cursor: 'pointer'
                      }}>
                        Suspender
                      </button>
                    )}
                    {member.member_status === 'suspended' && (
                      <button onClick={() => handleStatusAction(member.id, 'reactivate')} style={{
                        padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.3)', backgroundColor: 'transparent', color: '#22c55e', cursor: 'pointer'
                      }}>
                        Reactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '64px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <h3 style={{ fontSize: '20px', color: '#ffffff', margin: 0, marginBottom: '8px' }}>No hay miembros</h3>
            <p style={{ color: '#666666', margin: 0 }}>No se encontraron miembros con este filtro</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#111111', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '450px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Nuevo Miembro</h2>

            {error && <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Nombre Completo *</label>
              <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} style={{ width: '100%', padding: '12px', backgroundColor: '#0a0a0a', border: '1px solid #333333', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '12px', backgroundColor: '#0a0a0a', border: '1px solid #333333', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Teléfono</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+56 9 1234 5678" style={{ width: '100%', padding: '12px', backgroundColor: '#0a0a0a', border: '1px solid #333333', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Contraseña *</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ width: '100%', padding: '12px', backgroundColor: '#0a0a0a', border: '1px solid #333333', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '12px 24px', backgroundColor: 'transparent', border: '1px solid #333333', borderRadius: '8px', color: '#999999', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
              <button onClick={handleCreate} disabled={saving} style={{ padding: '12px 24px', backgroundColor: '#d4af37', border: 'none', borderRadius: '8px', color: '#0a0a0a', fontWeight: 600, cursor: 'pointer', fontSize: '14px', opacity: saving ? 0.5 : 1 }}>
                {saving ? 'Creando...' : 'Crear Miembro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}