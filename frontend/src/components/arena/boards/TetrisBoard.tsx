import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 24;

const TETROMINOES = {
  I: { shape: [[1,1,1,1]], color: "#06b6d4" },
  O: { shape: [[1,1],[1,1]], color: "#eab308" },
  T: { shape: [[0,1,0],[1,1,1]], color: "#a855f7" },
  S: { shape: [[0,1,1],[1,1,0]], color: "#22c55e" },
  Z: { shape: [[1,1,0],[0,1,1]], color: "#ef4444" },
  J: { shape: [[1,0,0],[1,1,1]], color: "#3b82f6" },
  L: { shape: [[0,0,1],[1,1,1]], color: "#f97316" },
};

type TetrominoType = keyof typeof TETROMINOES;
type Cell = string | null;

const TetrisBoard = () => {
  const [board, setBoard] = useState<Cell[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<{
    type: TetrominoType;
    shape: number[][];
    x: number;
    y: number;
  } | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrominoType>("T");
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const gameLoopRef = useRef<number>();

  const getRandomPiece = (): TetrominoType => {
    const pieces = Object.keys(TETROMINOES) as TetrominoType[];
    return pieces[Math.floor(Math.random() * pieces.length)];
  };

  const spawnPiece = useCallback(() => {
    const type = nextPiece;
    const shape = TETROMINOES[type].shape;
    setCurrentPiece({
      type,
      shape,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2),
      y: 0,
    });
    setNextPiece(getRandomPiece());
  }, [nextPiece]);

  const checkCollision = useCallback((shape: number[][], x: number, y: number): boolean => {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return true;
          if (newY >= 0 && board[newY][newX]) return true;
        }
      }
    }
    return false;
  }, [board]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece) return;
    const rotated = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    );
    if (!checkCollision(rotated, currentPiece.x, currentPiece.y)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  }, [currentPiece, checkCollision]);

  const movePiece = useCallback((dx: number) => {
    if (!currentPiece) return;
    if (!checkCollision(currentPiece.shape, currentPiece.x + dx, currentPiece.y)) {
      setCurrentPiece({ ...currentPiece, x: currentPiece.x + dx });
    }
  }, [currentPiece, checkCollision]);

  const dropPiece = useCallback(() => {
    if (!currentPiece) return;
    
    if (checkCollision(currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
      // Lock piece
      const newBoard = board.map(row => [...row]);
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const y = currentPiece.y + row;
            const x = currentPiece.x + col;
            if (y < 0) {
              setGameOver(true);
              setIsPlaying(false);
              return;
            }
            newBoard[y][x] = TETROMINOES[currentPiece.type].color;
          }
        }
      }

      // Clear lines
      let clearedLines = 0;
      for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
        if (newBoard[row].every(cell => cell !== null)) {
          newBoard.splice(row, 1);
          newBoard.unshift(Array(BOARD_WIDTH).fill(null));
          clearedLines++;
          row++;
        }
      }
      
      if (clearedLines > 0) {
        setLines(l => l + clearedLines);
        setScore(s => s + clearedLines * 100 * clearedLines);
      }

      setBoard(newBoard);
      spawnPiece();
    } else {
      setCurrentPiece({ ...currentPiece, y: currentPiece.y + 1 });
    }
  }, [currentPiece, board, checkCollision, spawnPiece]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      switch (e.key) {
        case "ArrowLeft": movePiece(-1); break;
        case "ArrowRight": movePiece(1); break;
        case "ArrowDown": dropPiece(); break;
        case "ArrowUp": rotatePiece(); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, movePiece, dropPiece, rotatePiece]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = window.setInterval(dropPiece, 500);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, gameOver, dropPiece]);

  const startGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
    setScore(0);
    setLines(0);
    setGameOver(false);
    setNextPiece(getRandomPiece());
    setTimeout(() => spawnPiece(), 50);
    setIsPlaying(true);
  };

  // Render board with current piece
  const renderBoard = () => {
    const display = board.map(row => [...row]);
    if (currentPiece) {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const y = currentPiece.y + row;
            const x = currentPiece.x + col;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              display[y][x] = TETROMINOES[currentPiece.type].color;
            }
          }
        }
      }
    }
    return display;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="flex gap-4 justify-center">
        {/* Main Board */}
        <div className="relative">
          <div className="absolute inset-0 blur-3xl opacity-20">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/40 via-transparent to-cyan-500/40" />
          </div>

          <div 
            className="relative glass-card rounded-2xl p-2 border border-glass-border overflow-hidden"
            style={{ width: BOARD_WIDTH * CELL_SIZE + 16, height: BOARD_HEIGHT * CELL_SIZE + 16 }}
          >
            <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)` }}>
              {renderBoard().map((row, rowIdx) =>
                row.map((cell, colIdx) => (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className="border border-slate-800/50"
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: cell || "transparent",
                      boxShadow: cell ? `0 0 10px ${cell}40` : undefined,
                    }}
                  />
                ))
              )}
            </div>

            {gameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center"
              >
                <p className="text-2xl font-bold text-red-500 mb-2">Game Over!</p>
                <p className="text-muted-foreground">Score: {score}</p>
              </motion.div>
            )}

            {!isPlaying && !gameOver && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <p className="text-muted-foreground">Press Start</p>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="flex flex-col gap-4">
          <div className="glass-card rounded-xl p-4 border border-glass-border">
            <span className="text-xs text-muted-foreground">Score</span>
            <p className="text-2xl font-bold text-primary">{score}</p>
          </div>
          
          <div className="glass-card rounded-xl p-4 border border-glass-border">
            <span className="text-xs text-muted-foreground">Lines</span>
            <p className="text-2xl font-bold">{lines}</p>
          </div>

          <div className="glass-card rounded-xl p-4 border border-glass-border">
            <span className="text-xs text-muted-foreground">Next</span>
            <div className="mt-2 grid gap-0.5" style={{ gridTemplateColumns: `repeat(4, 12px)` }}>
              {TETROMINOES[nextPiece].shape.map((row, rowIdx) =>
                row.map((cell, colIdx) => (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: cell ? TETROMINOES[nextPiece].color : "transparent" }}
                  />
                ))
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isPlaying ? () => setIsPlaying(false) : startGame}
            className="btn-glow px-4 py-2 rounded-xl flex items-center justify-center gap-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : gameOver ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Pause" : gameOver ? "Restart" : "Start"}
          </motion.button>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">→</kbd> Move • 
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">↑</kbd> Rotate • 
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">↓</kbd> Drop
      </p>
    </motion.div>
  );
};

export default TetrisBoard;
