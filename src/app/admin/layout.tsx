'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Función segura que solo crea el cliente si las variables de entorno están disponibles
const getSupabase = (): SupabaseClient | null => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    // Durante el build, las variables pueden no estar disponibles
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  // Inicializar Supabase client en el cliente (no durante SSR/build)
  useEffect(() => {
    const client = getSupabase();
    if (client) {
      setSupabase(client);
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (supabase) {
      checkAuth();
    }
  }, [pathname, supabase]);

  const checkAuth = async () => {
    if (!supabase) {
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Verificar que tiene rol admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, role')
        .eq('id', session.user.id)
        .single();

      if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
        // No es admin, redirigir según su rol
        if (profile?.role === 'professional') {
          router.push('/professional');
        } else {
          router.push('/member');
        }
        return;
      }

      setUser({
        id: profile.id,
        email: profile.email || session.user.email || '',
        full_name: profile.full_name || 'Admin',
        role: profile.role
      });
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

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
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/applications', label: 'Solicitudes', icon: '📝', badge: 3 },
    { href: '/admin/members', label: 'Miembros', icon: '👥' },
    { href: '/admin/professionals', label: 'Profesionales', icon: '💼' },
    { href: '/admin/services', label: 'Servicios', icon: '🎯' },
    { href: '/admin/bookings', label: 'Reservas', icon: '📅', badge: 6 },
    { href: '/admin/locations', label: 'Sedes', icon: '🏢' },
    { href: '/admin/technogym', label: 'Technogym', icon: '🏋️' },
    { href: '/admin/users', label: 'Usuarios & Roles', icon: '🔐' },
  ];

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/login');
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

  const userInitials = user.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: isSidebarCollapsed ? '80px' : '260px',
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
        <nav className="admin-sidebar-nav" style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
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
                  <span>🔐</span>
                  <span>Admin</span>
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
                    const isCurrentRole = option.role === 'admin';
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

        {/* User Section - Single Button with Dropdown */}
        <div 
          ref={userDropdownRef}
          style={{
            padding: '12px',
            borderTop: '1px solid #1a1a1a',
            position: 'relative',
          }}
        >
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: isSidebarCollapsed ? '0' : '12px',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '12px' : '12px 14px',
              borderRadius: '12px',
              backgroundColor: isUserDropdownOpen ? '#1a1a1a' : '#111111',
              border: '1px solid #1a1a1a',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d4af37',
              fontWeight: 600,
              fontSize: '14px',
              flexShrink: 0,
            }}>
              {userInitials}
            </div>
            {!isSidebarCollapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ 
                    color: '#ffffff', 
                    fontSize: '13px', 
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.full_name}
                  </div>
                  <div style={{ 
                    color: '#d4af37', 
                    fontSize: '11px',
                    textTransform: 'capitalize'
                  }}>
                    {user.role}
                  </div>
                </div>
                <span style={{ 
                  color: '#555',
                  fontSize: '10px',
                  transform: isUserDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}>
                  ▲
                </span>
              </>
            )}
          </button>

          {/* User Dropdown Menu */}
          {isUserDropdownOpen && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '12px',
              right: '12px',
              marginBottom: '4px',
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              border: '1px solid #2a2a2a',
              boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.4)',
              zIndex: 100,
              overflow: 'hidden',
            }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontSize: '13px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '16px' }}>🚪</span>
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', backgroundColor: '#0a0a0a' }}>
        {children}
      </main>

      {/* Dark scrollbar styles */}
      <style>{`
        .admin-sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }
        .admin-sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-sidebar-nav::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 4px;
        }
        .admin-sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: #3a3a3a;
        }
        .admin-sidebar-nav {
          scrollbar-width: thin;
          scrollbar-color: #2a2a2a transparent;
        }
      `}</style>
    </div>
  );
}
