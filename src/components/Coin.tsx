import { Sprite } from '@pixi/react';
import { FC } from 'react';
import { CoinObject } from '../types';

interface CoinProps extends Omit<CoinObject, 'type'> {}

export const Coin: FC<CoinProps> = ({ x, y, width, height, isCollected, id }) => {
  if (isCollected) return null;

  return (
    <Sprite 
      image="/assets/coin.png"
      x={x}
      y={y}
      width={width}
      height={height}
      anchor={0.5}
      alpha={1} 
      zIndex={1} 
    />
  );
};