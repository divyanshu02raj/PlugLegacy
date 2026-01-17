import { useState } from "react";
import { motion } from "framer-motion";
import { X, Circle } from "lucide-react";

const CATEGORIES = {
    rows: ["Alice", "Bob", "Carol"],
    cols: ["Red", "Blue", "Green"],
};

const CLUES = [
    "Alice doesn't like red.",
    "Bob's favorite isn't green.",
    "Carol loves blue.",
];

const LogicGridBoard = () => {
    const [grid, setGrid] = useState(
        Array(CATEGORIES.rows.length).fill(null).map(() =>
            Array(CATEGORIES.cols.length).fill("empty")
        )
    );

    const handleCellClick = (row, col) => {
        setGrid(prev => {
            const newGrid = prev.map(r => [...r]);
            const current = newGrid[row][col];

            if (current === "empty") newGrid[row][col] = "false";
            else if (current === "false") newGrid[row][col] = "true";
            else newGrid[row][col] = "empty";

            return newGrid;
        });
    };

    const resetGrid = () => {
        setGrid(Array(CATEGORIES.rows.length).fill(null).map(() =>
            Array(CATEGORIES.cols.length).fill("empty")
        ));
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl mx-auto"
        >
            {/* Clues */}
            <div className="glass-card rounded-xl p-4 mb-6 border border-glass-border">
                <h3 className="font-bold text-primary mb-2">🔍 Clues</h3>
                <ul className="space-y-1">
                    {CLUES.map((clue, i) => (
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
                            {CATEGORIES.cols.map(col => (
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
                        {CATEGORIES.rows.map((row, rowIdx) => (
                            <div key={row} className="flex items-center">
                                <div className="w-24 pr-2 text-right text-sm font-medium text-foreground">
                                    {row}
                                </div>
                                {CATEGORIES.cols.map((_, colIdx) => {
                                    const state = grid[rowIdx][colIdx];
                                    return (
                                        <motion.button
                                            key={colIdx}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleCellClick(rowIdx, colIdx)}
                                            className={`
                        w-16 h-16 border border-glass-border rounded-lg m-0.5
                        flex items-center justify-center transition-all duration-200
                        ${state === "empty" && "bg-white/5 hover:bg-white/10"}
                        ${state === "false" && "bg-red-500/20 border-red-500/50"}
                        ${state === "true" && "bg-green-500/20 border-green-500/50"}
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
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGrid}
                    className="px-4 py-2 rounded-xl glass-card border border-glass-border hover:border-primary/50"
                >
                    Reset
                </motion.button>
            </div>
        </motion.div>
    );
};

export default LogicGridBoard;
