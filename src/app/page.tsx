'use client';

import dynamic from 'next/dynamic';

// Lazy load the Interactive Hero component
const InteractiveHero = dynamic(() => import('@/components/InteractiveHero'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100vw',
      height: '100vh',
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
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  ),
});

export default function Home() {
  return <InteractiveHero />;
}