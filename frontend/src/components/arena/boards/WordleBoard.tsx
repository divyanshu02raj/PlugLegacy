import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete } from "lucide-react";

type LetterState = "empty" | "filled" | "correct" | "present" | "absent";

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const TARGET_WORD = "REACT"; // Sample word

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

const WordleBoard = () => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [letterStates, setLetterStates] = useState<Record<string, LetterState>>({});
  const [isRevealing, setIsRevealing] = useState(false);
  const [shakeRow, setShakeRow] = useState(-1);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH || isRevealing) return;
    
    setIsRevealing(true);
    const newLetterStates = { ...letterStates };

    currentGuess.split("").forEach((letter, i) => {
      setTimeout(() => {
        if (TARGET_WORD[i] === letter) {
          newLetterStates[letter] = "correct";
        } else if (TARGET_WORD.includes(letter) && newLetterStates[letter] !== "correct") {
          newLetterStates[letter] = "present";
        } else if (!newLetterStates[letter]) {
          newLetterStates[letter] = "absent";
        }
        setLetterStates({ ...newLetterStates });
      }, i * 300);
    });

    setTimeout(() => {
      setGuesses(prev => [...prev, currentGuess]);
      setCurrentGuess("");
      setIsRevealing(false);
    }, WORD_LENGTH * 300 + 200);
  }, [currentGuess, isRevealing, letterStates]);

  const handleKeyPress = useCallback((key: string) => {
    if (isRevealing) return;
    if (guesses.length >= MAX_ATTEMPTS) return;

    if (key === "ENTER") {
      if (currentGuess.length === WORD_LENGTH) {
        submitGuess();
      } else {
        setShakeRow(guesses.length);
        setTimeout(() => setShakeRow(-1), 500);
      }
    } else if (key === "⌫" || key === "BACKSPACE") {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + key);
    }
  }, [currentGuess, guesses.length, isRevealing, submitGuess]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyPress(e.key.toUpperCase());
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  const getLetterState = (guess: string, index: number): LetterState => {
    const letter = guess[index];
    if (TARGET_WORD[index] === letter) return "correct";
    if (TARGET_WORD.includes(letter)) return "present";
    return "absent";
  };

  const getStateStyles = (state: LetterState) => {
    switch (state) {
      case "correct": return "bg-green-600 border-green-600 text-white";
      case "present": return "bg-yellow-600 border-yellow-600 text-white";
      case "absent": return "bg-slate-700 border-slate-700 text-white";
      case "filled": return "border-white/30 bg-white/5";
      default: return "border-glass-border bg-transparent";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Board */}
      <div className="space-y-1.5 mb-8">
        {Array(MAX_ATTEMPTS).fill(null).map((_, rowIdx) => {
          const isCurrentRow = rowIdx === guesses.length;
          const guess = guesses[rowIdx] || (isCurrentRow ? currentGuess : "");
          const isRevealed = rowIdx < guesses.length;

          return (
            <motion.div
              key={rowIdx}
              animate={shakeRow === rowIdx ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex justify-center gap-1.5"
            >
              {Array(WORD_LENGTH).fill(null).map((_, colIdx) => {
                const letter = guess[colIdx] || "";
                const state: LetterState = isRevealed 
                  ? getLetterState(guess, colIdx) 
                  : letter ? "filled" : "empty";

                return (
                  <motion.div
                    key={colIdx}
                    initial={false}
                    animate={isRevealed && rowIdx === guesses.length - 1 ? {
                      rotateX: [0, 90, 0],
                    } : {}}
                    transition={{ delay: colIdx * 0.3, duration: 0.5 }}
                    className={`
                      w-12 h-12 md:w-14 md:h-14 border-2 rounded-lg
                      flex items-center justify-center font-bold text-2xl
                      transition-all duration-300 ${getStateStyles(state)}
                    `}
                  >
                    <motion.span
                      initial={letter && !isRevealed ? { scale: 1.2 } : false}
                      animate={{ scale: 1 }}
                    >
                      {letter}
                    </motion.span>
                  </motion.div>
                );
              })}
            </motion.div>
          );
        })}
      </div>

      {/* Keyboard */}
      <div className="space-y-1.5">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1">
            {row.map(key => {
              const state = letterStates[key] || "empty";
              const isWide = key === "ENTER" || key === "⌫";

              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleKeyPress(key)}
                  className={`
                    ${isWide ? "px-3 md:px-4" : "w-8 md:w-10"} h-12 rounded-lg font-bold text-sm
                    flex items-center justify-center transition-all
                    ${state === "correct" ? "bg-green-600 text-white" :
                      state === "present" ? "bg-yellow-600 text-white" :
                      state === "absent" ? "bg-slate-700 text-white" :
                      "glass-card border border-glass-border hover:bg-white/10"}
                  `}
                >
                  {key === "⌫" ? <Delete className="w-5 h-5" /> : key}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default WordleBoard;
