import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_SIZE = 10;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = CANVAS_WIDTH / BRICK_COLS - 4;
const BRICK_HEIGHT = 20;

type Brick = { x: number; y: number; color: string; alive: boolean };

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];

const BrickBreakerBoard = () => {
  const [paddle, setPaddle] = useState(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [ball, setBall] = useState({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60 });
  const [ballVelocity, setBallVelocity] = useState({ x: 4, y: -4 });
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const gameLoopRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  const initBricks = useCallback(() => {
    const newBricks: Brick[] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          x: col * (BRICK_WIDTH + 4) + 2,
          y: row * (BRICK_HEIGHT + 4) + 40,
          color: COLORS[row],
          alive: true,
        });
      }
    }
    setBricks(newBricks);
  }, []);

  const resetBall = useCallback(() => {
    setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60 });
    setBallVelocity({ x: 4 * (Math.random() > 0.5 ? 1 : -1), y: -4 });
  }, []);

  useEffect(() => {
    initBricks();
  }, [initBricks]);

  const gameLoop = useCallback(() => {
    setBall(prev => {
      let newX = prev.x + ballVelocity.x;
      let newY = prev.y + ballVelocity.y;
      let newVelX = ballVelocity.x;
      let newVelY = ballVelocity.y;

      // Wall collisions
      if (newX <= 0 || newX >= CANVAS_WIDTH - BALL_SIZE) {
        newVelX = -newVelX;
        newX = newX <= 0 ? 0 : CANVAS_WIDTH - BALL_SIZE;
      }
      if (newY <= 0) {
        newVelY = -newVelY;
        newY = 0;
      }

      // Paddle collision
      if (newY >= CANVAS_HEIGHT - PADDLE_HEIGHT - 30 - BALL_SIZE &&
          newX + BALL_SIZE >= paddle &&
          newX <= paddle + PADDLE_WIDTH &&
          newVelY > 0) {
        newVelY = -Math.abs(newVelY);
        const hitPos = (newX - paddle) / PADDLE_WIDTH;
        newVelX = (hitPos - 0.5) * 10;
        newY = CANVAS_HEIGHT - PADDLE_HEIGHT - 30 - BALL_SIZE;
      }

      // Brick collisions
      setBricks(prevBricks => {
        let hit = false;
        const newBricks = prevBricks.map(brick => {
          if (!brick.alive) return brick;
          if (newX + BALL_SIZE >= brick.x &&
              newX <= brick.x + BRICK_WIDTH &&
              newY + BALL_SIZE >= brick.y &&
              newY <= brick.y + BRICK_HEIGHT) {
            hit = true;
            setScore(s => s + 10);
            return { ...brick, alive: false };
          }
          return brick;
        });
        
        if (hit) {
          newVelY = -newVelY;
        }
        
        // Check win
        if (newBricks.every(b => !b.alive)) {
          setIsPlaying(false);
          setGameOver(true);
        }
        
        return newBricks;
      });

      // Ball lost
      if (newY >= CANVAS_HEIGHT) {
        setLives(l => {
          if (l <= 1) {
            setIsPlaying(false);
            setGameOver(true);
            return 0;
          }
          resetBall();
          return l - 1;
        });
        return prev;
      }

      setBallVelocity({ x: newVelX, y: newVelY });
      return { x: newX, y: newY };
    });
  }, [ballVelocity, paddle, resetBall]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !isPlaying) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - PADDLE_WIDTH / 2;
      setPaddle(Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, x)));
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      gameLoopRef.current = window.setInterval(gameLoop, 1000 / 60);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, gameLoop]);

  const startGame = () => {
    initBricks();
    resetBall();
    setScore(0);
    setLives(3);
    setGameOver(false);
    setIsPlaying(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <div className="glass-card px-3 py-1 rounded-lg border border-glass-border">
            <span className="text-xs text-muted-foreground">Score</span>
            <p className="text-xl font-bold text-primary">{score}</p>
          </div>
          <div className="glass-card px-3 py-1 rounded-lg border border-glass-border">
            <span className="text-xs text-muted-foreground">Lives</span>
            <p className="text-xl font-bold text-red-400">{"❤️".repeat(lives)}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="btn-glow px-4 py-2 rounded-xl flex items-center gap-2"
        >
          {gameOver ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {gameOver ? "Restart" : isPlaying ? "Playing..." : "Start"}
        </motion.button>
      </div>

      {/* Game Area */}
      <div className="relative">
        <div className="absolute inset-0 blur-3xl opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/40 via-yellow-500/20 to-blue-500/40" />
        </div>

        <div 
          ref={containerRef}
          className="relative glass-card rounded-2xl border border-glass-border overflow-hidden mx-auto cursor-none"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        >
          {/* Bricks */}
          {bricks.map((brick, idx) => (
            brick.alive && (
              <motion.div
                key={idx}
                initial={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute rounded-sm"
                style={{
                  left: brick.x,
                  top: brick.y,
                  width: BRICK_WIDTH,
                  height: BRICK_HEIGHT,
                  backgroundColor: brick.color,
                  boxShadow: `0 0 10px ${brick.color}40`,
                }}
              />
            )
          ))}

          {/* Paddle */}
          <motion.div
            className="absolute bg-gradient-to-r from-slate-300 to-slate-100 rounded-full"
            style={{
              left: paddle,
              bottom: 30,
              width: PADDLE_WIDTH,
              height: PADDLE_HEIGHT,
              boxShadow: "0 0 15px rgba(255,255,255,0.5)",
            }}
          />

          {/* Ball */}
          <motion.div
            className="absolute bg-white rounded-full"
            style={{
              left: ball.x,
              top: ball.y,
              width: BALL_SIZE,
              height: BALL_SIZE,
              boxShadow: "0 0 10px white, 0 0 20px white",
            }}
          />

          {/* Game Over */}
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center"
            >
              <p className="text-2xl font-bold mb-2">
                {lives === 0 ? "Game Over!" : "You Won! 🎉"}
              </p>
              <p className="text-muted-foreground">Score: {score}</p>
            </motion.div>
          )}

          {/* Start overlay */}
          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <p className="text-muted-foreground">Press Start to play</p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Move mouse to control paddle
      </p>
    </motion.div>
  );
};

export default BrickBreakerBoard;
