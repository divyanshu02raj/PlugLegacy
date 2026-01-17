import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Player = "black" | "white";
type Cell = Player | null;

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1],  [1, 0], [1, 1],
];

const initialBoard = (): Cell[][] => {
  const board: Cell[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  board[3][3] = "white";
  board[3][4] = "black";
  board[4][3] = "black";
  board[4][4] = "white";
  return board;
};

const ReversiBoard = () => {
  const [board, setBoard] = useState<Cell[][]>(initialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("black");
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [flipping, setFlipping] = useState<[number, number][]>([]);

  const getFlips = useCallback((row: number, col: number, player: Player, boardState: Cell[][]): [number, number][] => {
    if (boardState[row][col]) return [];
    
    const opponent = player === "black" ? "white" : "black";
    const allFlips: [number, number][] = [];

    for (const [dr, dc] of DIRECTIONS) {
      const flips: [number, number][] = [];
      let r = row + dr;
      let c = col + dc;

      while (r >= 0 && r < 8 && c >= 0 && c < 8 && boardState[r][c] === opponent) {
        flips.push([r, c]);
        r += dr;
        c += dc;
      }

      if (r >= 0 && r < 8 && c >= 0 && c < 8 && boardState[r][c] === player && flips.length > 0) {
        allFlips.push(...flips);
      }
    }

    return allFlips;
  }, []);

  const findValidMoves = useCallback((player: Player, boardState: Cell[][]): [number, number][] => {
    const moves: [number, number][] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (getFlips(r, c, player, boardState).length > 0) {
          moves.push([r, c]);
        }
      }
    }
    return moves;
  }, [getFlips]);

  useEffect(() => {
    setValidMoves(findValidMoves(currentPlayer, board));
  }, [board, currentPlayer, findValidMoves]);

  const handleCellClick = (row: number, col: number) => {
    const flips = getFlips(row, col, currentPlayer, board);
    if (flips.length === 0) return;

    setFlipping(flips);

    setTimeout(() => {
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = currentPlayer;
      flips.forEach(([r, c]) => {
        newBoard[r][c] = currentPlayer;
      });
      setBoard(newBoard);
      setFlipping([]);

      const nextPlayer = currentPlayer === "black" ? "white" : "black";
      const nextMoves = findValidMoves(nextPlayer, newBoard);
      
      if (nextMoves.length > 0) {
        setCurrentPlayer(nextPlayer);
      } else if (findValidMoves(currentPlayer, newBoard).length > 0) {
        // Current player plays again
      }
    }, 400);
  };

  const isValidMove = (row: number, col: number) => {
    return validMoves.some(([r, c]) => r === row && c === col);
  };

  const isFlipping = (row: number, col: number) => {
    return flipping.some(([r, c]) => r === row && c === col);
  };

  const countPieces = () => {
    let black = 0, white = 0;
    board.forEach(row => row.forEach(cell => {
      if (cell === "black") black++;
      if (cell === "white") white++;
    }));
    return { black, white };
  };

  const { black, white } = countPieces();

  const resetGame = () => {
    setBoard(initialBoard());
    setCurrentPlayer("black");
    setFlipping([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Score */}
      <div className="flex justify-between items-center mb-4">
        <div className={`glass-card px-4 py-2 rounded-xl border ${currentPlayer === "black" ? "border-primary" : "border-glass-border"}`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700" />
            <span className="font-bold text-xl">{black}</span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="px-4 py-2 rounded-xl glass-card border border-glass-border hover:border-primary/50"
        >
          Reset
        </motion.button>
        <div className={`glass-card px-4 py-2 rounded-xl border ${currentPlayer === "white" ? "border-primary" : "border-glass-border"}`}>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl">{white}</span>
            <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-slate-300" />
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="relative">
        <div className="absolute inset-0 blur-3xl opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/40 via-transparent to-emerald-500/40" />
        </div>

        <div className="relative glass-card rounded-2xl p-2 border border-glass-border overflow-hidden bg-green-800/80">
          <div className="grid grid-cols-8 gap-0.5">
            {board.map((row, rowIdx) =>
              row.map((cell, colIdx) => (
                <motion.button
                  key={`${rowIdx}-${colIdx}`}
                  onClick={() => handleCellClick(rowIdx, colIdx)}
                  whileHover={isValidMove(rowIdx, colIdx) ? { scale: 1.05 } : {}}
                  className={`
                    aspect-square bg-green-700/60 rounded-sm relative
                    flex items-center justify-center p-1
                    ${isValidMove(rowIdx, colIdx) && "cursor-pointer"}
                  `}
                >
                  {/* Valid move indicator */}
                  {isValidMove(rowIdx, colIdx) && !cell && (
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={`
                        absolute inset-2 rounded-full border-2 border-dashed
                        ${currentPlayer === "black" ? "border-slate-600" : "border-slate-300"}
                      `}
                    />
                  )}

                  {/* Disc */}
                  <AnimatePresence>
                    {cell && (
                      <motion.div
                        initial={{ scale: 0, rotateY: 0 }}
                        animate={{ 
                          scale: 1, 
                          rotateY: isFlipping(rowIdx, colIdx) ? 180 : 0,
                        }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`
                          w-full h-full rounded-full
                          ${cell === "black" 
                            ? "bg-gradient-to-br from-slate-700 to-slate-900" 
                            : "bg-gradient-to-br from-slate-100 to-slate-300"
                          }
                        `}
                        style={{
                          boxShadow: cell === "black"
                            ? "inset 0 -4px 8px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.3)"
                            : "inset 0 -4px 8px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.3)",
                        }}
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Turn indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 text-center"
      >
        <p className="text-muted-foreground">
          Turn:{" "}
          <span className="font-bold text-foreground capitalize">{currentPlayer}</span>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ReversiBoard;
