import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";

type GameState = "idle" | "waiting" | "ready" | "clicked" | "too-early";

const ReactionTimeBoard = () => {
  const [state, setState] = useState<GameState>("idle");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const readyTimeRef = useRef<number>(0);
  const timeoutRef = useRef<number>();

  const startTest = () => {
    setState("waiting");
    const delay = 2000 + Math.random() * 4000; // 2-6 seconds
    
    timeoutRef.current = window.setTimeout(() => {
      setState("ready");
      readyTimeRef.current = Date.now();
    }, delay);
  };

  const handleClick = () => {
    if (state === "idle") {
      startTest();
    } else if (state === "waiting") {
      clearTimeout(timeoutRef.current);
      setState("too-early");
    } else if (state === "ready") {
      const time = Date.now() - readyTimeRef.current;
      setReactionTime(time);
      setAttempts(prev => [...prev, time]);
      if (!bestTime || time < bestTime) {
        setBestTime(time);
      }
      setState("clicked");
    } else if (state === "too-early" || state === "clicked") {
      startTest();
    }
  };

  const reset = () => {
    setState("idle");
    setReactionTime(null);
    setAttempts([]);
    clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const averageTime = attempts.length > 0 
    ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length) 
    : null;

  const getBackgroundColor = () => {
    switch (state) {
      case "waiting": return "bg-red-600";
      case "ready": return "bg-green-500";
      case "too-early": return "bg-yellow-600";
      default: return "bg-slate-800";
    }
  };

  const getMessage = () => {
    switch (state) {
      case "idle": return { title: "Test Your Reflexes", subtitle: "Click to start" };
      case "waiting": return { title: "Wait for green...", subtitle: "Don't click yet!" };
      case "ready": return { title: "CLICK!", subtitle: "Now!" };
      case "too-early": return { title: "Too Early!", subtitle: "Click to try again" };
      case "clicked": return { 
        title: `${reactionTime} ms`, 
        subtitle: reactionTime! < 200 ? "Amazing! 🔥" : reactionTime! < 300 ? "Great! 👍" : "Good try!" 
      };
    }
  };

  const message = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Stats */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3">
          {bestTime && (
            <div className="glass-card px-3 py-1.5 rounded-lg border border-glass-border">
              <span className="text-xs text-muted-foreground">Best</span>
              <p className="text-lg font-bold text-green-400">{bestTime} ms</p>
            </div>
          )}
          {averageTime && (
            <div className="glass-card px-3 py-1.5 rounded-lg border border-glass-border">
              <span className="text-xs text-muted-foreground">Average</span>
              <p className="text-lg font-bold text-primary">{averageTime} ms</p>
            </div>
          )}
          <div className="glass-card px-3 py-1.5 rounded-lg border border-glass-border">
            <span className="text-xs text-muted-foreground">Attempts</span>
            <p className="text-lg font-bold">{attempts.length}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          className="p-2 rounded-xl glass-card border border-glass-border hover:border-primary/50"
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Main Click Area */}
      <motion.div
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative rounded-3xl cursor-pointer overflow-hidden
          transition-colors duration-200 ${getBackgroundColor()}
        `}
        style={{ aspectRatio: "16/10" }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <h2 className={`text-4xl md:text-6xl font-bold mb-2 ${
                state === "clicked" ? "text-white" : "text-white"
              }`}>
                {state === "clicked" && (
                  <motion.span
                    initial={{ scale: 2 }}
                    animate={{ scale: 1 }}
                    className="inline-block"
                  >
                    ⚡
                  </motion.span>
                )}
                {message.title}
              </h2>
              <p className="text-xl text-white/80">{message.subtitle}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Animated ring for ready state */}
        {state === "ready" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute inset-0 m-auto w-32 h-32 rounded-full border-4 border-white"
          />
        )}
      </motion.div>

      {/* Attempt History */}
      {attempts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <p className="text-sm text-muted-foreground mb-2">Recent attempts:</p>
          <div className="flex flex-wrap gap-2">
            {attempts.slice(-10).map((time, idx) => (
              <motion.span
                key={idx}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`
                  px-3 py-1 rounded-full text-sm font-mono
                  ${time === bestTime 
                    ? "bg-green-500/20 border border-green-500 text-green-400" 
                    : "glass-card border border-glass-border"
                  }
                `}
              >
                {time}ms
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-6 flex justify-center gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600" /> Wait
        </span>
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" /> Click!
        </span>
      </div>
    </motion.div>
  );
};

export default ReactionTimeBoard;
