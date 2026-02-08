'use client';

import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Easing,
} from 'remotion';

// Animated Logo Component
const AnimatedLogo = ({ progress }: { progress: number }) => {
  const scale = interpolate(progress, [0, 1], [0.5, 1], {
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(progress, [0, 0.5], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <svg
      viewBox="0 0 100 100"
      style={{
        width: 120,
        height: 120,
        transform: `scale(${scale})`,
        opacity,
      }}
      fill="#F2BB6A"
    >
      <g>
        <rect x="20" y="15" width="4" height="70" />
        <rect x="15" y="20" width="14" height="8" rx="1" />
        <rect x="15" y="72" width="14" height="8" rx="1" />
        <rect x="24" y="45" width="52" height="4" />
        <rect x="48" y="25" width="4" height="50" />
        <rect x="76" y="15" width="4" height="70" />
        <rect x="71" y="20" width="14" height="8" rx="1" />
        <rect x="71" y="72" width="14" height="8" rx="1" />
      </g>
    </svg>
  );
};

// Floating Particle
const Particle = ({
  index,
  frame,
  totalParticles,
}: {
  index: number;
  frame: number;
  totalParticles: number;
}) => {
  const angle = (index / totalParticles) * Math.PI * 2;
  const radius = 250 + Math.sin(index * 0.5) * 100;
  const speed = 0.008 + (index % 3) * 0.002;
  const size = 3 + (index % 4);
  
  const x = Math.cos(angle + frame * speed) * radius;
  const y = Math.sin(angle + frame * speed) * radius * 0.6;
  
  const opacity = interpolate(
    Math.sin(frame * 0.02 + index),
    [-1, 1],
    [0.1, 0.4]
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#F2BB6A',
        transform: `translate(${x}px, ${y}px)`,
        opacity,
      }}
    />
  );
};

// Geometric Ring
const Ring = ({
  radius,
  frame,
  rotationDirection = 1,
  dashOffset = 0,
}: {
  radius: number;
  frame: number;
  rotationDirection?: number;
  dashOffset?: number;
}) => {
  const rotation = frame * 0.2 * rotationDirection;
  const opacity = interpolate(radius, [150, 400], [0.15, 0.05]);
  const dashLength = radius * Math.PI * 0.1;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: radius * 2,
        height: radius * 2,
        marginLeft: -radius,
        marginTop: -radius,
        borderRadius: '50%',
        border: `1px solid #F2BB6A`,
        opacity,
        transform: `rotate(${rotation}deg)`,
        background: 'transparent',
      }}
    />
  );
};

// Main Hero Animation Composition
export const HeroComposition = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // Spring animation for logo entrance
  const logoProgress = spring({
    frame,
    fps,
    config: {
      damping: 50,
      stiffness: 100,
      mass: 1,
    },
  });
  
  // Text animations
  const titleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const titleY = interpolate(frame, [20, 45], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  
  const subtitleOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const subtitleY = interpolate(frame, [35, 60], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  
  const numbersOpacity = interpolate(frame, [50, 70], [0, 0.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Background pulse
  const pulseOpacity = interpolate(
    Math.sin(frame * 0.03),
    [-1, 1],
    [0.02, 0.08]
  );

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #1a1816 0%, #0d0c0b 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Open Sans', sans-serif",
      }}
    >
      {/* Background Gradient Pulse */}
      <div
        style={{
          position: 'absolute',
          width: '150%',
          height: '150%',
          background: 'radial-gradient(ellipse at center, #F2BB6A 0%, transparent 60%)',
          opacity: pulseOpacity,
        }}
      />
      
      {/* Geometric Rings */}
      <Ring radius={180} frame={frame} rotationDirection={1} />
      <Ring radius={250} frame={frame} rotationDirection={-0.5} />
      <Ring radius={320} frame={frame} rotationDirection={0.3} />
      <Ring radius={400} frame={frame} rotationDirection={-0.2} />
      
      {/* Floating Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Particle key={i} index={i} frame={frame} totalParticles={20} />
      ))}
      
      {/* Main Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        {/* Animated Logo */}
        <AnimatedLogo progress={logoProgress} />
        
        {/* Brand Name */}
        <div
          style={{
            marginTop: 20,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <span
            style={{
              fontSize: 48,
              fontWeight: 300,
              letterSpacing: '0.35em',
              color: '#FFFFFF',
              textTransform: 'lowercase',
            }}
          >
            haltere
          </span>
        </div>
        
        {/* Number Tag */}
        <div
          style={{
            opacity: numbersOpacity,
            marginTop: 4,
          }}
        >
          <span
            style={{
              fontSize: 14,
              letterSpacing: '0.5em',
              color: '#F2BB6A',
            }}
          >
            28250
          </span>
        </div>
        
        {/* Tagline */}
        <div
          style={{
            marginTop: 40,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          <span
            style={{
              fontSize: 16,
              letterSpacing: '0.3em',
              color: '#D4C9C2',
              textTransform: 'uppercase',
            }}
          >
            Club Silencioso del Bienestar
          </span>
        </div>
      </div>
      
      {/* Corner Accents */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 40,
          width: 60,
          height: 60,
          borderTop: '1px solid rgba(242, 187, 106, 0.3)',
          borderLeft: '1px solid rgba(242, 187, 106, 0.3)',
          opacity: interpolate(frame, [60, 80], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          right: 40,
          width: 60,
          height: 60,
          borderBottom: '1px solid rgba(242, 187, 106, 0.3)',
          borderRight: '1px solid rgba(242, 187, 106, 0.3)',
          opacity: interpolate(frame, [60, 80], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />
    </AbsoluteFill>
  );
};

// Export composition config
export const heroCompositionConfig = {
  id: 'HeroAnimation',
  component: HeroComposition,
  durationInFrames: 150, // 5 seconds at 30fps
  fps: 30,
  width: 1280,
  height: 720,
};