import { useState, useMemo } from "react";
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

// Calculate dynamic win line position
const getWinLineTransform = (line) => {
    if (!line) return null;
    
    const key = line.join(",");
    const transforms = {
        // Rows
        "0,1,2": { top: "16.67%", left: "50%", rotate: 0, width: "90%" },
        "3,4,5": { top: "50%", left: "50%", rotate: 0, width: "90%" },
        "6,7,8": { top: "83.33%", left: "50%", rotate: 0, width: "90%" },
        // Columns
        "0,3,6": { top: "50%", left: "16.67%", rotate: 90, width: "90%" },
        "1,4,7": { top: "50%", left: "50%", rotate: 90, width: "90%" },
        "2,5,8": { top: "50%", left: "83.33%", rotate: 90, width: "90%" },
        // Diagonals
        "0,4,8": { top: "50%", left: "50%", rotate: 45, width: "127%" },
        "2,4,6": { top: "50%", left: "50%", rotate: -45, width: "127%" },
    };
    
    return transforms[key];
};

const TicTacToeBoard = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);

    const result = checkWinner(board);
    const winner = result?.winner;
    const winLine = result?.line || [];
    const isDraw = !winner && board.every(cell => cell !== null);
    
    const winLineTransform = useMemo(() => getWinLineTransform(winLine), [winLine]);

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

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto"
        >
            {/* Board */}
            <div className="relative">
                {/* Ambient Glow */}
                <div className="absolute -inset-8 blur-3xl opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-cyan-500/40" />
                </div>

                {/* Grid Container */}
                <div className="relative aspect-square">
                    {/* Neon Grid Lines */}
                    {/* Vertical Lines */}
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="absolute top-[5%] bottom-[5%] left-[33.33%] w-1 -translate-x-1/2"
                        style={{ 
                            background: "linear-gradient(to bottom, transparent, hsl(var(--primary)), transparent)",
                            boxShadow: "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary))" 
                        }}
                    />
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="absolute top-[5%] bottom-[5%] left-[66.67%] w-1 -translate-x-1/2"
                        style={{ 
                            background: "linear-gradient(to bottom, transparent, hsl(var(--primary)), transparent)",
                            boxShadow: "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary))" 
                        }}
                    />

                    {/* Horizontal Lines */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="absolute left-[5%] right-[5%] top-[33.33%] h-1 -translate-y-1/2"
                        style={{ 
                            background: "linear-gradient(to right, transparent, hsl(var(--primary)), transparent)",
                            boxShadow: "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary))" 
                        }}
                    />
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="absolute left-[5%] right-[5%] top-[66.67%] h-1 -translate-y-1/2"
                        style={{ 
                            background: "linear-gradient(to right, transparent, hsl(var(--primary)), transparent)",
                            boxShadow: "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary))" 
                        }}
                    />

                    {/* Cells */}
                    <div className="grid grid-cols-3 h-full relative z-10">
                        {board.map((cell, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: cell || winner ? 1 : 1.02, backgroundColor: cell || winner ? "transparent" : "rgba(255,255,255,0.02)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCellClick(index)}
                                className={`
                                    flex items-center justify-center rounded-lg
                                    ${!cell && !winner && "cursor-pointer"}
                                    transition-colors duration-200
                                `}
                            >
                                <AnimatePresence>
                                    {cell && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{
                                                scale: winLine.includes(index) ? [1, 1.15, 1] : 1,
                                                rotate: 0
                                            }}
                                            transition={{ 
                                                type: "spring", 
                                                stiffness: 300, 
                                                damping: 15,
                                                scale: { delay: 0.3, duration: 0.5 }
                                            }}
                                            className="relative"
                                        >
                                            {cell === "X" ? (
                                                <svg className="w-20 h-20 md:w-28 md:h-28" viewBox="0 0 100 100">
                                                    <defs>
                                                        <filter id="glow-x" x="-50%" y="-50%" width="200%" height="200%">
                                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                                            <feMerge>
                                                                <feMergeNode in="blur" />
                                                                <feMergeNode in="blur" />
                                                                <feMergeNode in="SourceGraphic" />
                                                            </feMerge>
                                                        </filter>
                                                    </defs>
                                                    <motion.line
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 0.25 }}
                                                        x1="20" y1="20" x2="80" y2="80"
                                                        stroke="hsl(var(--primary))"
                                                        strokeWidth="10"
                                                        strokeLinecap="round"
                                                        filter="url(#glow-x)"
                                                    />
                                                    <motion.line
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 0.25, delay: 0.1 }}
                                                        x1="80" y1="20" x2="20" y2="80"
                                                        stroke="hsl(var(--primary))"
                                                        strokeWidth="10"
                                                        strokeLinecap="round"
                                                        filter="url(#glow-x)"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg className="w-20 h-20 md:w-28 md:h-28" viewBox="0 0 100 100">
                                                    <defs>
                                                        <filter id="glow-o" x="-50%" y="-50%" width="200%" height="200%">
                                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                                            <feMerge>
                                                                <feMergeNode in="blur" />
                                                                <feMergeNode in="blur" />
                                                                <feMergeNode in="SourceGraphic" />
                                                            </feMerge>
                                                        </filter>
                                                    </defs>
                                                    <motion.circle
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 0.35 }}
                                                        cx="50" cy="50" r="30"
                                                        fill="none"
                                                        stroke="hsl(190 100% 50%)"
                                                        strokeWidth="10"
                                                        strokeLinecap="round"
                                                        filter="url(#glow-o)"
                                                    />
                                                </svg>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        ))}
                    </div>

                    {/* Dynamic Win Line - Glowing Laser Beam */}
                    <AnimatePresence>
                        {winner && winLineTransform && (
                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                                className="absolute h-2 origin-center z-20 rounded-full"
                                style={{
                                    top: winLineTransform.top,
                                    left: winLineTransform.left,
                                    width: winLineTransform.width,
                                    transform: `translate(-50%, -50%) rotate(${winLineTransform.rotate}deg)`,
                                    background: "linear-gradient(90deg, hsl(var(--primary)), hsl(30 100% 60%), hsl(var(--primary)))",
                                    boxShadow: `
                                        0 0 10px hsl(var(--primary)),
                                        0 0 30px hsl(var(--primary)),
                                        0 0 60px hsl(30 100% 50%),
                                        0 0 100px hsl(var(--primary))
                                    `,
                                }}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Status */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
            >
                {winner ? (
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                    >
                        <motion.p 
                            className="text-3xl font-bold"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            <span
                                className={winner === "X" ? "text-primary" : "text-cyan-400"}
                                style={{ 
                                    textShadow: `0 0 30px ${winner === "X" ? "hsl(var(--primary))" : "hsl(190 100% 50%)"}`,
                                    filter: `drop-shadow(0 0 10px ${winner === "X" ? "hsl(var(--primary))" : "hsl(190 100% 50%)"})`
                                }}
                            >
                                {winner}
                            </span>
                            {" "}Wins!
                        </motion.p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetGame}
                            className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] transition-shadow"
                        >
                            Play Again
                        </motion.button>
                    </motion.div>
                ) : isDraw ? (
                    <div>
                        <p className="text-2xl font-bold text-muted-foreground">It's a Draw!</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetGame}
                            className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold"
                        >
                            Play Again
                        </motion.button>
                    </div>
                ) : (
                    <p className="text-xl text-muted-foreground">
                        Current Turn:{" "}
                        <motion.span
                            key={isXNext ? "x" : "o"}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`font-bold text-2xl ${isXNext ? "text-primary" : "text-cyan-400"}`}
                            style={{ 
                                textShadow: `0 0 15px ${isXNext ? "hsl(var(--primary))" : "hsl(190 100% 50%)"}` 
                            }}
                        >
                            {isXNext ? "X" : "O"}
                        </motion.span>
                    </p>
                )}
            </motion.div>
        </motion.div>
    );
};

export default TicTacToeBoard;
