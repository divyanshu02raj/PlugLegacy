import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";

const TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump!",
  "The five boxing wizards jump quickly.",
  "Sphinx of black quartz, judge my vow.",
  "Two driven jocks help fax my big quiz.",
];

const TypingRaceBoard = () => {
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [finished, setFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const startGame = () => {
    const newText = TEXTS[Math.floor(Math.random() * TEXTS.length)];
    setText(newText);
    setUserInput("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setFinished(false);
    setProgress(0);
    setIsPlaying(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPlaying || finished) return;
    
    const value = e.target.value;
    
    if (!startTime && value.length === 1) {
      setStartTime(Date.now());
    }

    setUserInput(value);

    // Calculate progress
    let correctChars = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === text[i]) correctChars++;
    }
    
    setProgress((correctChars / text.length) * 100);
    setAccuracy(value.length > 0 ? Math.round((correctChars / value.length) * 100) : 100);

    // Calculate WPM
    if (startTime) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
      const wordsTyped = correctChars / 5; // standard: 5 chars = 1 word
      setWpm(Math.round(wordsTyped / timeElapsed) || 0);
    }

    // Check if finished
    if (value === text) {
      setFinished(true);
      setIsPlaying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Stats */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="glass-card px-4 py-2 rounded-xl border border-glass-border">
            <span className="text-xs text-muted-foreground">WPM</span>
            <motion.p 
              key={wpm}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-primary"
            >
              {wpm}
            </motion.p>
          </div>
          <div className="glass-card px-4 py-2 rounded-xl border border-glass-border">
            <span className="text-xs text-muted-foreground">Accuracy</span>
            <p className={`text-2xl font-bold ${accuracy >= 95 ? "text-green-400" : accuracy >= 80 ? "text-yellow-400" : "text-red-400"}`}>
              {accuracy}%
            </p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="btn-glow px-4 py-2 rounded-xl flex items-center gap-2"
        >
          {isPlaying || finished ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying || finished ? "Restart" : "Start"}
        </motion.button>
      </div>

      {/* Race Track */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-2xl">🏎️</span>
          <div className="flex-1 h-4 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-yellow-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <span className="text-2xl">🏁</span>
        </div>
      </div>

      {/* Text Display */}
      <div className="relative mb-6">
        <div className="absolute inset-0 blur-3xl opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/40 via-transparent to-primary/40" />
        </div>

        <div className="relative glass-card rounded-2xl p-6 border border-glass-border">
          {isPlaying || finished ? (
            <div className="text-2xl md:text-3xl leading-relaxed font-mono">
              {text.split("").map((char, idx) => {
                let className = "text-muted-foreground/50";
                if (idx < userInput.length) {
                  className = userInput[idx] === char ? "text-green-400" : "text-red-500 bg-red-500/20";
                } else if (idx === userInput.length) {
                  className = "text-foreground border-b-2 border-primary animate-pulse";
                }
                return (
                  <span key={idx} className={className}>
                    {char}
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xl text-muted-foreground">Press Start to begin typing!</p>
              <p className="text-sm text-muted-foreground mt-2">Type the text as fast and accurately as you can</p>
            </div>
          )}
        </div>
      </div>

      {/* Input (hidden but functional) */}
      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={handleInput}
        className="opacity-0 absolute"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {/* Click to focus hint */}
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
          onClick={() => inputRef.current?.focus()}
        >
          <p className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            Click here or start typing...
          </p>
        </motion.div>
      )}

      {/* Results */}
      {finished && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 glass-card rounded-xl p-6 border border-green-500/50 bg-green-500/10 text-center"
        >
          <p className="text-2xl font-bold text-green-400 mb-2">🎉 Completed!</p>
          <div className="flex justify-center gap-8">
            <div>
              <p className="text-3xl font-bold text-primary">{wpm}</p>
              <p className="text-sm text-muted-foreground">WPM</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-400">{accuracy}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TypingRaceBoard;
