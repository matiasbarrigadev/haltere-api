'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// In production, use environment variable and proper auth
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'haltere2026';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple password check - in production use proper auth
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('haltere_admin_auth', 'true');
      router.push('/admin');
    } else {
      setError('Contraseña incorrecta');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 mb-4">
            <span className="text-4xl">🏛️</span>
          </div>
          <h1 className="text-[#d4af37] font-serif text-2xl tracking-widest">
            CLUB HALTERE
          </h1>
          <p className="text-[#666] mt-2">Panel de Administración</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#111] border border-[#222] rounded-2xl p-8">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm text-[#999] mb-2"
                >
                  Contraseña de Administrador
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder-[#555] focus:outline-none focus:border-[#d4af37] transition-colors"
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 px-6 py-3 bg-[#d4af37] text-[#0a0a0a] font-medium rounded-lg hover:bg-[#b8962f] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Verificando...' : 'Acceder'}
            </button>
          </div>
        </form>

        {/* Back to site */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-[#666] hover:text-[#d4af37] text-sm transition-colors"
          >
            ← Volver al sitio
          </a>
        </div>
      </div>
    </div>
  );
}