import { Sprite, useTick } from '@pixi/react';
import { FC, useCallback, useEffect, useState } from 'react';
import { PlayerState } from '../types';

interface MarioProps {
  onPositionUpdate: (position: PlayerState) => void;
  initialState: PlayerState;
}

export const Mario: FC<MarioProps> = ({ onPositionUpdate, initialState }) => {
  const [state, setState] = useState<PlayerState>(initialState);
  const GRAVITY = 0.5;
  const JUMP_FORCE = -10;
  const MOVE_SPEED = 3;
  
  
  const MARIO_WIDTH = 32; 
  const MARIO_HEIGHT = 32; 

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch(e.key.toLowerCase()) {
      case 'arrowleft':
      case 'a':
        setState(prev => ({
          ...prev,
          vx: -MOVE_SPEED,
          direction: 'left',
          isMoving: true
        }));
        break;
      case 'arrowright':
      case 'd':
        setState(prev => ({
          ...prev,
          vx: MOVE_SPEED,
          direction: 'right',
          isMoving: true
        }));
        break;
      case 'arrowup':
      case 'w':
      case ' ':
        if (!state.isJumping) {
          setState(prev => ({
            ...prev,
            vy: JUMP_FORCE,
            isJumping: true
          }));
          new Audio('/assets/jump.wav').play();
        }
        break;
    }
  }, [state.isJumping]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch(e.key.toLowerCase()) {
      case 'arrowleft':
      case 'a':
      case 'arrowright':
      case 'd':
        setState(prev => ({
          ...prev,
          vx: 0,
          isMoving: false
        }));
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useTick((delta) => {
    setState(prev => {
      const nextState = { ...prev };
      
      nextState.x += nextState.vx * delta;
      nextState.y += nextState.vy * delta;
      nextState.vy += GRAVITY * delta;

      // Điều chỉnh độ cao mặt đất để phù hợp với nền gạch
      const GROUND_LEVEL = 500; // Điều chỉnh số này để phù hợp với background
      if (nextState.y > GROUND_LEVEL) {
        nextState.y = GROUND_LEVEL;
        nextState.vy = 0;
        nextState.isJumping = false;
      }

      onPositionUpdate(nextState);
      return nextState;
    });
  });

  return (
    <Sprite
      image="/assets/mario.png"
      x={state.x}
      y={state.y}
      width={MARIO_WIDTH}
      height={MARIO_HEIGHT}
      anchor={0.5}
      scale={[state.direction === 'left' ? -1 : 1, 1]}
    />
  );
};