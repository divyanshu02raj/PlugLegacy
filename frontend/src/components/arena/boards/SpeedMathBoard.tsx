import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";

type Operation = "+" | "-" | "×" | "÷";

const SpeedMathBoard = () => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [question, setQuestion] = useState({ num1: 0, num2: 0, op: "+" as Operation, answer: 0 });
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [difficulty, setDifficulty] = useState(1);

  const generateQuestion = useCallback(() => {
    const operations: Operation[] = ["+", "-", "×"];
    if (difficulty > 2) operations.push("÷");
    
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num1: number, num2: number, answer: number;
    
    const maxNum = Math.min(10 + difficulty * 5, 50);
    
    switch (op) {
      case "+":
        num1 = Math.floor(Math.random() * maxNum) + 1;
        num2 = Math.floor(Math.random() * maxNum) + 1;
        answer = num1 + num2;
        break;
      case "-":
        num1 = Math.floor(Math.random() * maxNum) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        break;
      case "×":
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      case "÷":
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * answer;
        break;
      default:
        num1 = 1; num2 = 1; answer = 2;
    }

    setQuestion({ num1, num2, op, answer });
    setUserAnswer("");
    setFeedback(null);
  }, [difficulty]);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setDifficulty(1);
    setIsPlaying(true);
    generateQuestion();
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
    }
  }, [isPlaying, timeLeft]);

  const handleSubmit = () => {
    if (!userAnswer) return;
    
    const isCorrect = parseInt(userAnswer) === question.answer;
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      const points = 10 * (1 + streak * 0.1);
      setScore(s => Math.round(s + points));
      setStreak(s => s + 1);
      if (streak > 0 && streak % 5 === 0) {
        setDifficulty(d => Math.min(d + 1, 5));
      }
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      generateQuestion();
    }, 500);
  };

  const handleKeyPress = (key: string) => {
    if (!isPlaying) return;
    
    if (key === "⌫") {
      setUserAnswer(prev => prev.slice(0, -1));
    } else if (key === "✓") {
      handleSubmit();
    } else if (key === "-" && userAnswer === "") {
      setUserAnswer("-");
    } else if (/^\d$/.test(key)) {
      setUserAnswer(prev => prev + key);
    }
  };

  const timePercent = (timeLeft / 60) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3">
          <div className="glass-card px-3 py-1.5 rounded-lg border border-glass-border">
            <span className="text-xs text-muted-foreground">Score</span>
            <motion.p 
              key={score}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-xl font-bold text-primary"
            >
              {score}
            </motion.p>
          </div>
          <div className="glass-card px-3 py-1.5 rounded-lg border border-glass-border">
            <span className="text-xs text-muted-foreground">Streak</span>
            <p className="text-xl font-bold text-yellow-400">🔥 {streak}</p>
          </div>
        </div>
        {!isPlaying && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="btn-glow px-4 py-2 rounded-xl flex items-center gap-2"
          >
            {timeLeft === 0 ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {timeLeft === 0 ? "Play Again" : "Start"}
          </motion.button>
        )}
      </div>

      {/* Timer Bar */}
      <div className="h-2 rounded-full bg-slate-800 mb-6 overflow-hidden">
        <motion.div
          className={`h-full ${timeLeft > 20 ? "bg-green-500" : timeLeft > 10 ? "bg-yellow-500" : "bg-red-500"}`}
          initial={{ width: "100%" }}
          animate={{ width: `${timePercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Question Display */}
      <div className="relative mb-6">
        <div className="absolute inset-0 blur-3xl opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 via-transparent to-primary/40" />
        </div>

        <motion.div
          animate={feedback === "correct" ? { backgroundColor: ["transparent", "rgba(34, 197, 94, 0.2)", "transparent"] } :
                   feedback === "wrong" ? { x: [-10, 10, -10, 10, 0], backgroundColor: ["transparent", "rgba(239, 68, 68, 0.2)", "transparent"] } : {}}
          className="relative glass-card rounded-2xl p-8 border border-glass-border"
        >
          {isPlaying ? (
            <div className="text-center">
              <motion.p
                key={`${question.num1}-${question.op}-${question.num2}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl font-bold mb-6"
              >
                {question.num1} {question.op} {question.num2} = ?
              </motion.p>

              {/* Answer Display */}
              <div className="flex justify-center gap-2">
                <div className={`
                  min-w-[120px] h-16 rounded-xl border-2 flex items-center justify-center
                  text-3xl font-mono font-bold transition-all
                  ${feedback === "correct" ? "border-green-500 bg-green-500/20" :
                    feedback === "wrong" ? "border-red-500 bg-red-500/20" :
                    "border-primary bg-primary/10"}
                `}>
                  {userAnswer || "_"}
                </div>
              </div>
            </div>
          ) : timeLeft === 0 ? (
            <div className="text-center">
              <p className="text-3xl font-bold mb-2">Time's Up!</p>
              <p className="text-xl text-muted-foreground">Final Score: <span className="text-primary">{score}</span></p>
              <p className="text-muted-foreground">Best Streak: 🔥 {streak}</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xl text-muted-foreground">Press Start to begin</p>
              <p className="text-sm text-muted-foreground mt-2">60 seconds • Answer as many as you can!</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Numpad */}
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2 max-w-xs mx-auto"
        >
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "0", "⌫"].map(key => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleKeyPress(key)}
              className={`
                h-14 rounded-xl font-bold text-xl transition-all
                ${key === "⌫" 
                  ? "glass-card border border-glass-border hover:bg-red-500/20" 
                  : "glass-card border border-glass-border hover:bg-primary/20 hover:border-primary/50"
                }
              `}
            >
              {key}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleKeyPress("✓")}
            className="col-span-3 h-14 rounded-xl font-bold text-xl bg-green-500 hover:bg-green-600 transition-all"
          >
            Submit ✓
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SpeedMathBoard;
