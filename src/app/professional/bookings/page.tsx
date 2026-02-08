'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function ProfessionalBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const supabase = useMemo(() => getSupabase(), []);

  useEffect(() => {
    loadBookings();
  }, [filter, supabase]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('professional_profiles(id)')
        .eq('user_id', session.user.id)
        .single();

      const professionalId = profile?.professional_profiles?.[0]?.id;
      if (!professionalId) return;

      let query = supabase
        .from('bookings')
        .select(`
          *,
          service:services(name, duration_minutes),
          user:user_profiles(full_name, email, phone),
          location:locations(name)
        `)
        .eq('professional_id', professionalId)
        .order('start_datetime', { ascending: filter === 'upcoming' });

      if (filter === 'upcoming') {
        query = query.gte('start_datetime', new Date().toISOString());
      } else if (filter === 'past') {
        query = query.lt('start_datetime', new Date().toISOString());
      }

      const { data } = await query.limit(50);
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10B981';
      case 'completed': return '#3B82F6';
      case 'cancelled': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return 'rgba(255,255,255,0.5)';
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 300, color: 'rgba(255,255,255,0.95)' }}>
          Mis Reservas
        </h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['upcoming', 'past', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                background: filter === f ? 'rgba(242, 187, 106, 0.2)' : 'transparent',
                border: `1px solid ${filter === f ? '#F2BB6A' : 'rgba(255,255,255,0.2)'}`,
                color: filter === f ? '#F2BB6A' : 'rgba(255,255,255,0.6)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {f === 'upcoming' ? 'Próximas' : f === 'past' ? 'Pasadas' : 'Todas'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.5)' }}>
          Cargando reservas...
        </div>
      ) : bookings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 60,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(242, 187, 106, 0.1)',
          color: 'rgba(255,255,255,0.4)',
        }}>
          No tienes reservas {filter === 'upcoming' ? 'próximas' : filter === 'past' ? 'pasadas' : ''}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bookings.map((booking) => (
            <div key={booking.id} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(242, 187, 106, 0.15)',
              padding: 24,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: 24,
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>
                  {booking.user?.full_name || 'Cliente'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#F2BB6A', marginBottom: 8 }}>
                  {booking.service?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                  {booking.location?.name}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                  {formatDate(booking.start_datetime)}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                  {formatTime(booking.start_datetime)} - {formatTime(booking.end_datetime)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                  {booking.service?.duration_minutes} min
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  background: `${getStatusColor(booking.status)}20`,
                  border: `1px solid ${getStatusColor(booking.status)}40`,
                  color: getStatusColor(booking.status),
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                }}>
                  {booking.status}
                </span>
                {booking.bonos_charged > 0 && (
                  <div style={{ marginTop: 8, fontSize: '0.8rem', color: '#F2BB6A' }}>
                    {booking.bonos_charged} bonos
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}