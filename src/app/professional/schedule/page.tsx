'use client';

import { useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getSupabase = (): SupabaseClient | null => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
};

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location_id: string;
  location_name?: string;
  is_active: boolean;
}

interface TimeBlock {
  id: string;
  start_datetime: string;
  end_datetime: string;
  block_type: string;
  reason: string | null;
}

interface UpcomingBooking {
  id: string;
  booking_number: string;
  start_datetime: string;
  end_datetime: string;
  service_name: string;
  client_name: string;
  location_name: string;
  status: string;
}

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const blockTypeLabels: Record<string, { label: string; color: string; icon: string }> = {
  personal: { label: 'Personal', color: '#8b5cf6', icon: '🏠' },
  vacation: { label: 'Vacaciones', color: '#22c55e', icon: '🏖️' },
  sick: { label: 'Enfermedad', color: '#ef4444', icon: '🤒' },
  other: { label: 'Otro', color: '#6b7280', icon: '📅' },
};

export default function ProfessionalSchedulePage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  useEffect(() => {
    const client = getSupabase();
    if (client) setSupabase(client);
  }, []);

  useEffect(() => {
    if (supabase) {
      loadData();
    }
  }, [supabase]);

  const loadData = async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get professional profile
      const { data: profile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      setProfessionalId(profile.id);

      // Load availability with locations
      const { data: availData } = await supabase
        .from('professional_availability')
        .select(`
          id,
          day_of_week,
          start_time,
          end_time,
          location_id,
          is_active,
          locations(name)
        `)
        .eq('professional_id', profile.id)
        .order('day_of_week')
        .order('start_time');

      if (availData) {
        setAvailability(availData.map((a: any) => ({
          ...a,
          location_name: a.locations?.name || 'Sin ubicación'
        })));
      }

      // Load time blocks (next 30 days)
      const now = new Date();
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const { data: blocksData } = await supabase
        .from('professional_time_blocks')
        .select('*')
        .eq('professional_id', profile.id)
        .gte('start_datetime', now.toISOString())
        .lte('start_datetime', thirtyDaysLater.toISOString())
        .order('start_datetime');

      if (blocksData) {
        setTimeBlocks(blocksData);
      }

      // Load upcoming bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_number,
          start_datetime,
          end_datetime,
          status,
          services(name),
          user_profiles(full_name),
          locations(name)
        `)
        .eq('professional_id', profile.id)
        .gte('start_datetime', now.toISOString())
        .in('status', ['confirmed', 'pending'])
        .order('start_datetime')
        .limit(10);

      if (bookingsData) {
        setUpcomingBookings(bookingsData.map((b: any) => ({
          id: b.id,
          booking_number: b.booking_number,
          start_datetime: b.start_datetime,
          end_datetime: b.end_datetime,
          service_name: b.services?.name || 'Servicio',
          client_name: b.user_profiles?.full_name || 'Cliente',
          location_name: b.locations?.name || 'Ubicación',
          status: b.status,
        })));
      }

    } catch (error) {
      console.error('Error loading schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoy ${date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Mañana ${date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getAvailabilityByDay = () => {
    const byDay: Record<number, AvailabilitySlot[]> = {};
    availability.forEach(slot => {
      if (!byDay[slot.day_of_week]) byDay[slot.day_of_week] = [];
      byDay[slot.day_of_week].push(slot);
    });
    return byDay;
  };

  const calculateStats = () => {
    const totalHoursPerWeek = availability
      .filter(a => a.is_active)
      .reduce((acc, slot) => {
        const start = new Date(`2000-01-01T${slot.start_time}`);
        const end = new Date(`2000-01-01T${slot.end_time}`);
        return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0);

    const bookingsThisWeek = upcomingBookings.filter(b => {
      const bookingDate = new Date(b.start_datetime);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return bookingDate >= now && bookingDate <= weekFromNow;
    }).length;

    const blocksThisMonth = timeBlocks.length;

    return { totalHoursPerWeek, bookingsThisWeek, blocksThisMonth };
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d0c0b',
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '3px solid rgba(242, 187, 106, 0.2)',
          borderTopColor: '#F2BB6A',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const availabilityByDay = getAvailabilityByDay();
  const stats = calculateStats();

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>
          🕐 Mis Horarios
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>
          Gestiona tu disponibilidad semanal y bloqueos de tiempo
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {[
          { label: 'Horas/Semana', value: Math.round(stats.totalHoursPerWeek), icon: '⏰', color: '#F2BB6A' },
          { label: 'Citas esta semana', value: stats.bookingsThisWeek, icon: '📅', color: '#3b82f6' },
          { label: 'Bloqueos próximos', value: stats.blocksThisMonth, icon: '🚫', color: '#ef4444' },
          { label: 'Días con horario', value: Object.keys(availabilityByDay).length, icon: '✅', color: '#22c55e' },
        ].map((stat, i) => (
          <div key={i} style={{
            backgroundColor: '#111111',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(242, 187, 106, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: `${stat.color}15`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>{stat.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
      }}>
        {/* Weekly Availability */}
        <div style={{
          backgroundColor: '#111111',
          borderRadius: '20px',
          border: '1px solid rgba(242, 187, 106, 0.1)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(242, 187, 106, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>📆</span>
              <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>Disponibilidad Semanal</span>
            </div>
          </div>
          <div style={{ padding: '16px' }}>
            {[1, 2, 3, 4, 5, 6, 0].map(day => {
              const slots = availabilityByDay[day] || [];
              const isExpanded = selectedDay === day;
              
              return (
                <div key={day} style={{
                  marginBottom: '8px',
                  backgroundColor: '#0a0a0a',
                  borderRadius: '12px',
                  border: slots.length > 0 ? '1px solid rgba(242, 187, 106, 0.2)' : '1px solid #1a1a1a',
                  overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setSelectedDay(isExpanded ? null : day)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: slots.length > 0 ? '#22c55e' : '#4a4a4a',
                      }} />
                      <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>
                        {dayNames[day]}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {slots.length > 0 && (
                        <span style={{
                          backgroundColor: 'rgba(242, 187, 106, 0.2)',
                          color: '#F2BB6A',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: '6px',
                        }}>
                          {slots.length} {slots.length === 1 ? 'horario' : 'horarios'}
                        </span>
                      )}
                      <span style={{
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '12px',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.2s',
                      }}>
                        ▼
                      </span>
                    </div>
                  </button>
                  
                  {isExpanded && slots.length > 0 && (
                    <div style={{ padding: '0 16px 16px' }}>
                      {slots.map(slot => (
                        <div key={slot.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px',
                          backgroundColor: '#111111',
                          borderRadius: '8px',
                          marginTop: '8px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: '#F2BB6A', fontSize: '14px', fontWeight: 600 }}>
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px' }}>📍</span>
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                              {slot.location_name}
                            </span>
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: slot.is_active ? '#22c55e' : '#ef4444',
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {isExpanded && slots.length === 0 && (
                    <div style={{ padding: '0 16px 16px' }}>
                      <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '13px',
                      }}>
                        Sin horarios configurados para este día
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Upcoming Bookings */}
          <div style={{
            backgroundColor: '#111111',
            borderRadius: '20px',
            border: '1px solid rgba(242, 187, 106, 0.1)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(242, 187, 106, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span style={{ fontSize: '20px' }}>📅</span>
              <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>Próximas Citas</span>
            </div>
            <div style={{ padding: '16px', maxHeight: '300px', overflowY: 'auto' }}>
              {upcomingBookings.length === 0 ? (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.4)',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
                  <div>No tienes citas próximas</div>
                </div>
              ) : (
                upcomingBookings.map(booking => (
                  <div key={booking.id} style={{
                    padding: '14px',
                    backgroundColor: '#0a0a0a',
                    borderRadius: '12px',
                    marginBottom: '10px',
                    border: '1px solid #1a1a1a',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>
                          {booking.service_name}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px' }}>
                          con {booking.client_name}
                        </div>
                      </div>
                      <span style={{
                        backgroundColor: booking.status === 'confirmed' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(242, 187, 106, 0.2)',
                        color: booking.status === 'confirmed' ? '#22c55e' : '#F2BB6A',
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}>
                        {booking.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px' }}>🕐</span>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                          {formatDateTime(booking.start_datetime)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px' }}>📍</span>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                          {booking.location_name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Time Blocks */}
          <div style={{
            backgroundColor: '#111111',
            borderRadius: '20px',
            border: '1px solid rgba(242, 187, 106, 0.1)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(242, 187, 106, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span style={{ fontSize: '20px' }}>🚫</span>
              <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>Bloqueos de Tiempo</span>
            </div>
            <div style={{ padding: '16px' }}>
              {timeBlocks.length === 0 ? (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.4)',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>✨</div>
                  <div>No tienes bloqueos programados</div>
                </div>
              ) : (
                timeBlocks.map(block => {
                  const typeInfo = blockTypeLabels[block.block_type] || blockTypeLabels.other;
                  return (
                    <div key={block.id} style={{
                      padding: '14px',
                      backgroundColor: '#0a0a0a',
                      borderRadius: '12px',
                      marginBottom: '10px',
                      border: '1px solid #1a1a1a',
                      borderLeft: `3px solid ${typeInfo.color}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{typeInfo.icon}</span>
                        <span style={{ color: typeInfo.color, fontSize: '13px', fontWeight: 600 }}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                        {new Date(block.start_datetime).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {' - '}
                        {new Date(block.end_datetime).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                      {block.reason && (
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '6px' }}>
                          {block.reason}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}