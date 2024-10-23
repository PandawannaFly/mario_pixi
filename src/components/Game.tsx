// src/components/Game.tsx

import { Stage } from '@pixi/react';
import { FC, useEffect, useState } from 'react';
import { Background } from './Background';
import { Mario } from './Mario';
import { GameState, PlayerState } from '../types';

export const Game: FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    coins: 0
  });

  const [playerState, setPlayerState] = useState<PlayerState>({
    x: 100,
    y: 500,
    vx: 0,
    vy: 0,
    isJumping: false,
    direction: 'right',
    isMoving: false
  });

  useEffect(() => {
    const music = new Audio('/assets/overworld.mp3');
    music.loop = true;
    music.volume = 0.3;
    music.play();

    return () => {
      music.pause();
    };
  }, []);

  return (
    <div className="game-container">
      <div className="scorebar">
        <p>
          <span>MARIO</span>
          <span>{gameState.score.toString().padStart(6, '0')}</span>
          <span>🪙 x {gameState.coins.toString().padStart(2, '0')}</span>
        </p>
      </div>
      
      <Stage width={2010} height={600} options={{ backgroundColor: 0x6b88ff }}>
        <Background />
        <Mario 
          initialState={playerState}
          onPositionUpdate={setPlayerState}
        />
      </Stage>
    </div>
  );
};