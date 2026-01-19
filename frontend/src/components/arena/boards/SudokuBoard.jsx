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
        if (!board[row][col].isFixed) {
            setSelected({ row, col });
        }
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg mx-auto"
        >
            {/* Board */}
            <div className="relative">
                {/* Ambient glow */}
                <div className="absolute -inset-4 blur-3xl opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-transparent to-indigo-600/40" />
                </div>

                <div className="relative bg-black rounded-2xl p-1 border-2 border-gray-800 shadow-2xl">
                    {/* Main Grid */}
                    <div className="grid grid-cols-3 gap-0">
                        {[0, 1, 2].map(boxRow => (
                            <div key={boxRow} className="grid grid-cols-3 gap-0">
                                {[0, 1, 2].map(boxCol => {
                                    const isBoxSelected = selected && 
                                        Math.floor(selected.row / 3) === boxRow && 
                                        Math.floor(selected.col / 3) === boxCol;
                                    
                                    return (
                                        <div 
                                            key={`${boxRow}-${boxCol}`}
                                            className={`
                                                grid grid-cols-3 gap-0
                                                border-2 border-gray-700
                                                ${isBoxSelected ? "bg-blue-900/10" : ""}
                                            `}
                                        >
                                            {[0, 1, 2].map(cellRow =>
                                                [0, 1, 2].map(cellCol => {
                                                    const row = boxRow * 3 + cellRow;
                                                    const col = boxCol * 3 + cellCol;
                                                    const cell = board[row][col];
                                                    const isSelected = selected?.row === row && selected?.col === col;
                                                    const isSameRow = selected?.row === row;
                                                    const isSameCol = selected?.col === col;
                                                    const isSameBox = selected && isInSameBlock(selected.row, selected.col, row, col);
                                                    const isHighlighted = isSameRow || isSameCol || isSameBox;
                                                    const isShaking = errorCell?.row === row && errorCell?.col === col;

                                                    return (
                                                        <motion.button
                                                            key={`${row}-${col}`}
                                                            onClick={() => handleCellClick(row, col)}
                                                            animate={isShaking ? { x: [-4, 4, -4, 4, 0] } : {}}
                                                            transition={{ duration: 0.4 }}
                                                            className={`
                                                                aspect-square flex items-center justify-center
                                                                text-lg md:text-xl font-bold
                                                                border border-gray-800
                                                                transition-all duration-150 relative
                                                                ${isSelected 
                                                                    ? "bg-blue-600/30 ring-2 ring-blue-500 ring-inset z-10" 
                                                                    : isHighlighted 
                                                                        ? "bg-blue-900/20" 
                                                                        : "bg-black hover:bg-gray-900/50"
                                                                }
                                                                ${!cell.isFixed && "cursor-pointer"}
                                                            `}
                                                        >
                                                            <AnimatePresence mode="wait">
                                                                {cell.value ? (
                                                                    <motion.span
                                                                        key={`value-${cell.value}`}
                                                                        initial={{ scale: 0.5, opacity: 0 }}
                                                                        animate={{ scale: 1, opacity: 1 }}
                                                                        exit={{ scale: 0.5, opacity: 0 }}
                                                                        className={`
                                                                            ${cell.isFixed 
                                                                                ? "text-gray-400" 
                                                                                : cell.isError 
                                                                                    ? "text-red-500" 
                                                                                    : "text-blue-400 font-bold"
                                                                            }
                                                                            ${cell.isError && "drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"}
                                                                        `}
                                                                    >
                                                                        {cell.value}
                                                                    </motion.span>
                                                                ) : cell.notes.length > 0 ? (
                                                                    <div className="grid grid-cols-3 gap-0 text-[7px] md:text-[9px] text-gray-500 w-full h-full p-0.5">
                                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                                                            <span 
                                                                                key={n} 
                                                                                className={`
                                                                                    flex items-center justify-center
                                                                                    ${cell.notes.includes(n) ? "opacity-100 text-blue-300" : "opacity-0"}
                                                                                `}
                                                                            >
                                                                                {n}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                ) : null}
                                                            </AnimatePresence>
                                                        </motion.button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="mt-6 space-y-4">
                {/* Action Buttons */}
                <div className="flex justify-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNoteMode(!noteMode)}
                        className={`
                            px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all
                            ${noteMode
                                ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                                : "bg-gray-900 border border-gray-700 text-gray-300 hover:border-blue-500/50"
                            }
                        `}
                    >
                        <Edit3 className="w-4 h-4" />
                        <span className="text-sm font-medium">Notes</span>
                    </motion.button>
                    
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleErase}
                        className="px-5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-gray-300 hover:border-red-500/50 flex items-center gap-2 transition-all"
                    >
                        <Eraser className="w-4 h-4" />
                        <span className="text-sm font-medium">Erase</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetPuzzle}
                        className="px-5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-gray-300 hover:border-primary/50 flex items-center gap-2 transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span className="text-sm font-medium">Reset</span>
                    </motion.button>
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-9 gap-2 max-w-md mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <motion.button
                            key={num}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleNumberInput(num)}
                            className={`
                                aspect-square rounded-xl text-lg font-bold
                                bg-gray-900 border border-gray-700
                                hover:border-blue-500 hover:bg-blue-600/20
                                hover:text-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]
                                transition-all duration-200
                                ${noteMode ? "text-blue-300" : "text-gray-200"}
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
