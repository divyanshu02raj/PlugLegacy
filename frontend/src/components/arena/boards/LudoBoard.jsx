import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = {
    red: { 
        gradient: "from-red-600 to-red-500",
        bg: "bg-red-500",
        glow: "shadow-[0_0_30px_rgba(239,68,68,0.6)]",
        text: "text-red-400"
    },
    green: { 
        gradient: "from-green-600 to-green-500",
        bg: "bg-green-500",
        glow: "shadow-[0_0_30px_rgba(34,197,94,0.6)]",
        text: "text-green-400"
    },
    yellow: { 
        gradient: "from-yellow-500 to-yellow-400",
        bg: "bg-yellow-500",
        glow: "shadow-[0_0_30px_rgba(234,179,8,0.6)]",
        text: "text-yellow-400"
    },
    blue: { 
        gradient: "from-blue-600 to-blue-500",
        bg: "bg-blue-500",
        glow: "shadow-[0_0_30px_rgba(59,130,246,0.6)]",
        text: "text-blue-400"
    },
};

const PLAYERS = ["red", "green", "yellow", "blue"];

// 3D Dice Component
const Dice3D = ({ value, isRolling, onClick, currentColor }) => {
    const faces = {
        1: [[1, 1]],
        2: [[0, 0], [2, 2]],
        3: [[0, 0], [1, 1], [2, 2]],
        4: [[0, 0], [0, 2], [2, 0], [2, 2]],
        5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
        6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
    };

    const dots = faces[value] || faces[1];

    return (
        <motion.button
            onClick={onClick}
            disabled={isRolling}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                relative w-24 h-24 cursor-pointer
                ${COLORS[currentColor].glow}
            `}
            style={{ perspective: "200px" }}
        >
            <motion.div
                animate={isRolling ? {
                    rotateX: [0, 360, 720, 1080],
                    rotateY: [0, 360, 720, 1080],
                    rotateZ: [0, 180, 360, 540],
                } : { rotateX: 0, rotateY: 0, rotateZ: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full h-full relative"
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Dice Face */}
                <div className={`
                    absolute inset-0 rounded-2xl
                    bg-gradient-to-br ${COLORS[currentColor].gradient}
                    border-2 border-white/30
                    flex items-center justify-center
                    shadow-lg
                `}>
                    <div className="grid grid-cols-3 grid-rows-3 gap-2 p-3 w-16 h-16">
                        {[0, 1, 2].map(row =>
                            [0, 1, 2].map(col => {
                                const hasDot = dots.some(([r, c]) => r === row && c === col);
                                return (
                                    <div key={`${row}-${col}`} className="flex items-center justify-center">
                                        {hasDot && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-3 h-3 rounded-full bg-white shadow-md"
                                            />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.button>
    );
};

// Token/Pawn Component
const Token = ({ color, size = "normal", isHighlighted }) => {
    const sizeClasses = size === "small" ? "w-4 h-4" : "w-6 h-6";
    
    return (
        <motion.div
            animate={isHighlighted ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: isHighlighted ? Infinity : 0 }}
            className={`
                ${sizeClasses} rounded-full relative
                bg-gradient-to-br ${COLORS[color].gradient}
                border-2 border-white/50
                ${isHighlighted ? COLORS[color].glow : "shadow-md"}
            `}
        >
            {/* Shine effect */}
            <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/40" />
        </motion.div>
    );
};

// Home Base Component
const HomeBase = ({ color, tokens = 4 }) => (
    <div className={`
        w-full h-full rounded-2xl p-2
        bg-gradient-to-br ${COLORS[color].gradient}
        border-2 border-white/20
        ${COLORS[color].glow}
    `}>
        <div className="w-full h-full bg-black/20 rounded-xl p-3 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map(i => (
                    <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
                    >
                        {i < tokens && <Token color={color} />}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// Path Cell Component (Pill shaped)
const PathCell = ({ isColored, color, isSafe, children }) => (
    <div className={`
        rounded-lg border border-white/10
        flex items-center justify-center
        transition-all duration-200
        ${isColored ? `bg-gradient-to-br ${COLORS[color].gradient}/30` : "bg-white/5"}
        ${isSafe ? "ring-1 ring-yellow-400/50" : ""}
    `}>
        {isSafe && !children && <span className="text-yellow-400 text-xs">★</span>}
        {children}
    </div>
);

const LudoBoard = () => {
    const [diceValue, setDiceValue] = useState(1);
    const [isRolling, setIsRolling] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState("red");
    const [homeGlow, setHomeGlow] = useState(false);

    const rollDice = () => {
        if (isRolling) return;
        setIsRolling(true);

        let count = 0;
        const interval = setInterval(() => {
            setDiceValue(Math.floor(Math.random() * 6) + 1);
            count++;
            if (count > 15) {
                clearInterval(interval);
                const finalValue = Math.floor(Math.random() * 6) + 1;
                setDiceValue(finalValue);
                setIsRolling(false);

                // Flash home if 6
                if (finalValue === 6) {
                    setHomeGlow(true);
                    setTimeout(() => setHomeGlow(false), 1000);
                } else {
                    // Next player
                    const nextIdx = (PLAYERS.indexOf(currentPlayer) + 1) % PLAYERS.length;
                    setCurrentPlayer(PLAYERS[nextIdx]);
                }
            }
        }, 60);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl mx-auto"
        >
            {/* Current Player Indicator */}
            <motion.div 
                className="flex items-center justify-center gap-3 mb-6"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <Token color={currentPlayer} isHighlighted />
                <span className={`font-bold text-lg capitalize ${COLORS[currentPlayer].text}`}>
                    {currentPlayer}'s Turn
                </span>
            </motion.div>

            {/* SVG-Based Ludo Board */}
            <div className="relative aspect-square">
                {/* Ambient Glow */}
                <div className="absolute -inset-4 blur-3xl opacity-40">
                    <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-red-500/30 rounded-full" />
                    <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-green-500/30 rounded-full" />
                    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-yellow-500/30 rounded-full" />
                    <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-500/30 rounded-full" />
                </div>

                <div className="relative backdrop-blur-xl bg-black/40 rounded-3xl p-3 border border-white/10 shadow-2xl">
                    {/* Board Grid */}
                    <div className="w-full h-full grid grid-cols-15 grid-rows-15 gap-0.5 aspect-square"
                        style={{ gridTemplateColumns: "repeat(15, 1fr)", gridTemplateRows: "repeat(15, 1fr)" }}
                    >
                        {Array(15).fill(null).map((_, row) =>
                            Array(15).fill(null).map((_, col) => {
                                // Home bases (6x6 corners)
                                const isRedHome = row < 6 && col < 6;
                                const isGreenHome = row < 6 && col > 8;
                                const isYellowHome = row > 8 && col < 6;
                                const isBlueHome = row > 8 && col > 8;

                                // Center home triangle (3x3)
                                const isCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;

                                // Path cells
                                const isPath = !isRedHome && !isGreenHome && !isYellowHome && !isBlueHome && !isCenter;

                                // Colored paths to home
                                const isRedPath = col === 7 && row >= 1 && row <= 5;
                                const isGreenPath = row === 7 && col >= 9 && col <= 13;
                                const isYellowPath = col === 7 && row >= 9 && row <= 13;
                                const isBluePath = row === 7 && col >= 1 && col <= 5;

                                // Safe spots (stars)
                                const safeSpots = [
                                    [2, 6], [6, 1], [6, 8], [8, 2], [8, 13], [12, 6], [6, 12], [13, 8]
                                ];
                                const isSafe = safeSpots.some(([r, c]) => r === row && c === col);

                                if (isRedHome && row === 0 && col === 0) {
                                    return (
                                        <div key={`${row}-${col}`} className="col-span-6 row-span-6">
                                            <motion.div 
                                                className="w-full h-full"
                                                animate={homeGlow && currentPlayer === "red" ? { scale: [1, 1.02, 1] } : {}}
                                            >
                                                <HomeBase color="red" />
                                            </motion.div>
                                        </div>
                                    );
                                }
                                if (isGreenHome && row === 0 && col === 9) {
                                    return (
                                        <div key={`${row}-${col}`} className="col-span-6 row-span-6">
                                            <motion.div 
                                                className="w-full h-full"
                                                animate={homeGlow && currentPlayer === "green" ? { scale: [1, 1.02, 1] } : {}}
                                            >
                                                <HomeBase color="green" />
                                            </motion.div>
                                        </div>
                                    );
                                }
                                if (isYellowHome && row === 9 && col === 0) {
                                    return (
                                        <div key={`${row}-${col}`} className="col-span-6 row-span-6">
                                            <motion.div 
                                                className="w-full h-full"
                                                animate={homeGlow && currentPlayer === "yellow" ? { scale: [1, 1.02, 1] } : {}}
                                            >
                                                <HomeBase color="yellow" />
                                            </motion.div>
                                        </div>
                                    );
                                }
                                if (isBlueHome && row === 9 && col === 9) {
                                    return (
                                        <div key={`${row}-${col}`} className="col-span-6 row-span-6">
                                            <motion.div 
                                                className="w-full h-full"
                                                animate={homeGlow && currentPlayer === "blue" ? { scale: [1, 1.02, 1] } : {}}
                                            >
                                                <HomeBase color="blue" />
                                            </motion.div>
                                        </div>
                                    );
                                }

                                // Skip cells covered by home bases
                                if ((isRedHome && !(row === 0 && col === 0)) ||
                                    (isGreenHome && !(row === 0 && col === 9)) ||
                                    (isYellowHome && !(row === 9 && col === 0)) ||
                                    (isBlueHome && !(row === 9 && col === 9))) {
                                    return null;
                                }

                                // Center triangles
                                if (isCenter) {
                                    const centerColors = {
                                        "6-6": "red", "6-7": "green", "6-8": "green",
                                        "7-6": "red", "7-7": null, "7-8": "blue",
                                        "8-6": "yellow", "8-7": "yellow", "8-8": "blue",
                                    };
                                    const centerColor = centerColors[`${row}-${col}`];
                                    
                                    return (
                                        <motion.div
                                            key={`${row}-${col}`}
                                            animate={homeGlow ? { scale: [1, 1.1, 1] } : {}}
                                            className={`
                                                flex items-center justify-center
                                                ${centerColor ? `bg-gradient-to-br ${COLORS[centerColor].gradient}` : "bg-white/20"}
                                                ${row === 7 && col === 7 ? "rounded-full" : ""}
                                            `}
                                        >
                                            {row === 7 && col === 7 && (
                                                <span className="text-lg">🏠</span>
                                            )}
                                        </motion.div>
                                    );
                                }

                                // Path cells
                                if (isPath) {
                                    let pathColor = null;
                                    if (isRedPath) pathColor = "red";
                                    else if (isGreenPath) pathColor = "green";
                                    else if (isYellowPath) pathColor = "yellow";
                                    else if (isBluePath) pathColor = "blue";

                                    return (
                                        <PathCell 
                                            key={`${row}-${col}`}
                                            isColored={!!pathColor}
                                            color={pathColor}
                                            isSafe={isSafe}
                                        />
                                    );
                                }

                                return <div key={`${row}-${col}`} />;
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Dice & Controls */}
            <div className="mt-8 flex flex-col items-center gap-4">
                <Dice3D 
                    value={diceValue}
                    isRolling={isRolling}
                    onClick={rollDice}
                    currentColor={currentPlayer}
                />
                
                <AnimatePresence>
                    {!isRolling && diceValue === 6 && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`font-bold ${COLORS[currentPlayer].text}`}
                        >
                            🎉 Roll again!
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default LudoBoard;
