'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Wellness dimensions with their colors, descriptions, and position calculations
const DIMENSIONS = [
  { 
    name: 'Mejorar la Salud', 
    color: '#F2BB6A', 
    angle: 30,
    description: 'Un cuerpo sano es la base de todo. El ejercicio regular fortalece tu sistema inmune, mejora tu salud cardiovascular y aumenta tu energía vital.'
  },
  { 
    name: 'Dormir Mejor', 
    color: '#D4A85A', 
    angle: 90,
    description: 'El ejercicio físico regular mejora la calidad del sueño, te ayuda a conciliar el sueño más rápido y a despertar más descansado.'
  },
  { 
    name: 'Plena Concentración', 
    color: '#9A8A70', 
    angle: 150,
    description: 'Un buen descanso y un cuerpo activo mejoran tu capacidad de concentración, memoria y claridad mental durante el día.'
  },
  { 
    name: 'Mejorar el Aspecto', 
    color: '#7A6A5A', 
    angle: 210,
    description: 'El ejercicio tonifica tu cuerpo, mejora tu postura y te da esa apariencia saludable y radiante que refleja bienestar interior.'
  },
  { 
    name: 'Mejorar la Nutrición', 
    color: '#8B5A3C', 
    angle: 270,
    description: 'Cuando entrenas, naturalmente te inclinas hacia mejores elecciones alimenticias. Tu cuerpo te pide lo que necesita.'
  },
  { 
    name: 'Mejor Forma Física', 
    color: '#6B4A3C', 
    angle: 330,
    description: 'Una mejor nutrición potencia tus entrenamientos, creando un ciclo virtuoso que mejora constantemente tu condición física.'
  },
];

const HaltereLogoSVG: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="#1a1816" stroke="#F2BB6A" strokeWidth="2" />
    <g fill="#F2BB6A">
      {/* Three vertical bars representing dumbbells */}
      <rect x="25" y="25" width="6" height="50" rx="3" />
      <rect x="47" y="25" width="6" height="50" rx="3" />
      <rect x="69" y="25" width="6" height="50" rx="3" />
      {/* Horizontal connectors */}
      <rect x="25" y="30" width="50" height="4" rx="2" />
      <rect x="25" y="66" width="50" height="4" rx="2" />
    </g>
  </svg>
);

