'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

interface UserSession {
  id: string;
  email: string;
  full_name: string;
  role: string;
  member_status: string;
  bonus_balance: number;
}

interface RoleOption {
  role: string;
  label: string;
  icon: string;
  href: string;
}

const roleOptions: RoleOption[] = [
  { role: 'member', label: 'Miembro', icon: '👤', href: '/member' },
  { role: 'professional', label: 'Profesional', icon: '💼', href: '/professional' },
  { role: 'admin', label: 'Admin', icon: '🔐', href: '/admin' },
];

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const userSession = sessionStorage.getItem('haltere_user_session');
    if (userSession) {
      setUser(JSON.parse(userSession));
    } else if (pathname !== '/member/login') {
      router.push('/member/login');
    }
    setIsLoading(false);
  }, [pathname, router]);

  if (pathname === '/member/login') {
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

  if (!user) {
    return null;
  }

  const navItems: NavItem[] = [
    { href: '/member', label: 'Mi Panel', icon: '🏠' },
    { href: '/member/bookings', label: 'Mis Citas', icon: '📅', badge: 2 },
    { href: '/member/wallet', label: 'Mi Wallet', icon: '💰' },
    { href: '/member/bonos', label: 'Comprar Bonos', icon: '🎟️' },
    { href: '/member/technogym', label: 'Mis Resultados', icon: '📊' },
    { href: '/member/schedule', label: 'Agendar', icon: '➕' },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('haltere_user_session');
    router.push('/member/login');
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
        width: isSidebarCollapsed ? '80px' : '280px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: '#0d0d0d',
        borderRight: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
      }}>
        {/* Logo Header */}
        <div style={{
          padding: isSidebarCollapsed ? '24px 16px' : '24px',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
        }}>
          <Link href="/member" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #d4af37 0%, #b8963a 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
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
                  MI CUENTA
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

        {/* Wallet Card */}
        {!isSidebarCollapsed && (
          <div style={{
            margin: '16px 12px',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(212, 175, 55, 0.2)',
          }}>
            <div style={{ color: '#888888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Mi Balance
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ color: '#d4af37', fontSize: '32px', fontWeight: 700 }}>{user.bonus_balance}</span>
              <span style={{ color: '#888888', fontSize: '14px' }}>bonos</span>
            </div>
            <Link href="/member/bonos" style={{
              display: 'inline-block',
              marginTop: '12px',
              padding: '8px 16px',
              backgroundColor: '#d4af37',
              color: '#0a0a0a',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}>
              + Comprar Bonos
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
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
              Menú
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
          <div style={{ height: '1px', backgroundColor: '#1a1a1a', margin: '16px 0' }} />

          {/* Role Switch Dropdown */}
          {!isSidebarCollapsed && (
            <div ref={roleDropdownRef} style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
              <div style={{
                color: '#555555',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                padding: '8px 16px',
              }}>
                Cambiar Panel
              </div>
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#d4af37',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  width: '100%',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>👤</span>
                  <span>Miembro</span>
                </span>
                <span style={{ 
                  transform: isRoleDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}>
                  ▼
                </span>
              </button>
              
              {/* Dropdown Menu */}
              {isRoleDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: '#1a1a1a',
                  borderRadius: '12px',
                  border: '1px solid #2a2a2a',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  zIndex: 100,
                  overflow: 'hidden',
                }}>
                  {roleOptions.map((option) => {
                    const isCurrentRole = option.role === 'member';
                    return (
                      <Link
                        key={option.role}
                        href={option.href}
                        onClick={() => setIsRoleDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          textDecoration: 'none',
                          color: isCurrentRole ? '#d4af37' : '#999999',
                          backgroundColor: isCurrentRole ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                          transition: 'all 0.15s ease',
                          borderLeft: isCurrentRole ? '3px solid #d4af37' : '3px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrentRole) {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.color = '#ffffff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrentRole) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#999999';
                          }
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>{option.icon}</span>
                        <span style={{ fontSize: '13px', fontWeight: isCurrentRole ? 600 : 400 }}>
                          {option.label}
                        </span>
                        {isCurrentRole && (
                          <span style={{
                            marginLeft: 'auto',
                            fontSize: '10px',
                            color: '#d4af37',
                            backgroundColor: 'rgba(212, 175, 55, 0.2)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}>
                            Actual
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
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
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d4af37',
                fontWeight: 600,
                fontSize: '16px'
              }}>
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.full_name}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  marginTop: '2px'
                }}>
                  <span style={{
                    backgroundColor: user.member_status === 'vip' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    color: user.member_status === 'vip' ? '#d4af37' : '#22c55e',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {user.member_status === 'vip' ? 'VIP' : 'Miembro'}
                  </span>
                </div>
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
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', backgroundColor: '#0a0a0a' }}>
        {children}
      </main>
    </div>
  );
}