import { Container, Sprite } from '@pixi/react';
import { FC } from 'react';

// Organize layers from back to front
const BACKGROUND_LAYERS = [
  'mario_layer_4.gif', // clouds (back)
  'mario_layer_3.gif', // mountains
  'mario_layer_2.gif', // plants
];

const FOREGROUND_LAYER = 'mario_layer_1.gif';

interface BackgroundProps {
  children?: React.ReactNode; 
}

export const Background: FC<BackgroundProps> = ({ children }) => {
  return (
    <Container sortableChildren={true}>
     
      {BACKGROUND_LAYERS.map((layer, index) => (
        <Sprite
          key={layer}
          image={`/assets/${layer}`}
          width={8510}
          height={600}
          x={0}
          y={0}
          alpha={1}
          zIndex={index} 
        />
      ))}

      
      <Container zIndex={BACKGROUND_LAYERS.length}>
        {children}
      </Container>

     
      <Sprite
        image={`/assets/${FOREGROUND_LAYER}`}
        width={8510}
        height={600}
        x={0}
        y={0}
        alpha={1}
        zIndex={BACKGROUND_LAYERS.length + 1}
      />
    </Container>
  );
};