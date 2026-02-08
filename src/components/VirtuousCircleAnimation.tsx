'use client';

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

// Wellness dimensions with their colors based on reference image
const DIMENSIONS = [
  { name: 'Mejorar la Salud', color: '#F2BB6A', angle: 0 },
  { name: 'Dormir Mejor', color: '#D4A85A', angle: 60 },
  { name: 'Plena Concentración', color: '#9A8A70', angle: 120 },
  { name: 'Mejorar el Aspecto', color: '#7A6A5A', angle: 180 },
  { name: 'Mejorar la Nutrición', color: '#8B5A3C', angle: 240 },
  { name: 'Mejor Forma Física', color: '#6B4A3C', angle: 300 },
];

const HaltereLogoSVG: React.FC<{ size: number; opacity: number }> = ({ size, opacity }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity }}>
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

export const VirtuousCircleAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  const centerX = 300;
  const centerY = 300;
  const outerRadius = 250;
  const innerRadius = 180;
  const textRadius = 140;
  
  // Animation phases
  const segmentStartFrame = 15;
  const segmentDuration = 20;
  const logoStartFrame = segmentStartFrame + (DIMENSIONS.length * 8);
  const textStartFrame = logoStartFrame + 30;
  const rotationStartFrame = textStartFrame + 60;
  
  // Overall rotation (very subtle continuous rotation)
  const rotation = interpolate(
    frame,
    [rotationStartFrame, durationInFrames],
    [0, 15],
    { extrapolateRight: 'clamp' }
  );
  
  // Logo animation
  const logoScale = spring({
    frame: frame - logoStartFrame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.8 },
  });
  
  const logoOpacity = interpolate(
    frame,
    [logoStartFrame, logoStartFrame + 20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  // Glow pulse animation
  const glowPulse = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0.3, 0.6]
  );
  
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
  
  // Get text position for dimension
  const getTextPosition = (angle: number) => {
    const angleRad = (angle + 30 - 90) * (Math.PI / 180);
    return {
      x: centerX + textRadius * Math.cos(angleRad),
      y: centerY + textRadius * Math.sin(angleRad),
      rotation: angle + 30,
    };
  };

  return (
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
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Golden glow for logo */}
        <filter id="logoGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feFlood floodColor="#F2BB6A" floodOpacity={glowPulse} />
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
            gradientTransform={`rotate(${dim.angle + 30})`}
          >
            <stop offset="0%" stopColor={dim.color} stopOpacity="1" />
            <stop offset="100%" stopColor={dim.color} stopOpacity="0.7" />
          </linearGradient>
        ))}
      </defs>
      
      {/* Rotating group */}
      <g transform={`rotate(${rotation}, ${centerX}, ${centerY})`}>
        {/* Background ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={(outerRadius + innerRadius) / 2}
          fill="none"
          stroke="rgba(242, 187, 106, 0.1)"
          strokeWidth={outerRadius - innerRadius}
          opacity={interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })}
        />
        
        {/* Animated segments */}
        {DIMENSIONS.map((dim, index) => {
          const segmentFrame = segmentStartFrame + index * 8;
          
          // Segment animation
          const segmentProgress = spring({
            frame: frame - segmentFrame,
            fps,
            config: { damping: 15, stiffness: 80, mass: 0.5 },
          });
          
          const segmentOpacity = interpolate(
            frame,
            [segmentFrame, segmentFrame + 15],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          
          // Calculate arc angles with gap
          const gap = 2; // degrees
          const segmentAngle = 60 - gap;
          const startAngle = dim.angle + gap / 2;
          const endAngle = startAngle + segmentAngle * segmentProgress;
          
          const path = createArcPath(startAngle, endAngle, innerRadius, outerRadius);
          
          return (
            <g key={index}>
              {/* Segment arc */}
              <path
                d={path}
                fill={`url(#segGrad${index})`}
                opacity={segmentOpacity}
                filter="url(#segmentGlow)"
                style={{
                  transition: 'opacity 0.3s ease',
                }}
              />
              
              {/* Segment border highlight */}
              <path
                d={path}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
                opacity={segmentOpacity * 0.5}
              />
            </g>
          );
        })}
      </g>
      
      {/* Dimension labels (outside rotation group for readability) */}
      {DIMENSIONS.map((dim, index) => {
        const textFrame = textStartFrame + index * 10;
        
        const textOpacity = interpolate(
          frame,
          [textFrame, textFrame + 20],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        
        const textY = spring({
          frame: frame - textFrame,
          fps,
          config: { damping: 20, stiffness: 100 },
        });
        
        const pos = getTextPosition(dim.angle);
        const textRotation = pos.rotation > 90 && pos.rotation < 270 
          ? pos.rotation + 180 
          : pos.rotation;
        
        // Split text for multiline display
        const words = dim.name.split(' ');
        const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
        const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
        
        return (
          <g
            key={`text-${index}`}
            transform={`translate(${pos.x}, ${pos.y + (1 - textY) * 20})`}
            opacity={textOpacity}
          >
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fill={dim.color}
              fontSize="14"
              fontWeight="500"
              fontFamily="system-ui, sans-serif"
              transform={`rotate(${textRotation - pos.rotation})`}
            >
              <tspan x="0" dy="-8">{line1}</tspan>
              <tspan x="0" dy="16">{line2}</tspan>
            </text>
          </g>
        );
      })}
      
      {/* Center logo */}
      <g
        transform={`translate(${centerX - 50 * logoScale}, ${centerY - 50 * logoScale}) scale(${logoScale})`}
        filter="url(#logoGlow)"
      >
        <HaltereLogoSVG size={100} opacity={logoOpacity} />
      </g>
      
      {/* Decorative outer ring */}
      <circle
        cx={centerX}
        cy={centerY}
        r={outerRadius + 15}
        fill="none"
        stroke="rgba(242, 187, 106, 0.2)"
        strokeWidth="1"
        strokeDasharray="4 8"
        opacity={interpolate(frame, [segmentStartFrame, segmentStartFrame + 60], [0, 1], { extrapolateRight: 'clamp' })}
        style={{
          transform: `rotate(${frame * 0.2}deg)`,
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
        opacity={interpolate(frame, [logoStartFrame, logoStartFrame + 30], [0, 1], { extrapolateRight: 'clamp' })}
      />
    </svg>
  );
};

export default VirtuousCircleAnimation;