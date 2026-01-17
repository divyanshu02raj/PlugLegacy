import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const checkWinner = (board) => {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
        [0, 4, 8], [2, 4, 6], // diagonals
    ];

    for (const line of lines) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], line };
        }
    }
    return null;
};

const TicTacToeBoard = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);

    const result = checkWinner(board);
    const winner = result?.winner;
    const winLine = result?.line || [];
    const isDraw = !winner && board.every(cell => cell !== null);

    const handleCellClick = (index) => {
        if (board[index] || winner) return;

        const newBoard = [...board];
        newBoard[index] = isXNext ? "X" : "O";
        setBoard(newBoard);
        setIsXNext(!isXNext);
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
    };

    // Calculate line position for win animation
    const getLineStyle = () => {
        if (!winLine.length) return {};

        const positions = {
            "0,1,2": { transform: "rotate(0deg) translateY(-100px)", width: "100%" },
            "3,4,5": { transform: "rotate(0deg) translateY(0px)", width: "100%" },
            "6,7,8": { transform: "rotate(0deg) translateY(100px)", width: "100%" },
            "0,3,6": { transform: "rotate(90deg) translateX(-100px)", width: "100%" },
            "1,4,7": { transform: "rotate(90deg) translateX(0px)", width: "100%" },
            "2,5,8": { transform: "rotate(90deg) translateX(100px)", width: "100%" },
            "0,4,8": { transform: "rotate(45deg)", width: "141%" },
            "2,4,6": { transform: "rotate(-45deg)", width: "141%" },
        };
        return positions[winLine.join(",")] || {};
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto"
        >
            {/* Board */}
            <div className="relative">
                {/* Ambient Glow */}
                <div className="absolute inset-0 blur-3xl opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-cyan-500/40" />
                </div>

                {/* Grid Lines - Neon Style */}
                <div className="relative aspect-square">
                    {/* Vertical Lines */}
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.1 }}
                        className="absolute top-4 bottom-4 left-1/3 w-0.5 bg-gradient-to-b from-transparent via-primary to-transparent"
                        style={{ boxShadow: "0 0 20px hsl(var(--primary))" }}
                    />
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.2 }}
                        className="absolute top-4 bottom-4 right-1/3 w-0.5 bg-gradient-to-b from-transparent via-primary to-transparent"
                        style={{ boxShadow: "0 0 20px hsl(var(--primary))" }}
                    />

                    {/* Horizontal Lines */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute left-4 right-4 top-1/3 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                        style={{ boxShadow: "0 0 20px hsl(var(--primary))" }}
                    />
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.4 }}
                        className="absolute left-4 right-4 bottom-1/3 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                        style={{ boxShadow: "0 0 20px hsl(var(--primary))" }}
                    />

                    {/* Cells */}
                    <div className="grid grid-cols-3 h-full">
                        {board.map((cell, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: cell || winner ? 1 : 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCellClick(index)}
                                className={`
                  flex items-center justify-center
                  ${!cell && !winner && "cursor-pointer"}
                `}
                            >
                                <AnimatePresence>
                                    {cell && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{
                                                scale: winLine.includes(index) ? [1, 1.2, 1] : 1,
                                                rotate: 0
                                            }}
                                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                            className="relative"
                                        >
                                            {cell === "X" ? (
                                                <svg className="w-20 h-20 md:w-24 md:h-24" viewBox="0 0 100 100">
                                                    <motion.line
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 0.3 }}
                                                        x1="20" y1="20" x2="80" y2="80"
                                                        stroke="hsl(var(--primary))"
                                                        strokeWidth="8"
                                                        strokeLinecap="round"
                                                        filter="url(#glow-orange)"
                                                    />
                                                    <motion.line
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 0.3, delay: 0.1 }}
                                                        x1="80" y1="20" x2="20" y2="80"
                                                        stroke="hsl(var(--primary))"
                                                        strokeWidth="8"
                                                        strokeLinecap="round"
                                                        filter="url(#glow-orange)"
                                                    />
                                                    <defs>
                                                        <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
                                                            <feGaussianBlur stdDeviation="4" result="blur" />
                                                            <feMerge>
                                                                <feMergeNode in="blur" />
                                                                <feMergeNode in="SourceGraphic" />
                                                            </feMerge>
                                                        </filter>
                                                    </defs>
                                                </svg>
                                            ) : (
                                                <svg className="w-20 h-20 md:w-24 md:h-24" viewBox="0 0 100 100">
                                                    <motion.circle
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 0.4 }}
                                                        cx="50" cy="50" r="30"
                                                        fill="none"
                                                        stroke="hsl(200 100% 60%)"
                                                        strokeWidth="8"
                                                        strokeLinecap="round"
                                                        filter="url(#glow-cyan)"
                                                    />
                                                    <defs>
                                                        <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
                                                            <feGaussianBlur stdDeviation="4" result="blur" />
                                                            <feMerge>
                                                                <feMergeNode in="blur" />
                                                                <feMergeNode in="SourceGraphic" />
                                                            </feMerge>
                                                        </filter>
                                                    </defs>
                                                </svg>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        ))}
                    </div>

                    {/* Win Line */}
                    {winner && (
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 bg-white origin-center"
                            style={{
                                ...getLineStyle(),
                                boxShadow: "0 0 30px white, 0 0 60px white",
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Status */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
            >
                {winner ? (
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                    >
                        <p className="text-2xl font-bold">
                            <span
                                className={winner === "X" ? "text-primary" : "text-cyan-400"}
                                style={{ textShadow: `0 0 20px ${winner === "X" ? "hsl(var(--primary))" : "hsl(200 100% 60%)"}` }}
                            >
                                {winner}
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
                ) : isDraw ? (
                    <div>
                        <p className="text-xl font-bold text-muted-foreground">It's a Draw!</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetGame}
                            className="mt-4 btn-glow px-6 py-2 rounded-xl"
                        >
                            Play Again
                        </motion.button>
                    </div>
                ) : (
                    <p className="text-muted-foreground">
                        Current Turn:{" "}
                        <span
                            className={`font-bold ${isXNext ? "text-primary" : "text-cyan-400"}`}
                            style={{ textShadow: `0 0 10px ${isXNext ? "hsl(var(--primary))" : "hsl(200 100% 60%)"}` }}
                        >
                            {isXNext ? "X" : "O"}
                        </span>
                    </p>
                )}
            </motion.div>
        </motion.div>
    );
};

export default TicTacToeBoard;
