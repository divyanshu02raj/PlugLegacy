import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

const BOARD_SIZE = 10;
const TOTAL_CELLS = 100;

// Snakes: head -> tail
const SNAKES = {
    99: 54,
    70: 55,
    52: 42,
    25: 2,
    95: 72,
};

// Ladders: bottom -> top
const LADDERS = {
    6: 25,
    11: 40,
    60: 85,
    46: 90,
    17: 69,
};

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

const SnakesLaddersBoard = () => {
    const [playerPos, setPlayerPos] = useState(0);
    const [diceValue, setDiceValue] = useState(null);
    const [isRolling, setIsRolling] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [message, setMessage] = useState("");

    const getCellNumber = (row, col) => {
        const rowFromBottom = BOARD_SIZE - 1 - row;
        if (rowFromBottom % 2 === 0) {
            return rowFromBottom * BOARD_SIZE + col + 1;
        } else {
            return rowFromBottom * BOARD_SIZE + (BOARD_SIZE - col);
        }
    };

    const getCellPosition = (cellNum) => {
        const rowFromBottom = Math.floor((cellNum - 1) / BOARD_SIZE);
        const row = BOARD_SIZE - 1 - rowFromBottom;
        let col;
        if (rowFromBottom % 2 === 0) {
            col = (cellNum - 1) % BOARD_SIZE;
        } else {
            col = BOARD_SIZE - 1 - ((cellNum - 1) % BOARD_SIZE);
        }
        return { row, col };
    };

    const rollDice = () => {
        if (isRolling || isMoving) return;
        setIsRolling(true);
        setMessage("");

        let count = 0;
        const interval = setInterval(() => {
            setDiceValue(Math.floor(Math.random() * 6) + 1);
            count++;
            if (count > 10) {
                clearInterval(interval);
                const finalValue = Math.floor(Math.random() * 6) + 1;
                setDiceValue(finalValue);
                setIsRolling(false);
                movePlayer(finalValue);
            }
        }, 100);
    };

    const movePlayer = (steps) => {
        setIsMoving(true);
        let newPos = playerPos + steps;

        if (newPos > TOTAL_CELLS) {
            setMessage("Need exact roll to win!");
            setIsMoving(false);
            return;
        }

        // Animate step by step
        let currentStep = playerPos;
        const stepInterval = setInterval(() => {
            currentStep++;
            setPlayerPos(currentStep);

            if (currentStep >= newPos) {
                clearInterval(stepInterval);

                // Check for snake or ladder
                setTimeout(() => {
                    if (SNAKES[newPos]) {
                        setMessage("🐍 Snake bite! Sliding down...");
                        setPlayerPos(SNAKES[newPos]);
                    } else if (LADDERS[newPos]) {
                        setMessage("🪜 Ladder! Climbing up...");
                        setPlayerPos(LADDERS[newPos]);
                    }

                    if (newPos === TOTAL_CELLS) {
                        setMessage("🎉 You Won!");
                    }

                    setIsMoving(false);
                }, 300);
            }
        }, 200);
    };

    const resetGame = () => {
        setPlayerPos(0);
        setDiceValue(null);
        setMessage("");
    };

    const DiceIcon = diceValue ? DICE_ICONS[diceValue - 1] : Dice1;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg mx-auto"
        >
            {/* Board */}
            <div className="relative">
                <div className="absolute inset-0 blur-3xl opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/40 via-transparent to-red-500/40" />
                </div>

                <div className="relative glass-card rounded-2xl p-2 border border-glass-border">
                    <div className="grid grid-cols-10 gap-0.5">
                        {Array(BOARD_SIZE).fill(null).map((_, rowIdx) =>
                            Array(BOARD_SIZE).fill(null).map((_, colIdx) => {
                                const cellNum = getCellNumber(rowIdx, colIdx);
                                const isSnakeHead = SNAKES[cellNum] !== undefined;
                                const isSnakeTail = Object.values(SNAKES).includes(cellNum);
                                const isLadderBottom = LADDERS[cellNum] !== undefined;
                                const isLadderTop = Object.values(LADDERS).includes(cellNum);
                                const isPlayerHere = playerPos === cellNum;
                                const isEven = (rowIdx + colIdx) % 2 === 0;

                                return (
                                    <motion.div
                                        key={`${rowIdx}-${colIdx}`}
                                        className={`
                      aspect-square flex items-center justify-center relative
                      text-[10px] md:text-xs font-bold rounded-sm
                      ${isEven ? "bg-amber-100/80" : "bg-amber-200/80"}
                      ${isSnakeHead && "bg-red-400/60"}
                      ${isSnakeTail && "bg-red-300/60"}
                      ${isLadderBottom && "bg-green-400/60"}
                      ${isLadderTop && "bg-green-300/60"}
                    `}
                                    >
                                        <span className="text-slate-700/60">{cellNum}</span>

                                        {isSnakeHead && <span className="absolute text-lg">🐍</span>}
                                        {isLadderBottom && <span className="absolute text-lg">🪜</span>}

                                        <AnimatePresence>
                                            {isPlayerHere && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    className="absolute inset-1 bg-primary rounded-full flex items-center justify-center text-lg z-10"
                                                    style={{ boxShadow: "0 0 10px hsl(var(--primary))" }}
                                                >
                                                    🎮
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
            <div className="mt-6 flex justify-between items-center">
                <div className="text-sm">
                    <p className="text-muted-foreground">Position: <span className="font-bold text-foreground">{playerPos || "Start"}</span></p>
                    {message && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`font-bold ${message.includes("Won") ? "text-green-400" : message.includes("Snake") ? "text-red-400" : "text-primary"}`}
                        >
                            {message}
                        </motion.p>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={rollDice}
                        disabled={isRolling || isMoving || playerPos === TOTAL_CELLS}
                        className={`
              w-16 h-16 rounded-xl glass-card border-2 border-primary
              flex items-center justify-center
              ${(isRolling || isMoving) && "opacity-50"}
            `}
                    >
                        <motion.div
                            animate={isRolling ? { rotate: [0, 360] } : {}}
                            transition={{ duration: 0.2, repeat: isRolling ? Infinity : 0 }}
                        >
                            <DiceIcon className="w-10 h-10" />
                        </motion.div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetGame}
                        className="px-4 py-2 rounded-xl glass-card border border-glass-border hover:border-primary/50"
                    >
                        Reset
                    </motion.button>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
                <span>🐍 Snake (go down)</span>
                <span>🪜 Ladder (go up)</span>
            </div>
        </motion.div>
    );
};

export default SnakesLaddersBoard;
