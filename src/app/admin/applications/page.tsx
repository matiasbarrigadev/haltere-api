'use client';

import { useEffect, useState } from 'react';

interface Application {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  member_status: string;
  created_at: string;
  technogym_user_id?: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/admin/members?status=pending_approval');
      const data = await res.json();
      setApplications(data.members || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });

      if (res.ok) {
        // Remove from list
        setApplications((prev) => prev.filter((app) => app.user_id !== userId));
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Error al procesar la solicitud');
    } finally {
      setActionLoading(null);
    }
  };

  const createTechnogymUser = async (app: Application) => {
    setActionLoading(app.user_id);
    try {
      const res = await fetch('/api/technogym/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: app.user_id,
          email: `${app.user_id}@haltere.club`, // In production, get real email
          fullName: app.full_name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Usuario Technogym creado: ${data.technogymUserId}`);
        fetchApplications(); // Refresh
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'No se pudo crear usuario Technogym'}`);
      }
    } catch (error) {
      console.error('Error creating Technogym user:', error);
      alert('Error al crear usuario en Technogym');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#d4af37]">Cargando solicitudes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white tracking-wide">
            Solicitudes de Membresía
          </h1>
          <p className="text-[#666] mt-1">
            {applications.length} solicitudes pendientes
          </p>
        </div>
      </div>

      {/* Applications List */}
      {applications.length > 0 ? (
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#0a0a0a]">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#666]">
                  Nombre
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#666]">
                  Teléfono
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#666]">
                  Fecha
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#666]">
                  Technogym
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-[#666]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app.id}
                  className="border-t border-[#222] hover:bg-[#1a1a1a] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] font-medium">
                        {app.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-white">{app.full_name || 'Sin nombre'}</p>
                        <p className="text-[#666] text-xs">ID: {app.user_id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#999]">
                    {app.phone || 'No registrado'}
                  </td>
                  <td className="px-6 py-4 text-[#999]">
                    {new Date(app.created_at).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-6 py-4">
                    {app.technogym_user_id ? (
                      <span className="px-2 py-1 text-xs bg-green-500/10 text-green-400 rounded">
                        Vinculado
                      </span>
                    ) : (
                      <button
                        onClick={() => createTechnogymUser(app)}
                        disabled={actionLoading === app.user_id}
                        className="px-2 py-1 text-xs bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === app.user_id ? 'Creando...' : 'Crear cuenta'}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleAction(app.user_id, 'approve')}
                        disabled={actionLoading === app.user_id}
                        className="px-4 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50 text-sm"
                      >
                        {actionLoading === app.user_id ? '...' : 'Aprobar'}
                      </button>
                      <button
                        onClick={() => handleAction(app.user_id, 'reject')}
                        disabled={actionLoading === app.user_id}
                        className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 text-sm"
                      >
                        {actionLoading === app.user_id ? '...' : 'Rechazar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl text-white mb-2">
            No hay solicitudes pendientes
          </h3>
          <p className="text-[#666]">
            Todas las solicitudes han sido procesadas
          </p>
        </div>
      )}

      {/* Help */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h3 className="text-white font-medium mb-3">💡 Proceso de aprobación</h3>
        <ol className="text-[#666] text-sm space-y-2 list-decimal list-inside">
          <li>Revisa los datos del solicitante</li>
          <li><strong>Crear cuenta Technogym</strong> (opcional) - Crea perfil en Mywellness</li>
          <li><strong>Aprobar</strong> - Activa la membresía del usuario</li>
          <li>El usuario recibirá acceso a la app y podrá agendar sesiones</li>
        </ol>
      </div>
    </div>
  );
}