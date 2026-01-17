import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Check, X, RotateCcw } from "lucide-react";

const NumberRecallBoard = () => {
    const [phase, setPhase] = useState("idle");
    const [targetNumber, setTargetNumber] = useState("");
    const [userInput, setUserInput] = useState("");
    const [level, setLevel] = useState(3);
    const [score, setScore] = useState(0);
    const [countdown, setCountdown] = useState(3);

    const generateNumber = (length) => {
        return Array(length).fill(0).map(() => Math.floor(Math.random() * 10)).join("");
    };

    const startGame = useCallback(() => {
        const num = generateNumber(level);
        setTargetNumber(num);
        setUserInput("");
        setPhase("memorize");
        setCountdown(Math.max(2, level));
    }, [level]);

    useEffect(() => {
        if (phase === "memorize" && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (phase === "memorize" && countdown === 0) {
            setPhase("recall");
        }
    }, [phase, countdown]);

    const handleSubmit = () => {
        if (phase !== "recall") return;
        setPhase("result");

        if (userInput === targetNumber) {
            setScore(s => s + level * 10);
            setLevel(l => Math.min(l + 1, 12));
        }
    };

    const handleKeyPress = (key) => {
        if (phase !== "recall") return;

        if (key === "⌫") {
            setUserInput(prev => prev.slice(0, -1));
        } else if (key === "✓") {
            handleSubmit();
        } else if (userInput.length < targetNumber.length) {
            setUserInput(prev => prev + key);
        }
    };

    const resetGame = () => {
        setPhase("idle");
        setLevel(3);
        setScore(0);
        setUserInput("");
    };

    const isCorrect = userInput === targetNumber;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto"
        >
            {/* Stats */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                    <div className="glass-card px-3 py-1.5 rounded-lg border border-glass-border">
                        <span className="text-xs text-muted-foreground">Level</span>
                        <p className="text-lg font-bold text-primary">{level}</p>
                    </div>
                    <div className="glass-card px-3 py-1.5 rounded-lg border border-glass-border">
                        <span className="text-xs text-muted-foreground">Score</span>
                        <p className="text-lg font-bold">{score}</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="p-2 rounded-xl glass-card border border-glass-border hover:border-primary/50"
                >
                    <RotateCcw className="w-5 h-5" />
                </motion.button>
            </div>

            {/* Main Display */}
            <div className="relative">
                <div className="absolute inset-0 blur-3xl opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/40 via-transparent to-primary/40" />
                </div>

                <div className="relative glass-card rounded-2xl p-8 border border-glass-border min-h-[300px] flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        {phase === "idle" && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <p className="text-muted-foreground mb-4">Memorize the number!</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={startGame}
                                    className="btn-glow px-8 py-4 rounded-2xl flex items-center gap-2 mx-auto"
                                >
                                    <Play className="w-6 h-6" />
                                    <span className="font-bold">Start</span>
                                </motion.button>
                            </motion.div>
                        )}

                        {phase === "memorize" && (
                            <motion.div
                                key="memorize"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="text-center"
                            >
                                <motion.p
                                    key={targetNumber}
                                    initial={{ scale: 1.5 }}
                                    animate={{ scale: 1 }}
                                    className="text-5xl md:text-7xl font-mono font-bold tracking-widest"
                                    style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.5)" }}
                                >
                                    {targetNumber}
                                </motion.p>
                                <div className="mt-4 flex items-center justify-center gap-1">
                                    {Array(countdown).fill(0).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-3 h-3 rounded-full bg-primary"
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {phase === "recall" && (
                            <motion.div
                                key="recall"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center w-full"
                            >
                                <p className="text-muted-foreground mb-4">What was the number?</p>
                                <div className="flex justify-center gap-2 mb-6">
                                    {targetNumber.split("").map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`
                        w-10 h-14 md:w-12 md:h-16 rounded-lg border-2 flex items-center justify-center
                        text-2xl md:text-3xl font-mono font-bold
                        ${userInput[i]
                                                    ? "border-primary bg-primary/20"
                                                    : "border-glass-border bg-white/5"
                                                }
                      `}
                                        >
                                            {userInput[i] || ""}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {phase === "result" && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <motion.div
                                    animate={isCorrect ? { scale: [1, 1.2, 1] } : { x: [-10, 10, -10, 10, 0] }}
                                    className={`
                    w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4
                    ${isCorrect ? "bg-green-500/20 border-2 border-green-500" : "bg-red-500/20 border-2 border-red-500"}
                  `}
                                >
                                    {isCorrect ? (
                                        <Check className="w-10 h-10 text-green-500" />
                                    ) : (
                                        <X className="w-10 h-10 text-red-500" />
                                    )}
                                </motion.div>
                                <p className={`text-xl font-bold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                                    {isCorrect ? "Correct!" : "Wrong!"}
                                </p>
                                {!isCorrect && (
                                    <p className="text-muted-foreground mt-2">
                                        The number was: <span className="text-foreground font-mono">{targetNumber}</span>
                                    </p>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={startGame}
                                    className="mt-4 btn-glow px-6 py-2 rounded-xl"
                                >
                                    Next
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Numpad */}
            {phase === "recall" && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 grid grid-cols-3 gap-2 max-w-xs mx-auto"
                >
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"].map(key => (
                        <motion.button
                            key={key}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleKeyPress(key)}
                            className={`
                h-14 rounded-xl font-bold text-xl transition-all
                ${key === "✓"
                                    ? "bg-green-500 text-white hover:bg-green-600"
                                    : key === "⌫"
                                        ? "glass-card border border-glass-border hover:bg-red-500/20"
                                        : "glass-card border border-glass-border hover:bg-primary/20 hover:border-primary/50"
                                }
              `}
                        >
                            {key}
                        </motion.button>
                    ))}
                </motion.div>
            )}
        </motion.div>
    );
};

export default NumberRecallBoard;
