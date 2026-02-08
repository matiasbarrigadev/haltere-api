'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MemberLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Demo login - en producción se conectaría con Supabase Auth
    if (email && password === 'demo123') {
      // Simular sesión de usuario
      const userSession = {
        id: 'demo-user-id',
        email: email,
        full_name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: 'member',
        member_status: email.includes('vip') ? 'vip' : 'active',
        bonus_balance: 150
      };
      
      sessionStorage.setItem('haltere_user_session', JSON.stringify(userSession));
      router.push('/member');
    } else {
      setError('Credenciales inválidas. Usa cualquier email con contraseña: demo123');
    }
    
    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #d4af37 0%, #b8963a 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              margin: '0 auto 20px',
              boxShadow: '0 8px 32px rgba(212, 175, 55, 0.3)',
            }}>
              🏋️
            </div>
            <h1 style={{
              color: '#d4af37',
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '4px',
              margin: 0,
              fontFamily: 'system-ui'
            }}>
              HALTERE
            </h1>
            <p style={{ color: '#666666', fontSize: '13px', marginTop: '8px', letterSpacing: '2px' }}>
              ÁREA DE MIEMBROS
            </p>
          </Link>
        </div>

        {/* Login Card */}
        <div style={{
          backgroundColor: '#111111',
          borderRadius: '20px',
          padding: '40px',
          border: '1px solid #1a1a1a',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}>
          <h2 style={{
            color: '#ffffff',
            fontSize: '22px',
            fontWeight: 600,
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            Bienvenido de vuelta
          </h2>
          <p style={{
            color: '#888888',
            fontSize: '14px',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            Accede a tu cuenta para gestionar tus servicios
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: '#888888',
                fontSize: '12px',
                fontWeight: 500,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#d4af37'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: '#888888',
                fontSize: '12px',
                fontWeight: 500,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#d4af37'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
              />
            </div>

            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '20px'
              }}>
                <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #d4af37 0%, #b8963a 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#0a0a0a',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)'
              }}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link href="/apply" style={{
              color: '#888888',
              fontSize: '13px',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}>
              ¿No eres miembro? <span style={{ color: '#d4af37' }}>Solicita tu membresía</span>
            </Link>
          </div>
        </div>

        {/* Demo Info */}
        <div style={{
          marginTop: '24px',
          padding: '16px 20px',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(212, 175, 55, 0.2)'
        }}>
          <p style={{ color: '#d4af37', fontSize: '12px', fontWeight: 600, margin: '0 0 8px 0' }}>
            🔑 Credenciales de Demo
          </p>
          <p style={{ color: '#888888', fontSize: '12px', margin: 0 }}>
            Email: cualquier email válido<br />
            Contraseña: demo123<br />
            <span style={{ color: '#666666' }}>(Para VIP usa email con "vip" ej: juan.vip@email.com)</span>
          </p>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link href="/" style={{
            color: '#666666',
            fontSize: '13px',
            textDecoration: 'none'
          }}>
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}