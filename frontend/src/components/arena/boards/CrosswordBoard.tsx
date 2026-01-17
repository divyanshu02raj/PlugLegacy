import { useState } from "react";
import { motion } from "framer-motion";

type Cell = {
  letter: string;
  isBlack: boolean;
  number?: number;
  answer: string;
};

// Sample crossword puzzle
const PUZZLE: Cell[][] = [
  [{ letter: "", isBlack: false, number: 1, answer: "R" }, { letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: false, number: 2, answer: "A" }, { letter: "", isBlack: false, answer: "C" }, { letter: "", isBlack: false, answer: "T" }],
  [{ letter: "", isBlack: false, number: 3, answer: "E" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, answer: "P" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, answer: "A" }],
  [{ letter: "", isBlack: false, answer: "D" }, { letter: "", isBlack: false, number: 4, answer: "A" }, { letter: "", isBlack: false, answer: "P" }, { letter: "", isBlack: false, answer: "P" }, { letter: "", isBlack: false, answer: "S" }],
  [{ letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, answer: "X" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, answer: "L" }, { letter: "", isBlack: true, answer: "" }],
  [{ letter: "", isBlack: false, number: 5, answer: "C" }, { letter: "", isBlack: false, answer: "O" }, { letter: "", isBlack: false, answer: "D" }, { letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: false, answer: "S" }],
];

const CLUES = {
  across: [
    { number: 1, clue: "A JavaScript library for building UIs" },
    { number: 3, clue: "Color primary in RGB" },
    { number: 4, clue: "Web development tool (abbr.)" },
    { number: 5, clue: "What programmers write" },
  ],
  down: [
    { number: 1, clue: "To color something again" },
    { number: 2, clue: "Software for mobile devices" },
    { number: 2, clue: "Small programs for specific tasks" },
  ],
};

const CrosswordBoard = () => {
  const [board, setBoard] = useState<Cell[][]>(PUZZLE.map(row => row.map(cell => ({ ...cell }))));
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [currentClue, setCurrentClue] = useState(CLUES.across[0]);

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col].isBlack) return;
    
    if (selected?.row === row && selected?.col === col) {
      setDirection(d => d === "across" ? "down" : "across");
    }
    setSelected({ row, col });
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (board[row][col].isBlack) return;

    if (/^[A-Za-z]$/.test(e.key)) {
      const newBoard = [...board.map(r => [...r])];
      newBoard[row][col].letter = e.key.toUpperCase();
      setBoard(newBoard);
      
      // Move to next cell
      if (direction === "across" && col < board[0].length - 1) {
        const nextCol = col + 1;
        if (!board[row][nextCol]?.isBlack) {
          setSelected({ row, col: nextCol });
        }
      } else if (direction === "down" && row < board.length - 1) {
        const nextRow = row + 1;
        if (!board[nextRow]?.[col]?.isBlack) {
          setSelected({ row: nextRow, col });
        }
      }
    } else if (e.key === "Backspace") {
      const newBoard = [...board.map(r => [...r])];
      newBoard[row][col].letter = "";
      setBoard(newBoard);
    }
  };

  const isHighlighted = (row: number, col: number) => {
    if (!selected) return false;
    if (direction === "across") return row === selected.row && !board[row][col].isBlack;
    return col === selected.col && !board[row][col].isBlack;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Clue Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl px-4 py-3 mb-4 border border-glass-border"
      >
        <span className="text-primary font-bold">{currentClue.number} {direction === "across" ? "Across" : "Down"}:</span>
        <span className="ml-2 text-muted-foreground">{currentClue.clue}</span>
      </motion.div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Board */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 blur-3xl opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-blue-500/40" />
          </div>

          <div className="relative glass-card rounded-2xl p-2 border border-glass-border">
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${board[0].length}, 1fr)` }}>
              {board.map((row, rowIdx) =>
                row.map((cell, colIdx) => (
                  <motion.div
                    key={`${rowIdx}-${colIdx}`}
                    whileHover={!cell.isBlack ? { scale: 1.05 } : {}}
                    onClick={() => handleCellClick(rowIdx, colIdx)}
                    onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                    tabIndex={cell.isBlack ? -1 : 0}
                    className={`
                      w-10 h-10 md:w-12 md:h-12 relative flex items-center justify-center
                      font-bold text-lg md:text-xl transition-all duration-200 outline-none
                      ${cell.isBlack 
                        ? "bg-slate-900" 
                        : selected?.row === rowIdx && selected?.col === colIdx
                          ? "bg-yellow-500/40 border-2 border-yellow-500"
                          : isHighlighted(rowIdx, colIdx)
                            ? "bg-blue-500/20 border border-blue-500/50"
                            : "bg-white/10 border border-glass-border hover:bg-white/20"
                      }
                      ${!cell.isBlack && "cursor-pointer"}
                    `}
                  >
                    {cell.number && (
                      <span className="absolute top-0.5 left-1 text-[8px] text-muted-foreground">
                        {cell.number}
                      </span>
                    )}
                    <span className={cell.letter === cell.answer ? "text-green-400" : "text-foreground"}>
                      {cell.letter}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Clues */}
        <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
          <div className="glass-card rounded-xl p-4 border border-glass-border">
            <h3 className="font-bold text-primary mb-2">Across</h3>
            {CLUES.across.map(clue => (
              <p key={clue.number} className="text-muted-foreground mb-1">
                <span className="font-bold text-foreground">{clue.number}.</span> {clue.clue}
              </p>
            ))}
          </div>
          <div className="glass-card rounded-xl p-4 border border-glass-border">
            <h3 className="font-bold text-primary mb-2">Down</h3>
            {CLUES.down.map((clue, i) => (
              <p key={i} className="text-muted-foreground mb-1">
                <span className="font-bold text-foreground">{clue.number}.</span> {clue.clue}
              </p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CrosswordBoard;
