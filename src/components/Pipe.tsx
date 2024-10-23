import { Sprite } from '@pixi/react';
import { FC } from 'react';
import { ObstacleObject } from '../types';

interface PipeProps extends Omit<ObstacleObject, 'type'> {}

export const Pipe: FC<PipeProps> = ({ x, y, width, height, id }) => {
  return (
    <Sprite 
      image="/assets/pipe-low.png"
      x={x}
      y={y}
      width={width}
      height={height}
      anchor={[0.5, 1]}
      alpha={1} 
      zIndex={1} 
    />
  );
};