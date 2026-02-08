'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function ProfessionalCommissions() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const supabase = useMemo(() => getSupabase(), []);

  useEffect(() => {
    loadCommissions();
  }, [selectedMonth, supabase]);

  const loadCommissions = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('professional_profiles(id, commission_rate)')
        .eq('user_id', session.user.id)
        .single();

      const professionalId = profile?.professional_profiles?.[0]?.id;
      if (!professionalId) return;

      const [year, month] = selectedMonth.split('-').map(Number);

      const { data } = await supabase
        .from('commission_records')
        .select(`
          *,
          booking:bookings(
            start_datetime,
            service:services(name, price),
            user:user_profiles(full_name)
          )
        `)
        .eq('professional_id', professionalId)
        .eq('period_year', year)
        .eq('period_month', month)
        .order('created_at', { ascending: false });

      setCommissions(data || []);

      const totalPending = data?.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commission_amount, 0) || 0;
      const totalPaid = data?.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commission_amount, 0) || 0;

      setSummary({
        baseRate: profile?.professional_profiles?.[0]?.commission_rate || 50,
        total: data?.length || 0,
        pending: totalPending,
        paid: totalPaid,
        totalEarned: totalPending + totalPaid
      });
    } catch (error) {
      console.error('Error loading commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
  };

  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 300, color: 'rgba(255,255,255,0.95)' }}>
          Mis Comisiones
        </h1>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            padding: '10px 16px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(242, 187, 106, 0.3)',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.9rem',
          }}
        >
          {getMonthOptions().map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(242, 187, 106, 0.15)',
            padding: 20,
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 300, color: '#10B981' }}>
              ${summary.totalEarned.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              Total del Mes
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(242, 187, 106, 0.15)',
            padding: 20,
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 300, color: '#F59E0B' }}>
              ${summary.pending.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              Pendiente de Pago
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(242, 187, 106, 0.15)',
            padding: 20,
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 300, color: '#3B82F6' }}>
              ${summary.paid.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              Ya Pagado
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(242, 187, 106, 0.15)',
            padding: 20,
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 300, color: 'rgba(255,255,255,0.7)' }}>
              {summary.total}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              Servicios Realizados
            </div>
          </div>
        </div>
      )}

      {/* Commission List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.5)' }}>
          Cargando...
        </div>
      ) : commissions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 60,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(242, 187, 106, 0.1)',
          color: 'rgba(255,255,255,0.4)',
        }}>
          No tienes comisiones registradas este mes
        </div>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(242, 187, 106, 0.15)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(242, 187, 106, 0.1)' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  FECHA
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  SERVICIO
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  CLIENTE
                </th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  PRECIO
                </th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  COMISIÓN
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  ESTADO
                </th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                    {c.booking?.start_datetime ? formatDate(c.booking.start_datetime) : '-'}
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: '#F2BB6A' }}>
                    {c.booking?.service?.name || 'Servicio'}
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                    {c.booking?.user?.full_name || 'Cliente'}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                    ${c.service_price?.toLocaleString() || 0}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontSize: '0.9rem', color: '#10B981', fontWeight: 500 }}>
                    ${c.commission_amount?.toLocaleString() || 0}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      background: c.status === 'paid' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      border: `1px solid ${c.status === 'paid' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                      color: c.status === 'paid' ? '#3B82F6' : '#F59E0B',
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                    }}>
                      {c.status === 'paid' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}