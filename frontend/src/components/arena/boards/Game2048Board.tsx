import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Tile = {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
};

const GRID_SIZE = 4;

const getTileColor = (value: number): string => {
  const colors: Record<number, string> = {
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
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [tileId, setTileId] = useState(0);

  const addRandomTile = useCallback((currentTiles: Tile[]): Tile[] => {
    const emptyCells: {row: number; col: number}[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!currentTiles.find(t => t.row === r && t.col === c)) {
          emptyCells.push({row: r, col: c});
        }
      }
    }
    if (emptyCells.length === 0) return currentTiles;

    const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newTile: Tile = {
      id: tileId,
      value: Math.random() < 0.9 ? 2 : 4,
      row: cell.row,
      col: cell.col,
      isNew: true,
    };
    setTileId(prev => prev + 1);
    return [...currentTiles, newTile];
  }, [tileId]);

  useEffect(() => {
    setTiles(addRandomTile(addRandomTile([])));
  }, []);

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setTiles(prev => {
      let newTiles = prev.map(t => ({...t, isNew: false, isMerged: false}));
      let scoreAdd = 0;
      let moved = false;

      const sortTiles = (tiles: Tile[]) => {
        if (direction === 'up') return [...tiles].sort((a, b) => a.row - b.row);
        if (direction === 'down') return [...tiles].sort((a, b) => b.row - a.row);
        if (direction === 'left') return [...tiles].sort((a, b) => a.col - b.col);
        return [...tiles].sort((a, b) => b.col - a.col);
      };

      for (let line = 0; line < GRID_SIZE; line++) {
        let lineTiles: Tile[];
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
    const handleKeyDown = (e: KeyboardEvent) => {
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

      {/* Instructions */}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">Arrow Keys</kbd> to move tiles
      </p>
    </motion.div>
  );
};

export default Game2048Board;
