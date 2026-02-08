'use client';

import { useEffect, useState } from 'react';

interface Location {
  id: string;
  name: string;
  city: string;
  country: string;
}

interface Professional {
  id: string;
  user: {
    full_name: string;
    email: string;
  };
  specialty: string[];
}

interface ScheduledClass {
  day_of_week: number;
  start_time: string;
  end_time: string;
  location_id: string;
  max_participants?: number;
}

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  service_type: 'private_usage' | 'appointment' | 'class';
  duration_minutes: number;
  price_bonos: number;
  price_fiat: number;
  currency: string;
  is_active: boolean;
  max_participants: number;
  total_professionals: number;
  total_locations: number;
  total_scheduled_classes: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

const SERVICE_TYPES = [
  { value: 'private_usage', label: 'Uso Privado', description: 'Reserva de espacio sin profesional' },
  { value: 'appointment', label: 'Cita', description: 'Sesión 1:1 con profesional' },
  { value: 'class', label: 'Clase', description: 'Sesiones grupales programadas' },
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    service_type: 'appointment',
    duration_minutes: 60,
    price_bonos: 0,
    price_fiat: 0,
    max_participants: 1,
    professional_id: '',
    location_ids: [] as string[],
    scheduled_classes: [] as ScheduledClass[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sRes, lRes, pRes] = await Promise.all([
        fetch('/api/admin/services?include_inactive=true'),
        fetch('/api/locations'),
        fetch('/api/admin/professionals')
      ]);
      
      const sData = await sRes.json();
      const lData = await lRes.json();
      const pData = await pRes.json();
      
      if (sData.data) setServices(sData.data);
      if (lData.data) setLocations(lData.data);
      if (pData.data) setProfessionals(pData.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      service_type: 'appointment',
      duration_minutes: 60,
      price_bonos: 0,
      price_fiat: 0,
      max_participants: 1,
      professional_id: '',
      location_ids: [],
      scheduled_classes: [],
    });
    setError(null);
  };

  const toggleLocation = (id: string) => {
    setForm(prev => ({
      ...prev,
      location_ids: prev.location_ids.includes(id)
        ? prev.location_ids.filter(x => x !== id)
        : [...prev.location_ids, id]
    }));
  };

  const addScheduledClass = () => {
    if (form.location_ids.length === 0) {
      setError('Selecciona una sede primero');
      return;
    }
    setForm(prev => ({
      ...prev,
      scheduled_classes: [...prev.scheduled_classes, {
        day_of_week: 1,
        start_time: '09:00',
        end_time: '10:00',
        location_id: prev.location_ids[0],
        max_participants: prev.max_participants
      }]
    }));
  };

  const updateClass = (idx: number, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      scheduled_classes: prev.scheduled_classes.map((c, i) => 
        i === idx ? { ...c, [field]: value } : c
      )
    }));
  };

  const removeClass = (idx: number) => {
    setForm(prev => ({
      ...prev,
      scheduled_classes: prev.scheduled_classes.filter((_, i) => i !== idx)
    }));
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch('/api/admin/services', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !active })
    });
    fetchData();
  };

  const getTypeBadge = (type: string) => {
    const base = { padding: '4px 10px', fontSize: '11px', borderRadius: '6px', fontWeight: 600 };
    if (type === 'private_usage') return <span style={{ ...base, backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>Uso Privado</span>;
    if (type === 'appointment') return <span style={{ ...base, backgroundColor: 'rgba(212,175,55,0.15)', color: '#d4af37' }}>Cita</span>;
    if (type === 'class') return <span style={{ ...base, backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Clase</span>;
    return null;
  };

  const filtered = filterType ? services.filter(s => s.service_type === filterType) : services;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 48, height: 48, border: '4px solid rgba(212,175,55,0.2)', borderTop: '4px solid #d4af37', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Servicios</h1>
          <p style={{ fontSize: 14, color: '#666', margin: 0 }}>Gestiona los servicios por sede</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ backgroundColor: '#d4af37', color: '#0a0a0a', fontWeight: 600, borderRadius: 8, padding: '10px 20px', border: 'none', cursor: 'pointer' }}>
          + Nuevo Servicio
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total', value: services.length, color: '#fff' },
          { label: 'Citas', value: services.filter(s => s.service_type === 'appointment').length, color: '#d4af37' },
          { label: 'Clases', value: services.filter(s => s.service_type === 'class').length, color: '#22c55e' },
          { label: 'Uso Privado', value: services.filter(s => s.service_type === 'private_usage').length, color: '#3b82f6' },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: 16, padding: 20 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#666', textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {['', ...SERVICE_TYPES.map(t => t.value)].map(v => (
          <button key={v} onClick={() => setFilterType(v)} style={{
            padding: '8px 16px',
            backgroundColor: filterType === v ? '#d4af37' : '#1a1a1a',
            color: filterType === v ? '#0a0a0a' : '#999',
            border: '1px solid #333',
            borderRadius: 8,
            cursor: 'pointer'
          }}>
            {v === '' ? 'Todos' : SERVICE_TYPES.find(t => t.value === v)?.label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
        {filtered.map(service => (
          <div key={service.id} style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: 16, opacity: service.is_active ? 1 : 0.6 }}>
            <div style={{ padding: 20, borderBottom: '1px solid #222', background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(212,175,55,0.02) 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#fff' }}>{service.name}</h3>
                {getTypeBadge(service.service_type)}
              </div>
              {service.description && <p style={{ margin: 0, fontSize: 13, color: '#999' }}>{service.description.substring(0, 80)}...</p>}
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: '#666' }}>BONOS</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#d4af37' }}>{service.price_bonos}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: '#666' }}>CLP</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff' }}>${service.price_fiat?.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: '#666' }}>DURACIÓN</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff' }}>{service.duration_minutes}m</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#666' }}>📍 {service.total_locations || 0} sedes</span>
                <span style={{ fontSize: 12, color: '#666' }}>👤 {service.total_professionals || 0} profesionales</span>
                {service.service_type === 'class' && <span style={{ fontSize: 12, color: '#666' }}>📅 {service.total_scheduled_classes || 0} clases</span>}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => toggleActive(service.id, service.is_active)} style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                  backgroundColor: service.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                  border: `1px solid ${service.is_active ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                  color: service.is_active ? '#ef4444' : '#22c55e'
                }}>
                  {service.is_active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: 16, width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: 24, borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#111' }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#fff' }}>Nuevo Servicio</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} style={{ background: 'none', border: 'none', color: '#666', fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              {error && <div style={{ padding: 12, backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', marginBottom: 20, fontSize: 14 }}>{error}</div>}

              {/* Tipo */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#999', marginBottom: 8 }}>Tipo de Servicio *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {SERVICE_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => setForm(p => ({ ...p, service_type: t.value }))} style={{
                      padding: 16, textAlign: 'left', borderRadius: 8, cursor: 'pointer',
                      backgroundColor: form.service_type === t.value ? 'rgba(212,175,55,0.15)' : '#0a0a0a',
                      border: `1px solid ${form.service_type === t.value ? '#d4af37' : '#333'}`
                    }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: form.service_type === t.value ? '#d4af37' : '#fff' }}>{t.label}</p>
                      <p style={{ margin: 0, marginTop: 4, fontSize: 11, color: '#666' }}>{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#999', marginBottom: 8 }}>Nombre *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required style={{ width: '100%', padding: '12px 16px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }} />
              </div>

              {/* Descripción */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#999', marginBottom: 8 }}>Descripción</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} style={{ width: '100%', padding: '12px 16px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }} />
              </div>

              {/* Precios */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#999', marginBottom: 8 }}>Bonos *</label>
                  <input type="number" value={form.price_bonos} onChange={e => setForm(p => ({ ...p, price_bonos: Number(e.target.value) }))} min="0" required style={{ width: '100%', padding: '12px 16px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#999', marginBottom: 8 }}>CLP *</label>
                  <input type="number" value={form.price_fiat} onChange={e => setForm(p => ({ ...p, price_fiat: Number(e.target.value) }))} min="0" required style={{ width: '100%', padding: '12px 16px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#999', marginBottom: 8 }}>Duración (min)</label>
                  <input type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: Number(e.target.value) }))} min="15" step="15" style={{ width: '100%', padding: '12px 16px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }} />
                </div>
              </div>

              {/* Profesional */}
              {(form.service_type === 'appointment' || form.service_type === 'class') && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#999', marginBottom: 8 }}>Profesional *</label>
                  <select value={form.professional_id} onChange={e => setForm(p => ({ ...p, professional_id: e.target.value }))} required style={{ width: '100%', padding: '12px 16px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }}>
                    <option value="">Seleccionar...</option>
                    {professionals.map(pro => (
                      <option key={pro.id} value={pro.id}>{pro.user?.full_name || 'Sin nombre'}</option>
                    ))}
                  </select>
                  <p style={{ margin: 0, marginTop: 8, fontSize: 12, color: '#666' }}>
                    {form.service_type === 'appointment' ? 'Los horarios se basan en la disponibilidad del profesional.' : 'El profesional impartirá las clases.'}
                  </p>
                </div>
              )}

              {/* Sedes */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#999', marginBottom: 8 }}>Sedes *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {locations.map(loc => (
                    <button key={loc.id} type="button" onClick={() => toggleLocation(loc.id)} style={{
                      padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                      backgroundColor: form.location_ids.includes(loc.id) ? 'rgba(212,175,55,0.15)' : '#0a0a0a',
                      border: `1px solid ${form.location_ids.includes(loc.id) ? '#d4af37' : '#333'}`,
                      color: form.location_ids.includes(loc.id) ? '#d4af37' : '#999'
                    }}>
                      {loc.name} ({loc.city}, {loc.country || 'Chile'})
                    </button>
                  ))}
                </div>
              </div>

              {/* Clases programadas (solo para type === 'class') */}
              {form.service_type === 'class' && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 13, color: '#999' }}>Clases Programadas *</label>
                    <button type="button" onClick={addScheduledClass} style={{ padding: '6px 12px', backgroundColor: '#d4af37', color: '#0a0a0a', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>+ Agregar</button>
                  </div>
                  {form.scheduled_classes.map((cls, idx) => (
                    <div key={idx} style={{ padding: 16, backgroundColor: '#0a0a0a', borderRadius: 8, marginBottom: 8, border: '1px solid #222' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 4 }}>Día</label>
                          <select value={cls.day_of_week} onChange={e => updateClass(idx, 'day_of_week', Number(e.target.value))} style={{ width: '100%', padding: 8, backgroundColor: '#111', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 13 }}>
                            {DAYS_OF_WEEK.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 4 }}>Inicio</label>
                          <input type="time" value={cls.start_time} onChange={e => updateClass(idx, 'start_time', e.target.value)} style={{ width: '100%', padding: 8, backgroundColor: '#111', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 13 }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 4 }}>Fin</label>
                          <input type="time" value={cls.end_time} onChange={e => updateClass(idx, 'end_time', e.target.value)} style={{ width: '100%', padding: 8, backgroundColor: '#111', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 13 }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 4 }}>Sede</label>
                          <select value={cls.location_id} onChange={e => updateClass(idx, 'location_id', e.target.value)} style={{ width: '100%', padding: 8, backgroundColor: '#111', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 13 }}>
                            {form.location_ids.map(lid => {
                              const loc = locations.find(l => l.id === lid);
                              return <option key={lid} value={lid}>{loc?.name}</option>;
                            })}
                          </select>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeClass(idx)} style={{ marginTop: 8, padding: '4px 8px', backgroundColor: 'transparent', border: '1px solid #333', borderRadius: 4, color: '#ef4444', fontSize: 11, cursor: 'pointer' }}>Eliminar</button>
                    </div>
                  ))}
                  {form.scheduled_classes.length === 0 && <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Agrega al menos una clase programada</p>}
                </div>
              )}

              {/* Max participants for class */}
              {form.service_type === 'class' && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#999', marginBottom: 8 }}>Máx. Participantes por Clase</label>
                  <input type="number" value={form.max_participants} onChange={e => setForm(p => ({ ...p, max_participants: Number(e.target.value) }))} min="1" style={{ width: 120, padding: '12px 16px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }} />
                </div>
              )}

              {/* Submit */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ flex: 1, padding: '12px 20px', backgroundColor: 'transparent', border: '1px solid #333', borderRadius: 8, color: '#999', fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '12px 20px', backgroundColor: '#d4af37', border: 'none', borderRadius: 8, color: '#0a0a0a', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: isSubmitting ? 0.6 : 1 }}>
                  {isSubmitting ? 'Creando...' : 'Crear Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}