import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eraser, Edit3, RotateCcw, Play, CheckCircle2, Timer } from "lucide-react";
import { authService, userService } from "../../../services/api";

// --- Sudoku Logic Helpers ---
const BLANK = 0;

const isValid = (board, row, col, num) => {
    // Check row
    for (let x = 0; x < 9; x++) if (board[row][x] === num) return false;
    // Check col
    for (let x = 0; x < 9; x++) if (board[x][col] === num) return false;
    // Check 3x3
    const startRow = row - row % 3, startCol = col - col % 3;
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            if (board[i + startRow][j + startCol] === num) return false;
    return true;
};

const solveSudoku = (board) => {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === BLANK) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudoku(board)) return true;
                        board[row][col] = BLANK;
                    }
                }
                return false;
            }
        }
    }
    return true;
};

const generateSolvedBoard = () => {
    // Start with empty board
    const board = Array(9).fill().map(() => Array(9).fill(BLANK));

    // Fill diagonal 3x3 boxes first (independent) for randomness
    for (let i = 0; i < 9; i = i + 3) {
        fillBox(board, i, i);
    }

    // Solve the rest
    solveSudoku(board);
    return board;
};

const fillBox = (board, row, col) => {
    let num;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            do {
                num = Math.floor(Math.random() * 9) + 1;
            } while (!isSafeInBox(board, row, col, num));
            board[row + i][col + j] = num;
        }
    }
};

const isSafeInBox = (board, rowStart, colStart, num) => {
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            if (board[rowStart + i][colStart + j] === num) return false;
    return true;
};

const removeKDigits = (board, k) => {
    const puzzle = board.map(row => [...row]);
    let count = k;
    while (count !== 0) {
        let cellId = Math.floor(Math.random() * 81);
        let i = Math.floor(cellId / 9);
        let j = cellId % 9;
        if (puzzle[i][j] !== BLANK) {
            count--;
            puzzle[i][j] = BLANK;
        }
    }
    return puzzle;
};

const DIFFICULTIES = {
    EASY: { name: "Relaxed", removed: 30, color: "text-green-400", border: "border-green-500/20", multiplier: 1 },
    MEDIUM: { name: "Balanced", removed: 40, color: "text-blue-400", border: "border-blue-500/20", multiplier: 1.5 },
    HARD: { name: "Intense", removed: 50, color: "text-orange-400", border: "border-orange-500/20", multiplier: 2 },
};

