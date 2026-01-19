import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";

// SVG Chess Pieces - Premium vectors with gradients
const ChessPiece = ({ type, color, isActive }) => {
    const pieces = {
        K: (
            <svg viewBox="0 0 45 45" className="w-full h-full">
                <defs>
                    <linearGradient id={`king-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        {color === "white" ? (
                            <>
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="100%" stopColor="#e0e0e0" />
                            </>
                        ) : (
                            <>
                                <stop offset="0%" stopColor="#2a2a2a" />
                                <stop offset="100%" stopColor="#0a0a0a" />
                            </>
                        )}
                    </linearGradient>
                    <filter id={`shadow-${color}`}>
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.5" />
                    </filter>
                </defs>
                <g fill={`url(#king-${color})`} stroke={color === "white" ? "#333" : "#666"} strokeWidth="1.5" filter={`url(#shadow-${color})`}>
                    <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="round" />
                    <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" />
                    <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" />
                </g>
            </svg>
        ),
        Q: (
            <svg viewBox="0 0 45 45" className="w-full h-full">
                <defs>
                    <linearGradient id={`queen-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        {color === "white" ? (
                            <>
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="100%" stopColor="#e0e0e0" />
                            </>
                        ) : (
                            <>
                                <stop offset="0%" stopColor="#2a2a2a" />
                                <stop offset="100%" stopColor="#0a0a0a" />
                            </>
                        )}
                    </linearGradient>
                </defs>
                <g fill={`url(#queen-${color})`} stroke={color === "white" ? "#333" : "#666"} strokeWidth="1.5" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.4))" }}>
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
        R: (
            <svg viewBox="0 0 45 45" className="w-full h-full">
                <defs>
                    <linearGradient id={`rook-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        {color === "white" ? (
                            <>
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="100%" stopColor="#e0e0e0" />
                            </>
                        ) : (
                            <>
                                <stop offset="0%" stopColor="#2a2a2a" />
                                <stop offset="100%" stopColor="#0a0a0a" />
                            </>
                        )}
                    </linearGradient>
                </defs>
                <g fill={`url(#rook-${color})`} stroke={color === "white" ? "#333" : "#666"} strokeWidth="1.5" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.4))" }}>
                    <path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z" strokeLinecap="round" />
                    <path d="M14 29.5v-13h17v13H14z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z" strokeLinecap="round" />
                    <path d="M12 35.5h21M13 31.5h19M14 29.5h17M14 16.5h17" fill="none" stroke={color === "white" ? "#333" : "#666"} strokeWidth="1" strokeLinejoin="miter" />
                </g>
            </svg>
        ),
        B: (
            <svg viewBox="0 0 45 45" className="w-full h-full">
                <defs>
                    <linearGradient id={`bishop-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        {color === "white" ? (
                            <>
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="100%" stopColor="#e0e0e0" />
                            </>
                        ) : (
                            <>
                                <stop offset="0%" stopColor="#2a2a2a" />
                                <stop offset="100%" stopColor="#0a0a0a" />
                            </>
                        )}
                    </linearGradient>
                </defs>
                <g fill={`url(#bishop-${color})`} stroke={color === "white" ? "#333" : "#666"} strokeWidth="1.5" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.4))" }}>
                    <g strokeLinecap="round">
                        <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
                        <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
                        <path d="M25 8a2.5 2.5 0 11-5 0 2.5 2.5 0 115 0z" />
                    </g>
                    <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" fill="none" stroke={color === "white" ? "#333" : "#666"} strokeLinejoin="miter" />
                </g>
            </svg>
        ),
        N: (
            <svg viewBox="0 0 45 45" className="w-full h-full">
                <defs>
                    <linearGradient id={`knight-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        {color === "white" ? (
                            <>
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="100%" stopColor="#e0e0e0" />
                            </>
                        ) : (
                            <>
                                <stop offset="0%" stopColor="#2a2a2a" />
                                <stop offset="100%" stopColor="#0a0a0a" />
                            </>
                        )}
                    </linearGradient>
                </defs>
                <g fill={`url(#knight-${color})`} stroke={color === "white" ? "#333" : "#666"} strokeWidth="1.5" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.4))" }}>
                    <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
                    <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" />
                    <path d="M9.5 25.5a.5.5 0 11-1 0 .5.5 0 111 0zM14.933 15.75a.5 1.5 30 11-.866-.5.5 1.5 30 11.866.5z" fill={color === "white" ? "#333" : "#888"} />
                </g>
            </svg>
        ),
        P: (
            <svg viewBox="0 0 45 45" className="w-full h-full">
                <defs>
                    <linearGradient id={`pawn-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        {color === "white" ? (
                            <>
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="100%" stopColor="#e0e0e0" />
                            </>
                        ) : (
                            <>
                                <stop offset="0%" stopColor="#2a2a2a" />
                                <stop offset="100%" stopColor="#0a0a0a" />
                            </>
                        )}
                    </linearGradient>
                </defs>
                <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" 
                    fill={`url(#pawn-${color})`} 
                    stroke={color === "white" ? "#333" : "#666"} 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.4))" }}
                />
            </svg>
        ),
    };

    return (
        <div className={`w-full h-full p-1 transition-all duration-300 ${isActive ? (color === "white" ? "drop-shadow-[0_0_8px_rgba(255,200,0,0.8)]" : "drop-shadow-[0_0_8px_rgba(255,100,100,0.8)]") : ""}`}>
            {pieces[type]}
        </div>
    );
};

const initialBoard = () => {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    board[0] = [
        { type: "R", color: "black" }, { type: "N", color: "black" }, { type: "B", color: "black" },
        { type: "Q", color: "black" }, { type: "K", color: "black" }, { type: "B", color: "black" },
        { type: "N", color: "black" }, { type: "R", color: "black" },
    ];
    board[1] = Array(8).fill(null).map(() => ({ type: "P", color: "black" }));
    
    board[7] = [
        { type: "R", color: "white" }, { type: "N", color: "white" }, { type: "B", color: "white" },
        { type: "Q", color: "white" }, { type: "K", color: "white" }, { type: "B", color: "white" },
        { type: "N", color: "white" }, { type: "R", color: "white" },
    ];
    board[6] = Array(8).fill(null).map(() => ({ type: "P", color: "white" }));
    
    return board;
};

// Simplified move validation for valid move dots
const getValidMoves = (board, row, col) => {
    const piece = board[row][col];
    if (!piece) return [];
    
    const moves = [];
    const { type, color } = piece;
    const direction = color === "white" ? -1 : 1;
    
    switch (type) {
        case "P": {
            // Forward move
            const newRow = row + direction;
            if (newRow >= 0 && newRow < 8 && !board[newRow][col]) {
                moves.push([newRow, col]);
                // Double move from starting position
                const startRow = color === "white" ? 6 : 1;
                if (row === startRow && !board[row + 2 * direction][col]) {
                    moves.push([row + 2 * direction, col]);
                }
            }
            // Captures
            [-1, 1].forEach(dc => {
                const nc = col + dc;
                if (nc >= 0 && nc < 8 && newRow >= 0 && newRow < 8) {
                    const target = board[newRow][nc];
                    if (target && target.color !== color) {
                        moves.push([newRow, nc]);
                    }
                }
            });
            break;
        }
        case "R": {
            [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    const nr = row + dr * i, nc = col + dc * i;
                    if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
                    const target = board[nr][nc];
                    if (!target) moves.push([nr, nc]);
                    else {
                        if (target.color !== color) moves.push([nr, nc]);
                        break;
                    }
                }
            });
            break;
        }
        case "N": {
            [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => {
                const nr = row + dr, nc = col + dc;
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                    const target = board[nr][nc];
                    if (!target || target.color !== color) moves.push([nr, nc]);
                }
            });
            break;
        }
        case "B": {
            [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    const nr = row + dr * i, nc = col + dc * i;
                    if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
                    const target = board[nr][nc];
                    if (!target) moves.push([nr, nc]);
                    else {
                        if (target.color !== color) moves.push([nr, nc]);
                        break;
                    }
                }
            });
            break;
        }
        case "Q": {
            [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    const nr = row + dr * i, nc = col + dc * i;
                    if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
                    const target = board[nr][nc];
                    if (!target) moves.push([nr, nc]);
                    else {
                        if (target.color !== color) moves.push([nr, nc]);
                        break;
                    }
                }
            });
            break;
        }
        case "K": {
            [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                const nr = row + dr, nc = col + dc;
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                    const target = board[nr][nc];
                    if (!target || target.color !== color) moves.push([nr, nc]);
                }
            });
            break;
        }
    }
    return moves;
};

const ChessBoard = () => {
    const [board, setBoard] = useState(initialBoard());
    const [selected, setSelected] = useState(null);
    const [isWhiteTurn, setIsWhiteTurn] = useState(true);
    const [lastMove, setLastMove] = useState(null);
    const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
    
    const validMoves = useMemo(() => {
        if (!selected) return [];
        return getValidMoves(board, selected.row, selected.col);
    }, [selected, board]);

    const handleSquareClick = (row, col) => {
        const piece = board[row][col];

        if (selected) {
            const selectedPiece = board[selected.row][selected.col];

            if (selected.row === row && selected.col === col) {
                setSelected(null);
                return;
            }

            if (piece && piece.color === selectedPiece?.color) {
                setSelected({ row, col });
                return;
            }

            // Check if valid move
            const isValidMove = validMoves.some(([r, c]) => r === row && c === col);
            if (!isValidMove) {
                setSelected(null);
                return;
            }

            const newBoard = board.map(r => r.map(c => c ? { ...c } : null));

            if (piece) {
                setCapturedPieces(prev => ({
                    ...prev,
                    [piece.color]: [...prev[piece.color], piece],
                }));
            }

            newBoard[row][col] = selectedPiece;
            newBoard[selected.row][selected.col] = null;
            setBoard(newBoard);
            setLastMove({ from: [selected.row, selected.col], to: [row, col] });
            setSelected(null);
            setIsWhiteTurn(!isWhiteTurn);
        } else {
            if (piece && piece.color === (isWhiteTurn ? "white" : "black")) {
                setSelected({ row, col });
            }
        }
    };

    const isLastMoveSquare = (row, col) => {
        if (!lastMove) return null;
        if (lastMove.from[0] === row && lastMove.from[1] === col) return "from";
        if (lastMove.to[0] === row && lastMove.to[1] === col) return "to";
        return null;
    };

    const isValidMoveSquare = (row, col) => {
        return validMoves.some(([r, c]) => r === row && c === col);
    };

    const resetGame = () => {
        setBoard(initialBoard());
        setSelected(null);
        setIsWhiteTurn(true);
        setLastMove(null);
        setCapturedPieces({ white: [], black: [] });
    };

    const currentPlayerColor = isWhiteTurn ? "white" : "black";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl mx-auto"
        >
            {/* Captured Pieces - Graveyard Panels */}
            <div className="flex justify-between mb-4 gap-4">
                <motion.div 
                    className="flex-1 backdrop-blur-xl bg-white/5 rounded-2xl p-3 border border-white/10"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600" />
                        <span className="text-xs text-muted-foreground font-medium">Black Captured</span>
                    </div>
                    <div className="flex flex-wrap gap-1 min-h-[32px]">
                        {capturedPieces.white.map((p, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }}
                                className="w-7 h-7"
                            >
                                <ChessPiece type={p.type} color={p.color} />
                            </motion.div>
                        ))}
                        {capturedPieces.white.length === 0 && <span className="text-xs text-muted-foreground/50">—</span>}
                    </div>
                </motion.div>
                
                <motion.div 
                    className="flex-1 backdrop-blur-xl bg-white/5 rounded-2xl p-3 border border-white/10"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 border border-gray-400" />
                        <span className="text-xs text-muted-foreground font-medium">White Captured</span>
                    </div>
                    <div className="flex flex-wrap gap-1 min-h-[32px]">
                        {capturedPieces.black.map((p, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }}
                                className="w-7 h-7"
                            >
                                <ChessPiece type={p.type} color={p.color} />
                            </motion.div>
                        ))}
                        {capturedPieces.black.length === 0 && <span className="text-xs text-muted-foreground/50">—</span>}
                    </div>
                </motion.div>
            </div>

            {/* The Grandmaster Glass Board */}
            <div className="relative">
                {/* Ambient glow */}
                <div className="absolute -inset-4 blur-3xl opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 via-transparent to-blue-500/30" />
                </div>

                <div className="relative backdrop-blur-xl bg-white/5 rounded-3xl p-4 border border-white/20 shadow-2xl">
                    {/* Row Labels */}
                    <div className="absolute left-1 top-4 bottom-4 w-4 flex flex-col justify-around text-[10px] text-muted-foreground/70 font-mono">
                        {[8, 7, 6, 5, 4, 3, 2, 1].map(n => <span key={n} className="text-center">{n}</span>)}
                    </div>
                    
                    {/* Col Labels */}
                    <div className="absolute bottom-1 left-5 right-4 h-4 flex justify-around text-[10px] text-muted-foreground/70 font-mono">
                        {["a", "b", "c", "d", "e", "f", "g", "h"].map(l => <span key={l} className="text-center">{l}</span>)}
                    </div>

                    <div className="ml-5 mb-5">
                        <div className="grid grid-cols-8 aspect-square rounded-xl overflow-hidden border border-white/10">
                            {board.map((row, rowIdx) =>
                                row.map((piece, colIdx) => {
                                    const isLight = (rowIdx + colIdx) % 2 === 0;
                                    const isSelected = selected?.row === rowIdx && selected?.col === colIdx;
                                    const lastMoveType = isLastMoveSquare(rowIdx, colIdx);
                                    const isValidMove = isValidMoveSquare(rowIdx, colIdx);
                                    const isCapture = isValidMove && piece;

                                    return (
                                        <motion.button
                                            key={`${rowIdx}-${colIdx}`}
                                            onClick={() => handleSquareClick(rowIdx, colIdx)}
                                            whileHover={{ scale: 1.02 }}
                                            className={`
                                                aspect-square flex items-center justify-center relative overflow-hidden
                                                transition-all duration-200
                                                ${isLight ? "bg-white/10" : "bg-white/5"}
                                                ${isSelected && "ring-2 ring-blue-500 ring-inset z-20 shadow-[inset_0_0_20px_rgba(59,130,246,0.5)]"}
                                            `}
                                        >
                                            {/* Last move highlight */}
                                            {lastMoveType && (
                                                <div className={`absolute inset-0 ${lastMoveType === "from" 
                                                    ? "bg-gradient-to-br from-yellow-500/30 to-transparent" 
                                                    : "bg-gradient-to-tl from-yellow-500/40 to-yellow-500/10"
                                                }`} />
                                            )}
                                            
                                            {/* Valid move indicator */}
                                            <AnimatePresence>
                                                {isValidMove && !piece && (
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
                                                        exit={{ scale: 0, opacity: 0 }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                        className="absolute w-4 h-4 rounded-full bg-green-500/60"
                                                    />
                                                )}
                                                {isCapture && (
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0, opacity: 0 }}
                                                        className="absolute inset-1 rounded-full border-2 border-red-500/70 bg-red-500/10"
                                                    />
                                                )}
                                            </AnimatePresence>

                                            {/* Piece */}
                                            {piece && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-[85%] h-[85%] relative z-10"
                                                >
                                                    <ChessPiece 
                                                        type={piece.type} 
                                                        color={piece.color}
                                                        isActive={piece.color === currentPlayerColor}
                                                    />
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Turn Indicator & Controls */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex justify-between items-center"
            >
                <div className="flex items-center gap-3">
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-4 h-4 rounded-full ${isWhiteTurn 
                            ? "bg-gradient-to-br from-gray-100 to-gray-300 shadow-[0_0_12px_rgba(255,255,255,0.5)]" 
                            : "bg-gradient-to-br from-gray-700 to-gray-900 shadow-[0_0_12px_rgba(0,0,0,0.5)]"
                        }`} 
                    />
                    <span className="text-foreground font-medium">
                        {isWhiteTurn ? "White" : "Black"}'s Turn
                    </span>
                </div>
                
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-primary/50 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    New Game
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default ChessBoard;
