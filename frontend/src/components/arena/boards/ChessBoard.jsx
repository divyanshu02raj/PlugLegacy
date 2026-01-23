import { useState, useMemo, useEffect, useCallback, Component } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ArrowLeft } from "lucide-react";
import { Chess } from "chess.js";
import { useLocation } from "react-router-dom";
import { useSocket } from "../../../context/SocketContext";
import ChessModeSelection from "./chess/ChessModeSelection";
import ChessFriendLobby from "./chess/ChessFriendLobby";

// Error Boundary Component (unchanged)
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ChessBoard Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Something went wrong</h2>
                    <p className="text-muted-foreground mb-4">{this.state.error?.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// --- Premium SVG Chess Pieces ---
const ChessPiece = ({ type, color, isActive }) => {
    // Gradients definitions are reused for consistency
    const defs = (
        <defs>
            {/* White Pieces: Platinum/Silver Gradient */}
            <linearGradient id="grad-white" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            {/* Black Pieces: Golden Amber Gradient */}
            <linearGradient id="grad-black" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#92400e" />
            </linearGradient>

            {/* Drop Shadow for "Floating" effect */}
            <filter id="piece-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.6" />
            </filter>
        </defs>
    );

    const fillUrl = color === "w" ? "url(#grad-white)" : "url(#grad-black)";
    const strokeColor = color === "w" ? "#475569" : "#451a03"; // Slate-600 vs Amber-950

    const pieces = {
        k: (
            <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-2xl">
                {defs}
                <g fill={fillUrl} stroke={strokeColor} strokeWidth="1.2" filter="url(#piece-shadow)">
                    <path d="M22.5 11.63V6M20 8h5" strokeLinecap="round" />
                    <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" />
                    <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" />
                </g>
            </svg>
        ),
        q: (
            <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-2xl">
                {defs}
                <g fill={fillUrl} stroke={strokeColor} strokeWidth="1.2" filter="url(#piece-shadow)">
                    <circle cx="6" cy="12" r="2.75" />
                    <circle cx="14" cy="9" r="2.75" />
                    <circle cx="22.5" cy="8" r="2.75" />
                    <circle cx="31" cy="9" r="2.75" />
                    <circle cx="39" cy="12" r="2.75" />
                    <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-3.5-7-5 9.5-5-9.5-3.5 7-7.5-12.5L9 26z" strokeLinecap="round" />
                    <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" strokeLinecap="round" />
                    <path d="M11 38.5a35 35 1 0023 0" fill="none" strokeLinecap="round" />
                    <path d="M11 29a35 35 1 0123 0M12.5 31.5h20M11.5 34.5a35 35 1 0022 0M10.5 37.5a35 35 1 0024 0" fill="none" />
                </g>
            </svg>
        ),
        r: (
            <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-2xl">
                {defs}
                <g fill={fillUrl} stroke={strokeColor} strokeWidth="1.2" filter="url(#piece-shadow)">
                    <path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z" strokeLinecap="round" />
                    <path d="M14 29.5v-13h17v13H14z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z" strokeLinecap="round" />
                    <path d="M12 35.5h21M13 31.5h19M14 29.5h17M14 16.5h17" fill="none" strokeWidth="1" />
                </g>
            </svg>
        ),
        b: (
            <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-2xl">
                {defs}
                <g fill={fillUrl} stroke={strokeColor} strokeWidth="1.2" filter="url(#piece-shadow)">
                    <g strokeLinecap="round">
                        <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
                        <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
                        <path d="M25 8a2.5 2.5 0 11-5 0 2.5 2.5 0 115 0z" />
                    </g>
                    <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" fill="none" strokeLinejoin="miter" />
                </g>
            </svg>
        ),
        n: (
            <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-2xl">
                {defs}
                <g fill={fillUrl} stroke={strokeColor} strokeWidth="1.2" filter="url(#piece-shadow)">
                    <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
                    <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" />
                </g>
            </svg>
        ),
        p: (
            <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-2xl">
                {defs}
                <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
                    fill={fillUrl}
                    stroke={strokeColor}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    filter="url(#piece-shadow)"
                />
            </svg>
        ),
    };

    return (
        <motion.div
            className="w-full h-full p-1.5"
        >
            {pieces[type]}
        </motion.div>
    );
};

// --- Main Component ---
const ChessBoard = () => {
    const location = useLocation();
    const { socket } = useSocket();

    // Game Modes: null (selection), 'computer', 'stranger', 'friend'
    const [gameMode, setGameMode] = useState(location.state?.multiplayer ? 'friend' : null);
    const [roomId, setRoomId] = useState(location.state?.roomId || null);
    const [players, setPlayers] = useState(location.state?.players || {});

    const isFlipped = useMemo(() => {
        if (gameMode === 'friend' && socket?.id) {
            return players[socket.id]?.color === 'b';
        }
        return false;
    }, [gameMode, players, socket]);

    const [game, setGame] = useState(() => {
        try {
            return new Chess();
        } catch (e) {
            console.error("Failed to initialize chess.js", e);
            return null;
        }
    });
    const [board, setBoard] = useState(game ? game.board() : []);
    const [selected, setSelected] = useState(null);
    const [lastMove, setLastMove] = useState(null);
    const [capturedPieces, setCapturedPieces] = useState({ w: [], b: [] });
    // Force re-render on game updates
    const [fen, setFen] = useState(game ? game.fen() : "");

    const [engine, setEngine] = useState(null);

    // Initialize Stockfish
    useEffect(() => {
        if (gameMode === 'computer') {
            try {
                const stockfish = new Worker("/stockfish.js");
                setEngine(stockfish);

                stockfish.postMessage("uci");
                stockfish.postMessage("isready");

                // Listener
                stockfish.onmessage = (event) => {
                    const line = event.data;
                    if (line.startsWith("bestmove")) {
                        const move = line.split(" ")[1];
                        if (move) {
                            const from = move.substring(0, 2);
                            const to = move.substring(2, 4);
                            const promotion = move.length > 4 ? move.substring(4, 5) : "q"; // Default promotion to queen for simplicity if engine wants it

                            // Apply move safely
                            setGame(g => {
                                const newGame = new Chess(g.fen());
                                try {
                                    newGame.move({ from, to, promotion });
                                    setFen(newGame.fen());
                                    setBoard(newGame.board());

                                    // Highlight move
                                    const fromRow = 8 - parseInt(from[1]);
                                    const fromCol = from.charCodeAt(0) - 97;
                                    const toRow = 8 - parseInt(to[1]);
                                    const toCol = to.charCodeAt(0) - 97;
                                    setLastMove({ from: [fromRow, fromCol], to: [toRow, toCol] });

                                    // Capture sound could trigger here
                                } catch (e) {
                                    console.error("Invalid engine move", move, e);
                                }
                                return newGame;
                            });
                        }
                    }
                };

                return () => stockfish.terminate();
            } catch (e) {
                console.error("Stockfish init failed", e);
            }
        }
    }, [gameMode]);

    // Trigger AI move
    useEffect(() => {
        if (gameMode === 'computer' && game.turn() === 'b' && !game.isGameOver() && engine) {
            // Small delay for realism
            const timer = setTimeout(() => {
                engine.postMessage(`position fen ${game.fen()}`);
                engine.postMessage("go depth 15"); // Depth 15 is decent ~1500-1800 ELO depending on time
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [fen, gameMode, engine]);

    // Socket Listeners for Multiplayer
    useEffect(() => {
        if (!socket || !roomId) return;

        console.log("Joined game room:", roomId);
        socket.emit('join_game_room', roomId);

        const handleOpponentMove = ({ move, fen }) => {
            console.log("Opponent moved:", move);
            setGame(g => {
                const newGame = new Chess(fen); // Sync with trusted FEN or apply move?
                // Using FEN is safer for state sync, but move animation needs 'from'/'to'.
                // If we use FEN, we might lose last move highlight info unless sent.
                // For now, let's just set from FEN.
                setFen(fen);
                setBoard(newGame.board());
                setLastMove(null); // Or calculate from diff?
                return newGame;
            });
            // Update turn indicator etc.
        };

        socket.on('opponent_move', handleOpponentMove);

        return () => {
            socket.off('opponent_move', handleOpponentMove);
        };
    }, [socket, roomId]);



    const validMoves = useMemo(() => {
        if (!selected) return [];
        const moves = game.moves({
            square: String.fromCharCode(97 + selected.col) + (8 - selected.row),
            verbose: true
        });
        return moves.map(m => {
            const row = 8 - parseInt(m.to[1]);
            const col = m.to.charCodeAt(0) - 97;
            return [row, col];
        });
    }, [selected, fen]);

    const handleSquareClick = (row, col) => {
        if (!gameMode) return;

        // Prevent moving if it's computer's turn in vs computer mode
        if (gameMode === 'computer' && game.turn() === 'b') return;
        if (game.isGameOver()) return;

        const piece = board[row][col];
        const isSelectedSquare = selected?.row === row && selected?.col === col;

        // If clicking same square, deselect
        if (isSelectedSquare) {
            setSelected(null);
            return;
        }

        // Selecting a piece
        if (piece && piece.color === game.turn()) {
            setSelected({ row, col });
            return;
        }

        // Attempting to move
        if (selected) {
            const fromSquare = String.fromCharCode(97 + selected.col) + (8 - selected.row);
            const toSquare = String.fromCharCode(97 + col) + (8 - row);

            try {
                const move = game.move({
                    from: fromSquare,
                    to: toSquare,
                    promotion: 'q' // Always promote to queen for simplicity for now
                });

                if (move) {
                    setBoard(game.board());
                    setFen(game.fen());
                    setLastMove({ from: [selected.row, selected.col], to: [row, col] });
                    setSelected(null);

                    // Update captured pieces
                    if (move.captured) {
                        setCapturedPieces(prev => ({
                            ...prev,
                            [move.color === 'w' ? 'b' : 'w']: [...prev[move.color === 'w' ? 'b' : 'w'], { type: move.captured, color: move.color === 'w' ? 'b' : 'w' }]
                        }));
                    }

                    // Emit move if multiplayer
                    if (roomId && socket) {
                        socket.emit('game_move', { roomId, move: move.san, fen: game.fen() });
                    }
                }
            } catch (e) {
                // Invalid move
                if (piece && piece.color === game.turn()) {
                    // Clicked another own piece instead
                    setSelected({ row, col });
                } else {
                    setSelected(null);
                }
            }
        }
    };

    const resetGame = () => {
        const newGame = new Chess();
        setGame(newGame);
        setBoard(newGame.board());
        setFen(newGame.fen());
        setSelected(null);
        setLastMove(null);
        setCapturedPieces({ w: [], b: [] });
    };

    const handleModeSelect = (mode) => {
        setGameMode(mode);
        resetGame();
    };

    if (!game) {
        return <div className="text-red-500 text-center p-4">Error loading chess engine. Please refresh.</div>;
    }

    if (!gameMode) {
        return <ChessModeSelection onSelectMode={handleModeSelect} />;
    }

    if (gameMode === 'friend' && !roomId) { // If 'friend' selected but game not started (no roomId)
        return <ChessFriendLobby onBack={() => setGameMode(null)} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[420px] mx-auto flex flex-col items-center"
        >
            {/* Back to Selection */}
            <div className="w-full text-left mb-2">
                <button
                    onClick={() => setGameMode(null)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-3 h-3" /> Back to Modes
                </button>
            </div>

            {/* Graveyard (Opponent - White Captured) */}
            <div className="w-full mb-2 flex justify-between items-end px-2">
                <div className="flex-1">
                    <div className="flex flex-wrap gap-1 min-h-[28px] p-1.5 rounded-xl bg-black/20 border border-white/5 backdrop-blur-sm">
                        {capturedPieces.w.length === 0 && <span className="text-xs text-white/20 italic p-1">Captured white pieces</span>}
                        {capturedPieces.w.map((p, i) => (
                            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6">
                                <ChessPiece type={p.type} color={p.color} />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`
                    mx-4 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide
                    ${game.turn() === 'b' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-white/5 text-white/40"}
                `}>
                    BLACK TURN
                </div>
            </div>

            {/* THE BOARD */}
            <div className="relative p-1 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden border border-white/10">
                {/* Coordinate Labels */}
                <div className="absolute left-1 top-2 bottom-2 w-4 flex flex-col justify-around text-[9px] text-white/30 font-mono pointer-events-none">
                    {[8, 7, 6, 5, 4, 3, 2, 1].map(n => <span key={n} className="text-center">{n}</span>)}
                </div>
                <div className="absolute bottom-1 left-5 right-2 h-3 flex justify-around text-[9px] text-white/30 font-mono pointer-events-none">
                    {["A", "B", "C", "D", "E", "F", "G", "H"].map(l => <span key={l} className="text-center">{l}</span>)}
                </div>

                {/* Grid */}
                <div className="ml-5 mb-4 border border-white/10 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-8 bg-[#0f1014]">
                        {/* Dark Obsidian Base Background */}
                        {Array(8).fill(null).map((_, visualRow) => (
                            Array(8).fill(null).map((_, visualCol) => {
                                const rowIdx = isFlipped ? 7 - visualRow : visualRow;
                                const colIdx = isFlipped ? 7 - visualCol : visualCol;
                                const piece = board[rowIdx][colIdx];

                                const isLight = (rowIdx + colIdx) % 2 === 0;
                                const isSelected = selected?.row === rowIdx && selected?.col === colIdx;
                                const isValid = validMoves.some(([r, c]) => r === rowIdx && c === colIdx);
                                const isLastMoveFrom = lastMove?.from[0] === rowIdx && lastMove?.from[1] === colIdx;
                                const isLastMoveTo = lastMove?.to[0] === rowIdx && lastMove?.to[1] === colIdx;
                                const isCapture = isValid && piece;
                                const isKingCheck = piece?.type === 'k' && piece?.color === game.turn() && game.inCheck();

                                return (
                                    <div
                                        key={`${rowIdx}-${colIdx}`}
                                        onClick={() => handleSquareClick(rowIdx, colIdx)}
                                        className={`
                                            relative aspect-square flex items-center justify-center cursor-pointer select-none
                                            transition-colors duration-300
                                            ${isLight
                                                ? "bg-white/[0.03]" // Very subtle light square
                                                : "bg-[#050505]/60" // Darker square
                                            }
                                            ${isSelected ? "bg-cyan-500/20 !shadow-[inset_0_0_15px_rgba(6,182,212,0.4)]" : ""}
                                            ${(isLastMoveFrom || isLastMoveTo) ? "bg-amber-500/10" : ""}
                                            ${isKingCheck ? "bg-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.4)]" : ""}
                                        `}
                                    >
                                        {/* Corner markings for board aesthetics (optional) */}
                                        {!piece && !isValid && <div className="absolute w-0.5 h-0.5 bg-white/5 rounded-full" />}

                                        {/* Valid Move Indicator */}
                                        {isValid && !isCapture && (
                                            <div className="w-3 h-3 rounded-full bg-cyan-500/40 shadow-[0_0_8px_currentColor] animate-pulse" />
                                        )}

                                        {/* Capture Indicator */}
                                        {isCapture && (
                                            <div className="absolute inset-0 border-4 border-red-500/30 rounded-full scale-75 animate-pulse" />
                                        )}

                                        {/* Piece Render */}
                                        <AnimatePresence>
                                            {piece && (
                                                <motion.div
                                                    layoutId={`piece-${piece.type}-${piece.color}-${rowIdx}-${colIdx}`} // Unique ID for layout anim
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ opacity: 0, transition: { duration: 0 } }} // Instant exit to prevent ghosting
                                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                    className="w-[90%] h-[90%] z-10"
                                                >
                                                    <ChessPiece type={piece.type} color={piece.color} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Glowing border on selection */}
                                        {isSelected && (
                                            <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-sm" />
                                        )}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>
            </div>

            {/* Graveyard (Self - Black Captured) */}
            <div className="w-full mt-2 flex justify-between items-start px-2">
                <div className="flex-1">
                    <div className="flex flex-wrap gap-1 min-h-[32px] p-2 rounded-xl bg-black/20 border border-white/5 backdrop-blur-sm">
                        {capturedPieces.b.length === 0 && <span className="text-xs text-white/20 italic p-1">Captured black pieces</span>}
                        {capturedPieces.b.map((p, i) => (
                            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6">
                                <ChessPiece type={p.type} color={p.color} />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`
                    mx-4 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide
                    ${game.turn() === 'w' ? "bg-white/20 text-white border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "bg-white/5 text-white/40"}
                `}>
                    WHITE TURN
                </div>
            </div>

            {/* Game Over Message */}
            {game.isGameOver() && (
                <div className="mt-4 p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md text-center animate-in fade-in zoom-in">
                    <h3 className="text-xl font-bold text-white mb-2">
                        {game.isCheckmate() ? "Checkmate!" : "Draw"}
                    </h3>
                    <p className="text-sm text-white/70">
                        {game.isCheckmate()
                            ? `${game.turn() === 'w' ? 'Black' : 'White'} Wins!`
                            : "Game ended in a draw"}
                    </p>
                </div>
            )}

            {/* Controls */}
            <div className="mt-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all text-sm font-medium tracking-wide"
                >
                    <RotateCcw className="w-4 h-4" />
                    RESET BOARD
                </motion.button>
            </div>
        </motion.div>
    );
};

// Wrap with ErrorBoundary for safety
const SafeChessBoard = () => (
    <ErrorBoundary>
        <ChessBoard />
    </ErrorBoundary>
);

export default SafeChessBoard;
