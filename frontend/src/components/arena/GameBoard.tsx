import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type CellValue = "X" | "O" | null;

const GameBoard = () => {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const handleCellClick = (index: number) => {
    if (board[index]) return;
    
    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const renderCell = (index: number) => {
    const value = board[index];
    
    return (
      <motion.button
        key={index}
        whileHover={{ scale: value ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleCellClick(index)}
        className={`
          aspect-square glass-card border-2 border-glass-border rounded-2xl
          flex items-center justify-center text-6xl md:text-7xl lg:text-8xl font-bold
          transition-all duration-300 relative overflow-hidden
          ${!value && "hover:border-primary/50 hover:bg-glass-hover cursor-pointer"}
        `}
      >
        {/* Hover Glow Effect */}
        {!value && (
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"
          />
        )}

        {/* Cell Value */}
        <AnimatePresence>
          {value && (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className={`
                relative z-10
                ${value === "X" 
                  ? "text-primary" 
                  : "text-blue-400"
                }
              `}
              style={{
                textShadow: value === "X" 
                  ? "0 0 30px hsl(24 100% 50% / 0.8), 0 0 60px hsl(24 100% 50% / 0.4)" 
                  : "0 0 30px hsl(210 100% 60% / 0.8), 0 0 60px hsl(210 100% 60% / 0.4)",
              }}
            >
              {value}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Background Glow for placed pieces */}
        {value && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
              absolute inset-0 rounded-2xl
              ${value === "X" 
                ? "bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" 
                : "bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-transparent"
              }
            `}
          />
        )}
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Board Container */}
      <div className="relative">
        {/* Ambient Glow Behind Board */}
        <div className="absolute inset-0 blur-3xl opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-blue-500/40" />
        </div>

        {/* Game Board Grid */}
        <div className="relative grid grid-cols-3 gap-3 p-4 glass-card rounded-3xl border border-glass-border">
          {Array(9).fill(null).map((_, i) => renderCell(i))}
        </div>
      </div>

      {/* Turn Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center"
      >
        <p className="text-muted-foreground">
          Current Turn:{" "}
          <span
            className={`font-bold ${isXNext ? "text-primary" : "text-blue-400"}`}
            style={{
              textShadow: isXNext 
                ? "0 0 10px hsl(24 100% 50% / 0.5)" 
                : "0 0 10px hsl(210 100% 60% / 0.5)",
            }}
          >
            {isXNext ? "X (You)" : "O (Opponent)"}
          </span>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default GameBoard;
