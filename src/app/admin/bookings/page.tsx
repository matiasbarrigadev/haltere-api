'use client';

import { useEffect, useState } from 'react';

interface Booking {
  id: string;
  booking_number: string;
  start_datetime: string;
  end_datetime: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show';
  payment_method: string;
  bonos_charged: number;
  fiat_charged: number;
  notes: string | null;
  created_at: string;
  user: { id: string; full_name: string; email: string; phone: string | null } | null;
  service: { id: string; name: string; price_bonos: number; price_fiat: number } | null;
  location: { id: string; name: string } | null;
  zone: { id: string; name: string; zone_type: string } | null;
  professional: { id: string; user: { full_name: string } | null } | null;
}

interface Options {
  services: { id: string; name: string; price_bonos: number; price_fiat: number; duration_minutes: number }[];
  locations: { id: string; name: string }[];
  zones: { id: string; name: string; location_id: string }[];
  professionals: { id: string; user: { full_name: string } | null }[];
  users: { id: string; full_name: string; email: string }[];
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [options, setOptions] = useState<Options | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    userId: '',
    serviceId: '',
    locationId: '',
    zoneId: '',
    professionalId: '',
    startDatetime: '',
    paymentMethod: 'free',
    notes: ''
  });

  useEffect(() => {
    fetchBookings();
    fetchOptions();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const res = await fetch('/api/admin/bookings?type=options');
      const data = await res.json();
      setOptions(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSave = async () => {
    if (!form.userId || !form.serviceId || !form.locationId || !form.zoneId || !form.startDatetime) {
      setError('Complete todos los campos requeridos');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const service = options?.services.find(s => s.id === form.serviceId);
      const endDatetime = new Date(new Date(form.startDatetime).getTime() + (service?.duration_minutes || 60) * 60000).toISOString();

      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          endDatetime
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowModal(false);
      setForm({ userId: '', serviceId: '', locationId: '', zoneId: '', professionalId: '', startDatetime: '', paymentMethod: 'free', notes: '' });
      fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear');
    } finally {
      setSaving(false);
    }
  };

  const filteredBookings = bookings.filter((b) => filter === 'all' || b.status === filter);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      confirmed: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', label: 'Confirmada' },
      pending: { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', label: 'Pendiente' },
      cancelled: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Cancelada' },
      completed: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'Completada' },
      no_show: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', label: 'No asistió' }
    };
    const s = styles[status] || styles.pending;
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
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', margin: 0, marginBottom: '4px' }}>Reservas</h1>
          <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>Gestiona las reservas del club</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ backgroundColor: '#d4af37', color: '#0a0a0a', fontWeight: 600, borderRadius: '8px', padding: '10px 20px', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
          + Nueva Reserva
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total', value: stats.total, color: '#ffffff' },
          { label: 'Confirmadas', value: stats.confirmed, color: '#22c55e' },
          { label: 'Pendientes', value: stats.pending, color: '#eab308' },
          { label: 'Canceladas', value: stats.cancelled, color: '#ef4444' }
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '16px', padding: '20px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#666666', textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['all', 'confirmed', 'pending', 'cancelled'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '10px 16px', fontSize: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer',
            backgroundColor: filter === f ? 'rgba(212, 175, 55, 0.15)' : '#111111', color: filter === f ? '#d4af37' : '#666666'
          }}>
            {f === 'all' ? 'Todas' : f === 'confirmed' ? 'Confirmadas' : f === 'pending' ? 'Pendientes' : 'Canceladas'}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '16px', overflow: 'hidden' }}>
        {filteredBookings.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #222222' }}>
                <th style={{ padding: '16px', textAlign: 'left', color: '#666666', fontSize: '12px', textTransform: 'uppercase' }}>Cliente</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#666666', fontSize: '12px', textTransform: 'uppercase' }}>Servicio</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#666666', fontSize: '12px', textTransform: 'uppercase' }}>Fecha/Hora</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#666666', fontSize: '12px', textTransform: 'uppercase' }}>Sede</th>
                <th style={{ padding: '16px', textAlign: 'center', color: '#666666', fontSize: '12px', textTransform: 'uppercase' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontWeight: 600 }}>
                        {booking.user?.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div style={{ color: '#ffffff', fontWeight: 500 }}>{booking.user?.full_name || 'N/A'}</div>
                        <div style={{ color: '#666666', fontSize: '12px' }}>{booking.booking_number}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#ffffff' }}>{booking.service?.name || 'N/A'}</td>
                  <td style={{ padding: '16px', color: '#ffffff' }}>
                    {new Date(booking.start_datetime).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} · {new Date(booking.start_datetime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '16px', color: '#999999' }}>{booking.location?.name || 'N/A'}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>{getStatusBadge(booking.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '64px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
            <h3 style={{ fontSize: '20px', color: '#ffffff', margin: 0, marginBottom: '8px' }}>No hay reservas</h3>
            <p style={{ color: '#666666', margin: 0 }}>No se encontraron reservas con este filtro</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && options && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#111111', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Nueva Reserva</h2>

            {error && <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Cliente *</label>
              <select value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} style={{ width: '100%', padding: '12px', backgroundColor: '#0a0a0a', border: '1px solid #333333', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }}>
                <option value="">Seleccionar...</option>
                {options.users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Servicio *</label>
              <select value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })} style={{ width: '100%', padding: '12px', backgroundColor: '#0a0a0a', border: '1px solid #333333', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }}>
                <option value="">Seleccionar...</option>
                {options.services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.price_bonos} bonos)</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Sede *</label>
                <select value={form.locationId} onChange={e => { setForm({ ...form, locationId: e.target.value, zoneId: '' }); }} style={{ width: '100%', padding: '12px', backgroundColor: '#0a0a0a', border: '1px solid #333333', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }}>
                  <option value="">Seleccionar...</option>
                  {options.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Zona *</label>
                <select value={form.zoneId} onChange={e => setForm({ ...form, zoneId: e.target.value })} style={{ width: '100%', padding: '12px', backgroundColor: '#0a0a0a', border: '1px solid #333333', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }}>
                  <option value="">Seleccionar...</option>
                  {options.zones.filter(z => z.location_id === form.locationId).map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Fecha y Hora *</label>
              <input type="datetime-local" value={form.startDatetime} onChange={e => setForm({ ...form, startDatetime: e.target.value })} style={{ width: '100%', padding: '12px', backgroundColor: '#0a0a0a', border: '1px solid #333333', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Profesional (opcional)</label>
              <select value={form.professionalId} onChange={e => setForm({ ...form, professionalId: e.target.value })} style={{ width: '100%', padding: '12px', backgroundColor: '#0a0a0a', border: '1px solid #333333', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }}>
                <option value="">Sin profesional</option>
                {options.professionals.map(p => <option key={p.id} value={p.id}>{p.user?.full_name || 'N/A'}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#888888', fontSize: '13px', marginBottom: '8px' }}>Método de Pago</label>
              <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} style={{ width: '100%', padding: '12px', backgroundColor: '#0a0a0a', border: '1px solid #333333', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }}>
                <option value="free">Gratis (cortesía)</option>
                <option value="bonos">Bonos</option>
                <option value="fiat">Efectivo/Tarjeta</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '12px 24px', backgroundColor: 'transparent', border: '1px solid #333333', borderRadius: '8px', color: '#999999', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '12px 24px', backgroundColor: '#d4af37', border: 'none', borderRadius: '8px', color: '#0a0a0a', fontWeight: 600, cursor: 'pointer', fontSize: '14px', opacity: saving ? 0.5 : 1 }}>
                {saving ? 'Creando...' : 'Crear Reserva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}