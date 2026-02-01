import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { userService, authService } from "../../../services/api";


const GRID_SIZE = 4;

const getTileColor = (value) => {
    const colors = {
        2: "bg-slate-300 text-slate-900",
        4: "bg-slate-200 text-slate-900",
        8: "bg-orange-400 text-white",
        16: "bg-orange-500 text-white",
        32: "bg-orange-600 text-white",
        64: "bg-red-500 text-white",
        128: "bg-yellow-400 text-slate-900",
        256: "bg-yellow-500 text-white",
        512: "bg-yellow-600 text-white",
        1024: "bg-primary text-white",
        2048: "bg-gradient-to-br from-primary to-yellow-500 text-white",
    };
    return colors[value] || "bg-gradient-to-br from-purple-600 to-pink-600 text-white";
};

const Game2048Board = () => {
    const [tiles, setTiles] = useState([]);
    const [score, setScore] = useState(0);
    const tileIdRef = useRef(0);
    const [gameOver, setGameOver] = useState(false);
    const navigate = useNavigate();

    // Check for Game Over
    const checkGameOver = useCallback((currentTiles) => {
        if (currentTiles.length < 16) return false; // Not full

        // Check for possible merges
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const tile = currentTiles.find(t => t.row === r && t.col === c);
                if (!tile) return false; // Should not happen if length is 16 but safe check

                // Check right
                if (c < GRID_SIZE - 1) {
                    const right = currentTiles.find(t => t.row === r && t.col === c + 1);
                    if (right && right.value === tile.value) return false;
                }
                // Check down
                if (r < GRID_SIZE - 1) {
                    const down = currentTiles.find(t => t.row === r + 1 && t.col === c);
                    if (down && down.value === tile.value) return false;
                }
            }
        }
        return true;
    }, []);

    // Save Score on Game Over
    useEffect(() => {
        if (gameOver && score > 0) {
            userService.saveMatch({
                gameId: '2048',
                result: 'loss', // Single player is effectively 'practice' or just logging score
                score: score,
                players: [{ userId: authService.getCurrentUser()._id, result: 'win', score: score }] // Pseudo structure for profile
            }).catch(err => console.error("Failed to save stat:", err));
        }
    }, [gameOver, score]);

    useEffect(() => {
        if (tiles.length > 0 && checkGameOver(tiles)) {
            setGameOver(true);
        }
    }, [tiles, checkGameOver]);

    const addRandomTile = useCallback((currentTiles) => {
        const emptyCells = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (!currentTiles.find(t => t.row === r && t.col === c)) {
                    emptyCells.push({ row: r, col: c });
                }
            }
        }
        if (emptyCells.length === 0) return currentTiles;

        const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newTile = {
            id: tileIdRef.current++,
            value: Math.random() < 0.9 ? 2 : 4,
            row: cell.row,
            col: cell.col,
            isNew: true,
        };
        return [...currentTiles, newTile];
    }, []);

    useEffect(() => {
        setTiles(addRandomTile(addRandomTile([])));
    }, []);

    const move = useCallback((direction) => {
        setTiles(prev => {
            let newTiles = prev.map(t => ({ ...t, isNew: false, isMerged: false }));
            let scoreAdd = 0;
            let moved = false;

            const sortTiles = (tiles) => {
                if (direction === 'up') return [...tiles].sort((a, b) => a.row - b.row);
                if (direction === 'down') return [...tiles].sort((a, b) => b.row - a.row);
                if (direction === 'left') return [...tiles].sort((a, b) => a.col - b.col);
                return [...tiles].sort((a, b) => b.col - a.col);
            };

            for (let line = 0; line < GRID_SIZE; line++) {
                let lineTiles;
                if (direction === 'up' || direction === 'down') {
                    lineTiles = sortTiles(newTiles.filter(t => t.col === line));
                } else {
                    lineTiles = sortTiles(newTiles.filter(t => t.row === line));
                }

                let pos = direction === 'down' || direction === 'right' ? GRID_SIZE - 1 : 0;
                const step = direction === 'down' || direction === 'right' ? -1 : 1;

                for (let i = 0; i < lineTiles.length; i++) {
                    const tile = lineTiles[i];
                    const nextTile = lineTiles[i + 1];

                    if (nextTile && tile.value === nextTile.value && !tile.isMerged) {
                        // Merge
                        tile.value *= 2;
                        tile.isMerged = true;
                        scoreAdd += tile.value;
                        newTiles = newTiles.filter(t => t.id !== nextTile.id);
                        lineTiles.splice(i + 1, 1);
                    }

                    const oldPos = direction === 'up' || direction === 'down' ? tile.row : tile.col;
                    if (direction === 'up' || direction === 'down') {
                        if (tile.row !== pos) moved = true;
                        tile.row = pos;
                    } else {
                        if (tile.col !== pos) moved = true;
                        tile.col = pos;
                    }
                    pos += step;
                }
            }

            setScore(s => s + scoreAdd);
            if (moved) {
                return addRandomTile(newTiles);
            }
            return newTiles;
        });
    }, [addRandomTile]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowUp') move('up');
            else if (e.key === 'ArrowDown') move('down');
            else if (e.key === 'ArrowLeft') move('left');
            else if (e.key === 'ArrowRight') move('right');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [move]);

    const resetGame = () => {
        setTiles([]);
        setScore(0);
        setGameOver(false);
        setTimeout(() => setTiles(addRandomTile(addRandomTile([]))), 50);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto"
        >
            {/* Score */}
            <div className="flex justify-between items-center mb-4">
                <div className="glass-card px-4 py-2 rounded-xl border border-glass-border">
                    <span className="text-sm text-muted-foreground">Score</span>
                    <motion.p
                        key={score}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold text-primary"
                    >
                        {score}
                    </motion.p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="px-4 py-2 rounded-xl glass-card border border-glass-border hover:border-primary/50"
                >
                    New Game
                </motion.button>
            </div>

            {/* Board */}
            <div className="relative">
                <div className="absolute inset-0 blur-3xl opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/40 via-transparent to-primary/40" />
                </div>

                <div className="relative glass-card rounded-2xl p-3 border border-glass-border">
                    <div className="grid grid-cols-4 gap-2 aspect-square">
                        {/* Empty grid cells */}
                        {Array(16).fill(null).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-square rounded-lg bg-white/5"
                            />
                        ))}
                    </div>

                    {/* Animated Tiles */}
                    <div className="absolute inset-3">
                        <AnimatePresence>
                            {tiles.map(tile => (
                                <motion.div
                                    key={tile.id}
                                    initial={tile.isNew ? { scale: 0 } : false}
                                    animate={{
                                        x: `${tile.col * 100}%`,
                                        y: `${tile.row * 100}%`,
                                        scale: tile.isMerged ? [1, 1.2, 1] : 1,
                                    }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="absolute w-1/4 h-1/4 p-1"
                                >
                                    <div
                                        className={`w-full h-full rounded-lg flex items-center justify-center font-bold ${getTileColor(tile.value)} ${tile.value >= 128 ? 'shadow-lg shadow-primary/30' : ''}`}
                                        style={{ fontSize: tile.value >= 1000 ? '1rem' : tile.value >= 100 ? '1.25rem' : '1.5rem' }}
                                    >
                                        {tile.value}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Game Over Overlay */}
            <AnimatePresence>
                {gameOver && (
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
                            className="relative glass-card p-6 rounded-2xl border border-glass-border text-center w-full max-w-sm shadow-2xl"
                        >
                            <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
                            <p className="text-muted-foreground mb-6">Final Score: <span className="text-primary font-bold">{score}</span></p>

                            <div className="space-y-3">
                                <button
                                    onClick={resetGame}
                                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => navigate('/games')}
                                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                                >
                                    Back to Arena
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instructions */}
            <p className="mt-4 text-center text-sm text-muted-foreground">
                Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">Arrow Keys</kbd> to move tiles
            </p>
        </motion.div>
    );
};

export default Game2048Board;
