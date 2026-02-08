'use client';

import Link from 'next/link';
import { useState } from 'react';

// Logo SVG Component based on Brand Guidelines
const HaltereLogo = ({ className = '', size = 'default' }: { className?: string; size?: 'default' | 'large' }) => {
  const height = size === 'large' ? 60 : 40;
  return (
    <svg 
      viewBox="0 0 100 100" 
      height={height}
      className={className}
      fill="currentColor"
      aria-label="Haltere Logo"
    >
      {/* Stylized H with barbell bars */}
      <g>
        {/* Left vertical bar with weights */}
        <rect x="20" y="15" width="4" height="70" />
        <rect x="15" y="20" width="14" height="8" rx="1" />
        <rect x="15" y="72" width="14" height="8" rx="1" />
        
        {/* Center H connector */}
        <rect x="24" y="45" width="52" height="4" />
        
        {/* Middle vertical (T of halTere) */}
        <rect x="48" y="25" width="4" height="50" />
        
        {/* Right vertical bar with weights */}
        <rect x="76" y="15" width="4" height="70" />
        <rect x="71" y="20" width="14" height="8" rx="1" />
        <rect x="71" y="72" width="14" height="8" rx="1" />
      </g>
    </svg>
  );
};

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    // Step 1 - Personal
    fullName: '',
    email: '',
    phone: '',
    occupation: '',
    linkedin: '',
    
    // Step 2 - Reference
    referralSource: '',
    referredBy: '',
    goals: '',
    
    // Step 3 - Preferences
    preferredLocation: '',
    preferredSchedule: '',
    additionalComments: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la aplicación');
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '100vh', paddingTop: '120px' }}>
          <div className="container">
            <div style={{ 
              maxWidth: '600px', 
              margin: '0 auto', 
              textAlign: 'center',
              padding: '4rem 2rem'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem', color: 'var(--color-gold)' }}>✓</div>
              <h1 style={{ marginBottom: '1rem' }}>Aplicación Recibida</h1>
              <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
                Gracias por tu interés en Haltere Club. Hemos recibido tu aplicación 
                y nuestro equipo la revisará en los próximos días. Te contactaremos 
                al email <strong style={{ color: 'var(--color-gold)' }}>{formData.email}</strong> para 
                continuar con el proceso de admisión.
              </p>
              <Link href="/" className="btn">
                Volver al inicio
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '4rem' }}>
        <div className="container">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="section-subtitle">Proceso de Admisión</p>
            <h1>Aplicar a Membresía</h1>
            <p style={{ marginTop: '1rem', maxWidth: '500px', margin: '1rem auto 0' }}>
              Completa el formulario y nuestro equipo evaluará tu perfil 
              para unirte a nuestra comunidad exclusiva.
            </p>
          </div>

          {/* Progress Steps */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1rem',
            marginBottom: '3rem'
          }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  background: step >= s ? 'var(--color-gold)' : 'var(--color-brown-dark)',
                  color: step >= s ? 'var(--color-black)' : 'var(--color-gray)',
                  border: '1px solid',
                  borderColor: step >= s ? 'var(--color-gold)' : 'rgba(242, 187, 106, 0.2)',
                  transition: 'all 0.3s ease'
                }}>
                  {s}
                </div>
                {s < 3 && (
                  <div style={{
                    width: '60px',
                    height: '1px',
                    background: step > s ? 'var(--color-gold)' : 'rgba(242, 187, 106, 0.2)',
                    transition: 'all 0.3s ease'
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="form">
            {step === 1 && (
              <div className="animate-fadeInUp">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                  Información Personal
                </h2>
                
                <div className="form-group">
                  <label className="form-label">Nombre completo *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+56 9 1234 5678"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ocupación</label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Tu profesión u ocupación actual"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">LinkedIn (opcional)</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://linkedin.com/in/tu-perfil"
                  />
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button 
                    type="button" 
                    onClick={handleNext}
                    className="btn btn-primary btn-large"
                    disabled={!formData.fullName || !formData.email || !formData.phone}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fadeInUp">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                  Referencia y Objetivos
                </h2>
                
                <div className="form-group">
                  <label className="form-label">¿Cómo conociste Haltere Club? *</label>
                  <select
                    name="referralSource"
                    value={formData.referralSource}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="member_referral">Recomendación de un socio</option>
                    <option value="social_media">Redes sociales</option>
                    <option value="google">Búsqueda en Google</option>
                    <option value="event">Evento o networking</option>
                    <option value="press">Prensa o medios</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                {formData.referralSource === 'member_referral' && (
                  <div className="form-group">
                    <label className="form-label">¿Quién te refirió?</label>
                    <input
                      type="text"
                      name="referredBy"
                      value={formData.referredBy}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Nombre del socio que te refirió"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">¿Cuáles son tus objetivos de bienestar? *</label>
                  <textarea
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Cuéntanos qué buscas lograr con tu entrenamiento y bienestar..."
                    required
                  />
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <button type="button" onClick={handleBack} className="btn">
                    Atrás
                  </button>
                  <button 
                    type="button" 
                    onClick={handleNext}
                    className="btn btn-primary"
                    disabled={!formData.referralSource || !formData.goals}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fadeInUp">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                  Preferencias
                </h2>
                
                <div className="form-group">
                  <label className="form-label">Sede preferida *</label>
                  <select
                    name="preferredLocation"
                    value={formData.preferredLocation}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Selecciona una sede</option>
                    <option value="vitacura">Vitacura</option>
                    <option value="lo_barnechea">Lo Barnechea (2026)</option>
                    <option value="flexible">Sin preferencia / Flexible</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Horario preferido de entrenamiento *</label>
                  <select
                    name="preferredSchedule"
                    value={formData.preferredSchedule}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Selecciona un horario</option>
                    <option value="early_morning">Muy temprano (5:00 - 7:00)</option>
                    <option value="morning">Mañana (7:00 - 12:00)</option>
                    <option value="afternoon">Tarde (12:00 - 18:00)</option>
                    <option value="evening">Noche (18:00 - 22:00)</option>
                    <option value="late_night">Nocturno (22:00 - 5:00)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Comentarios adicionales</label>
                  <textarea
                    name="additionalComments"
                    value={formData.additionalComments}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="¿Hay algo más que quieras que sepamos sobre ti?"
                  />
                </div>

                {/* Membership Info */}
                <div style={{
                  background: 'var(--color-brown-dark)',
                  border: '1px solid rgba(242, 187, 106, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  marginTop: '2rem',
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase',
                    color: 'var(--color-gold)',
                    marginBottom: '0.5rem'
                  }}>
                    Membresía Anual
                  </p>
                  <p style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: 600,
                    color: 'var(--color-gold)',
                    marginBottom: '0.5rem'
                  }}>
                    $2.400.000 CLP
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)' }}>
                    Incluye acceso 24/7 a todas las sedes. Bonos se adquieren por separado.
                  </p>
                </div>

                {error && (
                  <div style={{
                    background: 'rgba(220, 53, 69, 0.1)',
                    border: '1px solid rgba(220, 53, 69, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    marginTop: '1rem',
                    color: '#dc3545',
                    textAlign: 'center'
                  }}>
                    {error}
                  </div>
                )}

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <button type="button" onClick={handleBack} className="btn">
                    Atrás
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSubmit}
                    className="btn btn-primary"
                    disabled={!formData.preferredLocation || !formData.preferredSchedule || isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Aplicación'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-inner">
          <Link href="/" className="logo">
            <HaltereLogo />
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ letterSpacing: '0.3em' }}>haltere</span>
              <span style={{ fontSize: '0.5em', letterSpacing: '0.4em', opacity: 0.7 }}>28250</span>
            </span>
          </Link>
          
          <nav className="nav">
            <Link href="/#manifesto" className="nav-link">Manifesto</Link>
            <Link href="/#experiencia" className="nav-link">Experiencia</Link>
            <Link href="/#clubes" className="nav-link">Clubes</Link>
            <Link href="/apply" className="btn btn-primary">Ser socio</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
          <Link href="/" className="logo" style={{ justifyContent: 'center' }}>
            <HaltereLogo />
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ letterSpacing: '0.3em' }}>haltere</span>
              <span style={{ fontSize: '0.5em', letterSpacing: '0.4em', opacity: 0.7 }}>28250</span>
            </span>
          </Link>
        </div>
        <p className="footer-text">
          © 2026 Haltere Club. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}