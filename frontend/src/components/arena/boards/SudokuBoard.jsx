import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eraser, Edit3, RotateCcw } from "lucide-react";

const generatePuzzle = () => {
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

// --- Main Component ---
const SudokuBoard = () => {
    const [board, setBoard] = useState(generatePuzzle);
    const [selected, setSelected] = useState(null);
    const [noteMode, setNoteMode] = useState(false);
    const [errorCell, setErrorCell] = useState(null);

    const isInSameBlock = (r1, c1, r2, c2) => {
        return Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3);
    };

    const checkConflict = useCallback((newBoard, row, col, value) => {
        if (!value) return false;

        // Check row
        for (let c = 0; c < 9; c++) {
            if (c !== col && newBoard[row][c].value === value) return true;
        }
        // Check column
        for (let r = 0; r < 9; r++) {
            if (r !== row && newBoard[r][col].value === value) return true;
        }
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if ((r !== row || c !== col) && newBoard[r][c].value === value) return true;
            }
        }
        return false;
    }, []);

    const handleCellClick = (row, col) => {
        // Allow selecting fixed cells too, just for visual consistency (block highlighting), but don't allow editing
        setSelected({ row, col });
    };

    const handleNumberInput = (num) => {
        if (!selected) return;
        const { row, col } = selected;
        if (board[row][col].isFixed) return;

        const newBoard = board.map(r => r.map(c => ({ ...c })));

        if (noteMode) {
            const notes = [...newBoard[row][col].notes];
            if (notes.includes(num)) {
                newBoard[row][col].notes = notes.filter(n => n !== num);
            } else {
                newBoard[row][col].notes = [...notes, num].sort((a, b) => a - b);
            }
            newBoard[row][col].value = null;
        } else {
            newBoard[row][col].value = num;
            newBoard[row][col].notes = [];

            // Check for conflicts
            if (checkConflict(newBoard, row, col, num)) {
                newBoard[row][col].isError = true;
                setErrorCell({ row, col });
                setTimeout(() => setErrorCell(null), 500);
            } else {
                newBoard[row][col].isError = false;
            }
        }
        setBoard(newBoard);
    };

    const handleErase = () => {
        if (!selected) return;
        const { row, col } = selected;
        if (board[row][col].isFixed) return;

        const newBoard = board.map(r => r.map(c => ({ ...c })));
        newBoard[row][col].value = null;
        newBoard[row][col].notes = [];
        newBoard[row][col].isError = false;
        setBoard(newBoard);
    };

    const resetPuzzle = () => {
        setBoard(generatePuzzle());
        setSelected(null);
        setErrorCell(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[380px] mx-auto flex flex-col gap-2"
        >
            {/* Header / Info (Matches Chess) */}
            <div className="w-full flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_currentColor]" />
                    <span className="text-sm font-medium text-cyan-100/70 tracking-wide">Standard Sudoku</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400">
                    DIFFICULTY: HARD
                </div>
            </div>

            {/* THE BOARD */}
            <div className="relative p-1 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden border border-white/10 aspect-square w-full">

                {/* Grid Container */}
                <div className="w-full h-full border border-white/10 rounded-xl overflow-hidden bg-[#15161c]">
                    {/* Flat 9x9 Grid */}
                    <div className="grid grid-cols-9 w-full h-full">
                        {board.map((row, rowIndex) => (
                            row.map((cell, colIndex) => {
                                const isSelected = selected?.row === rowIndex && selected?.col === colIndex;
                                const isSameRow = selected?.row === rowIndex;
                                const isSameCol = selected?.col === colIndex;
                                const isSameBox = selected && isInSameBlock(selected.row, selected.col, rowIndex, colIndex);
                                // Highlight related cells (row, col, box) subtly
                                const isRelated = selected && (isSameRow || isSameCol || isSameBox);

                                // Error shaking
                                const isShaking = errorCell?.row === rowIndex && errorCell?.col === colIndex;

                                // Borders Logic
                                const isRightBorder = (colIndex + 1) % 3 === 0 && colIndex !== 8;
                                const isBottomBorder = (rowIndex + 1) % 3 === 0 && rowIndex !== 8;

                                return (
                                    <div
                                        key={`${rowIndex}-${colIndex}`}
                                        onClick={() => handleCellClick(rowIndex, colIndex)}
                                        className={`
                                            relative flex items-center justify-center
                                            cursor-pointer select-none transition-colors duration-200
                                            border-white/10
                                            ${colIndex !== 8 ? "border-r" : ""}
                                            ${rowIndex !== 8 ? "border-b" : ""}
                                            ${isRightBorder ? "!border-r-white/30 !border-r-2" : ""}
                                            ${isBottomBorder ? "!border-b-white/30 !border-b-2" : ""}
                                            ${isSelected
                                                ? "bg-cyan-500/20 z-10"
                                                : isRelated
                                                    ? "bg-cyan-500/5"
                                                    : "bg-transparent hover:bg-white/5"
                                            }
                                            ${cell.isError ? "bg-red-500/20" : ""}
                                        `}
                                    >
                                        {/* Selection Glow */}
                                        {isSelected && (
                                            <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(6,182,212,0.3)] border border-cyan-500/50" />
                                        )}

                                        {/* Error Flash */}
                                        {isShaking && (
                                            <motion.div
                                                className="absolute inset-0 bg-red-500/30"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: [0, 1, 0, 1, 0] }}
                                                transition={{ duration: 0.4 }}
                                            />
                                        )}

                                        <AnimatePresence mode="wait">
                                            {cell.value ? (
                                                <motion.span
                                                    key={`val-${cell.value}`}
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className={`
                                                        text-xl md:text-2xl
                                                        ${cell.isFixed
                                                            ? "text-slate-200 font-semibold"
                                                            : cell.isError
                                                                ? "text-red-400 font-bold drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]"
                                                                : "text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                                                        }
                                                    `}
                                                >
                                                    {cell.value}
                                                </motion.span>
                                            ) : (
                                                // Notes Grid
                                                <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5 pointer-events-none">
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                                        <div key={n} className="flex items-center justify-center">
                                                            {cell.notes.includes(n) && (
                                                                <span className="text-[8px] text-cyan-200/70 font-medium">
                                                                    {n}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-2">
                {/* Tools */}
                <div className="flex justify-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNoteMode(!noteMode)}
                        className={`
                            px-4 py-2 rounded-full flex items-center gap-2 transition-all border
                            ${noteMode
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                                : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white"
                            }
                        `}
                    >
                        <Edit3 className="w-4 h-4" />
                        <span className="text-sm font-medium tracking-wide">NOTES</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleErase}
                        className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white hover:border-red-500/30 flex items-center gap-2 transition-all"
                    >
                        <Eraser className="w-4 h-4" />
                        <span className="text-sm font-medium tracking-wide">ERASE</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetPuzzle}
                        className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white hover:border-white/30 flex items-center gap-2 transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span className="text-sm font-medium tracking-wide">RESET</span>
                    </motion.button>
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-9 gap-2 mt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <motion.button
                            key={num}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleNumberInput(num)}
                            className={`
                                aspect-square rounded-xl text-xl font-light flex items-center justify-center
                                bg-white/5 border border-white/10 backdrop-blur-sm
                                hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]
                                transition-all duration-200
                                ${noteMode ? "text-cyan-200/70" : "text-white"}
                            `}
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
