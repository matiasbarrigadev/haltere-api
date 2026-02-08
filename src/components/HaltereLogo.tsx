'use client';

interface HaltereLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  color?: string;
}

// Official Haltere Logo based on brand guidelines
export default function HaltereLogo({ 
  className = '', 
  size = 'md', 
  variant = 'full',
  color = 'currentColor' 
}: HaltereLogoProps) {
  const heights = {
    sm: 24,
    md: 40,
    lg: 60,
    xl: 80,
  };
  
  const height = heights[size];
  const iconWidth = height;
  const fullWidth = variant === 'full' ? height * 12 : iconWidth;

  // Icon only - barbell in circle
  const IconLogo = () => (
    <svg 
      viewBox="0 0 80 80" 
      width={iconWidth} 
      height={height}
      fill={color}
      aria-label="Haltere Icon"
    >
      {/* Outer circle - partial arcs */}
      <path d="M40 2 A38 38 0 0 1 78 40" fill="none" stroke={color} strokeWidth="2"/>
      <path d="M78 40 A38 38 0 0 1 40 78" fill="none" stroke={color} strokeWidth="2"/>
      <path d="M40 78 A38 38 0 0 1 2 40" fill="none" stroke={color} strokeWidth="2"/>
      <path d="M2 40 A38 38 0 0 1 40 2" fill="none" stroke={color} strokeWidth="2"/>
      
      {/* Left barbell */}
      <rect x="18" y="20" width="3" height="40" rx="1"/>
      <rect x="14" y="25" width="11" height="6" rx="1"/>
      <rect x="14" y="49" width="11" height="6" rx="1"/>
      
      {/* Center H connector */}
      <rect x="21" y="37" width="38" height="3"/>
      
      {/* Middle vertical - T of halTere */}
      <rect x="38" y="25" width="3" height="30"/>
      
      {/* Right barbell */}
      <rect x="59" y="20" width="3" height="40" rx="1"/>
      <rect x="55" y="25" width="11" height="6" rx="1"/>
      <rect x="55" y="49" width="11" height="6" rx="1"/>
    </svg>
  );

  if (variant === 'icon') {
    return <IconLogo />;
  }

  // Full logo with text
  return (
    <svg 
      viewBox="0 0 1200 100" 
      width={fullWidth} 
      height={height}
      fill={color}
      className={className}
      aria-label="Haltere Logo"
    >
      {/* Icon */}
      <g transform="translate(0, 10) scale(1)">
        {/* Outer circle segments */}
        <path d="M40 2 A38 38 0 0 1 78 40" fill="none" stroke={color} strokeWidth="2.5"/>
        <path d="M78 40 A38 38 0 0 1 40 78" fill="none" stroke={color} strokeWidth="2.5"/>
        <path d="M40 78 A38 38 0 0 1 2 40" fill="none" stroke={color} strokeWidth="2.5"/>
        <path d="M2 40 A38 38 0 0 1 40 2" fill="none" stroke={color} strokeWidth="2.5"/>
        
        {/* Left barbell */}
        <rect x="18" y="20" width="3.5" height="40" rx="1"/>
        <rect x="14" y="25" width="12" height="6" rx="1"/>
        <rect x="14" y="49" width="12" height="6" rx="1"/>
        
        {/* Center connector */}
        <rect x="21.5" y="37" width="37" height="3.5"/>
        
        {/* Middle T */}
        <rect x="38" y="25" width="3.5" height="30"/>
        
        {/* Right barbell */}
        <rect x="58.5" y="20" width="3.5" height="40" rx="1"/>
        <rect x="54" y="25" width="12" height="6" rx="1"/>
        <rect x="54" y="49" width="12" height="6" rx="1"/>
      </g>
      
      {/* Text "haltere" */}
      <text 
        x="120" 
        y="65" 
        fontFamily="'Open Sans', Arial, sans-serif"
        fontSize="50"
        fontWeight="400"
        letterSpacing="18"
        fill={color}
      >
        haltere
      </text>
    </svg>
  );
}

// Export icon-only component for animation
export function HaltereIconLogo({ 
  size = 80, 
  color = '#F2BB6A',
  className = '' 
}: { 
  size?: number; 
  color?: string;
  className?: string;
}) {
  return (
    <svg 
      viewBox="0 0 80 80" 
      width={size} 
      height={size}
      fill={color}
      className={className}
      aria-label="Haltere Icon"
    >
      {/* Outer circle - broken into segments for style */}
      <circle cx="40" cy="40" r="37" fill="none" stroke={color} strokeWidth="2" strokeDasharray="10 3"/>
      
      {/* Left barbell */}
      <rect x="18" y="20" width="3" height="40" rx="1"/>
      <rect x="14" y="25" width="11" height="6" rx="1"/>
      <rect x="14" y="49" width="11" height="6" rx="1"/>
      
      {/* Center H connector */}
      <rect x="21" y="37" width="38" height="3"/>
      
      {/* Middle vertical - T */}
      <rect x="38" y="25" width="3" height="30"/>
      
      {/* Right barbell */}
      <rect x="59" y="20" width="3" height="40" rx="1"/>
      <rect x="55" y="25" width="11" height="6" rx="1"/>
      <rect x="55" y="49" width="11" height="6" rx="1"/>
    </svg>
  );
}