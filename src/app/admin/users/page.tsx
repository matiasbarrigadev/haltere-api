'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  member_status: string;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [changingRole, setChangingRole] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (filterRole !== 'all') params.append('role', filterRole);
      
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setChangingRole(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setChangingRole(null);
    }
  };

  const roleColors: Record<string, string> = {
    superadmin: '#ef4444',
    admin: '#d4af37',
    professional: '#3b82f6',
    member: '#22c55e',
  };

  const roleLabels: Record<string, string> = {
    superadmin: 'Super Admin',
    admin: 'Admin',
    professional: 'Profesional',
    member: 'Miembro',
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>
          Usuarios & Roles
        </h1>
        <p style={{ color: '#888888', fontSize: '14px' }}>
          Gestiona los usuarios y asigna roles de acceso
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {['all', 'admin', 'professional', 'member'].map((role) => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: filterRole === role ? '1px solid #d4af37' : '1px solid #333333',
              backgroundColor: filterRole === role ? 'rgba(212, 175, 55, 0.1)' : '#111111',
              color: filterRole === role ? '#d4af37' : '#888888',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
          >
            {role === 'all' ? 'Todos' : roleLabels[role] || role}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div style={{
        backgroundColor: '#111111',
        borderRadius: '16px',
        border: '1px solid #1a1a1a',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(212, 175, 55, 0.2)',
              borderTop: '3px solid #d4af37',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666666' }}>
            No hay usuarios con este filtro
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                <th style={{ padding: '16px', textAlign: 'left', color: '#888888', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Usuario</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#888888', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#888888', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Rol Actual</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#888888', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Cambiar Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#d4af37',
                        fontWeight: 600,
                        fontSize: '14px'
                      }}>
                        {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                      </div>
                      <div>
                        <div style={{ color: '#ffffff', fontWeight: 500, fontSize: '14px' }}>{user.full_name || 'Sin nombre'}</div>
                        <div style={{ color: '#666666', fontSize: '12px' }}>{user.phone || 'Sin teléfono'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#999999', fontSize: '14px' }}>{user.email}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: `${roleColors[user.role]}20`,
                      color: roleColors[user.role],
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={changingRole === user.id}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#0a0a0a',
                        border: '1px solid #333333',
                        color: '#ffffff',
                        fontSize: '13px',
                        cursor: changingRole === user.id ? 'not-allowed' : 'pointer',
                        opacity: changingRole === user.id ? 0.5 : 1
                      }}
                    >
                      <option value="member">Miembro</option>
                      <option value="professional">Profesional</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info */}
      <div style={{
        marginTop: '24px',
        padding: '16px 20px',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(212, 175, 55, 0.2)'
      }}>
        <p style={{ color: '#d4af37', fontSize: '13px', fontWeight: 600, margin: '0 0 8px 0' }}>
          ℹ️ Roles del Sistema
        </p>
        <p style={{ color: '#888888', fontSize: '12px', margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: '#ef4444' }}>Super Admin:</strong> Acceso total al sistema<br />
          <strong style={{ color: '#d4af37' }}>Admin:</strong> Gestiona usuarios, solicitudes y servicios<br />
          <strong style={{ color: '#3b82f6' }}>Profesional:</strong> Ve sus reservas y comisiones<br />
          <strong style={{ color: '#22c55e' }}>Miembro:</strong> Acceso al panel de miembro
        </p>
      </div>
    </div>
  );
}