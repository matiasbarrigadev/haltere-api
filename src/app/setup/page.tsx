'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetup = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'matiasbarriga7@gmail.com',
          fullName: 'Matias Barriga',
          password: 'devmgmt.msc',
          setupKey: 'HALTERE_SETUP_2026'
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult('✅ Usuario admin creado exitosamente! Ahora puedes ir a /login');
      } else {
        setError(data.error || 'Error desconocido');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
        maxWidth: '500px',
        width: '100%',
        backgroundColor: '#111111',
        padding: '40px',
        borderRadius: '16px',
        border: '1px solid #1a1a1a'
      }}>
        <h1 style={{ color: '#d4af37', fontSize: '24px', marginBottom: '16px', textAlign: 'center' }}>
          Setup Inicial
        </h1>
        <p style={{ color: '#888888', fontSize: '14px', marginBottom: '32px', textAlign: 'center' }}>
          Crear usuario admin: matiasbarriga7@gmail.com
        </p>

        {result && (
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#22c55e',
            fontSize: '14px'
          }}>
            {result}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#ef4444',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSetup}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: loading ? '#666666' : '#d4af37',
            color: '#0a0a0a',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creando usuario...' : 'Crear Admin'}
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/login" style={{ color: '#d4af37', fontSize: '14px' }}>
            Ir al Login →
          </a>
        </div>
      </div>
    </div>
  );
}