import { useState } from "react";
import { motion } from "framer-motion";

type PieceType = "K" | "Q" | "R" | "B" | "N" | "P" | null;
type PieceColor = "white" | "black";
type Piece = { type: PieceType; color: PieceColor } | null;

const PIECES: Record<string, string> = {
  "K-white": "♔", "Q-white": "♕", "R-white": "♖", "B-white": "♗", "N-white": "♘", "P-white": "♙",
  "K-black": "♚", "Q-black": "♛", "R-black": "♜", "B-black": "♝", "N-black": "♞", "P-black": "♟",
};

const initialBoard = (): Piece[][] => {
  const board: Piece[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Black pieces
  board[0] = [
    { type: "R", color: "black" }, { type: "N", color: "black" }, { type: "B", color: "black" },
    { type: "Q", color: "black" }, { type: "K", color: "black" }, { type: "B", color: "black" },
    { type: "N", color: "black" }, { type: "R", color: "black" },
  ];
  board[1] = Array(8).fill({ type: "P", color: "black" });
  
  // White pieces
  board[7] = [
    { type: "R", color: "white" }, { type: "N", color: "white" }, { type: "B", color: "white" },
    { type: "Q", color: "white" }, { type: "K", color: "white" }, { type: "B", color: "white" },
    { type: "N", color: "white" }, { type: "R", color: "white" },
  ];
  board[6] = Array(8).fill({ type: "P", color: "white" });
  
  return board;
};

const ChessBoard = () => {
  const [board, setBoard] = useState<Piece[][]>(initialBoard());
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [lastMove, setLastMove] = useState<{ from: [number, number]; to: [number, number] } | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<{ white: string[]; black: string[] }>({ white: [], black: [] });

  const handleSquareClick = (row: number, col: number) => {
    const piece = board[row][col];

    if (selected) {
      const selectedPiece = board[selected.row][selected.col];
      
      // If clicking the same square, deselect
      if (selected.row === row && selected.col === col) {
        setSelected(null);
        return;
      }

      // If clicking own piece, select it instead
      if (piece && piece.color === selectedPiece?.color) {
        setSelected({ row, col });
        return;
      }

      // Make move (simplified - no validation)
      const newBoard = board.map(r => [...r]);
      
      // Capture
      if (piece) {
        const capturedKey = `${piece.type}-${piece.color}`;
        setCapturedPieces(prev => ({
          ...prev,
          [piece.color === "white" ? "white" : "black"]: [...prev[piece.color === "white" ? "white" : "black"], PIECES[capturedKey]],
        }));
      }

      newBoard[row][col] = selectedPiece;
      newBoard[selected.row][selected.col] = null;
      setBoard(newBoard);
      setLastMove({ from: [selected.row, selected.col], to: [row, col] });
      setSelected(null);
      setIsWhiteTurn(!isWhiteTurn);
    } else {
      // Select piece if it belongs to current player
      if (piece && piece.color === (isWhiteTurn ? "white" : "black")) {
        setSelected({ row, col });
      }
    }
  };

  const isLastMoveSquare = (row: number, col: number) => {
    if (!lastMove) return false;
    return (lastMove.from[0] === row && lastMove.from[1] === col) ||
           (lastMove.to[0] === row && lastMove.to[1] === col);
  };

  const resetGame = () => {
    setBoard(initialBoard());
    setSelected(null);
    setIsWhiteTurn(true);
    setLastMove(null);
    setCapturedPieces({ white: [], black: [] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Captured Pieces */}
      <div className="flex justify-between mb-2 px-2">
        <div className="glass-card px-3 py-1 rounded-lg border border-glass-border">
          <span className="text-xs text-muted-foreground">Black captured:</span>
          <div className="text-lg">{capturedPieces.white.join(" ") || "—"}</div>
        </div>
        <div className="glass-card px-3 py-1 rounded-lg border border-glass-border">
          <span className="text-xs text-muted-foreground">White captured:</span>
          <div className="text-lg">{capturedPieces.black.join(" ") || "—"}</div>
        </div>
      </div>

      {/* Board */}
      <div className="relative">
        <div className="absolute inset-0 blur-3xl opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/40 via-transparent to-slate-500/40" />
        </div>

        <div className="relative glass-card rounded-2xl p-2 border border-glass-border overflow-hidden">
          {/* Row/Col Labels */}
          <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col justify-around text-[10px] text-muted-foreground font-mono pl-1">
            {[8, 7, 6, 5, 4, 3, 2, 1].map(n => <span key={n}>{n}</span>)}
          </div>
          <div className="absolute bottom-0 left-6 right-0 h-5 flex justify-around text-[10px] text-muted-foreground font-mono pt-1">
            {["a", "b", "c", "d", "e", "f", "g", "h"].map(l => <span key={l}>{l}</span>)}
          </div>

          <div className="ml-6 mb-5">
            <div className="grid grid-cols-8 aspect-square">
              {board.map((row, rowIdx) =>
                row.map((piece, colIdx) => {
                  const isLight = (rowIdx + colIdx) % 2 === 0;
                  const isSelected = selected?.row === rowIdx && selected?.col === colIdx;

                  return (
                    <motion.button
                      key={`${rowIdx}-${colIdx}`}
                      onClick={() => handleSquareClick(rowIdx, colIdx)}
                      whileHover={{ scale: 1.02 }}
                      className={`
                        aspect-square flex items-center justify-center text-3xl md:text-4xl
                        transition-all duration-200 relative
                        ${isLight ? "bg-amber-100/90" : "bg-amber-800/80"}
                        ${isSelected && "ring-2 ring-yellow-400 ring-inset z-10"}
                        ${isLastMoveSquare(rowIdx, colIdx) && "bg-yellow-500/40"}
                      `}
                    >
                      {piece && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`
                            drop-shadow-md
                            ${piece.color === "white" ? "text-slate-100" : "text-slate-900"}
                          `}
                          style={{
                            textShadow: piece.color === "white" 
                              ? "0 2px 4px rgba(0,0,0,0.5)" 
                              : "0 2px 4px rgba(255,255,255,0.3)",
                          }}
                        >
                          {PIECES[`${piece.type}-${piece.color}`]}
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 flex justify-between items-center"
      >
        <p className="text-muted-foreground">
          Turn: <span className="font-bold text-foreground">{isWhiteTurn ? "White" : "Black"}</span>
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="px-4 py-2 rounded-xl glass-card border border-glass-border hover:border-primary/50 text-sm"
        >
          New Game
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default ChessBoard;
