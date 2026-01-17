import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";

const ICONS = ["🍎", "🚀", "🐶", "🎸", "🌟", "🎮", "🍕", "🌈", "🦋", "🎯", "🔥", "💎", "🎪", "🌺", "🎭", "🍀", "🦊", "🌙"];

type Card = {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const MemoryMatchBoard = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const initGame = () => {
    const selectedIcons = ICONS.slice(0, 18);
    const pairs = [...selectedIcons, ...selectedIcons];
    const shuffled = shuffleArray(pairs);
    
    setCards(shuffled.map((icon, idx) => ({
      id: idx,
      icon,
      isFlipped: false,
      isMatched: false,
    })));
    setFlippedCards([]);
    setMoves(0);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (id: number) => {
    if (isLocked) return;
    if (cards[id].isFlipped || cards[id].isMatched) return;
    if (flippedCards.length === 2) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsLocked(true);

      const [first, second] = newFlipped;
      if (cards[first].icon === cards[second].icon) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          setIsLocked(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const matchedCount = cards.filter(c => c.isMatched).length / 2;
  const totalPairs = cards.length / 2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl mx-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <div className="glass-card px-3 py-1.5 rounded-lg border border-glass-border">
            <span className="text-xs text-muted-foreground">Moves</span>
            <p className="text-lg font-bold">{moves}</p>
          </div>
          <div className="glass-card px-3 py-1.5 rounded-lg border border-glass-border">
            <span className="text-xs text-muted-foreground">Matched</span>
            <p className="text-lg font-bold text-green-400">{matchedCount}/{totalPairs}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={initGame}
          className="p-2 rounded-xl glass-card border border-glass-border hover:border-primary/50"
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Board */}
      <div className="relative">
        <div className="absolute inset-0 blur-3xl opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/40 via-transparent to-purple-500/40" />
        </div>

        <div className="relative glass-card rounded-2xl p-3 border border-glass-border">
          <div className="grid grid-cols-6 gap-2">
            {cards.map(card => (
              <motion.div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className="aspect-square cursor-pointer perspective-1000"
              >
                <motion.div
                  animate={{ 
                    rotateY: card.isFlipped || card.isMatched ? 180 : 0,
                  }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full preserve-3d"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Back (hidden state) */}
                  <div 
                    className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/80 to-primary/40 border border-primary/30 flex items-center justify-center backface-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <span className="text-2xl opacity-50">?</span>
                  </div>

                  {/* Front (revealed state) */}
                  <motion.div 
                    className={`
                      absolute inset-0 rounded-lg flex items-center justify-center backface-hidden
                      ${card.isMatched 
                        ? "bg-green-500/20 border-2 border-green-500" 
                        : "bg-white/10 border border-glass-border"
                      }
                    `}
                    style={{ 
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                    animate={card.isMatched ? { scale: [1, 1.1, 1] } : {}}
                  >
                    <span className="text-2xl md:text-3xl">{card.icon}</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Win message */}
      <AnimatePresence>
        {matchedCount === totalPairs && totalPairs > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 text-center glass-card p-4 rounded-xl border border-green-500/50 bg-green-500/10"
          >
            <p className="text-xl font-bold text-green-400">🎉 You Won!</p>
            <p className="text-muted-foreground">Completed in {moves} moves</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MemoryMatchBoard;
