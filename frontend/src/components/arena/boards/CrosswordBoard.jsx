import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CROSSWORD_LEVELS } from "../../../utils/CrosswordData";
import { Timer, Lightbulb, CheckCircle, ArrowRight, RotateCcw } from "lucide-react";

const CrosswordBoard = () => {
    const [levelIndex, setLevelIndex] = useState(0);
    const [board, setBoard] = useState([]);
    const [clues, setClues] = useState({ across: [], down: [] });
    const [selected, setSelected] = useState(null);
    const [direction, setDirection] = useState("across");
    const [currentClue, setCurrentClue] = useState({ number: 0, clue: "" }); // Init safe default
    const [timer, setTimer] = useState(0);
    const [isSolved, setIsSolved] = useState(false);

    // Load Level
    useEffect(() => {
        const level = CROSSWORD_LEVELS[levelIndex];
        // Deep copy grid to avoid mutation ref issues
        const newBoard = level.grid.map(row => row.map(cell => ({ ...cell, letter: "" })));
        setBoard(newBoard);
        setClues(level.clues);
        setTimer(0);
        setIsSolved(false);
        setSelected({ row: 0, col: 0 }); // Reset selection
        // Find first clue
        setCurrentClue(level.clues.across[0] || { number: 0, clue: "Start solving!" });
    }, [levelIndex]);

    // Timer
    useEffect(() => {
        if (isSolved) return;
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [isSolved]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const checkWin = useCallback(() => {
        if (board.length === 0) return;

        let allCorrect = true;
        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board[r].length; c++) {
                const cell = board[r][c];
                if (!cell.isBlack && cell.letter !== cell.answer) {
                    allCorrect = false;
                    break;
                }
            }
        }
        if (allCorrect) setIsSolved(true);
    }, [board]);

    useEffect(() => {
        checkWin();
    }, [board, checkWin]);

    const revealHint = () => {
        if (!selected || isSolved) return;
        const { row, col } = selected;
        if (board[row][col].isBlack || board[row][col].letter === board[row][col].answer) return;

        const newBoard = [...board.map(r => [...r])];
        newBoard[row][col].letter = newBoard[row][col].answer;
        setBoard(newBoard);
        // Penalty? maybe later
    };

    const nextLevel = () => {
        if (levelIndex < CROSSWORD_LEVELS.length - 1) {
            setLevelIndex(l => l + 1);
        } else {
            // Loop or finish
            setLevelIndex(0);
        }
    };

    const handleCellClick = (row, col) => {
        if (board[row][col].isBlack) return;

        if (selected?.row === row && selected?.col === col) {
            setDirection(d => d === "across" ? "down" : "across");
        }
        setSelected({ row, col });
    };

    const handleKeyDown = (e, row, col) => {
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

    const isHighlighted = (row, col) => {
        if (!selected) return false;
        if (direction === "across") return row === selected.row && !board[row][col].isBlack;
        return col === selected.col && !board[row][col].isBlack;
    };

    const currentLevelData = CROSSWORD_LEVELS[levelIndex];

    if (!board.length) return null; // Loading state

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-[calc(100vh-120px)] max-w-7xl mx-auto p-4 flex flex-col gap-4"
        >
            {/* Header controls */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-lg border border-glass-border">
                    <Timer className="w-4 h-4 text-primary" />
                    <span className="font-mono text-lg">{formatTime(timer)}</span>
                </div>
                <div className="text-sm font-bold text-muted-foreground">
                    Level {levelIndex + 1} / {CROSSWORD_LEVELS.length}: {currentLevelData?.title}
                </div>
                <button
                    onClick={revealHint}
                    className="flex items-center gap-2 bg-yellow-500/20 text-yellow-500 px-3 py-1.5 rounded-lg hover:bg-yellow-500/30 transition-colors"
                >
                    <Lightbulb className="w-4 h-4" /> Hint
                </button>
            </div>

            {/* Clue Bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl px-4 py-3 mb-4 border border-glass-border"
            >
                <span className="text-primary font-bold">{currentClue?.number} {direction === "across" ? "Across" : "Down"}:</span>
                <span className="ml-2 text-muted-foreground">{currentClue?.clue}</span>
            </motion.div>

            {/* Main Content */}
            <div className="flex flex-1 gap-6 min-h-0">
                {/* Board */}
                <div className="flex-1 flex items-center justify-center min-w-0">
                    <div className="relative aspect-square max-h-full w-full max-w-[800px]">
                        <div className="absolute inset-0 blur-3xl opacity-20">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-blue-500/40" />
                        </div>
                        <div className="relative glass-card rounded-2xl p-4 border border-glass-border h-full w-full flex items-center justify-center bg-black/40">
                            <div className="grid gap-1 w-full h-full" style={{ gridTemplateColumns: `repeat(${board[0].length}, 1fr)` }}>
                                {board.map((row, rowIdx) =>
                                    row.map((cell, colIdx) => (
                                        <motion.div
                                            key={`${rowIdx}-${colIdx}`}
                                            whileHover={!cell.isBlack ? { scale: 1.05 } : {}}
                                            onClick={() => handleCellClick(rowIdx, colIdx)}
                                            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                                            tabIndex={cell.isBlack ? -1 : 0}
                                            className={`
                                                w-full h-full relative flex items-center justify-center
                                                font-bold transition-all duration-200 outline-none select-none
                                                text-[min(4vw,2.5rem)] leading-none rounded-sm
                                                ${cell.isBlack
                                                    ? "bg-white/5" // Lighter empty cells for contrast
                                                    : selected?.row === rowIdx && selected?.col === colIdx
                                                        ? "bg-yellow-500/40 border-2 border-yellow-500 z-10"
                                                        : isHighlighted(rowIdx, colIdx)
                                                            ? "bg-blue-500/20 border border-blue-500/50"
                                                            : "bg-white/10 border border-glass-border hover:bg-white/20"
                                                }
                                                ${!cell.isBlack && "cursor-pointer"}
                                            `}
                                        >
                                            {cell.number && (
                                                <span className="absolute top-0.5 left-0.5 text-[0.4em] text-muted-foreground leading-none">
                                                    {cell.number}
                                                </span>
                                            )}
                                            <span className={cell.letter === cell.answer ? "text-green-400" : "text-white"}>
                                                {cell.letter}
                                            </span>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clues Sidebar */}
                <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="glass-card rounded-xl p-4 border border-glass-border">
                        <h3 className="font-bold text-primary mb-2 sticky top-0 bg-black/50 backdrop-blur-md p-2 rounded-lg z-10">Across</h3>
                        {clues.across.map(clue => (
                            <div
                                key={clue.number}
                                className={`mb-2 p-2 rounded-lg transition-colors cursor-pointer ${currentClue?.number === clue.number && direction === 'across' ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5'}`}
                                onClick={() => { setCurrentClue(clue); setDirection('across'); }}
                            >
                                <span className="font-bold text-foreground mr-2">{clue.number}.</span>
                                <span className="text-muted-foreground text-sm">{clue.clue}</span>
                            </div>
                        ))}
                    </div>
                    <div className="glass-card rounded-xl p-4 border border-glass-border">
                        <h3 className="font-bold text-primary mb-2 sticky top-0 bg-black/50 backdrop-blur-md p-2 rounded-lg z-10">Down</h3>
                        {clues.down.map((clue, i) => (
                            <div
                                key={i}
                                className={`mb-2 p-2 rounded-lg transition-colors cursor-pointer ${currentClue?.number === clue.number && direction === 'down' ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5'}`}
                                onClick={() => { setCurrentClue(clue); setDirection('down'); }}
                            >
                                <span className="font-bold text-foreground mr-2">{clue.number}.</span>
                                <span className="text-muted-foreground text-sm">{clue.clue}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Win Modal */}
            <AnimatePresence>
                {isSolved && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl" />
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="relative glass-card p-8 rounded-2xl border border-glass-border text-center w-full max-w-sm shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Puzzle Solved!</h2>
                            <p className="text-muted-foreground mb-6">Time: <span className="text-primary font-bold">{formatTime(timer)}</span></p>

                            <div className="space-y-3">
                                <button
                                    onClick={nextLevel}
                                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    Next Level <ArrowRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setLevelIndex(0)} // Reset cycle
                                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" /> Replay
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CrosswordBoard;
