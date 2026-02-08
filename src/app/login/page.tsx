'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function UnifiedLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => getSupabase(), []);

  useEffect(() => {
    checkExistingSession();
  }, [supabase]);

  const checkExistingSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await redirectBasedOnRole(session.user.id);
      }
    } finally {
      setCheckingSession(false);
    }
  };

  const redirectBasedOnRole = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (profile?.role === 'admin' || profile?.role === 'superadmin') {
        router.push('/admin');
      } else if (profile?.role === 'professional') {
        router.push('/professional');
      } else if (profile?.role === 'member') {
        router.push('/member');
      } else {
        router.push('/member');
      }
    } catch (e) {
      router.push('/member');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        await redirectBasedOnRole(data.user.id);
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
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
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a1816 0%, #0d0c0b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 300,
              letterSpacing: '0.4em',
              color: '#F2BB6A',
              marginBottom: 8,
            }}>
              HALTERE
            </div>
            <div style={{
              fontSize: '0.7rem',
              letterSpacing: '0.3em',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
            }}>
              Club Exclusivo
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(242, 187, 106, 0.15)',
          padding: '48px 40px',
        }}>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            marginBottom: 32,
            letterSpacing: '0.1em',
          }}>
            Iniciar Sesión
          </h1>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(242, 187, 106, 0.2)',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(242, 187, 106, 0.2)',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                fontSize: '0.875rem',
                marginBottom: 24,
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: loading ? 'rgba(242, 187, 106, 0.5)' : '#F2BB6A',
                color: '#0d0c0b',
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        {/* Footer links */}
        <div style={{
          textAlign: 'center',
          marginTop: 32,
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(255,255,255,0.4)',
          }}>
            ¿No tienes cuenta?{' '}
            <Link href="/apply" style={{
              color: '#F2BB6A',
              textDecoration: 'none',
            }}>
              Aplica aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}