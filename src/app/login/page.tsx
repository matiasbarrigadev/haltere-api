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
  const [successMessage, setSuccessMessage] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [approvedMember, setApprovedMember] = useState<{profileId: string, fullName: string} | null>(null);
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
        .eq('id', userId)
        .single();

      if (profile?.role === 'admin' || profile?.role === 'superadmin') {
        router.push('/admin');
      } else if (profile?.role === 'professional') {
        router.push('/professional');
      } else {
        router.push('/member');
      }
    } catch (e) {
      router.push('/member');
    }
  };

  // Verificar si el email tiene una solicitud aprobada
  const checkApprovedMember = async (emailToCheck: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/check-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToCheck }),
      });
      const data = await res.json();
      
      if (data.approved) {
        setApprovedMember({ profileId: data.profileId, fullName: data.fullName });
        return true;
      } else {
        setError(data.message || 'Este email no tiene acceso');
        return false;
      }
    } catch (err) {
      console.error('Error checking member:', err);
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Intentar login normal primero
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!authError && data.user) {
        // Login exitoso
        await redirectBasedOnRole(data.user.id);
        return;
      }

      // Si el login falla, verificar si es un miembro aprobado sin cuenta
      if (authError?.message?.includes('Invalid login credentials')) {
        const isApproved = await checkApprovedMember(email);
        if (isApproved) {
          setMode('register');
          setError('');
          setSuccessMessage('¡Tu solicitud está aprobada! Ingresa una contraseña para crear tu cuenta.');
        }
      } else {
        throw authError;
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Crear cuenta con Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/member`,
          data: {
            full_name: approvedMember?.fullName || '',
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Si el email no requiere confirmación, hacer login directo
        if (data.session) {
          setSuccessMessage('¡Cuenta creada exitosamente!');
          await redirectBasedOnRole(data.user.id);
        } else {
          // Si requiere confirmación de email
          setSuccessMessage('Cuenta creada. Revisa tu email para confirmar y luego inicia sesión.');
          setMode('login');
          setApprovedMember(null);
        }
      }
    } catch (err: any) {
      // Si el usuario ya existe, intentar login
      if (err.message?.includes('User already registered')) {
        setError('Este email ya tiene una cuenta. Intenta iniciar sesión.');
        setMode('login');
      } else {
        setError(err.message || 'Error al crear cuenta');
      }
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

        {/* Login/Register Card */}
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
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>

          {/* Mensaje de bienvenida para miembro aprobado */}
          {mode === 'register' && approvedMember && (
            <div style={{
              padding: '16px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              marginBottom: 24,
              textAlign: 'center',
            }}>
              <div style={{ color: '#22c55e', fontSize: '0.875rem', marginBottom: 4 }}>
                ✓ Miembro Aprobado
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', fontWeight: 500 }}>
                {approvedMember.fullName}
              </div>
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleCreateAccount}>
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
                disabled={mode === 'register'}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: mode === 'register' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)',
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
                Contraseña {mode === 'register' && '(mínimo 6 caracteres)'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === 'register' ? 6 : undefined}
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

            {successMessage && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#22c55e',
                fontSize: '0.875rem',
                marginBottom: 24,
                textAlign: 'center',
              }}>
                {successMessage}
              </div>
            )}

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
              {loading 
                ? (mode === 'login' ? 'Ingresando...' : 'Creando cuenta...') 
                : (mode === 'login' ? 'Ingresar' : 'Crear Cuenta')
              }
            </button>
          </form>

          {/* Volver a login si está en modo registro */}
          {mode === 'register' && (
            <button
              onClick={() => {
                setMode('login');
                setApprovedMember(null);
                setError('');
                setSuccessMessage('');
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: 'transparent',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.8rem',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                marginTop: 16,
              }}
            >
              ← Volver a Iniciar Sesión
            </button>
          )}
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