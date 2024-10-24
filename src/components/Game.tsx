import { Container, Stage } from '@pixi/react';
import { FC, useEffect, useState, useCallback, useRef } from 'react';
import { Background } from './Background';
import { Mario } from './Mario';
import { Coin } from './Coin';
import { Pipe } from './Pipe';
import { GameState, PlayerState, CoinObject, ObstacleObject, Position, Size } from '../types';
import styles from './Game.module.css';


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
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const coinSoundRef = useRef<HTMLAudioElement | null>(null);

  

  const [coins, setCoins] = useState<CoinObject[]>([
    { id: 1, type: 'coin', x: 300, y: 400, width: 30, height: 30, isCollected: false },
    { id: 2, type: 'coin', x: 500, y: 300, width: 30, height: 30, isCollected: false },
    { id: 3, type: 'coin', x: 700, y: 400, width: 30, height: 30, isCollected: false },
    { id: 4, type: 'coin', x: 900, y: 300, width: 30, height: 30, isCollected: false },
  ]);

  const pipes: ObstacleObject[] = [
    { id: 1, type: 'obstacle', x: 1162, y: 550, width: 70, height: 117 },
    { id: 2, type: 'obstacle', x: 1568, y: 550, width: 70, height: 150 },
    { id: 3, type: 'obstacle', x: 1885, y: 550, width: 70, height: 180 },
  ];

  const checkCollision = useCallback((rect1: Position & Size, rect2: Position & Size): boolean => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y + rect1.height > rect2.y &&
      rect1.y < rect2.y + rect2.height
    );
  }, []);

 

  const collectCoin = useCallback((coinId: number) => {
    const coinSound = new Audio('/assets/coin.mp3');
    coinSound.volume = 0.5;
    coinSound.play();

    setCoins(prevCoins => 
      prevCoins.map(coin => 
        coin.id === coinId ? { ...coin, isCollected: true } : coin
      )
    );

    setGameState(prev => ({
      score: prev.score + 100,
      coins: prev.coins + 1
    }));
  }, []);

  const checkCoinCollision = useCallback(() => {
    const marioRect: Position & Size = {
      x: playerState.x - 25,
      y: playerState.y - 25,
      width: 50,
      height: 50
    };

    coins.forEach(coin => {
      if (!coin.isCollected && checkCollision(marioRect, coin)) {
        collectCoin(coin.id);
      }
    });
  }, [playerState, coins, checkCollision, collectCoin]);

 // init audio
 useEffect(() => {
  backgroundMusicRef.current = new Audio('/assets/overworld.mp3');
  backgroundMusicRef.current.loop = true;
  backgroundMusicRef.current.volume = 0.3;

  coinSoundRef.current = new Audio('/assets/coin.mp3');
  coinSoundRef.current.volume = 0.5;

  return () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
  };
}, []);

// toggle audio
const toggleAudio = useCallback(() => {
  if (!isAudioInitialized) {
    // first click
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.play()
        .then(() => {
          setIsAudioInitialized(true);
          setIsMuted(false);
        })
        .catch(console.error);
    }
  } else {
    // after click
    if (backgroundMusicRef.current) {
      if (isMuted) {
        backgroundMusicRef.current.play();
        backgroundMusicRef.current.volume = 0.3;
        coinSoundRef.current!.volume = 0.5;
      } else {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current.volume = 0;
        coinSoundRef.current!.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  }
}, [isAudioInitialized, isMuted]);

  useEffect(() => {
    checkCoinCollision();
  }, [playerState, checkCoinCollision]);

  return (
    <div className="game-container">
      <div className={styles.audioPrompt}>
        <button 
          className={`${styles.button} ${isMuted ? styles.muted : ''}`}
          onClick={toggleAudio}
        >
          {isAudioInitialized ? (
            <>
              {isMuted ? (
                <>
                  Unmute
                </>
              ) : (
                <>
                  Mute
                </>
              )}
            </>
          ) : (
            <>
              play game with Sound
            </>
          )}
        </button>
      </div>
      <div className="scorebar">
        <p>
          <span>MARIO</span>
          <span>{gameState.score.toString().padStart(6, '0')}</span>
          <span>🪙 x {gameState.coins.toString().padStart(2, '0')}</span>
        </p>
      </div>
      
      <Stage width={2010} height={600} options={{ backgroundColor: 0x6b88ff }}>
        <Container sortableChildren={true}>
          <Background>
            <Container zIndex={1}>
              {coins.map((coin) => (
                <Coin
                  key={coin.id}
                  id={coin.id}
                  x={coin.x}
                  y={coin.y}
                  width={coin.width}
                  height={coin.height}
                  isCollected={coin.isCollected}
                />
              ))}
              {pipes.map((pipe) => (
                <Pipe
                  key={pipe.id}
                  id={pipe.id}
                  x={pipe.x}
                  y={pipe.y}
                  width={pipe.width}
                  height={pipe.height}
                />
              ))}
            </Container>
          </Background>

          <Container zIndex={2}>
          <Mario 
            initialState={playerState}
            onPositionUpdate={setPlayerState}
            pipes={pipes} 
          />
      </Container>
        </Container>
      </Stage>
    </div>
  );
};