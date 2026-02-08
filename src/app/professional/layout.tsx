'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function ProfessionalLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => getSupabase(), []);

  useEffect(() => {
    checkAuth();
  }, [supabase]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*, professional_profiles(*)')
      .eq('user_id', session.user.id)
      .single();

    if (!profile || profile.role !== 'professional') {
      router.push('/login');
      return;
    }

    setUser({ ...session.user, profile });
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1a1816 0%, #0d0c0b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          border: '2px solid rgba(242, 187, 106, 0.2)',
          borderTopColor: '#F2BB6A',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  const navItems = [
    { href: '/professional', label: 'Dashboard', icon: '📊' },
    { href: '/professional/bookings', label: 'Mis Reservas', icon: '📅' },
    { href: '/professional/commissions', label: 'Comisiones', icon: '💰' },
    { href: '/professional/schedule', label: 'Horarios', icon: '🕐' },
    { href: '/professional/profile', label: 'Mi Perfil', icon: '👤' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0c0b' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 70 : 260,
        background: 'linear-gradient(180deg, rgba(26, 24, 22, 0.95) 0%, rgba(13, 12, 11, 0.98) 100%)',
        borderRight: '1px solid rgba(242, 187, 106, 0.1)',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '24px 16px' : '24px',
          borderBottom: '1px solid rgba(242, 187, 106, 0.1)',
        }}>
          <Link href="/professional" style={{ textDecoration: 'none' }}>
            <div style={{
              fontSize: collapsed ? '1rem' : '1.25rem',
              fontWeight: 300,
              letterSpacing: '0.3em',
              color: '#F2BB6A',
              textAlign: 'center',
            }}>
              {collapsed ? 'H' : 'HALTERE'}
            </div>
            {!collapsed && (
              <div style={{
                fontSize: '0.6rem',
                letterSpacing: '0.2em',
                color: 'rgba(255,255,255,0.4)',
                textAlign: 'center',
                marginTop: 4,
              }}>
                PANEL PROFESIONAL
              </div>
            )}
          </Link>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '14px 20px' : '14px 24px',
                color: isActive ? '#F2BB6A' : 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                background: isActive ? 'rgba(242, 187, 106, 0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid #F2BB6A' : '3px solid transparent',
                transition: 'all 0.2s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}>
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                {!collapsed && (
                  <span style={{
                    fontSize: '0.85rem',
                    letterSpacing: '0.05em',
                  }}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div style={{
          padding: collapsed ? '16px' : '20px 24px',
          borderTop: '1px solid rgba(242, 187, 106, 0.1)',
        }}>
          {!collapsed && (
            <div style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 8,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.profile?.full_name || user?.email}
            </div>
          )}
          <button onClick={handleLogout} style={{
            width: '100%',
            padding: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#EF4444',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            {collapsed ? '🚪' : 'Cerrar Sesión'}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          position: 'absolute',
          right: -12,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#1a1816',
          border: '1px solid rgba(242, 187, 106, 0.3)',
          color: '#F2BB6A',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
        }}>
          {collapsed ? '→' : '←'}
        </button>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: collapsed ? 70 : 260,
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        background: '#0d0c0b',
      }}>
        {children}
      </main>
    </div>
  );
}