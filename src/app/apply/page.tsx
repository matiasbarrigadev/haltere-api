'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ApplicationForm {
  full_name: string;
  email: string;
  phone: string;
  occupation: string;
  linkedin_url: string;
  referral_source: string;
  referral_name: string;
  fitness_goals: string;
  preferred_location: string;
  schedule_preference: string;
  additional_notes: string;
}

export default function ApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState<ApplicationForm>({
    full_name: '',
    email: '',
    phone: '',
    occupation: '',
    linkedin_url: '',
    referral_source: '',
    referral_name: '',
    fitness_goals: '',
    preferred_location: '',
    schedule_preference: '',
    additional_notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar solicitud');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">¡Solicitud Enviada!</h1>
          <p className="text-gray-400 mb-8">
            Gracias por tu interés en Club Haltere. Nuestro equipo revisará tu solicitud y te contactaremos 
            en las próximas 48-72 horas hábiles.
          </p>
          <p className="text-sm text-gray-500">
            Revisa tu correo electrónico para más información.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold tracking-tight">CLUB HALTERE</h1>
          <p className="text-gray-400 text-sm mt-1">Exclusive Wellness Club</p>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center space-x-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s ? 'bg-white text-black' : 'bg-gray-800 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-16 h-0.5 ${step > s ? 'bg-white' : 'bg-gray-800'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Información Personal</h2>
                <p className="text-gray-400 mt-2">Cuéntanos sobre ti</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="juan@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="+56 9 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ocupación *
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={form.occupation}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="CEO / Empresario / Médico"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  LinkedIn (opcional)
                </label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={form.linkedin_url}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent"
                  placeholder="https://linkedin.com/in/tuperfil"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!form.full_name || !form.email || !form.phone || !form.occupation}
                className="w-full bg-white text-black font-semibold py-4 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Step 2: Referral & Interests */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Referencia y Objetivos</h2>
                <p className="text-gray-400 mt-2">Ayúdanos a conocerte mejor</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ¿Cómo supiste de Club Haltere? *
                </label>
                <select
                  name="referral_source"
                  value={form.referral_source}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="member_referral">Recomendación de un miembro</option>
                  <option value="social_media">Redes sociales</option>
                  <option value="google">Búsqueda en Google</option>
                  <option value="event">Evento o conferencia</option>
                  <option value="press">Prensa o medios</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              {form.referral_source === 'member_referral' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del miembro que te refirió
                  </label>
                  <input
                    type="text"
                    name="referral_name"
                    value={form.referral_name}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Nombre del miembro"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ¿Cuáles son tus objetivos de bienestar? *
                </label>
                <textarea
                  name="fitness_goals"
                  value={form.fitness_goals}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent resize-none"
                  placeholder="Describe qué buscas lograr con tu membresía..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-800 text-white font-semibold py-4 rounded-lg hover:bg-gray-700 transition"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!form.referral_source || !form.fitness_goals}
                  className="flex-1 bg-white text-black font-semibold py-4 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preferences & Submit */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Preferencias</h2>
                <p className="text-gray-400 mt-2">Última información antes de enviar</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sede de preferencia *
                </label>
                <select
                  name="preferred_location"
                  value={form.preferred_location}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent"
                >
                  <option value="">Selecciona una sede</option>
                  <option value="santiago-centro">Santiago Centro (24/7)</option>
                  <option value="las-condes">Las Condes (24/7)</option>
                  <option value="vitacura">Vitacura (6AM - 11PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Horarios de preferencia *
                </label>
                <select
                  name="schedule_preference"
                  value={form.schedule_preference}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent"
                >
                  <option value="">Selecciona tu horario preferido</option>
                  <option value="early_morning">Madrugada (4AM - 7AM)</option>
                  <option value="morning">Mañana (7AM - 12PM)</option>
                  <option value="afternoon">Tarde (12PM - 6PM)</option>
                  <option value="evening">Noche (6PM - 10PM)</option>
                  <option value="late_night">Noche tardía (10PM - 4AM)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  name="additional_notes"
                  value={form.additional_notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent resize-none"
                  placeholder="¿Hay algo más que debamos saber?"
                />
              </div>

              {/* Membership Fee Info */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-semibold mb-2">Cuota de Membresía</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Una vez aprobada tu solicitud, se te enviará un enlace de pago para activar tu membresía.
                </p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">$2.400.000</span>
                  <span className="text-gray-400 ml-2">CLP / año</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Incluye acceso 24/7 a todas las sedes + beneficios exclusivos
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-800 text-white font-semibold py-4 rounded-lg hover:bg-gray-700 transition"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading || !form.preferred_location || !form.schedule_preference}
                  className="flex-1 bg-white text-black font-semibold py-4 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>© 2026 Club Haltere. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}