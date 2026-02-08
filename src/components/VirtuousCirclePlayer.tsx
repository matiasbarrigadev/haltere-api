'use client';

import React, { useMemo } from 'react';
import { Player } from '@remotion/player';
import { VirtuousCircleAnimation } from './VirtuousCircleAnimation';

interface VirtuousCirclePlayerProps {
  width?: number;
  height?: number;
  className?: string;
}

export const VirtuousCirclePlayer: React.FC<VirtuousCirclePlayerProps> = ({
  width = 600,
  height = 600,
  className,
}) => {
  const compositionWidth = 600;
  const compositionHeight = 600;
  const fps = 30;
  const durationInSeconds = 8; // 8 second animation then loops
  
  const style = useMemo(
    () => ({
      width: '100%',
      maxWidth: width,
      aspectRatio: `${compositionWidth} / ${compositionHeight}`,
    }),
    [width]
  );

  return (
    <div className={className} style={style}>
      <Player
        component={VirtuousCircleAnimation}
        durationInFrames={fps * durationInSeconds}
        compositionWidth={compositionWidth}
        compositionHeight={compositionHeight}
        fps={fps}
        style={{
          width: '100%',
          height: '100%',
        }}
        loop
        autoPlay
        controls={false}
        showVolumeControls={false}
      />
    </div>
  );
};

export default VirtuousCirclePlayer;