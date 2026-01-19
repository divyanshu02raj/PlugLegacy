import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw } from "lucide-react";

const BOARD_SIZE = 10;
const TOTAL_CELLS = 100;

// Snakes: head -> tail (descending)
const SNAKES = {
    99: 54,
    70: 55,
    52: 42,
    25: 2,
    95: 72,
};

// Ladders: bottom -> top (ascending)
const LADDERS = {
    6: 25,
    11: 40,
    60: 85,
    46: 90,
    17: 69,
};

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

// Adventure tile colors - creating a jungle/dungeon feel
const getTileStyle = (cellNum) => {
    const row = Math.floor((cellNum - 1) / 10);
    const isEven = row % 2 === 0;
    const col = (cellNum - 1) % 10;
    const actualCol = isEven ? col : 9 - col;
    
    // Create a checkerboard pattern with adventure colors
    const base = (row + actualCol) % 2 === 0;
    
    // Special milestone tiles
    if (cellNum === 100) return "bg-gradient-to-br from-yellow-500 to-amber-600 text-black";
    if (cellNum === 1) return "bg-gradient-to-br from-green-600 to-emerald-700";
    if (cellNum % 10 === 0) return base ? "bg-emerald-900/60" : "bg-emerald-800/40";
    
    return base ? "bg-stone-800/60" : "bg-stone-700/40";
};

