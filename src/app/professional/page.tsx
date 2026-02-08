'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function ProfessionalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => getSupabase(), []);

  useEffect(() => {
    loadDashboard();
  }, [supabase]);

  const loadDashboard = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*, professional_profiles(*)')
        .eq('user_id', session.user.id)
        .single();

      const professionalId = profile?.professional_profiles?.[0]?.id;
      if (!professionalId) return;

      // Get today's bookings
      const today = new Date().toISOString().split('T')[0];
      const { data: todayBookings } = await supabase
        .from('bookings')
        .select('*, service:services(name), user:user_profiles(full_name)')
        .eq('professional_id', professionalId)
        .gte('start_datetime', today)
        .lt('start_datetime', today + 'T23:59:59')
        .order('start_datetime');

      // Get upcoming bookings
      const { data: upcomingBookings } = await supabase
        .from('bookings')
        .select('*, service:services(name), user:user_profiles(full_name)')
        .eq('professional_id', professionalId)
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime')
        .limit(5);

      // Get commission summary (this month)
      const thisMonth = new Date();
      const { data: commissions } = await supabase
        .from('commission_records')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('period_year', thisMonth.getFullYear())
        .eq('period_month', thisMonth.getMonth() + 1);

      const totalPending = commissions?.filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;
      const totalPaid = commissions?.filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;

      setData({
        profile,
        professional: profile?.professional_profiles?.[0],
        todayBookings: todayBookings || [],
        upcomingBookings: upcomingBookings || [],
        commissions: {
          pending: totalPending,
          paid: totalPaid,
          total: commissions?.length || 0
        }
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)' }}>Cargando...</div>
      </div>
    );
  }

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div style={{ padding: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 300,
          color: 'rgba(255,255,255,0.95)',
          marginBottom: 8,
        }}>
          Bienvenido, {data?.profile?.full_name?.split(' ')[0] || 'Profesional'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
          {data?.professional?.specialty || 'Especialidad no definida'}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
        marginBottom: 40,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(242, 187, 106, 0.15)',
          padding: 24,
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 300, color: '#F2BB6A' }}>
            {data?.todayBookings?.length || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            Sesiones Hoy
          </div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(242, 187, 106, 0.15)',
          padding: 24,
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 300, color: '#10B981' }}>
            ${data?.commissions?.pending?.toLocaleString() || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            Comisiones Pendientes
          </div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(242, 187, 106, 0.15)',
          padding: 24,
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 300, color: 'rgba(255,255,255,0.7)' }}>
            {data?.commissions?.total || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            Servicios Este Mes
          </div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(242, 187, 106, 0.15)',
          padding: 24,
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 300, color: '#3B82F6' }}>
            {data?.professional?.commission_rate || 50}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            Tu Comisión Base
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Today's Schedule */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(242, 187, 106, 0.15)',
          padding: 24,
        }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            📅 Agenda de Hoy
          </h2>

          {data?.todayBookings?.length === 0 ? (
            <div style={{
              padding: 40,
              textAlign: 'center',
              color: 'rgba(255,255,255,0.4)',
            }}>
              No tienes sesiones programadas para hoy
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data?.todayBookings?.map((booking: any) => (
                <div key={booking.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(242, 187, 106, 0.05)',
                  border: '1px solid rgba(242, 187, 106, 0.1)',
                }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
                      {booking.user?.full_name || 'Cliente'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                      {booking.service?.name}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: '#F2BB6A',
                  }}>
                    {formatTime(booking.start_datetime)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(242, 187, 106, 0.15)',
          padding: 24,
        }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            🔜 Próximas Sesiones
          </h2>

          {data?.upcomingBookings?.length === 0 ? (
            <div style={{
              padding: 40,
              textAlign: 'center',
              color: 'rgba(255,255,255,0.4)',
            }}>
              No tienes sesiones próximas
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data?.upcomingBookings?.map((booking: any) => (
                <div key={booking.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
                      {booking.user?.full_name || 'Cliente'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                      {booking.service?.name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: '#F2BB6A' }}>
                      {formatDate(booking.start_datetime)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                      {formatTime(booking.start_datetime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}