import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eraser, Edit3 } from "lucide-react";

const generatePuzzle = () => {
    // Sample puzzle with some fixed numbers
    const fixed = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ];

    return fixed.map(row =>
        row.map(val => ({
            value: val || null,
            isFixed: val !== 0,
            notes: [],
            isError: false,
        }))
    );
};

const SudokuBoard = () => {
    const [board, setBoard] = useState(generatePuzzle);
    const [selected, setSelected] = useState(null);
    const [noteMode, setNoteMode] = useState(false);

    const handleCellClick = (row, col) => {
        if (!board[row][col].isFixed) {
            setSelected({ row, col });
        }
    };

    const handleNumberInput = (num) => {
        if (!selected) return;
        const { row, col } = selected;
        if (board[row][col].isFixed) return;

        const newBoard = [...board.map(r => [...r])];
        if (noteMode) {
            const notes = newBoard[row][col].notes;
            if (notes.includes(num)) {
                newBoard[row][col].notes = notes.filter(n => n !== num);
            } else {
                newBoard[row][col].notes = [...notes, num].sort();
            }
            newBoard[row][col].value = null;
        } else {
            newBoard[row][col].value = num;
            newBoard[row][col].notes = [];
        }
        setBoard(newBoard);
    };

    const handleErase = () => {
        if (!selected) return;
        const { row, col } = selected;
        if (board[row][col].isFixed) return;

        const newBoard = [...board.map(r => [...r])];
        newBoard[row][col].value = null;
        newBoard[row][col].notes = [];
        setBoard(newBoard);
    };

    const isInSameBlock = (r1, c1, r2, c2) => {
        return Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg mx-auto"
        >
            {/* Board */}
            <div className="relative">
                <div className="absolute inset-0 blur-3xl opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 via-transparent to-primary/40" />
                </div>

                <div className="relative glass-card rounded-2xl p-2 border border-glass-border">
                    <div className="grid grid-cols-9 gap-0">
                        {board.map((row, rowIdx) =>
                            row.map((cell, colIdx) => {
                                const isSelected = selected?.row === rowIdx && selected?.col === colIdx;
                                const isRelated = selected && (
                                    selected.row === rowIdx ||
                                    selected.col === colIdx ||
                                    isInSameBlock(selected.row, selected.col, rowIdx, colIdx)
                                );

                                return (
                                    <motion.button
                                        key={`${rowIdx}-${colIdx}`}
                                        whileHover={{ scale: cell.isFixed ? 1 : 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleCellClick(rowIdx, colIdx)}
                                        className={`
                      aspect-square flex items-center justify-center text-sm md:text-lg font-bold
                      transition-all duration-200 relative
                      ${colIdx % 3 === 2 && colIdx !== 8 ? "border-r-2 border-primary/50" : "border-r border-glass-border"}
                      ${rowIdx % 3 === 2 && rowIdx !== 8 ? "border-b-2 border-primary/50" : "border-b border-glass-border"}
                      ${colIdx === 0 ? "border-l border-glass-border" : ""}
                      ${rowIdx === 0 ? "border-t border-glass-border" : ""}
                      ${isSelected ? "bg-primary/30 z-10" : isRelated ? "bg-white/5" : "bg-transparent"}
                      ${!cell.isFixed && "cursor-pointer hover:bg-white/10"}
                    `}
                                    >
                                        {cell.value ? (
                                            <span className={cell.isFixed ? "text-foreground" : "text-blue-400"}>
                                                {cell.value}
                                            </span>
                                        ) : cell.notes.length > 0 ? (
                                            <div className="grid grid-cols-3 gap-0 text-[6px] md:text-[8px] text-muted-foreground">
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                                    <span key={n} className={cell.notes.includes(n) ? "opacity-100" : "opacity-0"}>
                                                        {n}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null}
                                    </motion.button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Number Pad */}
            <div className="mt-6 space-y-3">
                <div className="flex justify-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNoteMode(!noteMode)}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${noteMode
                                ? "bg-primary text-primary-foreground"
                                : "glass-card border border-glass-border"
                            }`}
                    >
                        <Edit3 className="w-4 h-4" />
                        <span className="text-sm">Notes</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleErase}
                        className="px-4 py-2 rounded-xl glass-card border border-glass-border flex items-center gap-2"
                    >
                        <Eraser className="w-4 h-4" />
                        <span className="text-sm">Erase</span>
                    </motion.button>
                </div>

                <div className="grid grid-cols-9 gap-1.5 max-w-md mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <motion.button
                            key={num}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleNumberInput(num)}
                            className="aspect-square glass-card border border-glass-border rounded-lg text-lg font-bold hover:bg-primary/20 hover:border-primary/50 transition-all"
                        >
                            {num}
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default SudokuBoard;
