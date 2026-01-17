import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ROWS = 6;
const COLS = 7;

const checkWinner = (board) => {
    // Check horizontal
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            if (board[r][c] && board[r][c] === board[r][c + 1] && board[r][c] === board[r][c + 2] && board[r][c] === board[r][c + 3]) {
                return { winner: board[r][c], line: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]] };
            }
        }
    }
    // Check vertical
    for (let r = 0; r < ROWS - 3; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] && board[r][c] === board[r + 1][c] && board[r][c] === board[r + 2][c] && board[r][c] === board[r + 3][c]) {
                return { winner: board[r][c], line: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]] };
            }
        }
    }
    // Check diagonal (down-right)
    for (let r = 0; r < ROWS - 3; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            if (board[r][c] && board[r][c] === board[r + 1][c + 1] && board[r][c] === board[r + 2][c + 2] && board[r][c] === board[r + 3][c + 3]) {
                return { winner: board[r][c], line: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]] };
            }
        }
    }
    // Check diagonal (up-right)
    for (let r = 3; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            if (board[r][c] && board[r][c] === board[r - 1][c + 1] && board[r][c] === board[r - 2][c + 2] && board[r][c] === board[r - 3][c + 3]) {
                return { winner: board[r][c], line: [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]] };
            }
        }
    }
    return null;
};

const Connect4Board = () => {
    const [board, setBoard] = useState(
        Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
    );
    const [isRedNext, setIsRedNext] = useState(true);
    const [hoverCol, setHoverCol] = useState(null);

    const result = checkWinner(board);
    const winner = result?.winner;
    const winLine = result?.line || [];

    const dropChip = (col) => {
        if (winner) return;

        // Find the lowest empty row
        let targetRow = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (!board[r][col]) {
                targetRow = r;
                break;
            }
        }

        if (targetRow === -1) return; // Column is full

        const newBoard = board.map(row => [...row]);
        newBoard[targetRow][col] = isRedNext ? "red" : "yellow";
        setBoard(newBoard);
        setIsRedNext(!isRedNext);
    };

    const resetGame = () => {
        setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
        setIsRedNext(true);
    };

    const isInWinLine = (row, col) => {
        return winLine.some(([r, c]) => r === row && c === col);
    };

    // Find preview position
    const getPreviewRow = (col) => {
        for (let r = ROWS - 1; r >= 0; r--) {
            if (!board[r][col]) return r;
        }
        return -1;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg mx-auto"
        >
            <div className="relative">
                {/* Glow */}
                <div className="absolute inset-0 blur-3xl opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/40 via-transparent to-yellow-500/40" />
                </div>

                {/* Board */}
                <div className="relative glass-card rounded-2xl p-3 border border-glass-border bg-blue-900/50">
                    {/* Column hover zones */}
                    <div className="absolute inset-3 grid grid-cols-7">
                        {Array(COLS).fill(null).map((_, col) => (
                            <div
                                key={col}
                                onMouseEnter={() => setHoverCol(col)}
                                onMouseLeave={() => setHoverCol(null)}
                                onClick={() => dropChip(col)}
                                className="cursor-pointer z-10"
                            />
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 gap-1.5">
                        {board.map((row, rowIdx) =>
                            row.map((cell, colIdx) => {
                                const previewRow = hoverCol === colIdx ? getPreviewRow(colIdx) : -1;
                                const showPreview = previewRow === rowIdx && !winner;

                                return (
                                    <div
                                        key={`${rowIdx}-${colIdx}`}
                                        className="aspect-square relative"
                                    >
                                        {/* Hole */}
                                        <div className="absolute inset-1 rounded-full bg-slate-900/80" />

                                        {/* Preview chip */}
                                        {showPreview && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 0.5 }}
                                                className={`absolute inset-1 rounded-full ${isRedNext ? "bg-red-500" : "bg-yellow-400"
                                                    }`}
                                            />
                                        )}

                                        {/* Actual chip */}
                                        <AnimatePresence>
                                            {cell && (
                                                <motion.div
                                                    initial={{ y: -300 }}
                                                    animate={{ y: 0 }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 200,
                                                        damping: 15,
                                                        mass: 0.8
                                                    }}
                                                    className={`
                            absolute inset-1 rounded-full
                            ${cell === "red"
                                                            ? "bg-gradient-to-br from-red-400 to-red-600"
                                                            : "bg-gradient-to-br from-yellow-300 to-yellow-500"
                                                        }
                            ${isInWinLine(rowIdx, colIdx) && "ring-4 ring-white animate-pulse"}
                          `}
                                                    style={{
                                                        boxShadow: cell === "red"
                                                            ? "inset 0 -4px 8px rgba(0,0,0,0.3), 0 0 15px rgba(239, 68, 68, 0.5)"
                                                            : "inset 0 -4px 8px rgba(0,0,0,0.3), 0 0 15px rgba(234, 179, 8, 0.5)",
                                                    }}
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Status */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
            >
                {winner ? (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                        <p className="text-2xl font-bold">
                            <span className={winner === "red" ? "text-red-500" : "text-yellow-400"}>
                                {winner === "red" ? "🔴 Red" : "🟡 Yellow"}
                            </span> Wins!
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetGame}
                            className="mt-4 btn-glow px-6 py-2 rounded-xl"
                        >
                            Play Again
                        </motion.button>
                    </motion.div>
                ) : (
                    <p className="text-muted-foreground">
                        Current Turn:{" "}
                        <span className={`font-bold ${isRedNext ? "text-red-500" : "text-yellow-400"}`}>
                            {isRedNext ? "🔴 Red" : "🟡 Yellow"}
                        </span>
                    </p>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Connect4Board;
