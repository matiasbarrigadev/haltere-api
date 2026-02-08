import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <Link href="/" className="logo">
              <span className="logo-symbol">⚖</span>
              <span>haltere</span>
            </Link>
            
            <nav className="nav">
              <Link href="#manifesto" className="nav-link">Manifesto</Link>
              <Link href="#experiencia" className="nav-link">Experiencia</Link>
              <Link href="#clubes" className="nav-link">Clubes</Link>
              <Link href="/apply" className="btn">Ser socio</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content animate-fadeInUp">
            <h1 className="hero-title">
              Club Silencioso<br />del Bienestar
            </h1>
            <p className="hero-subtitle">
              Enfocados en satisfacer las necesidades físicas e intelectuales 
              que impulsan la autorrealización, cultivando un sentido de 
              pertenencia a través de valores compartidos. A la vez, garantizamos 
              privacidad, excelencia y discreción en cada aspecto de nuestra experiencia.
            </p>
            <Link href="/apply" className="btn btn-large">
              Aplicar a membresía
            </Link>
          </div>
        </div>
        
        {/* Decorative gradient overlay */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '50%',
          background: 'radial-gradient(ellipse at right center, rgba(193, 154, 107, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
      </section>

      {/* Manifesto Section */}
      <section className="section" id="manifesto">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Nuestro Manifesto</p>
            <h2>Silencio, Disciplina, Excelencia</h2>
          </div>
          
          <div className="features-grid">
            <div className="feature-card animate-fadeInUp delay-1">
              <div className="card-icon">🔒</div>
              <h3 className="card-title">Privacidad Total</h3>
              <p className="card-text">
                Un santuario donde tu tiempo y espacio son sagrados. 
                Sin multitudes, sin distracciones.
              </p>
            </div>
            
            <div className="feature-card animate-fadeInUp delay-2">
              <div className="card-icon">⚡</div>
              <h3 className="card-title">Acceso 24/7</h3>
              <p className="card-text">
                Entrena cuando quieras. A las 4 AM o a medianoche, 
                el club está disponible para ti.
              </p>
            </div>
            
            <div className="feature-card animate-fadeInUp delay-3">
              <div className="card-icon">👤</div>
              <h3 className="card-title">Profesionales Elite</h3>
              <p className="card-text">
                Entrenadores personales y terapeutas seleccionados 
                para guiar tu transformación.
              </p>
            </div>
            
            <div className="feature-card animate-fadeInUp delay-4">
              <div className="card-icon">✨</div>
              <h3 className="card-title">Exclusividad</h3>
              <p className="card-text">
                Membresía por invitación. Cada socio pasa por un 
                proceso de selección riguroso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="section" id="experiencia" style={{
        background: 'linear-gradient(180deg, rgba(193, 154, 107, 0.03) 0%, transparent 100%)'
      }}>
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">La Experiencia</p>
            <h2>Diseñado para tu Bienestar</h2>
          </div>
          
          <div className="grid grid-3">
            <div className="card">
              <h3 className="card-title">Uso Privado</h3>
              <p className="card-text">
                Reserva espacios completos para ti. Sala de pesas, 
                área de yoga, o el gimnasio entero. Sin compartir.
              </p>
            </div>
            
            <div className="card">
              <h3 className="card-title">Sesiones 1 a 1</h3>
              <p className="card-text">
                Trabaja con profesionales dedicados exclusivamente 
                a tus objetivos y ritmo personal.
              </p>
            </div>
            
            <div className="card">
              <h3 className="card-title">Clases Selectas</h3>
              <p className="card-text">
                Grupos reducidos de máximo 6 personas. Intimidad 
                y atención personalizada garantizada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section className="section" id="membresia">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Membresía</p>
            <h2>Tu Camino al Bienestar</h2>
          </div>
          
          <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
              La membresía anual incluye acceso ilimitado 24/7 a todas 
              nuestras sedes, sistema de bonos para reservas, y prioridad 
              de agendamiento sobre visitantes.
            </p>
            
            <div style={{
              display: 'inline-block',
              padding: '2rem 3rem',
              background: 'var(--color-gray-dark)',
              border: '1px solid rgba(193, 154, 107, 0.3)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '2rem'
            }}>
              <p style={{ 
                fontSize: '0.75rem', 
                letterSpacing: '0.2em', 
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                marginBottom: '0.5rem'
              }}>
                Membresía Anual
              </p>
              <p style={{ 
                fontSize: '2.5rem', 
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-gold)'
              }}>
                $2.400.000 CLP
              </p>
              <p style={{ 
                fontSize: '0.875rem',
                color: 'var(--color-gray)'
              }}>
                + bonos según tu plan de uso
              </p>
            </div>
            
            <div>
              <Link href="/apply" className="btn btn-primary btn-large">
                Iniciar Aplicación
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clubs Section */}
      <section className="section" id="clubes" style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(193, 154, 107, 0.03) 100%)'
      }}>
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Nuestros Clubes</p>
            <h2>Ubicaciones</h2>
          </div>
          
          <div className="grid grid-2" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <h3 className="card-title">Vitacura</h3>
              <p className="card-text">
                Nuestro flagship. 800m² de espacios de última generación 
                en el corazón del barrio más exclusivo.
              </p>
              <p style={{ 
                marginTop: '1rem',
                fontSize: '0.875rem',
                color: 'var(--color-gold)'
              }}>
                Próximamente
              </p>
            </div>
            
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <h3 className="card-title">Lo Barnechea</h3>
              <p className="card-text">
                Conectado con la naturaleza. Un refugio de bienestar 
                con vistas a la cordillera.
              </p>
              <p style={{ 
                marginTop: '1rem',
                fontSize: '0.875rem',
                color: 'var(--color-gold)'
              }}>
                2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" style={{
        background: 'var(--color-gray-dark)',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem' }}>¿Listo para comenzar?</h2>
          <p style={{ 
            fontSize: '1.125rem', 
            maxWidth: '500px', 
            margin: '0 auto 2rem' 
          }}>
            Completa tu aplicación y uno de nuestros asesores 
            te contactará para el proceso de admisión.
          </p>
          <Link href="/apply" className="btn btn-primary btn-large">
            Aplicar Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <Link href="/" className="logo" style={{ justifyContent: 'center' }}>
              <span className="logo-symbol">⚖</span>
              <span>haltere</span>
            </Link>
          </div>
          <p className="footer-text">
            © 2026 Haltere Club. Todos los derechos reservados.
          </p>
          <p className="footer-text" style={{ marginTop: '0.5rem' }}>
            Club Silencioso del Bienestar · Santiago, Chile
          </p>
        </div>
      </footer>
    </>
  );
}