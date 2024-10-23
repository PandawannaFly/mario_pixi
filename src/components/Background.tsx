import { Container, Sprite } from '@pixi/react';
import { FC } from 'react';

const LAYERS = [
  'mario_layer_4.gif', // clouds
  'mario_layer_3.gif', // mountains
  'mario_layer_2.gif', // plants
  'mario_layer_1.gif'  // foreground
];

export const Background: FC = () => {
  return (
    <Container>
      {LAYERS.map((layer, index) => (
        <Sprite
          key={layer}
          image={`/assets/${layer}`}
          width={5010}
          height={600}
          x={0}
          y={0}
          alpha={1}
        />
      ))}
    </Container>
  );
};