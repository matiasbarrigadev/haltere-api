'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const ADMIN_PASSWORD = 'haltere2026';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('haltere_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else if (pathname !== '/admin/login') {
      router.push('/admin/login');
    }
    setIsLoading(false);
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(212, 175, 55, 0.2)',
          borderTop: '4px solid #d4af37',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/applications', label: 'Solicitudes', icon: '📝', badge: 3 },
    { href: '/admin/members', label: 'Miembros', icon: '👥' },
    { href: '/admin/professionals', label: 'Profesionales', icon: '💼' },
    { href: '/admin/services', label: 'Servicios', icon: '🎯' },
    { href: '/admin/bookings', label: 'Reservas', icon: '📅', badge: 6 },
    { href: '/admin/locations', label: 'Sedes', icon: '🏢' },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('haltere_admin_auth');
    router.push('/admin/login');
  };

  const getNavItemStyle = (item: NavItem): React.CSSProperties => {
    const isActive = pathname === item.href;
    const isHovered = hoveredItem === item.href;

    return {
      display: 'flex',
      alignItems: 'center',
      gap: isSidebarCollapsed ? '0' : '12px',
      justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
      padding: isSidebarCollapsed ? '14px' : '14px 16px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
      position: 'relative',
      backgroundColor: isActive 
        ? 'rgba(212, 175, 55, 0.15)' 
        : isHovered 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'transparent',
      border: isActive 
        ? '1px solid rgba(212, 175, 55, 0.3)' 
        : '1px solid transparent',
      color: isActive ? '#d4af37' : isHovered ? '#ffffff' : '#888888',
    };
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: isSidebarCollapsed ? '80px' : '260px',
        backgroundColor: '#0d0d0d',
        borderRight: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'relative',
      }}>
        {/* Logo Header */}
        <div style={{
          padding: isSidebarCollapsed ? '24px 16px' : '24px',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
        }}>
          <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #d4af37 0%, #b8963a 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
            }}>
              🏋️
            </div>
            {!isSidebarCollapsed && (
              <div>
                <div style={{
                  color: '#d4af37',
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  fontFamily: 'system-ui'
                }}>
                  HALTERE
                </div>
                <div style={{ color: '#666666', fontSize: '11px', letterSpacing: '1px' }}>
                  ADMIN PANEL
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          style={{
            position: 'absolute',
            right: '-14px',
            top: '70px',
            width: '28px',
            height: '28px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#888888',
            fontSize: '12px',
            zIndex: 10,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2a2a2a';
            e.currentTarget.style.color = '#d4af37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1a1a1a';
            e.currentTarget.style.color = '#888888';
          }}
        >
          {isSidebarCollapsed ? '→' : '←'}
        </button>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {!isSidebarCollapsed && (
            <div style={{
              color: '#555555',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '8px 16px',
              marginBottom: '8px'
            }}>
              Menú Principal
            </div>
          )}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    style={getNavItemStyle(item)}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span style={{ 
                      fontSize: '18px',
                      width: '24px',
                      textAlign: 'center',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && (
                      <>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: isActive ? 600 : 400,
                          flex: 1
                        }}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span style={{
                            backgroundColor: isActive ? '#d4af37' : '#333333',
                            color: isActive ? '#0a0a0a' : '#999999',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            minWidth: '20px',
                            textAlign: 'center'
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {isSidebarCollapsed && item.badge && (
                      <span style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#d4af37',
                        borderRadius: '50%'
                      }} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div style={{ 
            height: '1px', 
            backgroundColor: '#1a1a1a', 
            margin: '16px 0' 
          }} />

          {/* Quick Stats (only when expanded) */}
          {!isSidebarCollapsed && (
            <div style={{
              backgroundColor: '#111111',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #1a1a1a'
            }}>
              <div style={{ 
                color: '#666666', 
                fontSize: '11px', 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px'
              }}>
                Resumen Rápido
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Hoy', value: '12', color: '#22c55e' },
                  { label: 'Pendientes', value: '3', color: '#eab308' },
                ].map((stat, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#888888', fontSize: '13px' }}>{stat.label}</span>
                    <span style={{ color: stat.color, fontWeight: 600, fontSize: '14px' }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User Section */}
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid #1a1a1a',
        }}>
          {!isSidebarCollapsed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#111111',
              borderRadius: '12px',
              marginBottom: '12px',
              border: '1px solid #1a1a1a'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d4af37',
                fontWeight: 600,
                fontSize: '14px'
              }}>
                A
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: 500 }}>Admin</div>
                <div style={{ color: '#666666', fontSize: '11px' }}>Administrador</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: isSidebarCollapsed ? '0' : '12px',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '14px' : '14px 16px',
              borderRadius: '12px',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              color: '#888888',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.color = '#888888';
            }}
          >
            <span style={{ fontSize: '18px' }}>🚪</span>
            {!isSidebarCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>

        {/* Version */}
        {!isSidebarCollapsed && (
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #1a1a1a',
            textAlign: 'center'
          }}>
            <span style={{ color: '#444444', fontSize: '11px' }}>v1.0.0 • Haltere Club</span>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', backgroundColor: '#0a0a0a' }}>
        {children}
      </main>
    </div>
  );
}