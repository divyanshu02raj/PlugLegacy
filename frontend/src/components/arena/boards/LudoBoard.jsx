import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LudoEngine from "../../../utils/LudoEngine";
import LudoModeSelection from "./ludo/LudoModeSelection";
import LudoBotSelection from "./ludo/LudoBotSelection";

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

// 3D Dice Component with all 6 faces
const Dice3D = ({ value, isRolling, onClick, currentColor }) => {
    const faces = {
        1: [[1, 1]],
        2: [[0, 0], [2, 2]],
        3: [[0, 0], [1, 1], [2, 2]],
        4: [[0, 0], [0, 2], [2, 0], [2, 2]],
        5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
        6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
    };

    const DiceFace = ({ faceValue, transform }) => {
        const dots = faces[faceValue] || faces[1];
        return (
            <div
                className={`
                    absolute w-16 h-16 rounded-lg
                    bg-gradient-to-br ${COLORS[currentColor].gradient}
                    border-2 border-white/40
                    flex items-center justify-center
                    shadow-lg backdrop-blur-sm
                `}
                style={{ transform }}
            >
                <div className="grid grid-cols-3 grid-rows-3 gap-1 p-2 w-full h-full">
                    {[0, 1, 2].map(row =>
                        [0, 1, 2].map(col => {
                            const hasDot = dots.some(([r, c]) => r === row && c === col);
                            return (
                                <div key={`${row}-${col}`} className="flex items-center justify-center">
                                    {hasDot && (
                                        <div className="w-2 h-2 rounded-full bg-white shadow-md" />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    };

    return (
        <motion.button
            onClick={onClick}
            disabled={isRolling}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-16 h-16 cursor-pointer"
            style={{ perspective: "800px" }}
        >
            <motion.div
                animate={isRolling ? {
                    rotateX: [0, 360, 720, 1080, 1440],
                    rotateY: [0, 360, 720, 1080, 1440],
                    rotateZ: [0, 180, 360, 540, 720],
                } : {
                    rotateX: value === 1 ? 0 : value === 2 ? 180 : value === 3 ? -90 : value === 4 ? 90 : value === 5 ? -90 : 0,
                    rotateY: value === 1 ? 0 : value === 2 ? 0 : value === 3 ? 0 : value === 4 ? 0 : value === 5 ? 180 : -90,
                    rotateZ: 0,
                }}
                transition={{
                    duration: isRolling ? 1 : 0.5,
                    ease: isRolling ? "linear" : "easeOut"
                }}
                className="w-full h-full relative"
                style={{
                    transformStyle: "preserve-3d",
                    filter: `drop-shadow(${COLORS[currentColor].glow})`
                }}
            >
                {/* Front face (1) */}
                <DiceFace faceValue={1} transform="translateZ(32px)" />

                {/* Back face (2) */}
                <DiceFace faceValue={2} transform="rotateY(180deg) translateZ(32px)" />

                {/* Right face (3) */}
                <DiceFace faceValue={3} transform="rotateY(90deg) translateZ(32px)" />

                {/* Left face (4) */}
                <DiceFace faceValue={4} transform="rotateY(-90deg) translateZ(32px)" />

                {/* Top face (5) */}
                <DiceFace faceValue={5} transform="rotateX(90deg) translateZ(32px)" />

                {/* Bottom face (6) */}
                <DiceFace faceValue={6} transform="rotateX(-90deg) translateZ(32px)" />
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
const HomeBase = ({ color, pieces, onPieceClick }) => (
    <div className={`
        w-full h-full rounded-2xl p-2
        bg-gradient-to-br ${COLORS[color].gradient}
        border-2 border-white/20
        ${COLORS[color].glow}
    `}>
        <div className="w-full h-full bg-black/20 rounded-xl p-3 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map(i => {
                    const piece = pieces ? pieces[i] : null;
                    const isInHome = piece && piece.position === -1;
                    return (
                        <div
                            key={i}
                            onClick={() => isInHome && onPieceClick && onPieceClick(color, i)}
                            className={`w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center ${isInHome && onPieceClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''
                                }`}
                        >
                            {isInHome && <Token color={color} />}
                        </div>
                    );
                })}
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
    const [gameMode, setGameMode] = useState(null); // null = show mode selection
    const [botCount, setBotCount] = useState(null); // null = show bot selection (for computer mode)

    const engineRef = useRef(new LudoEngine());
    const [gameState, setGameState] = useState(engineRef.current.getGameState());
    const [isRolling, setIsRolling] = useState(false);
    const [homeGlow, setHomeGlow] = useState(false);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [message, setMessage] = useState("");

    const engine = engineRef.current;

    // Bot AI execution
    useEffect(() => {
        const currentPlayer = gameState.currentPlayer;
        const isBotTurn = ["green", "yellow", "blue"].includes(currentPlayer);

        if (isBotTurn && gameState.diceValue > 0 && !gameState.gameOver) {
            // Bot makes move after a delay
            const timeout = setTimeout(() => {
                const validMoves = engine.getValidMoves(currentPlayer);

                if (validMoves.length === 0) {
                    // No valid moves, skip turn
                    engine.nextTurn();
                    setGameState(engine.getGameState());
                    setMessage("");
                } else {
                    // Bot selects best move
                    const pieceId = engine.getBotMove(currentPlayer);
                    const result = engine.movePiece(currentPlayer, pieceId);

                    if (result.success) {
                        if (result.action === "win") {
                            setMessage(`${currentPlayer.toUpperCase()} WINS! 🎉`);
                        } else if (result.action === "capture") {
                            setMessage(`${currentPlayer} captured a piece!`);
                        }

                        if (!result.extraTurn) {
                            engine.nextTurn();
                        }
                        setGameState(engine.getGameState());
                    }
                }
            }, 1500);

            return () => clearTimeout(timeout);
        }
    }, [gameState.currentPlayer, gameState.diceValue, gameState.gameOver]);

    const rollDice = () => {
        if (isRolling || gameState.currentPlayer !== "red" || gameState.diceValue > 0) return;

        setIsRolling(true);
        setMessage("");

        let count = 0;
        const interval = setInterval(() => {
            count++;
            if (count > 12) {
                clearInterval(interval);
                const result = engine.rollDice();
                setIsRolling(false);

                if (result.skipTurn) {
                    setMessage("Three 6s! Turn skipped!");
                    setTimeout(() => {
                        setMessage("");
                        setGameState(engine.getGameState());
                    }, 1500);
                } else {
                    if (result.value === 6) {
                        setHomeGlow(true);
                        setTimeout(() => setHomeGlow(false), 800);
                    }
                    setGameState(engine.getGameState());

                    // Check if player has any valid moves
                    const validMoves = engine.getValidMoves("red");
                    if (validMoves.length === 0) {
                        setMessage("No valid moves!");
                        setTimeout(() => {
                            engine.nextTurn();
                            setGameState(engine.getGameState());
                            setMessage("");
                        }, 1500);
                    }
                }
            }
        }, 60);
    };

    const handlePieceClick = (player, pieceId) => {
        if (player !== "red" || gameState.diceValue === 0 || isRolling) return;

        if (!engine.canMovePiece(player, pieceId)) {
            setMessage("Can't move this piece!");
            setTimeout(() => setMessage(""), 1000);
            return;
        }

        const result = engine.movePiece(player, pieceId);

        if (result.success) {
            setSelectedPiece(null);

            if (result.action === "win") {
                setMessage("YOU WIN! 🎉🏆");
            } else if (result.action === "capture") {
                setMessage("Captured opponent's piece!");
            } else if (result.action === "start") {
                setMessage("Piece started!");
            }

            if (!result.extraTurn) {
                setTimeout(() => {
                    engine.nextTurn();
                    setGameState(engine.getGameState());
                    setMessage("");
                }, 800);
            } else {
                setGameState(engine.getGameState());
            }
        }
    };

    const getPiecePosition = (player, piece) => {
        // This will be used to position pieces on the board
        // For now, return null (pieces will be in home bases)
        return null;
    };

    const handleModeSelect = (mode) => {
        setGameMode(mode);
        // Don't reset game yet if computer mode - wait for bot count selection
        if (mode !== 'computer') {
            engine.reset();
            setGameState(engine.getGameState());
        }
    };

    const handleBotCountSelect = (count) => {
        setBotCount(count);
        // Now reset game with selected bot count
        engine.reset();
        // Update engine to use selected number of bots
        engine.bots = PLAYERS.slice(1, count + 1); // Red is player, rest are bots
        setGameState(engine.getGameState());
    };

    // Show mode selection if no mode is chosen
    if (!gameMode) {
        return <LudoModeSelection onSelectMode={handleModeSelect} />;
    }

    // Show bot selection if computer mode but no bot count chosen
    if (gameMode === 'computer' && !botCount) {
        return (
            <LudoBotSelection
                onSelectBotCount={handleBotCountSelect}
                onBack={() => setGameMode(null)}
            />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg mx-auto"
        >
            {/* Current Player Indicator */}
            <motion.div
                className="flex items-center justify-center gap-3 mb-3"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <Token color={gameState.currentPlayer} isHighlighted />
                <span className={`font-bold text-lg capitalize ${COLORS[gameState.currentPlayer].text}`}>
                    {gameState.currentPlayer}'s Turn
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
            <div className="mt-4 flex flex-col items-center gap-3">
                <Dice3D
                    value={gameState.diceValue}
                    isRolling={isRolling}
                    onClick={rollDice}
                    currentColor={gameState.currentPlayer}
                />

                <AnimatePresence>
                    {!isRolling && gameState.diceValue === 6 && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`font-bold ${COLORS[gameState.currentPlayer].text}`}
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