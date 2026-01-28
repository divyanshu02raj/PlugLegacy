import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Zap } from "lucide-react";

const GRID_SIZE = 24;
const CELL_SIZE = 20;
const INITIAL_SPEED = 140;

const SnakeBoard = () => {
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 10 });
    const [direction, setDirection] = useState("RIGHT");
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
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

            if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                setGameOver(true);
                setIsPlaying(false);
                setHighScore(prev => Math.max(prev, score));
                return prevSnake;
            }

            if (prevSnake.some(s => s.x === head.x && s.y === head.y)) {
                setGameOver(true);
                setIsPlaying(false);
                setHighScore(prev => Math.max(prev, score));
                return prevSnake;
            }

            const newSnake = [head, ...prevSnake];

            if (head.x === food.x && head.y === food.y) {
                setScore(s => s + 10);
                setFood(generateFood(newSnake));
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [food, generateFood, score]);

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

    const getSegmentStyle = (segment, idx, allSegments) => {
        const isHead = idx === 0;
        const isTail = idx === allSegments.length - 1;

        // Calculate gradient color based on position
        const gradientProgress = idx / Math.max(allSegments.length - 1, 1);
        const hue = 120 + gradientProgress * 30; // Green to teal
        const saturation = 70 - gradientProgress * 20;
        const lightness = 45 - gradientProgress * 15;

        // Determine direction for head rotation
        let rotation = 0;
        if (isHead && allSegments.length > 1) {
            const next = allSegments[1];
            if (segment.x > next.x) rotation = 0;
            else if (segment.x < next.x) rotation = 180;
            else if (segment.y > next.y) rotation = -90;
            else if (segment.y < next.y) rotation = 90;
        } else if (isHead) {
            switch (directionRef.current) {
                case "RIGHT": rotation = 0; break;
                case "LEFT": rotation = 180; break;
                case "UP": rotation = -90; break;
                case "DOWN": rotation = 90; break;
            }
        }

        return {
            left: segment.x * CELL_SIZE,
            top: segment.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            backgroundColor: isHead
                ? `hsl(100, 65%, 40%)`
                : `hsl(${hue}, ${saturation}%, ${lightness}%)`,
            borderRadius: isHead ? '6px 6px 4px 4px' : isTail ? '4px' : '3px',
            transform: isHead ? `rotate(${rotation}deg)` : undefined,
            boxShadow: isHead
                ? '0 0 12px rgba(34, 197, 94, 0.6), inset 0 2px 4px rgba(255,255,255,0.2)'
                : `0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)`,
            zIndex: allSegments.length - idx,
        };
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl mx-auto px-4"
        >
            {/* Header Stats */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                    {/* Score */}
                    <div className="glass-card px-5 py-3 rounded-2xl border border-glass-border">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Score</span>
                        <p className="text-3xl font-bold text-emerald-400">{score}</p>
                    </div>
                    {/* High Score */}
                    <div className="glass-card px-5 py-3 rounded-2xl border border-glass-border">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Best</span>
                        <p className="text-3xl font-bold text-amber-400">{highScore}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                    {!isPlaying ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startGame}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] px-5 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all"
                        >
                            {gameOver ? <RotateCcw className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            {gameOver ? "Retry" : "Play"}
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsPlaying(false)}
                            className="px-5 py-3 rounded-xl glass-card border border-glass-border flex items-center gap-2"
                        >
                            <Pause className="w-5 h-5" />
                            Pause
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Game Board */}
            <div className="relative">
                {/* Ambient Glow */}
                <div className="absolute -inset-8 blur-3xl opacity-30 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/50 via-transparent to-primary/30 rounded-full" />
                </div>

                <div
                    className="relative glass-card rounded-3xl p-3 border-2 border-emerald-500/20 overflow-hidden"
                    style={{
                        width: GRID_SIZE * CELL_SIZE + 24,
                        height: GRID_SIZE * CELL_SIZE + 24,
                        margin: "0 auto",
                        background: "linear-gradient(145deg, rgba(0,0,0,0.8) 0%, rgba(10,30,20,0.9) 100%)",
                    }}
                >
                    {/* Inner Board */}
                    <div
                        className="relative rounded-2xl overflow-hidden"
                        style={{
                            width: GRID_SIZE * CELL_SIZE,
                            height: GRID_SIZE * CELL_SIZE,
                            background: "linear-gradient(180deg, #0a1f12 0%, #0d2818 50%, #0a1f12 100%)",
                            boxShadow: "inset 0 0 60px rgba(0,0,0,0.8), inset 0 0 20px rgba(34, 197, 94, 0.1)",
                        }}
                    >
                        {/* Grass Texture Pattern */}
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{
                                backgroundImage: `
                                    radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 15%),
                                    radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.1) 0%, transparent 15%),
                                    radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 30%)
                                `,
                            }}
                        />

                        {/* Subtle Grid */}
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: `
                                    linear-gradient(to right, rgba(34, 197, 94, 0.3) 1px, transparent 1px),
                                    linear-gradient(to bottom, rgba(34, 197, 94, 0.3) 1px, transparent 1px)
                                `,
                                backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
                            }}
                        />

                        {/* Snake Body */}
                        {snake.map((segment, idx) => (
                            <motion.div
                                key={idx}
                                initial={idx === 0 ? { scale: 1.1 } : false}
                                animate={{ scale: 1 }}
                                className="absolute"
                                style={getSegmentStyle(segment, idx, snake)}
                            >
                                {/* Head Details */}
                                {idx === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {/* Eyes */}
                                        <div className="relative w-full h-full">
                                            {/* Left Eye */}
                                            <div
                                                className="absolute rounded-full bg-white"
                                                style={{
                                                    width: 5,
                                                    height: 6,
                                                    top: 3,
                                                    left: 3,
                                                    boxShadow: "inset 0 0 2px rgba(0,0,0,0.5)"
                                                }}
                                            >
                                                <div
                                                    className="absolute rounded-full bg-black"
                                                    style={{
                                                        width: 3,
                                                        height: 3,
                                                        top: 1,
                                                        left: 1,
                                                    }}
                                                />
                                            </div>
                                            {/* Right Eye */}
                                            <div
                                                className="absolute rounded-full bg-white"
                                                style={{
                                                    width: 5,
                                                    height: 6,
                                                    top: 3,
                                                    right: 3,
                                                    boxShadow: "inset 0 0 2px rgba(0,0,0,0.5)"
                                                }}
                                            >
                                                <div
                                                    className="absolute rounded-full bg-black"
                                                    style={{
                                                        width: 3,
                                                        height: 3,
                                                        top: 1,
                                                        right: 1,
                                                    }}
                                                />
                                            </div>
                                            {/* Tongue (flickering) */}
                                            <motion.div
                                                animate={{ scaleX: [1, 1.3, 1] }}
                                                transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 1 }}
                                                className="absolute bg-red-500"
                                                style={{
                                                    width: 6,
                                                    height: 2,
                                                    bottom: 2,
                                                    left: "50%",
                                                    transform: "translateX(-50 किन्न)",
                                                    borderRadius: 2,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Body pattern scales */}
                                {idx !== 0 && idx % 2 === 0 && (
                                    <div
                                        className="absolute inset-1 rounded-sm opacity-30"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)"
                                        }}
                                    />
                                )}
                            </motion.div>
                        ))}

                        {/* Food - Apple */}
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute flex items-center justify-center"
                            style={{
                                left: food.x * CELL_SIZE,
                                top: food.y * CELL_SIZE,
                                width: CELL_SIZE,
                                height: CELL_SIZE,
                            }}
                        >
                            {/* Apple Body */}
                            <div
                                className="relative"
                                style={{
                                    width: CELL_SIZE - 2,
                                    height: CELL_SIZE - 2,
                                    background: "radial-gradient(circle at 30% 30%, #ff6b6b, #dc2626 60%, #991b1b)",
                                    borderRadius: "45% 45% 50% 50%",
                                    boxShadow: "0 0 15px rgba(220, 38, 38, 0.6), inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)",
                                }}
                            >
                                {/* Apple Stem */}
                                <div
                                    className="absolute bg-amber-800"
                                    style={{
                                        width: 2,
                                        height: 4,
                                        top: -2,
                                        left: "50%",
                                        transform: "translateX(-50%) rotate(-10deg)",
                                        borderRadius: 1,
                                    }}
                                />
                                {/* Apple Leaf */}
                                <div
                                    className="absolute bg-green-500"
                                    style={{
                                        width: 5,
                                        height: 3,
                                        top: -1,
                                        left: "55%",
                                        borderRadius: "50% 50% 50% 0",
                                        transform: "rotate(15deg)",
                                    }}
                                />
                                {/* Highlight */}
                                <div
                                    className="absolute bg-white/40 rounded-full"
                                    style={{
                                        width: 3,
                                        height: 4,
                                        top: 3,
                                        left: 3,
                                    }}
                                />
                            </div>
                        </motion.div>

                        {/* Game Over Overlay */}
                        <AnimatePresence>
                            {gameOver && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0.5, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        className="text-center"
                                    >
                                        <p className="text-3xl font-bold text-red-500 mb-2">Game Over!</p>
                                        <p className="text-lg text-muted-foreground mb-1">Score: <span className="text-emerald-400 font-bold">{score}</span></p>
                                        {score === highScore && score > 0 && (
                                            <motion.p
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="text-amber-400 font-semibold flex items-center justify-center gap-1"
                                            >
                                                <Zap className="w-4 h-4" /> New High Score!
                                            </motion.p>
                                        )}
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Start Overlay */}
                        <AnimatePresence>
                            {!isPlaying && !gameOver && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                                >
                                    <motion.p
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-muted-foreground font-medium"
                                    >
                                        Press Play to start
                                    </motion.p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Controls Hint */}
            <div className="mt-6 flex justify-center">
                <div className="glass-card px-4 py-2 rounded-xl border border-glass-border flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Controls:</span>
                    <div className="flex gap-1">
                        {["↑", "←", "↓", "→"].map((key, i) => (
                            <kbd
                                key={i}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 border border-white/20 text-xs font-mono"
                            >
                                {key}
                            </kbd>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SnakeBoard;
