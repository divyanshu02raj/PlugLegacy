import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Trophy, MousePointer2, Keyboard, Heart, Zap, Crosshair, Copy } from "lucide-react";
import confetti from "canvas-confetti";
import { userService } from "../../../services/api";

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 500;
const INITIAL_PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 16;
const BALL_SIZE = 12;
const BRICK_ROWS = 6;
const BRICK_COLS = 8;
const BRICK_PADDING = 8;
const BRICK_WIDTH = (CANVAS_WIDTH - (BRICK_PADDING * (BRICK_COLS + 1))) / BRICK_COLS;
const BRICK_HEIGHT = 24;

const COLORS = [
    { bg: "#ef4444", shadow: "#991b1b" }, // Red
    { bg: "#f97316", shadow: "#c2410c" }, // Orange
    { bg: "#eab308", shadow: "#a16207" }, // Yellow
    { bg: "#22c55e", shadow: "#15803d" }, // Green
    { bg: "#06b6d4", shadow: "#0e7490" }, // Cyan
    { bg: "#3b82f6", shadow: "#1d4ed8" }, // Blue
];

// 0 = Empty, 1-6 = Normal (Color), 7 = Hard (2 hits), 8 = Unbreakable, 9 = Power-up Block
const LEVELS = [
    // Level 1: Classic
    [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2, 2, 2, 2],
        [3, 3, 3, 3, 3, 3, 3, 3],
        [4, 4, 4, 4, 4, 4, 4, 4],
        [5, 5, 5, 5, 5, 5, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6],
    ],
    // Level 2: Pyramid
    [
        [0, 0, 0, 7, 7, 0, 0, 0],
        [0, 0, 7, 1, 1, 7, 0, 0],
        [0, 7, 1, 2, 2, 1, 7, 0],
        [7, 1, 2, 3, 3, 2, 1, 7],
        [1, 2, 3, 4, 4, 3, 2, 1],
        [2, 3, 4, 5, 5, 4, 3, 2],
    ],
    // Level 3: Fortress (with Unbreakable)
    [
        [8, 8, 8, 8, 8, 8, 8, 8],
        [8, 0, 0, 0, 0, 0, 0, 8],
        [8, 0, 7, 7, 7, 7, 0, 8],
        [8, 0, 7, 9, 9, 7, 0, 8], // 9 = Power-up guarantees?
        [8, 0, 7, 7, 7, 7, 0, 8],
        [8, 0, 0, 0, 0, 0, 0, 8],
    ]
];

const POWER_UPS = {
    MULTI_BALL: { id: 'multi', color: '#ec4899', icon: Copy },
    PADDLE_EXPAND: { id: 'expand', color: '#8b5cf6', icon: Zap },
    EXTRA_LIFE: { id: 'life', color: '#ef4444', icon: Heart },
};

