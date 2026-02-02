import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Circle, Timer, Lightbulb, CheckCircle, RotateCcw, ArrowLeft } from "lucide-react";
import { LOGIC_PUZZLES } from "../../../utils/LogicGridData";

const LogicGridBoard = () => {
    const [currentPuzzle, setCurrentPuzzle] = useState(null);
    const [grid, setGrid] = useState([]);
    const [timer, setTimer] = useState(0);
    const [isSolved, setIsSolved] = useState(false);
    const [hintsUsed, setHintsUsed] = useState(0);

    // Load Random Puzzle
    const loadRandomPuzzle = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * LOGIC_PUZZLES.length);
        const puzzle = LOGIC_PUZZLES[randomIndex];
        setCurrentPuzzle(puzzle);

        // Initialize empty grid
        const emptyGrid = Array(puzzle.categories.rows.length)
            .fill(null)
            .map(() => Array(puzzle.categories.cols.length).fill("empty"));
        setGrid(emptyGrid);

        setTimer(0);
        setIsSolved(false);
        setHintsUsed(0);
    }, []);

    // Load puzzle on mount
    useEffect(() => {
        loadRandomPuzzle();
    }, [loadRandomPuzzle]);

    // Timer
    useEffect(() => {
        if (isSolved || !currentPuzzle) return;
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [isSolved, currentPuzzle]);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Check if puzzle is solved
    const checkWin = useCallback((currentGrid) => {
        if (!currentPuzzle) return false;

        for (let row = 0; row < currentGrid.length; row++) {
            for (let col = 0; col < currentGrid[row].length; col++) {
                if (currentGrid[row][col] !== currentPuzzle.solution[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }, [currentPuzzle]);

    // Auto-mark logic: when a cell is marked as "true", mark rest of row and column as "false"
    const autoMark = (newGrid, row, col) => {
        // Mark rest of row as false
        for (let c = 0; c < newGrid[row].length; c++) {
            if (c !== col && newGrid[row][c] === "empty") {
                newGrid[row][c] = "false";
            }
        }

        // Mark rest of column as false
        for (let r = 0; r < newGrid.length; r++) {
            if (r !== row && newGrid[r][col] === "empty") {
                newGrid[r][col] = "false";
            }
        }

        return newGrid;
    };

    // Handle cell click
    const handleCellClick = (row, col) => {
        if (isSolved) return;

        setGrid(prev => {
            const newGrid = prev.map(r => [...r]);
            const current = newGrid[row][col];

            if (current === "empty") {
                newGrid[row][col] = "false";
            } else if (current === "false") {
                newGrid[row][col] = "true";
                // Auto-mark rest of row and column
                autoMark(newGrid, row, col);
            } else {
                newGrid[row][col] = "empty";
            }

            // Check win condition
            if (checkWin(newGrid)) {
                setIsSolved(true);
            }

            return newGrid;
        });
    };

    // Reveal hint
    const revealHint = () => {
        if (!currentPuzzle || isSolved) return;

        setGrid(prev => {
            const newGrid = prev.map(r => [...r]);

            // Find first cell that doesn't match solution
            for (let row = 0; row < newGrid.length; row++) {
                for (let col = 0; col < newGrid[row].length; col++) {
                    if (newGrid[row][col] !== currentPuzzle.solution[row][col]) {
                        newGrid[row][col] = currentPuzzle.solution[row][col];

                        // If we just placed a "true", auto-mark the rest
                        if (currentPuzzle.solution[row][col] === "true") {
                            autoMark(newGrid, row, col);
                        }

                        setHintsUsed(h => h + 1);

                        // Check win after hint
                        if (checkWin(newGrid)) {
                            setIsSolved(true);
                        }

                        return newGrid;
                    }
                }
            }

            return newGrid;
        });
    };

    if (!currentPuzzle || !grid.length) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl mx-auto -mt-20"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-primary" />
                    <span className="font-mono text-lg">{formatTime(timer)}</span>
                </div>
                <div className="text-sm font-bold text-muted-foreground">
                    {currentPuzzle.title}
                </div>
                <button
                    onClick={revealHint}
                    disabled={isSolved}
                    className="flex items-center gap-2 bg-yellow-500/20 text-yellow-500 px-3 py-1.5 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Lightbulb className="w-4 h-4" /> Hint
                </button>
            </div>

            {/* Clues */}
            <div className="glass-card rounded-xl p-4 mb-3 border border-glass-border">
                <h3 className="font-bold text-primary mb-2">🔍 Clues</h3>
                <ul className="space-y-1">
                    {currentPuzzle.clues.map((clue, i) => (
                        <li key={i} className="text-muted-foreground text-sm">
                            • {clue}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Grid */}
            <div className="relative overflow-x-auto">
                <div className="absolute inset-0 blur-3xl opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 via-transparent to-primary/40" />
                </div>

                <div className="relative inline-block">
                    <div className="glass-card rounded-2xl p-4 border border-glass-border">
                        {/* Header Row */}
                        <div className="flex">
                            <div className="w-24" /> {/* Empty corner */}
                            {currentPuzzle.categories.cols.map(col => (
                                <div
                                    key={col}
                                    className="w-16 h-12 flex items-end justify-center pb-2 text-sm font-medium text-primary"
                                >
                                    <span className="transform -rotate-45 origin-bottom-left whitespace-nowrap">
                                        {col}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Grid Rows */}
                        {currentPuzzle.categories.rows.map((row, rowIdx) => (
                            <div key={row} className="flex items-center">
                                <div className="w-24 pr-2 text-right text-sm font-medium text-foreground">
                                    {row}
                                </div>
                                {currentPuzzle.categories.cols.map((_, colIdx) => {
                                    const state = grid[rowIdx][colIdx];
                                    return (
                                        <motion.button
                                            key={colIdx}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleCellClick(rowIdx, colIdx)}
                                            disabled={isSolved}
                                            className={`
                        w-16 h-16 border border-glass-border rounded-lg m-0.5
                        flex items-center justify-center transition-all duration-200
                        ${state === "empty" && "bg-white/5 hover:bg-white/10"}
                        ${state === "false" && "bg-red-500/20 border-red-500/50"}
                        ${state === "true" && "bg-green-500/20 border-green-500/50"}
                        ${isSolved && "cursor-not-allowed"}
                      `}
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                key={state}
                                            >
                                                {state === "false" && (
                                                    <X className="w-8 h-8 text-red-500" strokeWidth={3} />
                                                )}
                                                {state === "true" && (
                                                    <Circle className="w-8 h-8 text-green-500" strokeWidth={3} />
                                                )}
                                            </motion.div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend & Reset */}
            <div className="mt-6 flex justify-between items-center">
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <X className="w-4 h-4 text-red-500" /> Not possible
                    </span>
                    <span className="flex items-center gap-1">
                        <Circle className="w-4 h-4 text-green-500" /> Confirmed
                    </span>
                </div>
                <div className="text-sm text-muted-foreground">
                    Hints used: {hintsUsed}
                </div>
            </div>

            {/* Win Modal */}
            <AnimatePresence>
                {isSolved && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="relative glass-card p-8 rounded-2xl border border-glass-border text-center w-full max-w-sm shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Puzzle Solved!</h2>
                            <p className="text-muted-foreground mb-2">
                                Time: <span className="text-primary font-bold">{formatTime(timer)}</span>
                            </p>
                            <p className="text-muted-foreground mb-6">
                                Hints used: <span className="text-yellow-500 font-bold">{hintsUsed}</span>
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={loadRandomPuzzle}
                                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" /> Play Again
                                </button>
                                <button
                                    onClick={() => window.location.href = '/games'}
                                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Go Back
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default LogicGridBoard;
