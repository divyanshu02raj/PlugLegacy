import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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
            className="relative w-16 h-16 cursor-pointer z-10"
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
                {/* Faces */}
                <DiceFace faceValue={1} transform="translateZ(32px)" />
                <DiceFace faceValue={2} transform="rotateY(180deg) translateZ(32px)" />
                <DiceFace faceValue={3} transform="rotateY(90deg) translateZ(32px)" />
                <DiceFace faceValue={4} transform="rotateY(-90deg) translateZ(32px)" />
                <DiceFace faceValue={5} transform="rotateX(90deg) translateZ(32px)" />
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
const HomeBase = ({ color, pieces, onPieceClick, isActive = true }) => (
    <div className={`
        relative w-full h-full rounded-2xl p-2
        bg-gradient-to-br ${COLORS[color].gradient}
        border-2 border-white/20
        ${isActive ? COLORS[color].glow : 'opacity-30 grayscale'}
        transition-all duration-500
    `}>
        <div className="w-full h-full bg-black/20 rounded-xl p-3 flex items-center justify-center">
            {isActive ? (
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
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <X className="w-16 h-16 text-white/50" />
                </div>
            )}
        </div>
    </div>
);

// Path Cell Component
const PathCell = ({ isColored, color, isSafe, children, onClick }) => (
    <div
        onClick={onClick}
        className={`
            rounded-lg border border-white/10
            flex items-center justify-center relative
            transition-all duration-200
            ${isColored ? `bg-gradient-to-br ${COLORS[color].gradient}/30` : "bg-white/5"}
            ${isSafe ? "ring-1 ring-yellow-400/50" : ""}
            ${onClick ? "cursor-pointer hover:bg-white/20" : ""}
    `}>
        {isSafe && !children && <span className="text-yellow-400 text-xs absolute top-0.5 right-0.5">★</span>}
        {children}
    </div>
);

// Map of 0-51 positions to [row, col] coordinates
const MAIN_PATH_COORDS = [
    [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], // 0-4 (Red Start -> Right)
    [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], // 5-10 (Up)
    [0, 7], [0, 8], // 11-12 (Top Center)
    [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], // 13-18 (Green Start -> Down)
    [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], // 19-24 (Right)
    [7, 14], [8, 14], // 25-26 (Right Center)
    [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], // 27-31 (Yellow Start -> Left)
    [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], // 32-37 (Down)
    [14, 7], [14, 6], // 38-39 (Bottom Center)
    [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], // 40-44 (Blue Start -> Up)
    [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], // 45-50 (Left)
    [7, 0] // 51 (Last step before home)
];

const HOME_STRETCH_COORDS = {
    red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]], // Red Home Stretch (Left)
    green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]], // Green Home Stretch (Top)
    yellow: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]], // Yellow Home Stretch (Bottom)
    blue: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]]  // Blue Home Stretch (Right)
};