const BrickBreakerBoard = () => {
    const [paddle, setPaddle] = useState(CANVAS_WIDTH / 2 - INITIAL_PADDLE_WIDTH / 2);
    const [paddleWidth, setPaddleWidth] = useState(INITIAL_PADDLE_WIDTH);
    // Array of balls: { x, y, dx, dy, active }
    const [balls, setBalls] = useState([]);
    const [bricks, setBricks] = useState([]);
    const [powerUps, setPowerUps] = useState([]); // Falling power-ups
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [level, setLevel] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [highScore, setHighScore] = useState(() => {
        return parseInt(localStorage.getItem("brick_breaker_high_score") || "0");
    });

    const gameLoopRef = useRef();
    const containerRef = useRef(null);
    const keysPressed = useRef({ ArrowLeft: false, ArrowRight: false });
    const paddleRef = useRef({ x: CANVAS_WIDTH / 2 - INITIAL_PADDLE_WIDTH / 2, width: INITIAL_PADDLE_WIDTH });

    useEffect(() => {
        paddleRef.current = { x: paddle, width: paddleWidth };
    }, [paddle, paddleWidth]);

    const initLevel = useCallback((lvlIndex) => {
        const layout = LEVELS[lvlIndex % LEVELS.length];
        const newBricks = [];
        layout.forEach((row, rIndex) => {
            row.forEach((type, cIndex) => {
                if (type === 0) return;

                let health = 1;
                let color = COLORS[rIndex % COLORS.length];
                let isUnbreakable = false;

                if (type === 7) { // Hard
                    health = 2;
                    color = { bg: "#57534e", shadow: "#292524" }; // Stone
                } else if (type === 8) { // Unbreakable
                    isUnbreakable = true;
                    color = { bg: "#fbbf24", shadow: "#b45309" }; // Gold
                } else if (type === 9) { // Power-up container (behave like normal but drop guaranteed?)
                    // For simplicity, treat as normal visually but logic handles drop
                } else {
                    // Normal based on row
                    color = COLORS[(type - 1) % COLORS.length] || COLORS[0];
                }

                newBricks.push({
                    x: cIndex * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING,
                    y: rIndex * (BRICK_HEIGHT + BRICK_PADDING) + 60,
                    width: BRICK_WIDTH,
                    height: BRICK_HEIGHT,
                    color,
                    health,
                    maxHealth: health,
                    isUnbreakable,
                    type,
                    id: `${rIndex}-${cIndex}`
                });
            });
        });
        setBricks(newBricks);
        setBalls([{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60, dx: 0, dy: 0, active: true }]);
        setPowerUps([]);
        setPaddleWidth(INITIAL_PADDLE_WIDTH);
        setPaddle(CANVAS_WIDTH / 2 - INITIAL_PADDLE_WIDTH / 2);
    }, []);

    useEffect(() => {
        initLevel(0); // Load level 1 initially
    }, [initLevel]);

    // Keyboard
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                keysPressed.current[e.key] = true;
            }
        };
        const handleKeyUp = (e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                keysPressed.current[e.key] = false;
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    const spawnPowerUp = (x, y) => {
        if (Math.random() > 0.15) return; // 15% chance
        const types = Object.values(POWER_UPS);
        const type = types[Math.floor(Math.random() * types.length)];
        setPowerUps(prev => [...prev, { x, y, type, id: Date.now() + Math.random() }]);
    };

    const applyPowerUp = (type) => {
        if (type.id === 'multi') {
            setBalls(prev => {
                const active = prev.find(b => b.active);
                if (!active) return prev;
                return [
                    ...prev,
                    { ...active, dx: -active.dx, id: Date.now() + 1 },
                    { ...active, dx: active.dx * 0.5, dy: active.dy * 1.1, id: Date.now() + 2 }
                ];
            });
        } else if (type.id === 'expand') {
            setPaddleWidth(prev => Math.min(prev + 40, 200));
            // Reset after 10s? For simplicity, permanent for level or until life lost
        } else if (type.id === 'life') {
            setLives(prev => Math.min(prev + 1, 5));
        }
    };

    const handleLevelComplete = () => {
        setIsPlaying(false);
        if (level < LEVELS.length) {
            // Next Level
            setTimeout(() => {
                setLevel(l => l + 1);
                initLevel(level); // index is current level because level state updates async? No, logic: level 1 -> index 1 (Level 2)
                // Actually if level is 1 (index 0), next is 2 (index 1)
                // initLevel takes index.
                setBalls([{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60, dx: 0, dy: 0, active: true }]);
                setIsPlaying(true);
            }, 2000);
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 }
            });
        } else {
            // Win Game
            setWon(true);
            setGameOver(true);
            handleGameEnd(true);
        }
    };

    const handleGameEnd = async (isWin) => {
        // Save Score
        const finalScore = score + (isWin ? 5000 : 0);
        if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem("brick_breaker_high_score", finalScore.toString());
        }

        try {
            await userService.saveMatch({
                gameId: 'brick-breaker',
                result: isWin ? 'win' : 'loss',
                score: finalScore,
                opponent: { username: 'Single Player' }, // Arcade Mode
                playerColor: 'w',
                duration: 0
            });
        } catch (error) {
            console.error("Match save error", error);
        }
    };

    const gameLoop = useCallback(() => {
        // Paddle Movement
        const PADDLE_SPEED = 8;
        if (keysPressed.current.ArrowLeft) {
            setPaddle(p => Math.max(0, p - PADDLE_SPEED));
        }
        if (keysPressed.current.ArrowRight) {
            setPaddle(p => Math.min(CANVAS_WIDTH - paddleRef.current.width, p + PADDLE_SPEED));
        }

        // --- Power-ups Logic ---
        setPowerUps(prev => {
            const nextPowerUps = [];
            prev.forEach(p => {
                const newY = p.y + 3; // Fall speed
                // Collision with Paddle
                if (newY + 20 >= CANVAS_HEIGHT - 30 &&
                    newY <= CANVAS_HEIGHT - 30 + PADDLE_HEIGHT &&
                    p.x >= paddleRef.current.x &&
                    p.x <= paddleRef.current.x + paddleRef.current.width) {
                    // Collect
                    applyPowerUp(p.type);
                    setScore(s => s + 50);
                } else if (newY < CANVAS_HEIGHT) {
                    nextPowerUps.push({ ...p, y: newY });
                }
            });
            return nextPowerUps;
        });


        // GAME LOOP: Update Balls and Bricks together
        setBricks(currentBricks => {
            let nextBricks = [...currentBricks];
            let levelCleared = false;
            let scoreAdd = 0;
            let powerUpSpawns = [];

            setBalls(currentBalls => {
                const nextBalls = currentBalls.map(ball => {
                    if (!ball || !ball.active) return ball;
                    let { x, y, dx, dy } = ball;
                    let newX = x + dx;
                    let newY = y + dy;
                    let newDx = dx;
                    let newDy = dy;

                    // Walls
                    if (newX <= 0 || newX >= CANVAS_WIDTH - BALL_SIZE) {
                        newDx = -newDx;
                        newX = newX < 0 ? 0 : CANVAS_WIDTH - BALL_SIZE;
                    }
                    if (newY <= 0) {
                        newDy = -newDy;
                        newY = 0;
                    }

                    // Paddle
                    const paddleY = CANVAS_HEIGHT - PADDLE_HEIGHT - 30;
                    if (newY + BALL_SIZE >= paddleY &&
                        newY + BALL_SIZE <= paddleY + PADDLE_HEIGHT + 10 &&
                        newX + BALL_SIZE >= paddleRef.current.x &&
                        newX <= paddleRef.current.x + paddleRef.current.width &&
                        dy > 0) {
                        newDy = -Math.abs(newDy);
                        const center = paddleRef.current.x + paddleRef.current.width / 2;
                        const hitPos = (newX + BALL_SIZE / 2) - center;
                        newDx = hitPos * 0.15;
                        newY = paddleY - BALL_SIZE;
                    }

                    // Bricks
                    let hitObj = null;
                    for (let i = 0; i < nextBricks.length; i++) {
                        const b = nextBricks[i];
                        if (!b.alive) continue;

                        if (newX + BALL_SIZE >= b.x &&
                            newX <= b.x + b.width &&
                            newY + BALL_SIZE >= b.y &&
                            newY <= b.y + b.height) {

                            // Hit! Determine which side was hit based on ball's previous position
                            const ballCenterX = newX + BALL_SIZE / 2;
                            const ballCenterY = newY + BALL_SIZE / 2;
                            const brickCenterX = b.x + b.width / 2;
                            const brickCenterY = b.y + b.height / 2;

                            // Calculate which side the ball came from
                            const fromLeft = x + BALL_SIZE <= b.x;
                            const fromRight = x >= b.x + b.width;
                            const fromTop = y + BALL_SIZE <= b.y;
                            const fromBottom = y >= b.y + b.height;

                            // Determine bounce direction based on entry side
                            if (fromLeft || fromRight) {
                                newDx = -newDx; // Hit from side
                                // Push ball out of brick
                                if (fromLeft) newX = b.x - BALL_SIZE;
                                else newX = b.x + b.width;
                            } else if (fromTop || fromBottom) {
                                newDy = -newDy; // Hit from top/bottom
                                // Push ball out of brick
                                if (fromTop) newY = b.y - BALL_SIZE;
                                else newY = b.y + b.height;
                            } else {
                                // Corner hit - use angle to determine
                                const dx_diff = ballCenterX - brickCenterX;
                                const dy_diff = ballCenterY - brickCenterY;
                                if (Math.abs(dx_diff) > Math.abs(dy_diff)) {
                                    newDx = -newDx;
                                } else {
                                    newDy = -newDy;
                                }
                            }

                            // Update Brick Health
                            if (!b.isUnbreakable) {
                                const newHealth = b.health - 1;
                                if (newHealth <= 0) {
                                    nextBricks[i] = { ...b, alive: false, health: 0 };
                                    scoreAdd += (b.type === 7 ? 200 : 100);
                                    // Power-up chance
                                    if (Math.random() < 0.15) {
                                        powerUpSpawns.push({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
                                    }
                                } else {
                                    nextBricks[i] = { ...b, health: newHealth };
                                    scoreAdd += 50;
                                }
                            } else {
                                // Unbreakable hit
                                scoreAdd += 10;
                                // Sound effect?
                            }
                            break; // Handle one brick per frame per ball prevents tunneling through multiple
                        }
                    }

                    // Death
                    if (newY >= CANVAS_HEIGHT) {
                        return { ...ball, active: false };
                    }

                    return { ...ball, x: newX, y: newY, dx: newDx, dy: newDy };
                });

                // Trigger Side Effects from collisions logic
                if (scoreAdd > 0) setScore(s => s + scoreAdd);
                if (powerUpSpawns.length > 0) {
                    powerUpSpawns.forEach(p => spawnPowerUp(p.x, p.y));
                }

                // Check Level Clear
                if (nextBricks.every(b => !b.alive || b.isUnbreakable)) {
                    // Logic: If only unbreakables remain, level is cleared? Usually yes.
                    // Or hardcode specific count.
                    // Let's assume unbreakables don't count for clear condition.
                    // Wait, if unbreakables exist how do we clear?
                    // Usually you clear all *destructible* bricks.
                    const destructibles = nextBricks.filter(b => !b.isUnbreakable && b.alive);
                    if (destructibles.length === 0) {
                        // All clear!
                        // Cannot call handleLevelComplete directly in render loop (set state loop).
                        // Use effect or flag?
                        // We are in setBalls/setBricks.
                        // Setting a flag in state is safer.
                        // But we can't because we are deep in callback.
                        // Actually, we can just not reset bricks here if cleared, 
                        // and let an Effect detect "Bricks == 0"
                    }
                }

                // Check Lives (All balls dead)
                const alive = nextBalls.filter(b => b && b.active).length;
                if (alive === 0) {
                    // Lives - 1
                    // If in game loop, this triggers repeatedly. Need "Resetting" state.
                    // Handled by Effect or independent check?
                }

                return nextBalls.filter(b => b !== undefined && b !== null);
            });

            return nextBricks;
        });

    }, []);

    // Side-Effect Monitors
    useEffect(() => {
        if (!isPlaying || gameOver) return;

        // Check Level Clear
        const destructibles = bricks.filter(b => !b.isUnbreakable && b.alive);
        if (destructibles.length === 0 && bricks.length > 0) {
            handleLevelComplete();
        }

        // Check Lives
        const activeBalls = balls.filter(b => b && b.active);
        // Only check for game over if balls exist and none are active AND at least one ball has fallen (dy was positive)
        // This prevents false game over on initial load
        const hasMovingBalls = balls.some(b => b && (b.dx !== 0 || b.dy !== 0));
        if (balls.length > 0 && activeBalls.length === 0 && hasMovingBalls) {
            if (lives > 1) {
                setLives(l => l - 1);
                // Reset Ball
                setBalls([{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60, dx: 4 * (Math.random() > 0.5 ? 1 : -1), dy: -5, active: true }]);
                setPaddleWidth(INITIAL_PADDLE_WIDTH);
            } else {
                setLives(0);
                setIsPlaying(false);
                setGameOver(true);
                handleGameEnd(false);
            }
        }
    }, [bricks, balls, lives, isPlaying, gameOver]); // This might be too frequent? Render loop runs gameLoop. Game loop updates state. Effect notices state change.

    // Game loop timer
    useEffect(() => {
        if (isPlaying && !gameOver) {
            gameLoopRef.current = window.setInterval(gameLoop, 1000 / 60);
        }
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [isPlaying, gameOver, gameLoop]);


    const startGame = () => {
        // Reset everything
        setBricks([]); // Temporary clear
        setLevel(1);
        setScore(0);
        setLives(3);
        setGameOver(false);
        setWon(false);
        setIsPlaying(true);
        setPaddleWidth(INITIAL_PADDLE_WIDTH);
        setPaddle(CANVAS_WIDTH / 2 - INITIAL_PADDLE_WIDTH / 2);
        setPowerUps([]);

        // Init Level 1 manually or ensure initLevel returns the state to set?
        // Let's just use initLevel's logic here for Level 1 to be safe
        const layout = LEVELS[0];
        const newBricks = [];
        layout.forEach((row, rIndex) => {
            row.forEach((type, cIndex) => {
                if (type === 0) return;
                let health = 1;
                let color = COLORS[rIndex % COLORS.length];
                let isUnbreakable = false;

                if (type === 7) {
                    health = 2;
                    color = { bg: "#57534e", shadow: "#292524" };
                } else if (type === 8) {
                    isUnbreakable = true;
                    color = { bg: "#fbbf24", shadow: "#b45309" };
                } else {
                    color = COLORS[(type - 1) % COLORS.length] || COLORS[0];
                }

                newBricks.push({
                    x: cIndex * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING,
                    y: rIndex * (BRICK_HEIGHT + BRICK_PADDING) + 60,
                    width: BRICK_WIDTH,
                    height: BRICK_HEIGHT,
                    color,
                    health,
                    maxHealth: health,
                    isUnbreakable,
                    type,
                    alive: true,
                    id: `${rIndex}-${cIndex}`
                });
            });
        });
        setBricks(newBricks);
        setBalls([{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60, dx: 4 * (Math.random() > 0.5 ? 1 : -1), dy: -5, active: true }]);
    };

    const startBall = () => {
        // Find static ball and launch it
        setBalls(prev => prev.map(b => (b && b.dx === 0 && b.dy === 0 ? { ...b, dx: 4 * (Math.random() > 0.5 ? 1 : -1), dy: -5 } : b)));
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg mx-auto"
        >
            {/* Header Stats */}
            <div className="flex justify-between items-end mb-4">
                <div className="flex gap-3">
                    <div className="glass-card px-3 py-2 rounded-xl border border-glass-border">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Level</span>
                        <span className="text-xl font-bold">{level}</span>
                    </div>
                    <div className="glass-card px-3 py-2 rounded-xl border border-glass-border min-w-[90px]">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Score</span>
                        <div className="text-xl font-bold text-primary">{score}</div>
                    </div>
                    <div className="glass-card px-3 py-2 rounded-xl border border-glass-border min-w-[90px] bg-yellow-500/5 border-yellow-500/20">
                        <span className="text-[10px] text-yellow-500/80 uppercase tracking-wider block">High Score</span>
                        <div className="text-xl font-bold text-yellow-500">{highScore}</div>
                    </div>
                </div>

                <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        <span className="font-bold text-red-500">{lives}</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            if (gameOver) startGame();
                            else if (!isPlaying) startGame();
                            else if (balls.some(b => b && b.dx === 0)) startBall();
                        }}
                        className="btn-glow px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold"
                    >
                        {gameOver ? "Play Again" : (balls.some(b => b && b.dx === 0) && isPlaying ? "Launch!" : "Restart")}
                    </motion.button>
                </div>
            </div>

            {/* Canvas */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-purple-600/30 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />

                <div
                    ref={containerRef}
                    className="relative glass-card rounded-2xl border border-glass-border overflow-hidden mx-auto shadow-2xl bg-black/80 backdrop-blur-md"
                    style={{ width: '100%', maxWidth: CANVAS_WIDTH, height: CANVAS_HEIGHT, cursor: isPlaying ? 'none' : 'default' }}
                >
                    <div className="absolute inset-0 opacity-10 grid-pattern" />

                    {/* Bricks */}
                    <AnimatePresence>
                        {bricks.map((brick) => (
                            brick.alive && (
                                <motion.div
                                    key={brick.id}
                                    className="absolute rounded-sm border-t border-white/20"
                                    style={{
                                        left: brick.x,
                                        top: brick.y,
                                        width: brick.width,
                                        height: brick.height,
                                        backgroundColor: brick.color.bg,
                                        boxShadow: brick.isUnbreakable ? `0 0 10px ${brick.color.shadow}` : `0 4px 0 ${brick.color.shadow}`,
                                        opacity: brick.isUnbreakable ? 1 : brick.health / brick.maxHealth
                                    }}
                                >
                                    {brick.health > 1 && !brick.isUnbreakable && (
                                        <div className="absolute inset-0 border-2 border-black/20" />
                                    )}
                                    {brick.isUnbreakable && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-50">🔒</div>
                                    )}
                                </motion.div>
                            )
                        ))}
                    </AnimatePresence>

                    {/* Power-ups */}
                    {powerUps.map(p => {
                        const Icon = p.type.icon;
                        return (
                            <motion.div
                                key={p.id}
                                className="absolute flex items-center justify-center w-8 h-8 rounded-full shadow-lg z-10"
                                style={{
                                    left: p.x, top: p.y,
                                    backgroundColor: p.type.color,
                                    boxShadow: `0 0 10px ${p.type.color}`
                                }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Icon className="w-5 h-5 text-white" />
                            </motion.div>
                        );
                    })}

                    {/* Paddle */}
                    <motion.div
                        className="absolute rounded-full bg-gradient-to-b from-white to-slate-300"
                        style={{
                            left: paddle,
                            bottom: 30,
                            width: paddleWidth,
                            height: PADDLE_HEIGHT,
                            boxShadow: "0 0 20px rgba(255, 255, 255, 0.3), inset 0 -4px 4px rgba(0,0,0,0.2)",
                        }}
                    >
                        <div className={`absolute inset-0 bg-primary/20 blur-md rounded-full ${powerUps.length > 0 ? "animate-pulse" : ""}`} />
                    </motion.div>

                    {/* Balls */}
                    {balls.map((b, idx) => (b && b.active) && (
                        <motion.div
                            key={idx}
                            className="absolute rounded-full bg-white z-10"
                            style={{
                                left: b.x,
                                top: b.y,
                                width: BALL_SIZE,
                                height: BALL_SIZE,
                                boxShadow: "0 0 15px white",
                            }}
                        />
                    ))}

                    {/* Overlay */}
                    <AnimatePresence>
                        {(!isPlaying || gameOver) && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-20"
                            >
                                {gameOver ? (
                                    <>
                                        <h2 className={`text-4xl font-bold mb-2 ${won ? "text-green-400" : "text-red-400"}`}>
                                            {won ? "Victory! 🏆" : "Game Over"}
                                        </h2>
                                        <p className="text-xl text-white mb-6">Score: <span className="text-primary font-bold">{score}</span></p>
                                        <button
                                            onClick={startGame}
                                            className="px-8 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-all"
                                        >
                                            {won ? "Play Again" : "Try Again"}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-3xl font-bold text-white mb-2">Arcade Breaker</h2>
                                        <p className="text-white/60 mb-6">Level {level}</p>
                                        <button
                                            onClick={startGame}
                                            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg btn-glow"
                                        >
                                            Start Game
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground/50">
                Use <kbd className="bg-white/10 px-1 rounded">←</kbd> <kbd className="bg-white/10 px-1 rounded">→</kbd> to move
            </p>
        </motion.div>
    );
};

export default BrickBreakerBoard;