const SnakesLaddersBoard = () => {
    const [playerPos, setPlayerPos] = useState(0);
    const [diceValue, setDiceValue] = useState(null);
    const [isRolling, setIsRolling] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [message, setMessage] = useState("");
    const [moveHistory, setMoveHistory] = useState([]);

    const getCellNumber = (row, col) => {
        const rowFromBottom = BOARD_SIZE - 1 - row;
        if (rowFromBottom % 2 === 0) {
            return rowFromBottom * BOARD_SIZE + col + 1;
        } else {
            return rowFromBottom * BOARD_SIZE + (BOARD_SIZE - col);
        }
    };

    const getCellPosition = useCallback((cellNum) => {
        if (cellNum <= 0) return { row: 9, col: 0 };
        const rowFromBottom = Math.floor((cellNum - 1) / BOARD_SIZE);
        const row = BOARD_SIZE - 1 - rowFromBottom;
        let col;
        if (rowFromBottom % 2 === 0) {
            col = (cellNum - 1) % BOARD_SIZE;
        } else {
            col = BOARD_SIZE - 1 - ((cellNum - 1) % BOARD_SIZE);
        }
        return { row, col };
    }, []);

    const rollDice = () => {
        if (isRolling || isMoving || playerPos === TOTAL_CELLS) return;
        setIsRolling(true);
        setMessage("");

        let count = 0;
        const interval = setInterval(() => {
            setDiceValue(Math.floor(Math.random() * 6) + 1);
            count++;
            if (count > 12) {
                clearInterval(interval);
                const finalValue = Math.floor(Math.random() * 6) + 1;
                setDiceValue(finalValue);
                setIsRolling(false);
                movePlayer(finalValue);
            }
        }, 80);
    };

    const movePlayer = (steps) => {
        setIsMoving(true);
        let newPos = playerPos + steps;

        if (newPos > TOTAL_CELLS) {
            setMessage("Need exact roll to win! 🎯");
            setIsMoving(false);
            return;
        }

        // Animate hop by hop
        let currentStep = playerPos;
        const stepInterval = setInterval(() => {
            currentStep++;
            setPlayerPos(currentStep);
            setMoveHistory(prev => [...prev, currentStep]);

            if (currentStep >= newPos) {
                clearInterval(stepInterval);

                setTimeout(() => {
                    if (SNAKES[newPos]) {
                        setMessage("🐍 Vines pulled you down!");
                        setTimeout(() => setPlayerPos(SNAKES[newPos]), 300);
                    } else if (LADDERS[newPos]) {
                        setMessage("🚀 Rope boost! Climbing up!");
                        setTimeout(() => setPlayerPos(LADDERS[newPos]), 300);
                    }

                    if (newPos === TOTAL_CELLS) {
                        setMessage("🏆 VICTORY! You conquered the jungle!");
                    }

                    setIsMoving(false);
                }, 200);
            }
        }, 180);
    };

    const resetGame = () => {
        setPlayerPos(0);
        setDiceValue(null);
        setMessage("");
        setMoveHistory([]);
    };

    const DiceIcon = diceValue ? DICE_ICONS[diceValue - 1] : Dice1;

    // Get coordinates for snake/ladder SVG paths
    const getPathCoords = (start, end) => {
        const startPos = getCellPosition(start);
        const endPos = getCellPosition(end);
        const cellSize = 100 / BOARD_SIZE;
        
        return {
            x1: startPos.col * cellSize + cellSize / 2,
            y1: startPos.row * cellSize + cellSize / 2,
            x2: endPos.col * cellSize + cellSize / 2,
            y2: endPos.row * cellSize + cellSize / 2,
        };
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl mx-auto"
        >
            {/* Board */}
            <div className="relative">
                {/* Atmospheric glow */}
                <div className="absolute -inset-6 blur-3xl opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/40 via-transparent to-amber-600/40" />
                </div>

                <div className="relative rounded-3xl overflow-hidden border-4 border-stone-700 shadow-2xl">
                    {/* Background texture overlay */}
                    <div className="absolute inset-0 bg-stone-900/50 opacity-50 pointer-events-none z-0" />

                    {/* SVG Layer for Snakes & Ladders */}
                    <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 100 100">
                        <defs>
                            {/* Vine/Snake gradient */}
                            <linearGradient id="vineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#166534" />
                                <stop offset="50%" stopColor="#15803d" />
                                <stop offset="100%" stopColor="#166534" />
                            </linearGradient>
                            {/* Rope/Ladder gradient */}
                            <linearGradient id="ropeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#a16207" />
                                <stop offset="50%" stopColor="#ca8a04" />
                                <stop offset="100%" stopColor="#a16207" />
                            </linearGradient>
                            {/* Glow filters */}
                            <filter id="snakeGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="0.5" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                            <filter id="ladderGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="0.5" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Draw Snakes (Cyber Vines) */}
                        {Object.entries(SNAKES).map(([head, tail]) => {
                            const coords = getPathCoords(Number(head), Number(tail));
                            const midX = (coords.x1 + coords.x2) / 2 + (Math.random() - 0.5) * 15;
                            const midY = (coords.y1 + coords.y2) / 2;
                            
                            return (
                                <g key={`snake-${head}`} filter="url(#snakeGlow)">
                                    {/* Main vine body */}
                                    <path
                                        d={`M ${coords.x1} ${coords.y1} Q ${midX} ${midY} ${coords.x2} ${coords.y2}`}
                                        stroke="url(#vineGrad)"
                                        strokeWidth="2"
                                        fill="none"
                                        strokeLinecap="round"
                                        opacity="0.9"
                                    />
                                    {/* Vine details */}
                                    <path
                                        d={`M ${coords.x1} ${coords.y1} Q ${midX - 3} ${midY} ${coords.x2} ${coords.y2}`}
                                        stroke="#22c55e"
                                        strokeWidth="0.8"
                                        fill="none"
                                        strokeLinecap="round"
                                        opacity="0.6"
                                        strokeDasharray="2 2"
                                    />
                                    {/* Snake head indicator */}
                                    <circle cx={coords.x1} cy={coords.y1} r="1.5" fill="#dc2626" />
                                </g>
                            );
                        })}

                        {/* Draw Ladders (Rope Bridges) */}
                        {Object.entries(LADDERS).map(([bottom, top]) => {
                            const coords = getPathCoords(Number(bottom), Number(top));
                            const dx = coords.x2 - coords.x1;
                            const dy = coords.y2 - coords.y1;
                            const len = Math.sqrt(dx * dx + dy * dy);
                            const perpX = (-dy / len) * 1.5;
                            const perpY = (dx / len) * 1.5;
                            
                            return (
                                <g key={`ladder-${bottom}`} filter="url(#ladderGlow)">
                                    {/* Left rope */}
                                    <line
                                        x1={coords.x1 - perpX}
                                        y1={coords.y1 - perpY}
                                        x2={coords.x2 - perpX}
                                        y2={coords.y2 - perpY}
                                        stroke="url(#ropeGrad)"
                                        strokeWidth="1"
                                        strokeLinecap="round"
                                    />
                                    {/* Right rope */}
                                    <line
                                        x1={coords.x1 + perpX}
                                        y1={coords.y1 + perpY}
                                        x2={coords.x2 + perpX}
                                        y2={coords.y2 + perpY}
                                        stroke="url(#ropeGrad)"
                                        strokeWidth="1"
                                        strokeLinecap="round"
                                    />
                                    {/* Rungs */}
                                    {[0.2, 0.4, 0.6, 0.8].map((t, i) => {
                                        const rx = coords.x1 + dx * t;
                                        const ry = coords.y1 + dy * t;
                                        return (
                                            <line
                                                key={i}
                                                x1={rx - perpX}
                                                y1={ry - perpY}
                                                x2={rx + perpX}
                                                y2={ry + perpY}
                                                stroke="#fbbf24"
                                                strokeWidth="0.8"
                                                strokeLinecap="round"
                                            />
                                        );
                                    })}
                                    {/* Ladder bottom indicator */}
                                    <circle cx={coords.x1} cy={coords.y1} r="1.5" fill="#22c55e" />
                                </g>
                            );
                        })}
                    </svg>

                    {/* Game Grid */}
                    <div className="grid grid-cols-10 gap-0 relative z-20">
                        {Array(BOARD_SIZE).fill(null).map((_, rowIdx) =>
                            Array(BOARD_SIZE).fill(null).map((_, colIdx) => {
                                const cellNum = getCellNumber(rowIdx, colIdx);
                                const isPlayerHere = playerPos === cellNum;
                                const isSnakeHead = SNAKES[cellNum] !== undefined;
                                const isLadderBottom = LADDERS[cellNum] !== undefined;

                                return (
                                    <motion.div
                                        key={`${rowIdx}-${colIdx}`}
                                        className={`
                                            aspect-square flex items-center justify-center relative
                                            text-[9px] md:text-xs font-bold
                                            ${getTileStyle(cellNum)}
                                            border-b border-r border-stone-600/30
                                            transition-all duration-200
                                        `}
                                    >
                                        {/* Cell number */}
                                        <span className={`
                                            absolute top-0.5 left-1 text-[8px] md:text-[10px]
                                            ${cellNum === 100 ? "text-black/70" : "text-white/40"}
                                        `}>
                                            {cellNum}
                                        </span>

                                        {/* Snake/Ladder indicators */}
                                        {isSnakeHead && (
                                            <span className="absolute text-base md:text-lg drop-shadow-lg">🐍</span>
                                        )}
                                        {isLadderBottom && (
                                            <span className="absolute text-base md:text-lg drop-shadow-lg">🪜</span>
                                        )}

                                        {/* Player Token */}
                                        <AnimatePresence>
                                            {isPlayerHere && (
                                                <motion.div
                                                    initial={{ scale: 0, y: -20 }}
                                                    animate={{ 
                                                        scale: 1, 
                                                        y: [0, -8, 0],
                                                    }}
                                                    exit={{ scale: 0 }}
                                                    transition={{ 
                                                        y: { duration: 0.3 },
                                                        scale: { duration: 0.2 }
                                                    }}
                                                    className="absolute z-30"
                                                >
                                                    {/* 3D Pin Avatar */}
                                                    <div className="relative">
                                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-primary to-orange-600 border-2 border-white shadow-lg flex items-center justify-center text-sm md:text-base">
                                                            🎮
                                                        </div>
                                                        {/* Shadow */}
                                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/30 rounded-full blur-sm" />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">
                        Position: <span className="font-bold text-foreground text-lg">{playerPos || "Start"}</span>
                    </p>
                    <AnimatePresence mode="wait">
                        {message && (
                            <motion.p
                                key={message}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className={`font-bold text-base ${
                                    message.includes("VICTORY") ? "text-yellow-400" : 
                                    message.includes("Vines") ? "text-red-400" : 
                                    message.includes("Rope") ? "text-green-400" : 
                                    "text-primary"
                                }`}
                            >
                                {message}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-4">
                    {/* Dice Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={rollDice}
                        disabled={isRolling || isMoving || playerPos === TOTAL_CELLS}
                        className={`
                            w-20 h-20 rounded-2xl 
                            bg-gradient-to-br from-amber-600 to-amber-800
                            border-2 border-amber-500/50
                            flex items-center justify-center
                            shadow-[0_0_20px_rgba(217,119,6,0.4)]
                            transition-all duration-200
                            ${(isRolling || isMoving) && "opacity-60 cursor-not-allowed"}
                        `}
                    >
                        <motion.div
                            animate={isRolling ? { 
                                rotate: [0, 360],
                                scale: [1, 1.1, 1]
                            } : {}}
                            transition={{ duration: 0.15, repeat: isRolling ? Infinity : 0 }}
                        >
                            <DiceIcon className="w-12 h-12 text-white" />
                        </motion.div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetGame}
                        className="p-3 rounded-xl bg-stone-800 border border-stone-600 hover:border-primary/50 transition-colors"
                    >
                        <RotateCcw className="w-6 h-6" />
                    </motion.button>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">🐍 Vine (slide down)</span>
                <span className="flex items-center gap-1">🪜 Rope (climb up)</span>
            </div>
        </motion.div>
    );
};

export default SnakesLaddersBoard;