interface TooltipProps {
  content: string;
  title: string;
  color: string;
  position: { x: number; y: number };
  visible: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ content, title, color, position, visible }) => {
  if (!visible) return null;
  
  // Adjust position to keep tooltip in view
  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    left: position.x > 300 ? position.x - 220 : position.x + 20,
    top: position.y > 300 ? position.y - 100 : position.y,
    width: '200px',
    padding: '12px 16px',
    backgroundColor: 'rgba(26, 24, 22, 0.95)',
    border: `1px solid ${color}`,
    borderRadius: '8px',
    boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 10px ${color}33`,
    zIndex: 100,
    pointerEvents: 'none',
    opacity: visible ? 1 : 0,
    transform: visible ? 'scale(1)' : 'scale(0.95)',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
  };

  return (
    <div style={tooltipStyle}>
      <h4 style={{ 
        color: color, 
        fontSize: '14px', 
        fontWeight: 600, 
        marginBottom: '8px',
        margin: 0,
        paddingBottom: '8px',
        borderBottom: `1px solid ${color}33`
      }}>
        {title}
      </h4>
      <p style={{ 
        color: 'rgba(255,255,255,0.8)', 
        fontSize: '12px', 
        lineHeight: 1.5,
        margin: 0,
        marginTop: '8px'
      }}>
        {content}
      </p>
    </div>
  );
};

interface VirtuousCircleProps {
  width?: number;
  height?: number;
  className?: string;
}

export const VirtuousCircle: React.FC<VirtuousCircleProps> = ({
  width = 600,
  height = 600,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for triggering animation once
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  const centerX = 300;
  const centerY = 300;
  const outerRadius = 250;
  const innerRadius = 180;
  const textRadius = 145;

  // Create arc path for segment
  const createArcPath = (
    startAngle: number,
    endAngle: number,
    innerR: number,
    outerR: number
  ): string => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + outerR * Math.cos(startAngleRad);
    const y1 = centerY + outerR * Math.sin(startAngleRad);
    const x2 = centerX + outerR * Math.cos(endAngleRad);
    const y2 = centerY + outerR * Math.sin(endAngleRad);
    const x3 = centerX + innerR * Math.cos(endAngleRad);
    const y3 = centerY + innerR * Math.sin(endAngleRad);
    const x4 = centerX + innerR * Math.cos(startAngleRad);
    const y4 = centerY + innerR * Math.sin(startAngleRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
  };

  // Get text position - always horizontal text
  const getTextPosition = (angle: number) => {
    const angleRad = (angle - 90) * (Math.PI / 180);
    return {
      x: centerX + textRadius * Math.cos(angleRad),
      y: centerY + textRadius * Math.sin(angleRad),
    };
  };

  // Calculate segment paths
  const segments = DIMENSIONS.map((dim, index) => {
    const gap = 3;
    const segmentAngle = 60 - gap;
    const startAngle = dim.angle - 30 + gap / 2;
    const endAngle = startAngle + segmentAngle;
    
    return {
      ...dim,
      path: createArcPath(startAngle, endAngle, innerRadius, outerRadius),
      textPos: getTextPosition(dim.angle),
      index,
    };
  });

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        maxWidth: width,
        aspectRatio: '1 / 1',
        position: 'relative',
      }}
      onMouseMove={handleMouseMove}
    >
      <svg
        viewBox="0 0 600 600"
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
        }}
      >
        <defs>
          {/* Glow filter for segments */}
          <filter id="segmentGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Golden glow for logo */}
          <filter id="logoGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feFlood floodColor="#F2BB6A" floodOpacity="0.4" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for each segment */}
          {DIMENSIONS.map((dim, i) => (
            <linearGradient
              key={`grad-${i}`}
              id={`segGrad${i}`}
              gradientTransform={`rotate(${dim.angle})`}
            >
              <stop offset="0%" stopColor={dim.color} stopOpacity="1" />
              <stop offset="100%" stopColor={dim.color} stopOpacity="0.7" />
            </linearGradient>
          ))}
        </defs>

        {/* Background ring - fades in first */}
        <circle
          cx={centerX}
          cy={centerY}
          r={(outerRadius + innerRadius) / 2}
          fill="none"
          stroke="rgba(242, 187, 106, 0.1)"
          strokeWidth={outerRadius - innerRadius}
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.8s ease-out',
          }}
        />

        {/* Animated segments */}
        {segments.map((segment, index) => {
          const delay = index * 0.15;
          const isHovered = hoveredIndex === index;

          return (
            <g key={index}>
              {/* Segment arc */}
              <path
                d={segment.path}
                fill={`url(#segGrad${index})`}
                filter="url(#segmentGlow)"
                style={{
                  opacity: isVisible ? (isHovered ? 1 : 0.85) : 0,
                  transform: isVisible 
                    ? `scale(${isHovered ? 1.02 : 1})` 
                    : 'scale(0.8)',
                  transformOrigin: `${centerX}px ${centerY}px`,
                  transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />

              {/* Segment border highlight */}
              <path
                d={segment.path}
                fill="none"
                stroke={isHovered ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'}
                strokeWidth={isHovered ? 2 : 1}
                style={{
                  opacity: isVisible ? 0.6 : 0,
                  transition: `opacity 0.6s ease-out ${delay}s, stroke 0.2s ease, stroke-width 0.2s ease`,
                  pointerEvents: 'none',
                }}
              />
            </g>
          );
        })}

        {/* Dimension labels - always horizontal */}
        {segments.map((segment, index) => {
          const delay = 0.5 + index * 0.1;
          const isHovered = hoveredIndex === index;
          
          // Split text for multiline display
          const words = segment.name.split(' ');
          const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
          const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');

          return (
            <g
              key={`text-${index}`}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                transition: `opacity 0.5s ease-out ${delay}s, transform 0.5s ease-out ${delay}s`,
                pointerEvents: 'none',
              }}
            >
              <text
                x={segment.textPos.x}
                y={segment.textPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isHovered ? '#ffffff' : segment.color}
                fontSize={isHovered ? '15' : '14'}
                fontWeight={isHovered ? '600' : '500'}
                fontFamily="system-ui, -apple-system, sans-serif"
                style={{
                  transition: 'fill 0.2s ease, font-size 0.2s ease',
                  textShadow: isHovered ? `0 0 10px ${segment.color}` : 'none',
                }}
              >
                <tspan x={segment.textPos.x} dy="-8">{line1}</tspan>
                <tspan x={segment.textPos.x} dy="16">{line2}</tspan>
              </text>
            </g>
          );
        })}

        {/* Center logo */}
        <g
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'scale(1)' : 'scale(0)',
            transformOrigin: `${centerX}px ${centerY}px`,
            transition: 'opacity 0.8s ease-out 0.8s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s',
          }}
          filter="url(#logoGlow)"
        >
          <foreignObject x={centerX - 50} y={centerY - 50} width={100} height={100}>
            <HaltereLogoSVG size={100} />
          </foreignObject>
        </g>

        {/* Decorative outer ring - subtle continuous rotation */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius + 15}
          fill="none"
          stroke="rgba(242, 187, 106, 0.2)"
          strokeWidth="1"
          strokeDasharray="4 8"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 1s ease-out 0.3s',
            animation: isVisible ? 'spin 60s linear infinite' : 'none',
            transformOrigin: `${centerX}px ${centerY}px`,
          }}
        />

        {/* Inner decorative ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius - 15}
          fill="none"
          stroke="rgba(242, 187, 106, 0.15)"
          strokeWidth="1"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 1s ease-out 0.8s',
          }}
        />

        {/* Pulsing center glow */}
        <circle
          cx={centerX}
          cy={centerY}
          r={60}
          fill="url(#centerGlow)"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 1s ease-out 1s',
            animation: isVisible ? 'pulse 3s ease-in-out infinite' : 'none',
          }}
        />

        {/* Center glow gradient */}
        <defs>
          <radialGradient id="centerGlow">
            <stop offset="0%" stopColor="#F2BB6A" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#F2BB6A" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <Tooltip
          title={DIMENSIONS[hoveredIndex].name}
          content={DIMENSIONS[hoveredIndex].description}
          color={DIMENSIONS[hoveredIndex].color}
          position={mousePosition}
          visible={hoveredIndex !== null}
        />
      )}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default VirtuousCircle;