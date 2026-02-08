'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Lazy load the Player to avoid SSR issues
const Player = dynamic(
  () => import('@remotion/player').then((mod) => mod.Player),
  { ssr: false }
);

// Import our composition
import { HeroComposition, heroCompositionConfig } from './HeroAnimation';

interface HeroPlayerProps {
  className?: string;
}

export default function HeroPlayer({ className }: HeroPlayerProps) {
  const [isClient, setIsClient] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show placeholder during SSR
  if (!isClient) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '500px',
          background: 'linear-gradient(180deg, #1a1816 0%, #0d0c0b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '2px solid rgba(242, 187, 106, 0.2)',
            borderTopColor: '#F2BB6A',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '500px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <Player
        component={HeroComposition}
        durationInFrames={heroCompositionConfig.durationInFrames}
        fps={heroCompositionConfig.fps}
        compositionWidth={heroCompositionConfig.width}
        compositionHeight={heroCompositionConfig.height}
        style={{
          width: '100%',
          height: '100%',
        }}
        loop
        autoPlay
        controls={false}
        showVolumeControls={false}
        clickToPlay={false}
      />
      
      {/* Overlay gradient for text readability */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}