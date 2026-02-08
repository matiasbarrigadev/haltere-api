import dynamic from 'next/dynamic';
import VirtuousCircle from '@/components/VirtuousCircle';

const InteractiveHero = dynamic(() => import('@/components/InteractiveHero'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(180deg, #1a1816 0%, #0d0c0b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        border: '2px solid rgba(242, 187, 106, 0.2)',
        borderTopColor: '#F2BB6A',
        animation: 'spin 1s linear infinite'
      }} />
    </div>
  )
});

// Wellness dimensions content
const dimensions = [
  {
    title: 'Entrenamiento Físico',
    description: 'Instalaciones de última generación equipadas con tecnología Technogym. Entrenadores personales certificados que diseñan programas a medida.',
    icon: '💪',
  },
  {
    title: 'Nutrición Consciente',
    description: 'Chef privado especializado en nutrición deportiva. Menús personalizados según objetivos y restricciones alimentarias.',
    icon: '🥗',
  },
  {
    title: 'Bienestar Mental',
    description: 'Espacios de meditación y mindfulness. Sesiones de coaching ejecutivo y manejo del estrés.',
    icon: '🧘',
  },
  {
    title: 'Recuperación Activa',
    description: 'Cryoterapia, masajes terapéuticos, y sauna finlandesa. Protocolos de recuperación personalizados.',
    icon: '♨️',
  },
  {
    title: 'Comunidad Exclusiva',
    description: 'Red de profesionales afines. Eventos privados de networking y desarrollo personal.',
    icon: '🤝',
  },
  {
    title: 'Estilo de Vida',
    description: 'Concierge personal para reservas y servicios. Acceso a experiencias exclusivas.',
    icon: '✨',
  },
];

export default function Home() {
  return (
    <main style={{ background: '#0d0c0b' }}>
      {/* Hero Section */}
      <InteractiveHero />

      {/* About Section */}
      <section style={{
        padding: '120px 24px',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 60,
          alignItems: 'center',
        }}>
          <div>
            <span style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              letterSpacing: '0.3em',
              color: '#F2BB6A',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              Nuestra Filosofía
            </span>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.95)',
              lineHeight: 1.2,
              marginBottom: 24,
            }}>
              El bienestar como <br/>
              <span style={{ color: '#F2BB6A' }}>estilo de vida</span>
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.8,
              marginBottom: 32,
            }}>
              Haltere trasciende el concepto tradicional de gimnasio. Somos un 
              santuario donde el rendimiento físico se une con la excelencia 
              intelectual, creando un ecosistema de crecimiento integral.
            </p>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.8,
            }}>
              Nuestros miembros comparten una visión común: la búsqueda constante 
              de la autorrealización a través del equilibrio entre cuerpo y mente. 
              Un club donde la privacidad y la discreción son valores fundamentales.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 20,
          }}>
            {[
              { number: '28', label: 'Miembros máximo' },
              { number: '250', label: 'M² exclusivos' },
              { number: '24/7', label: 'Acceso privado' },
              { number: '1:1', label: 'Ratio entrenador' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(242, 187, 106, 0.05)',
                border: '1px solid rgba(242, 187, 106, 0.1)',
                padding: '32px 24px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 300,
                  color: '#F2BB6A',
                  marginBottom: 8,
                }}>
                  {stat.number}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Virtuous Circle Section */}
      <section style={{
        padding: '80px 24px 120px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(242, 187, 106, 0.02) 50%, transparent 100%)',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <span style={{
            display: 'inline-block',
            fontSize: '0.75rem',
            letterSpacing: '0.3em',
            color: '#F2BB6A',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            Las 6 Dimensiones
          </span>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.95)',
            marginBottom: 16,
          }}>
            El Círculo Virtuoso del Bienestar
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: 600,
            margin: '0 auto 60px',
          }}>
            Seis pilares fundamentales que trabajan en armonía para crear 
            una experiencia de bienestar integral y transformadora.
          </p>
          <VirtuousCircle />
        </div>
      </section>

      {/* Dimensions Grid Section */}
      <section style={{
        padding: '120px 24px',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 32,
        }}>
          {dimensions.map((dim, i) => (
            <div key={i} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(242, 187, 106, 0.1)',
              padding: '40px 32px',
              transition: 'all 0.3s ease',
            }}>
              <div style={{
                fontSize: '2.5rem',
                marginBottom: 20,
              }}>
                {dim.icon}
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.9)',
                marginBottom: 16,
              }}>
                {dim.title}
              </h3>
              <p style={{
                fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.7,
              }}>
                {dim.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Technogym Section */}
      <section style={{
        padding: '120px 24px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(242, 187, 106, 0.03) 100%)',
      }}>
        <div style={{
          maxWidth: 800,
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <span style={{
            display: 'inline-block',
            fontSize: '0.75rem',
            letterSpacing: '0.3em',
            color: '#F2BB6A',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            Tecnología de Elite
          </span>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.95)',
            marginBottom: 24,
          }}>
            Powered by Technogym
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.8,
            marginBottom: 40,
          }}>
            Equipamiento de última generación con conectividad inteligente. 
            Cada sesión se sincroniza con tu perfil personal, permitiendo 
            un seguimiento preciso de tu progreso y rendimiento.
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 24,
          }}>
            {['Artis Line', 'Pure Strength', 'Skillmill', 'Kinesis'].map((item, i) => (
              <span key={i} style={{
                padding: '12px 24px',
                background: 'rgba(242, 187, 106, 0.08)',
                border: '1px solid rgba(242, 187, 106, 0.2)',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.875rem',
                letterSpacing: '0.1em',
              }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '120px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: 600,
          margin: '0 auto',
        }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.95)',
            marginBottom: 24,
            letterSpacing: '0.1em',
          }}>
            ¿Listo para unirte?
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 40,
            lineHeight: 1.8,
          }}>
            La membresía está limitada a 28 personas para garantizar 
            exclusividad y atención personalizada.
          </p>
          <a href="/apply" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '16px 40px',
            background: '#F2BB6A',
            color: '#0d0c0b',
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            border: '2px solid #F2BB6A',
            transition: 'all 0.4s ease',
          }}>
            Aplicar Ahora
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '60px 24px',
        borderTop: '1px solid rgba(242, 187, 106, 0.1)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.1em',
        }}>
          © 2026 Haltere Club. Todos los derechos reservados.
        </p>
      </footer>
    </main>
  );
}