// --- Main Component ---
const SudokuBoard = () => {
    const [gameState, setGameState] = useState('menu'); // menu, playing, won
    const [difficulty, setDifficulty] = useState('MEDIUM');
    const [board, setBoard] = useState([]);
    const [solution, setSolution] = useState([]);
    const [selected, setSelected] = useState(null);
    const [noteMode, setNoteMode] = useState(false);
    const [errorCell, setErrorCell] = useState(null);
    const [time, setTime] = useState(0);
    const hasSavedRef = useRef(false);

    // Timer
    useEffect(() => {
        let interval;
        if (gameState === 'playing') {
            interval = setInterval(() => setTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [gameState]);

    // Save Game on Win
    useEffect(() => {
        if (gameState === 'won' && !hasSavedRef.current) {
            hasSavedRef.current = true;

            // Calculate Score: Base(1000) * Diff - Time
            const diffMult = DIFFICULTIES[difficulty].multiplier;
            const calculatedScore = Math.max(100, Math.round((1000 * diffMult) - time));

            const user = authService.getCurrentUser();
            if (user) {
                userService.saveMatch({
                    gameId: 'sudoku',
                    score: calculatedScore,
                    result: 'completed',
                    opponent: { username: 'Single Player' }
                }).catch(err => console.error("Failed to save sudoku score:", err));
            }
        } else if (gameState !== 'won') {
            hasSavedRef.current = false;
        }
    }, [gameState, difficulty, time]);

    // Keyboard Input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== 'playing' || !selected) return;

            // Numbers 1-9
            if (e.key >= '1' && e.key <= '9') {
                handleNumberInput(parseInt(e.key));
                return;
            }

            // Eraser
            if (e.key === 'Backspace' || e.key === 'Delete') {
                handleErase();
                return;
            }

            // Notes Toggle
            if (e.key.toLowerCase() === 'n') {
                setNoteMode(prev => !prev);
                return;
            }

            // Navigation
            const { row, col } = selected;
            let newRow = row;
            let newCol = col;

            if (e.key === 'ArrowUp') newRow = Math.max(0, row - 1);
            else if (e.key === 'ArrowDown') newRow = Math.min(8, row + 1);
            else if (e.key === 'ArrowLeft') newCol = Math.max(0, col - 1);
            else if (e.key === 'ArrowRight') newCol = Math.min(8, col + 1);
            else return; // Not a nav key

            e.preventDefault(); // Prevent scrolling
            setSelected({ row: newRow, col: newCol });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, selected, board, noteMode]); // Dependencies for closure access

    const startGame = (diffKey) => {
        localStorage.removeItem('sudoku_state');
        const solved = generateSolvedBoard();
        setSolution(solved.map(row => [...row])); // Deep copy solution

        const puzzle = removeKDigits(solved, DIFFICULTIES[diffKey].removed);

        const initialBoard = puzzle.map(row =>
            row.map(val => ({
                value: val || null,
                isFixed: val !== BLANK,
                notes: [],
                isError: false,
            }))
        );

        setBoard(initialBoard);
        setDifficulty(diffKey);
        setGameState('playing');
        setTime(0);
        setSelected(null);
    };

    // Load saved state
    useEffect(() => {
        const savedState = localStorage.getItem('sudoku_state');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.gameState === 'playing') {
                    setBoard(parsed.board);
                    setDifficulty(parsed.difficulty);
                    setTime(parsed.time);
                    setSolution(parsed.solution);
                    setGameState('playing');
                    setNoteMode(parsed.noteMode || false);
                }
            } catch (e) {
                console.error("Failed to load sudoku state", e);
            }
        }
    }, []);

    // Save state
    useEffect(() => {
        if (gameState === 'playing') {
            const state = {
                board,
                difficulty,
                time,
                solution,
                noteMode,
                gameState
            };
            localStorage.setItem('sudoku_state', JSON.stringify(state));
        } else if (gameState === 'won' || gameState === 'menu') {
            // Check if we just won, clear it
            if (gameState === 'won') localStorage.removeItem('sudoku_state');
        }
    }, [board, difficulty, time, solution, noteMode, gameState]);

    const isInSameBlock = (r1, c1, r2, c2) => {
        return Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3);
    };

    const handleNumberInput = (num) => {
        if (!selected || gameState !== 'playing') return;
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

            // Check correctness immediately against solution (Standard App Behavior) or just Constraints?
            // Let's stick to constraint checking for "real feel", but we warn on conflicts.
            // Actually, for a game app, instantaneous feedback on obvious errors is usually preferred.

            // Check against actual solution for "Strict Mode" or just check conflicts?
            // Let's check conflicts with existing board.

            if (isValidPlacement(newBoard, row, col, num)) {
                newBoard[row][col].isError = false;
                // Check Win
                if (checkWin(newBoard)) setGameState('won');
            } else {
                newBoard[row][col].isError = true;
                setErrorCell({ row, col });
                setTimeout(() => setErrorCell(null), 500);
            }
        }
        setBoard(newBoard);
    };

    const isValidPlacement = (currentBoard, row, col, val) => {
        // Simple conflict check against current visible board
        // Row
        for (let c = 0; c < 9; c++) if (c !== col && currentBoard[row][c].value === val) return false;
        // Col
        for (let r = 0; r < 9; r++) if (r !== row && currentBoard[r][col].value === val) return false;
        // Box
        const startRow = row - row % 3, startCol = col - col % 3;
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                if ((startRow + i !== row || startCol + j !== col) && currentBoard[startRow + i][startCol + j].value === val) return false;
        return true;
    };

    const checkWin = (currentBoard) => {
        for (let r = 0; r < 9; r++)
            for (let c = 0; c < 9; c++)
                if (!currentBoard[r][c].value || currentBoard[r][c].isError) return false;
        return true;
    };

    const handleErase = () => {
        if (!selected || gameState !== 'playing') return;
        const { row, col } = selected;
        if (board[row][col].isFixed) return;

        const newBoard = board.map(r => r.map(c => ({ ...c })));
        newBoard[row][col].value = null;
        newBoard[row][col].notes = [];
        newBoard[row][col].isError = false;
        setBoard(newBoard);
    };

    const getNumberCount = (num) => {
        let count = 0;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r] && board[r][c] && board[r][c].value === num) {
                    count++;
                }
            }
        }
        return count;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl mx-auto flex flex-col gap-4"
        >
            {gameState === 'menu' ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] glass-card rounded-3xl p-8 gap-8">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                            Sudoku Arena
                        </h2>
                        <p className="text-muted-foreground">Select your challenge level</p>
                    </div>

                    <div className="grid gap-4 w-full max-w-xs">
                        {Object.entries(DIFFICULTIES).map(([key, config]) => (
                            <motion.button
                                key={key}
                                whileHover={{ scale: 1.02, x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => startGame(key)}
                                className={`
                                    relative p-4 rounded-xl border bg-black/20 text-left overflow-hidden group
                                    hover:bg-black/40 transition-all ${config.border}
                                `}
                            >
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-current ${config.color}`} />
                                <div className="flex items-center justify-between relative z-10">
                                    <div>
                                        <p className={`font-bold text-lg ${config.color}`}>{config.name}</p>
                                    </div>
                                    <div className={`p-2 rounded-full bg-white/5 ${config.color}`}>
                                        <Play className="w-5 h-5 fill-current" />
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="w-full flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setGameState('menu')}
                                className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </motion.button>
                            <div className="flex flex-col">
                                <span className={`text-sm font-bold tracking-wide ${DIFFICULTIES[difficulty].color}`}>
                                    {DIFFICULTIES[difficulty].name.toUpperCase()}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Timer className="w-3.5 h-3.5" />
                                    <span className="font-mono">{formatTime(time)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setNoteMode(!noteMode)}
                                className={`
                                    px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all border text-xs font-semibold
                                    ${noteMode
                                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                                        : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
                                    }
                                `}
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                NOTES
                            </motion.button>
                        </div>
                    </div>

                    {/* THE BOARD */}
                    <div className="relative p-1 rounded-2xl bg-[#0f1115] shadow-2xl overflow-hidden border border-white/10 aspect-square w-full">
                        <div className="w-full h-full border border-white/10 rounded-xl overflow-hidden bg-[#15161c]">
                            <div className="grid grid-cols-9 w-full h-full">
                                {board.map((row, rowIndex) => (
                                    row.map((cell, colIndex) => {
                                        const isSelected = selected?.row === rowIndex && selected?.col === colIndex;
                                        const isSameRow = selected?.row === rowIndex;
                                        const isSameCol = selected?.col === colIndex;
                                        const isSameBox = selected && isInSameBlock(selected.row, selected.col, rowIndex, colIndex);
                                        const isRelated = selected && (isSameRow || isSameCol || isSameBox);
                                        const isRightBorder = (colIndex + 1) % 3 === 0 && colIndex !== 8;
                                        const isBottomBorder = (rowIndex + 1) % 3 === 0 && rowIndex !== 8;

                                        return (
                                            <div
                                                key={`${rowIndex}-${colIndex}`}
                                                onClick={() => setSelected({ row: rowIndex, col: colIndex })}
                                                className={`
                                                    relative flex items-center justify-center
                                                    cursor-pointer select-none transition-colors duration-75
                                                    border-white/5
                                                    ${colIndex !== 8 ? "border-r" : ""}
                                                    ${rowIndex !== 8 ? "border-b" : ""}
                                                    ${isRightBorder ? "!border-r-white/20 !border-r-2" : ""}
                                                    ${isBottomBorder ? "!border-b-white/20 !border-b-2" : ""}
                                                    ${isSelected ? "bg-cyan-500/20 z-10" : isRelated ? "bg-cyan-500/5" : "hover:bg-white/5"}
                                                    ${cell.isError ? "bg-red-500/20" : ""}
                                                `}
                                            >
                                                {/* Error Shake */}
                                                {errorCell?.row === rowIndex && errorCell?.col === colIndex && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-red-500/30"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: [0, 1, 0, 1, 0] }}
                                                        transition={{ duration: 0.4 }}
                                                    />
                                                )}

                                                {cell.value ? (
                                                    <span className={`
                                                        text-xl md:text-3xl font-medium
                                                        ${cell.isFixed ? "text-slate-400" : cell.isError ? "text-red-400" : "text-cyan-400"}
                                                    `}>
                                                        {cell.value}
                                                    </span>
                                                ) : (
                                                    <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5 pointer-events-none">
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                                            <div key={n} className="flex items-center justify-center">
                                                                {cell.notes.includes(n) && (
                                                                    <span className="text-[9px] text-cyan-200/50 leading-none">{n}</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Numpad */}
                    <div className="grid grid-cols-9 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
                            const isComplete = getNumberCount(num) >= 9;
                            return (
                                <button
                                    key={num}
                                    onClick={() => !isComplete && handleNumberInput(num)}
                                    disabled={isComplete}
                                    className={`
                                        aspect-[4/3] rounded-lg border text-xl font-medium transition-all flex items-center justify-center
                                        ${isComplete
                                            ? 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
                                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-white active:scale-95 cursor-pointer'
                                        }
                                    `}
                                >
                                    {num}
                                </button>
                            );
                        })}
                    </div>

                    {/* Victory Popup */}
                    <AnimatePresence>
                        {gameState === 'won' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                                onClick={() => setGameState('menu')}
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ type: "spring", duration: 0.5 }}
                                    className="glass-card rounded-3xl p-8 max-w-md mx-4 text-center"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1, rotate: 360 }}
                                        transition={{ delay: 0.2, type: "spring" }}
                                        className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center"
                                    >
                                        <CheckCircle2 className="w-12 h-12 text-white" />
                                    </motion.div>

                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent mb-2">
                                        Puzzle Solved!
                                    </h2>
                                    <p className="text-muted-foreground mb-6">Congratulations on completing the challenge</p>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="glass-card p-4 rounded-xl">
                                            <p className="text-xs text-muted-foreground mb-1">Time</p>
                                            <p className="text-2xl font-bold text-cyan-400">{formatTime(time)}</p>
                                        </div>
                                        <div className="glass-card p-4 rounded-xl">
                                            <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
                                            <p className={`text-2xl font-bold ${DIFFICULTIES[difficulty].color}`}>
                                                {DIFFICULTIES[difficulty].name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => window.location.href = '/games'}
                                            className="py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
                                        >
                                            Back to Home
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setGameState('menu')}
                                            className="py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                                        >
                                            Play Again
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </motion.div>
    );
};

export default SudokuBoard;
