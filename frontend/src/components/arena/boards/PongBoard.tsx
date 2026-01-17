import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 12;
const PADDLE_SPEED = 8;
const INITIAL_BALL_SPEED = 5;

const PongBoard = () => {
  const [leftPaddle, setLeftPaddle] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [rightPaddle, setRightPaddle] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [ball, setBall] = useState({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  const [ballVelocity, setBallVelocity] = useState({ x: INITIAL_BALL_SPEED, y: INITIAL_BALL_SPEED / 2 });
  const [score, setScore] = useState({ left: 0, right: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();

  const resetBall = useCallback((direction: number) => {
    setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
    setBallVelocity({ 
      x: INITIAL_BALL_SPEED * direction, 
      y: (Math.random() - 0.5) * INITIAL_BALL_SPEED 
    });
  }, []);

  const gameLoop = useCallback(() => {
    // Move paddles based on keys pressed
    if (keysPressed.current.has("w")) {
      setLeftPaddle(p => Math.max(0, p - PADDLE_SPEED));
    }
    if (keysPressed.current.has("s")) {
      setLeftPaddle(p => Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, p + PADDLE_SPEED));
    }
    if (keysPressed.current.has("ArrowUp")) {
      setRightPaddle(p => Math.max(0, p - PADDLE_SPEED));
    }
    if (keysPressed.current.has("ArrowDown")) {
      setRightPaddle(p => Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, p + PADDLE_SPEED));
    }

    // Move ball
    setBall(prev => {
      let newX = prev.x + ballVelocity.x;
      let newY = prev.y + ballVelocity.y;
      let newVelX = ballVelocity.x;
      let newVelY = ballVelocity.y;

      // Top/bottom wall collision
      if (newY <= 0 || newY >= CANVAS_HEIGHT - BALL_SIZE) {
        newVelY = -newVelY;
        newY = newY <= 0 ? 0 : CANVAS_HEIGHT - BALL_SIZE;
      }

      // Left paddle collision
      if (newX <= PADDLE_WIDTH + 20 && 
          newY + BALL_SIZE >= leftPaddle && 
          newY <= leftPaddle + PADDLE_HEIGHT) {
        newVelX = Math.abs(newVelX) * 1.05;
        const hitPos = (newY - leftPaddle) / PADDLE_HEIGHT;
        newVelY = (hitPos - 0.5) * 10;
        newX = PADDLE_WIDTH + 20;
      }

      // Right paddle collision
      if (newX >= CANVAS_WIDTH - PADDLE_WIDTH - 20 - BALL_SIZE && 
          newY + BALL_SIZE >= rightPaddle && 
          newY <= rightPaddle + PADDLE_HEIGHT) {
        newVelX = -Math.abs(newVelX) * 1.05;
        const hitPos = (newY - rightPaddle) / PADDLE_HEIGHT;
        newVelY = (hitPos - 0.5) * 10;
        newX = CANVAS_WIDTH - PADDLE_WIDTH - 20 - BALL_SIZE;
      }

      // Score
      if (newX <= 0) {
        setScore(s => ({ ...s, right: s.right + 1 }));
        resetBall(1);
        return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
      }
      if (newX >= CANVAS_WIDTH - BALL_SIZE) {
        setScore(s => ({ ...s, left: s.left + 1 }));
        resetBall(-1);
        return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
      }

      setBallVelocity({ x: newVelX, y: newVelY });
      return { x: newX, y: newY };
    });
  }, [ballVelocity, leftPaddle, rightPaddle, resetBall]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      gameLoopRef.current = window.setInterval(gameLoop, 1000 / 60);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, gameLoop]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Score */}
      <div className="flex justify-center items-center gap-8 mb-4">
        <div className="text-center">
          <span className="text-sm text-muted-foreground">Player 1 (W/S)</span>
          <p className="text-4xl font-mono font-bold text-primary">{score.left}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPlaying(!isPlaying)}
          className="btn-glow px-4 py-2 rounded-xl flex items-center gap-2"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? "Pause" : "Play"}
        </motion.button>
        <div className="text-center">
          <span className="text-sm text-muted-foreground">Player 2 (↑/↓)</span>
          <p className="text-4xl font-mono font-bold text-cyan-400">{score.right}</p>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative">
        <div className="absolute inset-0 blur-3xl opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-transparent to-cyan-500/40" />
        </div>

        <div 
          className="relative glass-card rounded-2xl border border-glass-border overflow-hidden mx-auto"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        >
          {/* Center line */}
          <div 
            className="absolute top-0 bottom-0 left-1/2 w-0.5 border-l-2 border-dashed border-white/20"
          />

          {/* Left Paddle */}
          <motion.div
            className="absolute bg-primary rounded-r-lg"
            style={{
              left: 20,
              top: leftPaddle,
              width: PADDLE_WIDTH,
              height: PADDLE_HEIGHT,
              boxShadow: "0 0 20px hsl(var(--primary))",
            }}
          />

          {/* Right Paddle */}
          <motion.div
            className="absolute bg-cyan-400 rounded-l-lg"
            style={{
              right: 20,
              top: rightPaddle,
              width: PADDLE_WIDTH,
              height: PADDLE_HEIGHT,
              boxShadow: "0 0 20px hsl(200 100% 60%)",
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
              boxShadow: "0 0 15px white, 0 0 30px white",
            }}
          />

          {/* Start overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <p className="text-muted-foreground">Press Play to start</p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Player 1: <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">W</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">S</kbd> • 
        Player 2: <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">↑</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">↓</kbd>
      </p>
    </motion.div>
  );
};

export default PongBoard;
