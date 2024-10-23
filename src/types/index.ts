export interface Position {
    x: number;
    y: number;
  }
  
  export interface Size {
    width: number;
    height: number;
  }
  
  export interface Velocity {
    vx: number;
    vy: number;
  }
  
  export interface GameState {
    score: number;
    coins: number;
  }
  
  export interface Sprite extends Position, Size {
    texture: string;
  }
  
  export interface GameObject extends Position, Size {
    id: number;
    type: 'coin' | 'obstacle';
  }
  
  export interface CoinObject extends GameObject {
    type: 'coin';
    isCollected: boolean;
  }
  
  export interface ObstacleObject extends GameObject {
    type: 'obstacle';
  }
  
  export interface PlayerState extends Position, Velocity {
    isJumping: boolean;
    direction: 'left' | 'right';
    isMoving: boolean;
  }