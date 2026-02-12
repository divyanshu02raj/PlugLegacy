import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CROSSWORD_LEVELS } from "../../../utils/CrosswordData";
import { Timer, Lightbulb, CheckCircle, ArrowRight, RotateCcw, ArrowLeft } from "lucide-react";
import { userService, authService } from "../../../services/api";

const CrosswordBoard = () => {
    const [currentPuzzle, setCurrentPuzzle] = useState(null);
    const [board, setBoard] = useState([]);
    const [clues, setClues] = useState({ across: [], down: [] });
    const [selected, setSelected] = useState({ row: 0, col: 0 });
    const [direction, setDirection] = useState("across"); // "across" or "down"
    const [currentClue, setCurrentClue] = useState([]); // Array to support highlighting multiple clues at intersections
    const [timer, setTimer] = useState(0);
    const [isSolved, setIsSolved] = useState(false);
    const cellRefs = useRef({});
    const hasSavedRef = useRef(false);

    // Sync Focus with Selection
    useEffect(() => {
        if (selected && !isSolved) {
            const key = `${selected.row}-${selected.col}`;
            const el = cellRefs.current[key];
            if (el) {
                el.focus();
            }
        }
    }, [selected, isSolved]);

    // Effect to update current clues when selection changes
    useEffect(() => {
        if (!selected || board.length === 0) return;
        const { row, col } = selected;
        // Safety check for bounds
        if (row >= board.length || col >= board[0].length) return;
        if (board[row][col].isBlack) return;

        const foundClues = [];

        // Search for across clue
        let acrossClueNum = null;
        for (let c = col; c >= 0 && !board[row][c].isBlack; c--) {
            if (board[row][c].number) {
                const num = board[row][c].number;
                // Verify this number corresponds to an actual Across clue
                if (clues.across.some(clue => clue.number === num)) {
                    acrossClueNum = num;
                    break;
                }
            }
        }
        if (acrossClueNum) {
            const acrossClue = clues.across.find(c => c.number === acrossClueNum);
            if (acrossClue) {
                foundClues.push({ ...acrossClue, direction: 'across' });
            }
        }

        // Search for down clue
        let downClueNum = null;
        for (let r = row; r >= 0 && !board[r][col].isBlack; r--) {
            if (board[r][col].number) {
                const num = board[r][col].number;
                // Verify this number corresponds to an actual Down clue
                if (clues.down.some(clue => clue.number === num)) {
                    downClueNum = num;
                    break;
                }
            }
        }
        if (downClueNum) {
            const downClue = clues.down.find(c => c.number === downClueNum);
            if (downClue) {
                foundClues.push({ ...downClue, direction: 'down' });
            }
        }

        setCurrentClue(foundClues);
    }, [selected, board, clues]);

    // Load Random Puzzle with Smart Rotation
    const loadRandomPuzzle = useCallback(() => {
        // Get visited puzzle IDs from localStorage
        const visitedPuzzlesStr = localStorage.getItem('crossword_visited_puzzles');
        let visitedPuzzles = visitedPuzzlesStr ? JSON.parse(visitedPuzzlesStr) : [];

        // If all puzzles have been visited, reset the cycle
        if (visitedPuzzles.length >= CROSSWORD_LEVELS.length) {
            visitedPuzzles = [];
            localStorage.setItem('crossword_visited_puzzles', JSON.stringify([]));
        }

        // Get available (not yet visited) puzzles
        const availablePuzzles = CROSSWORD_LEVELS.filter(
            level => !visitedPuzzles.includes(level.id)
        );

        // Pick a random puzzle from available ones
        const randomIndex = Math.floor(Math.random() * availablePuzzles.length);
        const level = availablePuzzles[randomIndex];

        setCurrentPuzzle(level);
        // Deep copy grid to avoid mutation ref issues
        const newBoard = level.grid.map(row => row.map(cell => ({ ...cell, letter: "" })));
        setBoard(newBoard);
        setClues(level.clues);
        setTimer(0);
        setIsSolved(false);
        hasSavedRef.current = false; // Reset save flag
        setSelected({ row: 0, col: 0 }); // Reset selection
        // Find first clue
        setCurrentClue(level.clues.across[0] || { number: 0, clue: "Start solving!" });

        // Mark puzzle as visited immediately when loaded
        if (!visitedPuzzles.includes(level.id)) {
            visitedPuzzles.push(level.id);
            localStorage.setItem('crossword_visited_puzzles', JSON.stringify(visitedPuzzles));
        }
    }, []);

    // Load puzzle on mount
    useEffect(() => {
        loadRandomPuzzle();
    }, [loadRandomPuzzle]);

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

    // Save Match when Solved
    useEffect(() => {
        if (isSolved && !hasSavedRef.current) {
            hasSavedRef.current = true;
            const user = authService.getCurrentUser();
            if (user) {
                userService.saveMatch({
                    gameId: 'crossword',
                    result: 'win',
                    score: timer, // Time in seconds
                    players: [{ userId: user._id, result: 'win', score: timer }]
                }).catch(err => console.error("Failed to save match:", err));
            }
        }
    }, [isSolved, timer]);



    const checkWin = useCallback(() => {
        if (board.length === 0 || !currentPuzzle) return;

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

        if (allCorrect && !isSolved) {
            setIsSolved(true);
        }
    }, [board, currentPuzzle, isSolved]);

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

    const handleCellClick = (row, col) => {
        if (board[row][col].isBlack) return;

        if (selected?.row === row && selected?.col === col) {
            setDirection(d => d === "across" ? "down" : "across");
        }
        setSelected({ row, col });
    };

    const moveSelection = (targetRow, targetCol) => {
        const numRows = board.length;
        const numCols = board[0].length;

        let newRow = targetRow;
        let newCol = targetCol;

        // Handle out of bounds
        if (newRow < 0 || newRow >= numRows || newCol < 0 || newCol >= numCols) {
            return; // Don't move if out of bounds
        }

        // Skip black cells
        while (board[newRow][newCol].isBlack) {
            if (direction === "across") {
                newCol++;
                if (newCol >= numCols) {
                    newCol = 0;
                    newRow++;
                }
            } else { // direction === "down"
                newRow++;
                if (newRow >= numRows) {
                    newRow = 0;
                    newCol++;
                }
            }
            // If we've wrapped around the entire board and still hit black cells, stop
            if (newRow === targetRow && newCol === targetCol) break; // Avoid infinite loop
            if (newRow >= numRows || newCol >= numCols) return; // Reached end of board
        }

        if (!board[newRow][newCol].isBlack) {
            setSelected({ row: newRow, col: newCol });
        }
    };

    const handleKeyDown = (e, row, col) => {
        if (board[row][col].isBlack) return;

        // Backspace: Delete current or move back and delete
        if (e.key === "Backspace") {
            e.preventDefault();
            const newBoard = [...board.map(r => [...r])];

            // If current cell has a letter, delete it
            if (newBoard[row][col].letter !== "") {
                newBoard[row][col].letter = "";
                setBoard(newBoard);
            } else {
                // If empty, move back and delete the previous cell
                if (direction === "across") {
                    let prevCol = col - 1;
                    while (prevCol >= 0 && board[row][prevCol].isBlack) prevCol--; // Skip black
                    if (prevCol >= 0) {
                        newBoard[row][prevCol].letter = "";
                        setBoard(newBoard);
                        setSelected({ row: row, col: prevCol });
                    }
                } else { // direction === "down"
                    let prevRow = row - 1;
                    while (prevRow >= 0 && board[prevRow][col].isBlack) prevRow--; // Skip black
                    if (prevRow >= 0) {
                        newBoard[prevRow][col].letter = "";
                        setBoard(newBoard);
                        setSelected({ row: prevRow, col: col });
                    }
                }
            }
            return;
        }

        // Tab: Cycle through valid cells
        if (e.key === "Tab") {
            e.preventDefault();
            const flattened = [];
            board.forEach((r, rIdx) => r.forEach((c, cIdx) => {
                if (!c.isBlack) flattened.push({ r: rIdx, c: cIdx });
            }));

            const currIdx = flattened.findIndex(x => x.r === row && x.c === col);
            if (currIdx !== -1) {
                const step = e.shiftKey ? -1 : 1;
                const nextIdx = (currIdx + step + flattened.length) % flattened.length;
                const next = flattened[nextIdx];
                setSelected({ row: next.r, col: next.c });
            }
            return;
        }

        // Arrows: Navigation
        if (e.key.startsWith("Arrow")) {
            e.preventDefault();
            if (e.key === "ArrowRight") moveSelection(row, col + 1);
            if (e.key === "ArrowLeft") moveSelection(row, col - 1);
            if (e.key === "ArrowUp") moveSelection(row - 1, col);
            if (e.key === "ArrowDown") moveSelection(row + 1, col);
            return;
        }

        // Letters: Input and Auto-Advance
        if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
            const newBoard = [...board.map(r => [...r])];
            newBoard[row][col].letter = e.key.toUpperCase();
            setBoard(newBoard);

            // Auto-advance logic
            if (direction === "across") {
                let nextCol = col + 1;
                while (nextCol < board[0].length && board[row][nextCol].isBlack) {
                    nextCol++;
                }
                if (nextCol < board[0].length && !board[row][nextCol].isBlack) {
                    setSelected({ row, col: nextCol });
                }
            } else { // direction === "down"
                let nextRow = row + 1;
                while (nextRow < board.length && board[nextRow][col].isBlack) {
                    nextRow++;
                }
                if (nextRow < board.length && !board[nextRow][col].isBlack) {
                    setSelected({ row: nextRow, col });
                }
            }
        }
    };

    const isHighlighted = (row, col) => {
        if (!selected) return false;
        if (board[row][col].isBlack) return false;

        // Determine which directions to highlight based on active clues
        let highlightAcross = false;
        let highlightDown = false;

        if (Array.isArray(currentClue) && currentClue.length > 0) {
            // Check if we have active clues for each direction
            highlightAcross = currentClue.some(c => c.direction === 'across');
            highlightDown = currentClue.some(c => c.direction === 'down');
        } else {
            // Fallback if currentClue is not an array (though it should be now)
            highlightAcross = direction === 'across';
            highlightDown = direction === 'down';
        }

        // Check ACROSS match
        if (highlightAcross) {
            if (row === selected.row) {
                // Find the start and end of the word containing the selected cell
                let startCol = selected.col;
                while (startCol > 0 && !board[row][startCol - 1].isBlack) {
                    startCol--;
                }
                let endCol = selected.col;
                while (endCol < board[row].length - 1 && !board[row][endCol + 1].isBlack) {
                    endCol++;
                }
                if (col >= startCol && col <= endCol) return true;
            }
        }

        // Check DOWN match
        if (highlightDown) {
            if (col === selected.col) {
                // Find the start and end of the word containing the selected cell
                let startRow = selected.row;
                while (startRow > 0 && !board[startRow - 1][col].isBlack) {
                    startRow--;
                }
                let endRow = selected.row;
                while (endRow < board.length - 1 && !board[endRow + 1][col].isBlack) {
                    endRow++;
                }
                if (row >= startRow && row <= endRow) return true;
            }
        }

        return false;
    };



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
                    {currentPuzzle?.title}
                </div>
                <button
                    onClick={revealHint}
                    className="flex items-center gap-2 bg-yellow-500/20 text-yellow-500 px-3 py-1.5 rounded-lg hover:bg-yellow-500/30 transition-colors"
                >
                    <Lightbulb className="w-4 h-4" /> Hint
                </button>
            </div>


            {/* Main Content: Vertical Stack */}
            <div className="flex flex-col flex-1 min-h-0 gap-4 overflow-hidden">
                {/* Board - Centered and constrained to leave room for clues */}
                <div className="flex-1 flex items-start justify-center min-h-0 pt-2">
                    <div
                        className="relative max-h-full w-full max-w-[700px]"
                        style={{ aspectRatio: `${board[0].length} / ${board.length}` }}
                    >
                        <div className="absolute inset-0 blur-3xl opacity-20">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-blue-500/40" />
                        </div>
                        <div className="relative glass-card rounded-2xl p-4 border border-glass-border h-full w-full flex items-center justify-center bg-black/40">
                            <div className="grid gap-1 w-full h-full" style={{
                                gridTemplateColumns: `repeat(${board[0].length}, minmax(0, 1fr))`,
                                gridTemplateRows: `repeat(${board.length}, minmax(0, 1fr))`
                            }}>
                                {board.map((row, rowIdx) =>
                                    row.map((cell, colIdx) => (
                                        <motion.div
                                            key={`${rowIdx}-${colIdx}`}
                                            ref={(el) => (cellRefs.current[`${rowIdx}-${colIdx}`] = el)}
                                            whileHover={!cell.isBlack ? { scale: 1.05 } : {}}
                                            onClick={() => {
                                                if (!cell.isBlack) {
                                                    // Check if clicking the same cell (for toggling direction)
                                                    const isSameCell = selected?.row === rowIdx && selected?.col === colIdx;

                                                    // ALWAYS set selected first for immediate visual feedback
                                                    setSelected({ row: rowIdx, col: colIdx });

                                                    if (isSameCell) {
                                                        // Toggle direction
                                                        const newDirection = direction === 'across' ? 'down' : 'across';
                                                        setDirection(newDirection);
                                                    } else {
                                                        // Auto-detect direction based on available cells
                                                        const hasDownCell = rowIdx + 1 < board.length && !board[rowIdx + 1][colIdx].isBlack;
                                                        const hasAcrossCell = colIdx + 1 < board[rowIdx].length && !board[rowIdx][colIdx + 1].isBlack;

                                                        // Set direction based on available cells
                                                        if (hasDownCell && !hasAcrossCell) {
                                                            setDirection('down');
                                                        } else if (hasAcrossCell && !hasDownCell) {
                                                            setDirection('across');
                                                        } else if (hasDownCell && hasAcrossCell) {
                                                            // Both directions available - prefer down
                                                            setDirection('down');
                                                        }
                                                    }
                                                }
                                            }}
                                            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                                            tabIndex={cell.isBlack ? -1 : 0}
                                            className={`
                                                w-full h-full relative flex items-center justify-center
                                                font-bold transition-all duration-200 outline-none select-none
                                                text-[min(3vw,1.5rem)] md:text-[min(2vw,2rem)] leading-none rounded-sm
                                                ${cell.isBlack
                                                    ? "invisible" // Hide empty cells completely
                                                    : selected?.row === rowIdx && selected?.col === colIdx
                                                        ? "bg-yellow-500/50 border-4 border-yellow-400 shadow-lg shadow-yellow-500/50 z-10 scale-105"
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

                {/* Clues Section - Bottom Two Columns */}
                <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 px-2">
                    <div className="glass-card rounded-xl p-4 border border-glass-border bg-black/20">
                        <h3 className="font-bold text-primary mb-2 sticky top-0 bg-black/80 backdrop-blur-md p-2 rounded-lg z-10">Across</h3>
                        <div className="space-y-1">
                            {clues.across.map(clue => (
                                <div
                                    key={clue.number}
                                    className={`p-2 rounded-lg transition-colors cursor-pointer flex items-start gap-2 ${Array.isArray(currentClue) && currentClue.some(c => c.number === clue.number && c.direction === 'across') ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5'}`}
                                    onClick={() => { setCurrentClue([{ ...clue, direction: 'across' }]); setDirection('across'); }}
                                >
                                    <span className="font-bold text-foreground min-w-[1.5rem]">{clue.number}.</span>
                                    <span className="text-muted-foreground text-sm">{clue.clue}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-4 border border-glass-border bg-black/20">
                        <h3 className="font-bold text-primary mb-2 sticky top-0 bg-black/80 backdrop-blur-md p-2 rounded-lg z-10">Down</h3>
                        <div className="space-y-1">
                            {clues.down.map((clue, i) => (
                                <div
                                    key={i}
                                    className={`p-2 rounded-lg transition-colors cursor-pointer flex items-start gap-2 ${Array.isArray(currentClue) && currentClue.some(c => c.number === clue.number && c.direction === 'down') ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5'}`}
                                    onClick={() => { setCurrentClue([{ ...clue, direction: 'down' }]); setDirection('down'); }}
                                >
                                    <span className="font-bold text-foreground min-w-[1.5rem]">{clue.number}.</span>
                                    <span className="text-muted-foreground text-sm">{clue.clue}</span>
                                </div>
                            ))}
                        </div>
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

export default CrosswordBoard;
