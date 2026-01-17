import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";

const GRID_SIZE = 20;
const CELL_SIZE = 16;
const INITIAL_SPEED = 150;

const SnakeBoard = () => {
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 10 });
    const [direction, setDirection] = useState("RIGHT");
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const gameLoopRef = useRef();
    const directionRef = useRef(direction);

    const generateFood = useCallback((currentSnake) => {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
        } while (currentSnake.some(s => s.x === newFood.x && s.y === newFood.y));
        return newFood;
    }, []);

    const moveSnake = useCallback(() => {
        setSnake(prevSnake => {
            const head = { ...prevSnake[0] };
            const dir = directionRef.current;

            switch (dir) {
                case "UP": head.y -= 1; break;
                case "DOWN": head.y += 1; break;
                case "LEFT": head.x -= 1; break;
                case "RIGHT": head.x += 1; break;
            }

            // Check wall collision
            if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                setGameOver(true);
                setIsPlaying(false);
                return prevSnake;
            }

            // Check self collision
            if (prevSnake.some(s => s.x === head.x && s.y === head.y)) {
                setGameOver(true);
                setIsPlaying(false);
                return prevSnake;
            }

            const newSnake = [head, ...prevSnake];

            // Check food collision
            if (head.x === food.x && head.y === food.y) {
                setScore(s => s + 10);
                setFood(generateFood(newSnake));
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [food, generateFood]);

    useEffect(() => {
        directionRef.current = direction;
    }, [direction]);

    useEffect(() => {
        if (isPlaying && !gameOver) {
            gameLoopRef.current = window.setInterval(moveSnake, INITIAL_SPEED);
        }
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [isPlaying, gameOver, moveSnake]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isPlaying) return;

            const dir = directionRef.current;
            switch (e.key) {
                case "ArrowUp":
                    if (dir !== "DOWN") setDirection("UP");
                    break;
                case "ArrowDown":
                    if (dir !== "UP") setDirection("DOWN");
                    break;
                case "ArrowLeft":
                    if (dir !== "RIGHT") setDirection("LEFT");
                    break;
                case "ArrowRight":
                    if (dir !== "LEFT") setDirection("RIGHT");
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPlaying]);

    const startGame = () => {
        setSnake([{ x: 10, y: 10 }]);
        setFood(generateFood([{ x: 10, y: 10 }]));
        setDirection("RIGHT");
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto"
        >
            {/* Score */}
            <div className="flex justify-between items-center mb-4">
                <div className="glass-card px-4 py-2 rounded-xl border border-glass-border">
                    <span className="text-xs text-muted-foreground">Score</span>
                    <p className="text-2xl font-bold text-green-400">{score}</p>
                </div>
                <div className="flex gap-2">
                    {!isPlaying && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startGame}
                            className="btn-glow px-4 py-2 rounded-xl flex items-center gap-2"
                        >
                            <Play className="w-4 h-4" />
                            {gameOver ? "Restart" : "Start"}
                        </motion.button>
                    )}
                    {isPlaying && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsPlaying(false)}
                            className="px-4 py-2 rounded-xl glass-card border border-glass-border"
                        >
                            Pause
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Board */}
            <div className="relative">
                <div className="absolute inset-0 blur-3xl opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/40 via-transparent to-primary/40" />
                </div>

                <div
                    className="relative glass-card rounded-2xl p-2 border border-glass-border overflow-hidden"
                    style={{
                        width: GRID_SIZE * CELL_SIZE + 16,
                        height: GRID_SIZE * CELL_SIZE + 16,
                        margin: "0 auto",
                    }}
                >
                    <div
                        className="relative bg-slate-900/80"
                        style={{
                            width: GRID_SIZE * CELL_SIZE,
                            height: GRID_SIZE * CELL_SIZE,
                        }}
                    >
                        {/* Grid lines */}
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                                backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
                            }}
                        />

                        {/* Snake */}
                        {snake.map((segment, idx) => (
                            <motion.div
                                key={idx}
                                initial={idx === 0 ? { scale: 1.2 } : false}
                                animate={{ scale: 1 }}
                                className={`absolute rounded-sm ${idx === 0
                                        ? "bg-green-400 z-10"
                                        : "bg-green-500"
                                    }`}
                                style={{
                                    left: segment.x * CELL_SIZE,
                                    top: segment.y * CELL_SIZE,
                                    width: CELL_SIZE - 1,
                                    height: CELL_SIZE - 1,
                                    boxShadow: idx === 0 ? "0 0 10px rgba(74, 222, 128, 0.5)" : undefined,
                                }}
                            >
                                {idx === 0 && (
                                    <div className="w-full h-full flex items-center justify-center text-[8px]">
                                        👀
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {/* Food */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="absolute bg-red-500 rounded-full flex items-center justify-center"
                            style={{
                                left: food.x * CELL_SIZE,
                                top: food.y * CELL_SIZE,
                                width: CELL_SIZE - 1,
                                height: CELL_SIZE - 1,
                                boxShadow: "0 0 15px rgba(239, 68, 68, 0.6)",
                            }}
                        >
                            🍎
                        </motion.div>

                        {/* Game Over Overlay */}
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

                        {/* Start Overlay */}
                        {!isPlaying && !gameOver && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-black/50 flex items-center justify-center"
                            >
                                <p className="text-muted-foreground">Press Start to play</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls hint */}
            <p className="mt-4 text-center text-sm text-muted-foreground">
                Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">Arrow Keys</kbd> to move
            </p>
        </motion.div>
    );
};

export default SnakeBoard;
