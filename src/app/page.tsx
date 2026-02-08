'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import HaltereLogo, { HaltereIconLogo } from '@/components/HaltereLogo';

// Lazy load the Virtuous Circle Player
const VirtuousCirclePlayer = dynamic(() => import('@/components/VirtuousCirclePlayer'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      maxWidth: '500px',
      aspectRatio: '1',
      margin: '0 auto',
      background: 'rgba(242, 187, 106, 0.05)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        border: '2px solid rgba(242, 187, 106, 0.2)',
        borderTopColor: '#F2BB6A',
        animation: 'spin 1s linear infinite',
      }} />
    </div>
  ),
});

// Lazy load the Hero Player
const HeroPlayer = dynamic(() => import('@/components/HeroPlayer'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '500px',
      background: 'linear-gradient(180deg, #1a1816 0%, #0d0c0b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        border: '2px solid rgba(242, 187, 106, 0.2)',
        borderTopColor: '#F2BB6A',
        animation: 'spin 1s linear infinite',
      }} />
    </div>
  ),
});

export default function Home() {
  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <Link href="/" className="logo">
              <HaltereIconLogo size={40} color="currentColor" />
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ letterSpacing: '0.3em' }}>haltere</span>
                <span style={{ fontSize: '0.5em', letterSpacing: '0.4em', opacity: 0.7 }}>28250</span>
              </span>
            </Link>
            
            <nav className="nav">
              <Link href="#experiencia" className="nav-link">Experiencia</Link>
              <Link href="#bienestar" className="nav-link">Bienestar</Link>
              <Link href="#technogym" className="nav-link">Technogym</Link>
              <Link href="#clubes" className="nav-link">Clubes</Link>
              <Link href="/apply" className="btn">Ser socio</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Remotion Animation */}
      <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}>
          <HeroPlayer />
        </div>
        
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="hero-content animate-fadeInUp" style={{ 
            backdropFilter: 'blur(4px)',
            background: 'rgba(0,0,0,0.4)',
            padding: '3rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(242, 187, 106, 0.15)',
          }}>
            <h1 className="hero-title">
              Club Silencioso<br />del Bienestar
            </h1>
            <p className="hero-subtitle">
              Autorrealización a través de la satisfacción de las necesidades físicas 
              e intelectuales. Sentimiento de pertenencia anónima, rodeándose de 
              personas con los mismos valores. Consumo consciente y sostenible. 
              Privacidad y discreción.
            </p>
            <Link href="/apply" className="btn btn-large" style={{
              background: 'var(--color-gold)',
              color: 'var(--color-black)',
            }}>
              Aplicar a membresía
            </Link>
          </div>
        </div>
      </section>

      {/* Un Club Privado de Bienestar */}
      <section className="section" id="concepto">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Quiet Luxury Club</p>
            <h2>Un Club Privado de Bienestar</h2>
          </div>
          
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <p style={{ 
              fontSize: '1.2rem', 
              lineHeight: '1.8',
              marginBottom: '3rem',
              fontStyle: 'italic',
              color: 'var(--color-cream)'
            }}>
              Ofrecer un espacio único, equipado con material de última generación, 
              cerca de casa, donde el miembro pueda entrenar, pueda tener su propio 
              espacio privado compartiendo los mismos valores con otros miembros del club, 
              un lugar en el que se sienta como en casa y que pueda llamar suyo.
            </p>
            
            <div className="grid grid-3" style={{ gap: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔐</div>
                <h3 style={{ color: 'var(--color-gold)', marginBottom: '0.5rem' }}>Exclusividad</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)' }}>
                  Sentimiento de exclusividad y pertenencia entre sus socios
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👥</div>
                <h3 style={{ color: 'var(--color-gold)', marginBottom: '0.5rem' }}>Comunidad</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)' }}>
                  Plataforma para conectarse con personas de valores afines
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
                <h3 style={{ color: 'var(--color-gold)', marginBottom: '0.5rem' }}>Calidad</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)' }}>
                  Servicios y experiencias de alta calidad limitando el número de socios
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experiencia Club 28250 */}
      <section className="section" id="experiencia" style={{
        background: 'linear-gradient(180deg, rgba(242, 187, 106, 0.05) 0%, transparent 100%)'
      }}>
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">La Experiencia</p>
            <h2>Experiencia Club 28250</h2>
          </div>
          
          <div className="grid grid-3">
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                background: 'rgba(242, 187, 106, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                🧘‍♀️
              </div>
              <h3 className="card-title" style={{ color: 'var(--color-gold)' }}>Máxima Privacidad</h3>
              <p className="card-text">
                Espacios diseñados para tu tranquilidad. Entrena sin interrupciones, 
                sin multitudes, en tu propio santuario de bienestar.
              </p>
            </div>
            
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                background: 'rgba(242, 187, 106, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                🏋️
              </div>
              <h3 className="card-title" style={{ color: 'var(--color-gold)' }}>Material de Primer Nivel</h3>
              <p className="card-text">
                Equipamiento premium de diseño exclusivo. Cada pieza seleccionada 
                por su calidad excepcional y estética atemporal.
              </p>
            </div>
            
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                background: 'rgba(242, 187, 106, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                📱
              </div>
              <h3 className="card-title" style={{ color: 'var(--color-gold)' }}>Última Tecnología</h3>
              <p className="card-text">
                Integración con Technogym para trackeo de progreso, 
                entrenamientos personalizados y análisis de rendimiento en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Círculo Virtuoso del Bienestar - Animación Interactiva */}
      <section className="section" id="bienestar" style={{
        background: 'radial-gradient(ellipse at center, rgba(242, 187, 106, 0.03) 0%, transparent 70%)',
        paddingTop: '4rem',
        paddingBottom: '4rem',
      }}>
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">El Círculo Virtuoso</p>
            <h2>6 Dimensiones del Bienestar</h2>
          </div>
          
          <p style={{ 
            maxWidth: '700px', 
            margin: '0 auto 3rem', 
            textAlign: 'center',
            fontSize: '1.15rem',
            lineHeight: '1.8',
            fontStyle: 'italic',
            color: 'var(--color-cream)'
          }}>
            Diseñamos comunidades exclusivas en pequeños núcleos urbanos con un interés 
            común en ser parte del <span style={{ color: 'var(--color-gold)' }}>círculo virtuoso del bienestar</span>, 
            a través de espacios, productos y servicios singulares y atemporales.
          </p>
          
          {/* Animated Virtuous Circle */}
          <div style={{ 
            maxWidth: '500px', 
            margin: '0 auto',
            position: 'relative',
          }}>
            <VirtuousCirclePlayer width={500} />
          </div>
          
          <p style={{ 
            maxWidth: '600px', 
            margin: '3rem auto 0', 
            textAlign: 'center',
            fontSize: '1rem',
            color: 'var(--color-gray)',
            lineHeight: '1.7'
          }}>
            Satisfacer las 6 dimensiones del bienestar que conducen a la autorrealización: 
            mejorar la salud, dormir mejor, plena concentración, mejorar el aspecto, 
            mejorar la nutrición y mejor forma física.
          </p>
        </div>
      </section>

      {/* Technogym Precision Training */}
      <section className="section" id="technogym" style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(242, 187, 106, 0.03) 100%)'
      }}>
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Tecnología Avanzada</p>
            <h2>Entrenamiento de Precisión</h2>
          </div>
          
          <div style={{ maxWidth: '800px', margin: '0 auto 3rem' }}>
            <p style={{ 
              fontSize: '1.15rem', 
              lineHeight: '1.8',
              textAlign: 'center',
              color: 'var(--color-cream)'
            }}>
              En haltere se puede mejorar la eficiencia y la eficacia del entrenamiento 
              gracias a una experiencia de entrenamiento fluida y personalizada, adaptada 
              a las necesidades, las preferencias y el <strong style={{ color: 'var(--color-gold)' }}>
              estilo de vida de cada miembro del Club</strong>.
            </p>
          </div>

          <div className="grid grid-2" style={{ gap: '3rem', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                Evaluaciones Basadas en IA
              </h3>
              <p style={{ marginBottom: '2rem', lineHeight: '1.7' }}>
                Transforma tu entrenamiento con evaluaciones basadas en IA para un 
                entrenamiento personalizado y progresivo.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(242, 187, 106, 0.05)', borderRadius: '8px' }}>
                  <h4 style={{ color: 'var(--color-gold)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Movilidad</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)' }}>
                    Análisis de amplitud de movimiento
                  </p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(242, 187, 106, 0.05)', borderRadius: '8px' }}>
                  <h4 style={{ color: 'var(--color-gold)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Balance</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)' }}>
                    Evaluación de equilibrio y estabilidad
                  </p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(242, 187, 106, 0.05)', borderRadius: '8px' }}>
                  <h4 style={{ color: 'var(--color-gold)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Cuerpo</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)' }}>
                    Composición corporal detallada
                  </p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(242, 187, 106, 0.05)', borderRadius: '8px' }}>
                  <h4 style={{ color: 'var(--color-gold)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Mente</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)' }}>
                    Habilidades cognitivas y atención
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                Protocolo Adaptable
              </h3>
              <p style={{ marginBottom: '1.5rem', lineHeight: '1.7' }}>
                Basándose en los resultados de las pruebas, <strong style={{ color: 'var(--color-gold)' }}>
                Technogym AI Coach</strong> ayuda a crear programas personalizados que están siempre 
                disponibles en todos los dispositivos de entrenamiento.
              </p>
              <p style={{ lineHeight: '1.7', color: 'var(--color-gray)' }}>
                Se adapta al progreso de los miembros para garantizar que alcancen 
                resultados superiores más rápidamente. Seguimiento de los progresos 
                con datos fiables a mano.
              </p>
              
              <div style={{ 
                marginTop: '2rem', 
                padding: '1.5rem', 
                background: 'rgba(242, 187, 106, 0.08)',
                borderRadius: '12px',
                borderLeft: '4px solid var(--color-gold)'
              }}>
                <p style={{ fontStyle: 'italic', fontSize: '0.95rem' }}>
                  &quot;Variedad Infinita de Ejercicios. Resultados superiores más 
                  rápidamente con Technogym Precision Training.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios Membresía */}
      <section className="section" id="beneficios">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Beneficios</p>
            <h2>Por qué un Club Privado</h2>
          </div>
          
          <div className="features-grid">
            <div className="feature-card animate-fadeInUp delay-1">
              <h3 className="card-title">Networking</h3>
              <p className="card-text">
                Oportunidades de establecer contactos con compañeros, 
                profesionales del bienestar y potenciales colaboradores.
              </p>
            </div>
            
            <div className="feature-card animate-fadeInUp delay-2">
              <h3 className="card-title">Acceso Exclusivo</h3>
              <p className="card-text">
                Instalaciones y servicios que no están disponibles en otros 
                lugares, como formación y eventos especiales.
              </p>
            </div>
            
            <div className="feature-card animate-fadeInUp delay-3">
              <h3 className="card-title">Comunidad</h3>
              <p className="card-text">
                Sentido de comunidad entre nuestros socios, oportunidades para 
                socializar y participar en intereses compartidos.
              </p>
            </div>
            
            <div className="feature-card animate-fadeInUp delay-4">
              <h3 className="card-title">Prestigio</h3>
              <p className="card-text">
                Sensación de prestigio y estatus, así como acceso a eventos 
                y oportunidades exclusivas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section className="section" id="membresia" style={{
        background: 'linear-gradient(180deg, rgba(242, 187, 106, 0.05) 0%, transparent 100%)'
      }}>
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Membresía Anual</p>
            <h2>Tu Camino al Bienestar</h2>
          </div>
          
          <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.7' }}>
              La membresía incluye acceso ilimitado 24/7 a todas nuestras sedes, 
              sistema de bonos para reservas, y prioridad de agendamiento.
            </p>
            
            <div style={{
              display: 'inline-block',
              padding: '2.5rem 4rem',
              background: 'var(--color-brown-dark)',
              border: '1px solid rgba(242, 187, 106, 0.3)',
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
                fontSize: '2.8rem', 
                fontWeight: 600,
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
      <section className="section" id="clubes">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Ubicaciones</p>
            <h2>Nuestros Clubes</h2>
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
        background: 'var(--color-brown-dark)',
        textAlign: 'center'
      }}>
        <div className="container">
          <HaltereIconLogo size={60} color="#F2BB6A" className="animate-fadeInUp" />
          <h2 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>¿Listo para comenzar?</h2>
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
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <Link href="/" className="logo" style={{ justifyContent: 'center' }}>
              <HaltereIconLogo size={40} color="currentColor" />
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ letterSpacing: '0.3em' }}>haltere</span>
                <span style={{ fontSize: '0.5em', letterSpacing: '0.4em', opacity: 0.7 }}>28250</span>
              </span>
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