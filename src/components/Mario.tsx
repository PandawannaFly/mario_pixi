import { Sprite, useTick } from '@pixi/react';
import { FC, useCallback, useEffect, useState } from 'react';
import { PlayerState, ObstacleObject } from '../types';

interface MarioProps {
  onPositionUpdate: (position: PlayerState) => void;
  initialState: PlayerState;
  pipes: ObstacleObject[];
}

export const Mario: FC<MarioProps> = ({ onPositionUpdate, initialState, pipes }) => {
  const [state, setState] = useState<PlayerState>(initialState);
  const GRAVITY = 0.5;
  const JUMP_FORCE = -10;
  const MOVE_SPEED = 3;
  
  const MARIO_WIDTH = 32; 
  const MARIO_HEIGHT = 32;

  const SCREEN_LEFT_BOUNDARY = MARIO_WIDTH / 2; 
  const SCREEN_RIGHT_BOUNDARY = 1900 - MARIO_WIDTH / 2;

  const checkPipeCollision = (
    newX: number,
    newY: number,
    newVy: number,  
    currentState: PlayerState
  ): { x: number; y: number; vx: number; vy: number; isJumping: boolean } => {
    // hitbox Mario
    const marioBox = {
      left: newX - MARIO_WIDTH / 2,
      right: newX + MARIO_WIDTH / 2,
      top: newY - MARIO_HEIGHT / 2,
      bottom: newY + MARIO_HEIGHT / 2
    };

    // curret Mario
    const currentBox = {
      left: currentState.x - MARIO_WIDTH / 2,
      right: currentState.x + MARIO_WIDTH / 2,
      top: currentState.y - MARIO_HEIGHT / 2,
      bottom: currentState.y + MARIO_HEIGHT / 2
    };

    let finalX = newX;
    let finalY = newY;
    let finalVx = currentState.vx;
    let finalVy = newVy;  
    let isJumping = currentState.isJumping;

    for (const pipe of pipes) {
      // create hitbox pipe
      const pipeBox = {
        left: pipe.x - pipe.width / 2,
        right: pipe.x + pipe.width / 2,
        top: pipe.y - pipe.height,
        bottom: pipe.y
      };

      // check collision
      if (
        marioBox.right > pipeBox.left &&
        marioBox.left < pipeBox.right &&
        marioBox.bottom > pipeBox.top &&
        marioBox.top < pipeBox.bottom
      ) {
        // dectect direct collision
        const wasAbove = currentBox.bottom <= pipeBox.top;
        const wasBelow = currentBox.top >= pipeBox.bottom;
        const wasLeft = currentBox.right <= pipeBox.left;
        const wasRight = currentBox.left >= pipeBox.right;

        if (wasAbove) {
          finalY = pipeBox.top - MARIO_HEIGHT / 2;
          finalVy = 0;
          isJumping = false;
        } else if (wasBelow) {
          finalY = pipeBox.bottom + MARIO_HEIGHT / 2;
          finalVy = 0;
        } else if (wasLeft) {
          finalX = pipeBox.left - MARIO_WIDTH / 2;
          finalVx = 0;
        } else if (wasRight) {
          finalX = pipeBox.right + MARIO_WIDTH / 2;
          finalVx = 0;
        }
      }
    }

    return { x: finalX, y: finalY, vx: finalVx, vy: finalVy, isJumping };
  };

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
      // caculate the Vy
      const newVy = prev.vy + GRAVITY * delta;  
      
      // new cordinates
      const newX = prev.x + prev.vx * delta;
      const newY = prev.y + prev.vy * delta;  

      // check screen boundaries
      let boundedX = Math.max(SCREEN_LEFT_BOUNDARY, Math.min(newX, SCREEN_RIGHT_BOUNDARY));

      // check collision with pipes
      const collision = checkPipeCollision(boundedX, newY, newVy, prev);

      // 
      const nextState = {
        ...prev,
        x: collision.x,
        y: collision.y,
        vx: collision.vx,
        vy: collision.vy,
        isJumping: collision.isJumping
      };

      // 
      const GROUND_LEVEL = 500;
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