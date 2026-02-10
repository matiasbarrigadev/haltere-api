'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Particle type for floating dots
interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  speed: number;
}

// Orbital ring configuration
interface OrbitalRing {
  radius: number;
  speed: number;
  dotCount: number;
  dotSize: number;
  opacity: number;
  direction: number;
  baseAngle: number;
}

// Mouse trail point
interface TrailPoint {
  x: number;
  y: number;
  age: number;
}


interface InteractiveHeroProps {
  onScrollDown?: () => void;
}

export default function InteractiveHero({ onScrollDown }: InteractiveHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const mouseTrailRef = useRef<TrailPoint[]>([]);
  const animationFrameRef = useRef<number>(0);
  const timeRef = useRef(0);

  // Orbital ring configurations
  const orbitalRings: OrbitalRing[] = [
    { radius: 120, speed: 0.0008, dotCount: 60, dotSize: 1.5, opacity: 0.3, direction: 1, baseAngle: 0 },
    { radius: 180, speed: 0.0006, dotCount: 80, dotSize: 1.2, opacity: 0.25, direction: -1, baseAngle: 45 },
    { radius: 250, speed: 0.0004, dotCount: 100, dotSize: 1, opacity: 0.2, direction: 1, baseAngle: 90 },
    { radius: 320, speed: 0.0003, dotCount: 120, dotSize: 0.8, opacity: 0.15, direction: -1, baseAngle: 135 },
    { radius: 400, speed: 0.0002, dotCount: 140, dotSize: 0.6, opacity: 0.1, direction: 1, baseAngle: 180 },
  ];

  // Initialize particles
  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    const particleCount = Math.floor((width * height) / 15000);

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        speed: Math.random() * 0.5 + 0.5,
      });
    }
    particlesRef.current = particles;
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
        initParticles(clientWidth, clientHeight);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initParticles]);

  // Handle mouse movement with trail
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setMousePos(newPos);
      
      // Add to trail
      mouseTrailRef.current.push({ ...newPos, age: 0 });
      if (mouseTrailRef.current.length > 30) {
        mouseTrailRef.current.shift();
      }
    }
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    const animate = () => {
      timeRef.current += 16;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw gradient background
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.max(dimensions.width, dimensions.height)
      );
      gradient.addColorStop(0, 'rgba(26, 24, 22, 1)');
      gradient.addColorStop(0.5, 'rgba(13, 12, 11, 1)');
      gradient.addColorStop(1, 'rgba(5, 5, 5, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw mouse trail
      if (isHovering && mouseTrailRef.current.length > 1) {
        ctx.beginPath();
        ctx.moveTo(mouseTrailRef.current[0].x, mouseTrailRef.current[0].y);
        
        for (let i = 1; i < mouseTrailRef.current.length; i++) {
          const point = mouseTrailRef.current[i];
          const prevPoint = mouseTrailRef.current[i - 1];
          
          // Smooth curve
          const midX = (point.x + prevPoint.x) / 2;
          const midY = (point.y + prevPoint.y) / 2;
          ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
          
          // Age the point
          mouseTrailRef.current[i].age += 0.05;
        }
        
        // Draw trail with gradient opacity
        const trailGradient = ctx.createLinearGradient(
          mouseTrailRef.current[0].x,
          mouseTrailRef.current[0].y,
          mouseTrailRef.current[mouseTrailRef.current.length - 1].x,
          mouseTrailRef.current[mouseTrailRef.current.length - 1].y
        );
        trailGradient.addColorStop(0, 'rgba(242, 187, 106, 0)');
        trailGradient.addColorStop(0.5, 'rgba(242, 187, 106, 0.15)');
        trailGradient.addColorStop(1, 'rgba(242, 187, 106, 0.3)');
        
        ctx.strokeStyle = trailGradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        // Draw glow at cursor position
        const cursorGlow = ctx.createRadialGradient(
          mousePos.x, mousePos.y, 0,
          mousePos.x, mousePos.y, 50
        );
        cursorGlow.addColorStop(0, 'rgba(242, 187, 106, 0.15)');
        cursorGlow.addColorStop(0.5, 'rgba(242, 187, 106, 0.05)');
        cursorGlow.addColorStop(1, 'rgba(242, 187, 106, 0)');
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 50, 0, Math.PI * 2);
        ctx.fillStyle = cursorGlow;
        ctx.fill();
        
        // Remove old trail points
        mouseTrailRef.current = mouseTrailRef.current.filter(p => p.age < 1);
      }

      // Calculate mouse influence
      const mouseInfluence = isHovering ? 1 : 0;
      const dx = mousePos.x - centerX;
      const dy = mousePos.y - centerY;
      const mouseAngle = Math.atan2(dy, dx);
      const mouseDistance = Math.sqrt(dx * dx + dy * dy);

      // Draw orbital rings with dots
      orbitalRings.forEach((ring) => {
        const time = timeRef.current * ring.speed * ring.direction;
        
        for (let i = 0; i < ring.dotCount; i++) {
          const baseAngle = (i / ring.dotCount) * Math.PI * 2 + ring.baseAngle;
          let angle = baseAngle + time;
          
          if (mouseInfluence > 0 && mouseDistance < ring.radius + 100) {
            const angleDiff = angle - mouseAngle;
            const repelStrength = Math.max(0, 1 - mouseDistance / (ring.radius + 100));
            angle += Math.sin(angleDiff) * repelStrength * 0.3 * mouseInfluence;
          }

          const waveOffset = Math.sin(time * 2 + i * 0.1) * 5;
          const currentRadius = ring.radius + waveOffset;

          const x = centerX + Math.cos(angle) * currentRadius;
          const y = centerY + Math.sin(angle) * currentRadius;

          const pulseOpacity = ring.opacity * (0.7 + 0.3 * Math.sin(time * 3 + i * 0.2));
          
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, ring.dotSize * 4);
          glowGradient.addColorStop(0, `rgba(242, 187, 106, ${pulseOpacity})`);
          glowGradient.addColorStop(1, 'rgba(242, 187, 106, 0)');
          
          ctx.beginPath();
          ctx.arc(x, y, ring.dotSize * 4, 0, Math.PI * 2);
          ctx.fillStyle = glowGradient;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x, y, ring.dotSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(242, 187, 106, ${pulseOpacity * 1.5})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(242, 187, 106, ${ring.opacity * 0.15})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw floating particles
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = dimensions.width;
        if (particle.x > dimensions.width) particle.x = 0;
        if (particle.y < 0) particle.y = dimensions.height;
        if (particle.y > dimensions.height) particle.y = 0;

        if (isHovering) {
          const pdx = particle.x - mousePos.x;
          const pdy = particle.y - mousePos.y;
          const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
          const maxDist = 150;

          if (pDist < maxDist) {
            const force = (1 - pDist / maxDist) * 2;
            particle.x += (pdx / pDist) * force;
            particle.y += (pdy / pDist) * force;
          }
        }

        const particleGlow = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 3
        );
        particleGlow.addColorStop(0, `rgba(242, 187, 106, ${particle.opacity})`);
        particleGlow.addColorStop(1, 'rgba(242, 187, 106, 0)');

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = particleGlow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242, 187, 106, ${particle.opacity * 1.2})`;
        ctx.fill();
      });

      // Draw central glow
      const centralGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
      centralGlow.addColorStop(0, 'rgba(242, 187, 106, 0.08)');
      centralGlow.addColorStop(0.5, 'rgba(242, 187, 106, 0.03)');
      centralGlow.addColorStop(1, 'rgba(242, 187, 106, 0)');
      ctx.beginPath();
      ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
      ctx.fillStyle = centralGlow;
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [dimensions, mousePos, isHovering, orbitalRings]);

  const handleScrollClick = () => {
    if (onScrollDown) {
      onScrollDown();
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={containerRef}
      className="interactive-hero"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* Content overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        {/* Official Logo */}
        <div
          className="hero-logo"
          style={{
            marginBottom: '2rem',
            animation: 'fadeInScale 1s ease-out forwards',
            pointerEvents: 'auto',
            filter: 'drop-shadow(0 0 30px rgba(242, 187, 106, 0.4))',
          }}
        >
          <Image 
            src="/logooficial.svg" 
            alt="Haltere Club" 
            width={280} 
            height={50}
            priority
          />
        </div>

        {/* Separator line */}
        <div
          style={{
            width: '60px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #F2BB6A, transparent)',
            marginBottom: '2rem',
            animation: 'expandWidth 1s ease-out 0.4s forwards',
            opacity: 0,
          }}
        />

        {/* Tagline */}
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 300,
            color: 'rgba(255, 255, 255, 0.9)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            textAlign: 'center',
            animation: 'fadeInUp 1s ease-out 0.5s forwards',
            opacity: 0,
          }}
        >
          Club Silencioso del Bienestar
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: 'clamp(0.875rem, 1.5vw, 1.1rem)',
            fontWeight: 300,
            color: 'rgba(255, 255, 255, 0.6)',
            maxWidth: '600px',
            textAlign: 'center',
            lineHeight: 1.8,
            padding: '0 2rem',
            marginBottom: '3rem',
            animation: 'fadeInUp 1s ease-out 0.7s forwards',
            opacity: 0,
          }}
        >
          Autorrealización a través de la satisfacción de las necesidades físicas 
          e intelectuales. Sentimiento de pertenencia anónima, rodeándose de 
          personas con los mismos valores. Privacidad y discreción.
        </p>

        {/* CTA Button */}
        <Link
          href="/apply"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 2.5rem',
            background: '#F2BB6A',
            color: '#0d0c0b',
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            borderRadius: '0',
            border: '2px solid #F2BB6A',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: 'fadeInUp 1s ease-out 0.9s forwards',
            opacity: 0,
            pointerEvents: 'auto',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#F2BB6A';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(242, 187, 106, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#F2BB6A';
            e.currentTarget.style.color = '#0d0c0b';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Aplicar a Membresía
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0l-1.5 1.5L11 6H0v2h11L6.5 12.5 8 14l6-6-6-6z"/>
          </svg>
        </Link>

        {/* Scroll hint - now clickable */}
        <button
          onClick={handleScrollClick}
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeInUp 1s ease-out 1.2s forwards, bounce 2s ease-in-out infinite 2s',
            opacity: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              color: 'rgba(242, 187, 106, 0.4)',
              textTransform: 'uppercase',
            }}
          >
            Descubre más
          </span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(242, 187, 106, 0.5)" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes expandWidth {
          from {
            opacity: 0;
            width: 0;
          }
          to {
            opacity: 1;
            width: 60px;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(10px);
          }
        }

        .interactive-hero a:focus,
        .interactive-hero button:focus {
          outline: 2px solid #F2BB6A;
          outline-offset: 4px;
        }
      `}</style>
    </div>
  );
}