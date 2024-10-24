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

  const GRAVITY = 0.5;
  const JUMP_FORCE = -15;
  const GROUND_Y = 500;

  const [coins, setCoins] = useState<CoinObject[]>([
    { id: 1, type: 'coin', x: 300, y: 400, width: 30, height: 30, isCollected: false },
    { id: 2, type: 'coin', x: 500, y: 300, width: 30, height: 30, isCollected: false },
    { id: 3, type: 'coin', x: 700, y: 400, width: 30, height: 30, isCollected: false },
    { id: 4, type: 'coin', x: 900, y: 300, width: 30, height: 30, isCollected: false },
  ]);

  const pipes: ObstacleObject[] = [
    { id: 1, type: 'obstacle', x: 1160, y: 550, width: 70, height: 120 },
    { id: 2, type: 'obstacle', x: 1570, y: 550, width: 70, height: 200 },
    { id: 3, type: 'obstacle', x: 1870, y: 550, width: 70, height: 180 },
  ];

  const checkCollision = useCallback((rect1: Position & Size, rect2: Position & Size): boolean => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y + rect1.height > rect2.y &&
      rect1.y < rect2.y + rect2.height
    );
  }, []);

  const handleCollisionWithPipe = useCallback((
    marioRect: Position & Size, 
    pipe: ObstacleObject, 
    newState: PlayerState,
    oldState: PlayerState
  ): PlayerState => {
    
    const marioLeft = marioRect.x;
    const marioRight = marioRect.x + marioRect.width;
    const marioTop = marioRect.y;
    const marioBottom = marioRect.y + marioRect.height;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + pipe.width;
    const pipeTop = pipe.y;
    const pipeBottom = pipe.y + pipe.height;

    // Tính toán khoảng cách chồng lấn
    const overlapX = Math.min(marioRight - pipeLeft, pipeRight - marioLeft);
    const overlapY = Math.min(marioBottom - pipeTop, pipeBottom - marioTop);

    // Xác định hướng va chạm dựa trên vị trí cũ của Mario
    const wasAbove = oldState.y + marioRect.height <= pipe.y;
    const wasBelow = oldState.y >= pipe.y + pipe.height;
    const wasLeft = oldState.x + marioRect.width <= pipe.x;
    const wasRight = oldState.x >= pipe.x + pipe.width;

    // Nếu có va chạm
    if (checkCollision(marioRect, pipe)) {
      // Va chạm từ trên xuống
      if (wasAbove && newState.vy > 0) {
        return {
          ...newState,
          y: pipeTop - marioRect.height,
          vy: 0,
          isJumping: false
        };
      }
      // Va chạm từ dưới lên
      else if (wasBelow && newState.vy < 0) {
        return {
          ...newState,
          y: pipeBottom,
          vy: 0
        };
      }
      // Va chạm từ bên trái
      else if (wasLeft) {
        return {
          ...newState,
          x: pipeLeft - marioRect.width,
          vx: 0
        };
      }
      // Va chạm từ bên phải
      else if (wasRight) {
        return {
          ...newState,
          x: pipeRight,
          vx: 0
        };
      }
      
      else if (overlapX < overlapY) {
        return {
          ...newState,
          x: newState.vx > 0 ? pipeLeft - marioRect.width : pipeRight,
          vx: 0
        };
      } else {
        return {
          ...newState,
          y: newState.vy > 0 ? pipeTop - marioRect.height : pipeBottom,
          vy: 0,
          isJumping: newState.vy > 0 ? false : newState.isJumping
        };
      }
    }

    return newState;
  }, [checkCollision]);

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

 // Khởi tạo audio
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

// Xử lý toggle audio
const toggleAudio = useCallback(() => {
  if (!isAudioInitialized) {
    // Lần đầu click
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.play()
        .then(() => {
          setIsAudioInitialized(true);
          setIsMuted(false);
        })
        .catch(console.error);
    }
  } else {
    // Những lần click sau
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
          onPositionUpdate={(newState) => {
            const marioRect: Position & Size = {
              x: newState.x - 25,
              y: newState.y - 25,
              width: 50,
              height: 50
            };

            //
            newState.vy = newState.vy + GRAVITY;

            // Lưu trạng thái hiện tại trước khi cập nhật
            const oldState = { ...playerState };

            // Tính toán vị trí mới trước khi kiểm tra va chạm
            let finalState = {
              ...newState,
              x: newState.x + newState.vx,
              y: newState.y + newState.vy
            };

            // Kiểm tra va chạm với từng pipe
            for (const pipe of pipes) {
              finalState = handleCollisionWithPipe(
                { ...marioRect, x: finalState.x - 25, y: finalState.y - 25 },
                pipe,
                finalState,
                oldState
              );
            }

            // Check ground collision sau khi đã xử lý va chạm với pipe
            if (finalState.y > GROUND_Y) {
              finalState.y = GROUND_Y;
              finalState.vy = 0;
              finalState.isJumping = false;
            }

            setPlayerState(finalState);
          }}
        />
      </Container>
        </Container>
      </Stage>
    </div>
  );
};