const LudoBoard = () => {
    const [gameMode, setGameMode] = useState(null); // null = show mode selection
    const [botCount, setBotCount] = useState(null); // null = show bot selection (for computer mode)

    const engineRef = useRef(new LudoEngine());
    const [gameState, setGameState] = useState(engineRef.current.getGameState());
    const [isRolling, setIsRolling] = useState(false);
    const [homeGlow, setHomeGlow] = useState(false);
    const workerRef = useRef(null);

    // Initialize Stockfish Worker
    useEffect(() => {
        workerRef.current = new Worker("/LudoStockfish.worker.js");

        workerRef.current.onmessage = (e) => {
            const bestMove = e.data;
            if (bestMove) {
                // Execute move returned by worker
                const result = engine.movePiece(gameState.currentPlayer, bestMove.pieceId);
                handleMoveResult(result, gameState.currentPlayer);
            } else {
                // No valid moves (should be rare if worker logic matches engine)
                handleMoveResult({ success: true, action: "skip", extraTurn: false }, gameState.currentPlayer);
            }
        };

        return () => workerRef.current?.terminate();
    }, [gameState.currentPlayer]); // Re-bind if needed, or just once (empty dependency is better but need state access in handler? actually handler uses engine which is ref-like object, but we might need wrapper) 

    // Better: Worker handler calls a unified move handler.

    const handleMoveResult = (result, player) => {
        if (result.success) {
            if (result.action === "win") {
                setMessage(`${player.toUpperCase()} WINS! 🎉`);
            } else if (result.action === "capture") {
                setMessage(`${player} captured a piece!`);
            }

            if (!result.extraTurn) {
                engine.nextTurn();
            } else {
                engine.diceValue = 0;
            }
            setGameState(engine.getGameState());
        } else {
            // Fallback skip
            engine.nextTurn();
            setGameState(engine.getGameState());
        }
    };
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [message, setMessage] = useState("");

    const engine = engineRef.current;

    // Bot Dice Roll execution
    useEffect(() => {
        const currentPlayer = gameState.currentPlayer;
        const isBotTurn = ["green", "yellow", "blue"].includes(currentPlayer);

        if (isBotTurn && gameState.diceValue === 0 && !isRolling && !gameState.gameOver) {
            const rollDelay = setTimeout(() => {
                setIsRolling(true);
                setMessage(`${currentPlayer}'s turn...`);

                // Simulate rolling animation time
                setTimeout(() => {
                    const result = engine.rollDice();
                    setIsRolling(false);
                    setMessage("");

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
                    }
                }, 1000);
            }, 500);

            return () => clearTimeout(rollDelay);
        }
    }, [gameState.currentPlayer, gameState.diceValue, gameState.gameOver, isRolling]);

    // Bot Move execution
    // Bot Move Execution with Stockfish
    useEffect(() => {
        const currentPlayer = gameState.currentPlayer;
        const isBotTurn = ["green", "yellow", "blue"].includes(currentPlayer);

        if (isBotTurn && gameState.diceValue > 0 && !gameState.gameOver) {
            // Send game state to worker
            // Small delay for UX
            const timeout = setTimeout(() => {
                const validMoves = engine.getValidMoves(currentPlayer);
                if (validMoves.length === 0) {
                    engine.nextTurn();
                    setGameState(engine.getGameState());
                    setMessage("");
                } else {
                    setMessage("Thinking...");
                    workerRef.current.postMessage({
                        gameState: engine.getGameState(),
                        player: currentPlayer,
                        depth: 3
                    });
                }
            }, 1000);
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
                engine.diceValue = 0; // Reset dice for extra turn
                setGameState(engine.getGameState());
            }
        }
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

        // Define active players based on bot count
        // 1 Bot = Red vs Blue (Opposite Corners)
        // 2 Bots = Red, Green, Yellow (Standard 3-player)
        // 3 Bots = All
        let activePlayers = PLAYERS;
        if (count === 1) activePlayers = ["red", "blue"];
        else if (count === 2) activePlayers = ["red", "green", "yellow"];

        // Now reset game with selected active players
        engine.reset(activePlayers);

        // Update engine to use selected number of bots (exclude human/red)
        engine.bots = activePlayers.filter(p => p !== "red");

        setGameState(engine.getGameState());
    };

    const getPiecesAt = (row, col) => {
        const piecesAtLoc = [];
        PLAYERS.forEach(player => {
            const playerPieces = gameState.pieces[player];
            if (!playerPieces) return;

            playerPieces.forEach((piece, id) => {
                if (piece.finished || piece.position === -1) return; // Ignore finished or home pieces

                let coords = null;
                if (piece.inHomeStretch) {
                    const index = piece.homeStretchPosition - 1;
                    if (index >= 0 && index < 6) {
                        coords = HOME_STRETCH_COORDS[player][index];
                    }
                } else {
                    coords = MAIN_PATH_COORDS[piece.position];
                }

                if (coords && coords[0] === row && coords[1] === col) {
                    piecesAtLoc.push({ ...piece, color: player, originalId: id });
                }
            });
        });
        return piecesAtLoc;
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

    const activePlayers = gameMode === 'computer' && botCount
        ? (botCount === 1 ? ["red", "blue"] : botCount === 2 ? ["red", "green", "yellow"] : PLAYERS)
        : PLAYERS;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto"
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

                                // Colored paths to home (Corrected)
                                const isRedPath = row === 7 && col >= 1 && col <= 5;        // Left
                                const isGreenPath = col === 7 && row >= 1 && row <= 5;      // Top
                                const isYellowPath = col === 7 && row >= 9 && row <= 13;    // Bottom
                                const isBluePath = row === 7 && col >= 9 && col <= 13;      // Right

                                // Start Positions
                                const isRedStart = row === 6 && col === 1;
                                const isGreenStart = row === 1 && col === 8;
                                const isYellowStart = row === 13 && col === 6;
                                const isBlueStart = row === 8 && col === 13;
                                const isStart = isRedStart || isGreenStart || isYellowStart || isBlueStart;

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
                                                animate={homeGlow && gameState.currentPlayer === "red" ? { scale: [1, 1.02, 1] } : {}}
                                            >
                                                <HomeBase
                                                    color="red"
                                                    pieces={gameState.pieces.red}
                                                    onPieceClick={handlePieceClick}
                                                    isActive={activePlayers.includes("red")}
                                                />
                                            </motion.div>
                                        </div>
                                    );
                                }
                                if (isGreenHome && row === 0 && col === 9) {
                                    return (
                                        <div key={`${row}-${col}`} className="col-span-6 row-span-6">
                                            <motion.div
                                                className="w-full h-full"
                                                animate={homeGlow && gameState.currentPlayer === "green" ? { scale: [1, 1.02, 1] } : {}}
                                            >
                                                <HomeBase
                                                    color="green"
                                                    pieces={gameState.pieces.green}
                                                    onPieceClick={handlePieceClick}
                                                    isActive={activePlayers.includes("green")}
                                                />
                                            </motion.div>
                                        </div>
                                    );
                                }
                                if (isYellowHome && row === 9 && col === 0) {
                                    return (
                                        <div key={`${row}-${col}`} className="col-span-6 row-span-6">
                                            <motion.div
                                                className="w-full h-full"
                                                animate={homeGlow && gameState.currentPlayer === "yellow" ? { scale: [1, 1.02, 1] } : {}}
                                            >
                                                <HomeBase
                                                    color="yellow"
                                                    pieces={gameState.pieces.yellow}
                                                    onPieceClick={handlePieceClick}
                                                    isActive={activePlayers.includes("yellow")}
                                                />
                                            </motion.div>
                                        </div>
                                    );
                                }
                                if (isBlueHome && row === 9 && col === 9) {
                                    return (
                                        <div key={`${row}-${col}`} className="col-span-6 row-span-6">
                                            <motion.div
                                                className="w-full h-full"
                                                animate={homeGlow && gameState.currentPlayer === "blue" ? { scale: [1, 1.02, 1] } : {}}
                                            >
                                                <HomeBase
                                                    color="blue"
                                                    pieces={gameState.pieces.blue}
                                                    onPieceClick={handlePieceClick}
                                                    isActive={activePlayers.includes("blue")}
                                                />
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

                                    const piecesHere = getPiecesAt(row, col);

                                    return (
                                        <div
                                            key={`${row}-${col}`}
                                            onClick={() => {
                                                if (piecesHere.length > 0) {
                                                    const myPiece = piecesHere.find(p => p.color === gameState.currentPlayer);
                                                    const pieceToMove = myPiece || piecesHere[0];
                                                    handlePieceClick(pieceToMove.color, pieceToMove.originalId);
                                                }
                                            }}
                                            className={`
                                            relative w-full h-full rounded-sm border border-white/5
                                            transition-colors duration-300 cursor-pointer
                                            
                                            // Colored Home Paths
                                            ${isRedPath ? "bg-red-500/20 border-red-500/30" : ""}
                                            ${isGreenPath ? "bg-green-500/20 border-green-500/30" : ""}
                                            ${isYellowPath ? "bg-yellow-500/20 border-yellow-500/30" : ""}
                                            ${isBluePath ? "bg-blue-500/20 border-blue-500/30" : ""}

                                            // Start Positions
                                            ${isRedStart ? "bg-red-500/40 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" : ""}
                                            ${isGreenStart ? "bg-green-500/40 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : ""}
                                            ${isYellowStart ? "bg-yellow-500/40 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]" : ""}
                                            ${isBlueStart ? "bg-blue-500/40 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]" : ""}
                                            
                                            ${!pathColor && !isStart ? "bg-white/5 hover:bg-white/10" : ""}
                                        `}
                                        >
                                            {/* Start Icon/Dot */}
                                            {isStart && (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-50">
                                                    <div className={`w-2 h-2 rounded-full 
                                                        ${isRedStart ? "bg-red-500 shadow-[0_0_5px_red]" : ""}
                                                        ${isGreenStart ? "bg-green-500 shadow-[0_0_5px_green]" : ""}
                                                        ${isYellowStart ? "bg-yellow-500 shadow-[0_0_5px_yellow]" : ""}
                                                        ${isBlueStart ? "bg-blue-500 shadow-[0_0_5px_blue]" : ""}
                                                    `} />
                                                </div>
                                            )}

                                            {/* Safe Spot Star */}
                                            {isSafe && !isStart && (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                                    <span className="text-xs">⭐</span>
                                                </div>
                                            )}

                                            {piecesHere.map((p, i) => (
                                                <motion.div
                                                    key={`${p.color}-${p.originalId}`}
                                                    layoutId={`piece-${p.color}-${p.originalId}`}
                                                    className="absolute"
                                                    style={{
                                                        zIndex: 10 + i,
                                                        transform: piecesHere.length > 1 ? `translate(${(i - (piecesHere.length - 1) / 2) * 4}px, ${(i - (piecesHere.length - 1) / 2) * -4}px)` : 'none'
                                                    }}
                                                >
                                                    <Token color={p.color} />
                                                </motion.div>
                                            ))}
                                        </div>
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
                            className={`absolute top-full mt-2 font-bold whitespace-nowrap ${COLORS[gameState.currentPlayer].text}`}
                        >
                            🎉 Extra Turn! Move Piece
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default LudoBoard;

