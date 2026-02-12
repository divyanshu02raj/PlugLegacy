import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Trophy, Timer, Award } from "lucide-react";
import confetti from "canvas-confetti";

const FALLBACK_TEXTS = [
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
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [finished, setFinished] = useState(false);
    const [totalTyped, setTotalTyped] = useState(0);
    const [bestWpm, setBestWpm] = useState(() => {
        return parseInt(localStorage.getItem("typing_race_best_wpm") || "0");
    });
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);

    const fetchQuote = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("https://api.quotable.io/random?minLength=100&maxLength=200");
            const data = await res.json();
            if (data.content) {
                setText(data.content);
            } else {
                throw new Error("No content");
            }
        } catch (err) {
            console.log("Using fallback text");
            const newText = FALLBACK_TEXTS[Math.floor(Math.random() * FALLBACK_TEXTS.length)];
            setText(newText);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Load initial quote
        fetchQuote();
    }, []);

    const startGame = async () => {
        // If finished, load new quote first
        if (finished) {
            await fetchQuote();
        }

        setUserInput("");
        setStartTime(null);
        setWpm(0);
        setAccuracy(100);
        setFinished(false);
        setProgress(0);
        setTotalTyped(0);
        setIsPlaying(true);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const finishGame = () => {
        setFinished(true);
        setIsPlaying(false);
        const finalWpm = wpm;
        if (finalWpm > bestWpm) {
            setBestWpm(finalWpm);
            localStorage.setItem("typing_race_best_wpm", finalWpm.toString());
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#34d399', '#f59e0b']
            });
        } else {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    };

    const handleInput = (e) => {
        if (!isPlaying || finished) return;

        const value = e.target.value;
        const prevValue = userInput;

        if (!startTime && value.length === 1) {
            setStartTime(Date.now());
        }

        // Increment total typed only on additions (typing)
        if (value.length > prevValue.length) {
            setTotalTyped(prev => prev + (value.length - prevValue.length));
        }

        setUserInput(value);

        // Calculate progress
        let correctChars = 0;
        for (let i = 0; i < value.length; i++) {
            if (value[i] === text[i]) correctChars++;
        }

        setProgress((correctChars / text.length) * 100);

        // Update Accuracy based on total typed characters (not just current length)
        // If totalTyped is 0 (shouldn't be if value > 0), avoid NaN
        setAccuracy(value.length > 0 ? Math.round((correctChars / Math.max(totalTyped + (value.length > prevValue.length ? 1 : 0), 1)) * 100) : 100);
        // Wait, totalTyped state update is async, so use local variable for immediate calc?
        // Better: calculate newTotalTyped locally
        const newTotalTyped = value.length > prevValue.length
            ? totalTyped + (value.length - prevValue.length)
            : totalTyped;

        setAccuracy(newTotalTyped > 0 ? Math.round((correctChars / newTotalTyped) * 100) : 100);

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
            className="w-full max-w-4xl mx-auto px-4 overflow-x-hidden"
        >
            {/* Header Stats */}
            <div className="flex justify-between items-end mb-8">
                <div className="flex gap-4">
                    <div className="glass-card px-5 py-3 rounded-2xl border border-glass-border min-w-[100px]">
                        <div className="flex items-center gap-2 mb-1">
                            <Timer className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">WPM</span>
                        </div>
                        <motion.p
                            key={wpm}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className="text-3xl font-bold text-primary"
                        >
                            {wpm}
                        </motion.p>
                    </div>

                    <div className="glass-card px-5 py-3 rounded-2xl border border-glass-border min-w-[100px]">
                        <div className="flex items-center gap-2 mb-1">
                            <Award className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Accuracy</span>
                        </div>
                        <p className={`text-3xl font-bold ${accuracy >= 95 ? "text-emerald-400" : accuracy >= 80 ? "text-amber-400" : "text-red-400"}`}>
                            {accuracy}%
                        </p>
                    </div>

                    <div className="glass-card px-5 py-3 rounded-2xl border border-glass-border min-w-[100px] bg-yellow-500/5 border-yellow-500/20">
                        <div className="flex items-center gap-2 mb-1">
                            <Trophy className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-yellow-500/80 uppercase tracking-wider">Best</span>
                        </div>
                        <p className="text-3xl font-bold text-yellow-500">
                            {bestWpm}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startGame}
                        disabled={isLoading}
                        className={`
                            px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg transition-all
                            ${isPlaying
                                ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                                : "bg-primary text-primary-foreground shadow-primary/25 hover:shadow-primary/40 btn-glow"
                            }
                        `}
                    >
                        {isLoading ? (
                            <span className="animate-spin">⏳</span>
                        ) : (
                            <>
                                {isPlaying ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {isPlaying ? "Restart" : (finished ? "Play Again" : "Start Race")}
                            </>
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Race Track Visual */}
            <div className="mb-8 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-14 bg-slate-900/80 backdrop-blur-sm rounded-full border border-white/10 overflow-hidden px-2 flex items-center">
                    {/* Track Markings */}
                    <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white/10" />
                    {[0, 25, 50, 75, 100].map(p => (
                        <div key={p} className="absolute bottom-0 h-2 w-[1px] bg-white/20" style={{ left: `${p}%` }} />
                    ))}

                    {/* Car */}
                    <motion.div
                        className="absolute top-1/2 -translate-y-1/2 text-3xl z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] filter"
                        initial={{ left: "0%" }}
                        animate={{ left: `calc(${progress}% - 15px)` }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    >
                        🏎️
                    </motion.div>

                    {/* Progress Fill */}
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/10 to-primary/30"
                        animate={{ width: `${progress}%` }}
                    />

                    {/* Finish Line */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl opacity-50">
                        🏁
                    </div>
                </div>
            </div>

            {/* Text Display */}
            <div className="relative mb-6 group">
                <div className="absolute inset-0 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20" />
                </div>

                <div
                    className={`
                        relative glass-card rounded-2xl p-8 border transition-all duration-300 min-h-[200px] flex items-center justify-center
                        ${isPlaying ? "border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.1)]" : "border-glass-border"}
                        ${finished ? "border-green-500/30 bg-green-500/5" : ""}
                    `}
                    onClick={() => inputRef.current?.focus()}
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-3 text-muted-foreground animate-pulse">
                            <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
                            <p>Loading text...</p>
                        </div>
                    ) : (
                        <div className={`text-2xl md:text-3xl leading-relaxed font-mono transition-opacity duration-300 ${!isPlaying && !finished ? "opacity-50 blur-[1px]" : "opacity-100"}`}>
                            {text.split("").map((char, idx) => {
                                let className = "text-muted-foreground/40 transition-colors duration-100";
                                if (idx < userInput.length) {
                                    className = userInput[idx] === char
                                        ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                                        : "text-red-500 bg-red-500/10 rounded-sm";
                                } else if (idx === userInput.length && isPlaying) {
                                    className = "bg-primary/20 text-foreground border-b-2 border-primary animate-pulse";
                                }
                                return (
                                    <span key={idx} className={className}>
                                        {char}
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {!isPlaying && !finished && !isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-2xl">
                            <div className="text-center">
                                <p className="text-xl text-white font-medium mb-2">Ready to Race?</p>
                                <p className="text-sm text-white/60">Type the text as accurately as possible</p>
                            </div>
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
                className="opacity-0 absolute top-0 left-0 h-0 w-0 pointer-events-none"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
            />

            {/* Results Overlay */}
            <AnimatePresence>
                {finished && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-6"
                    >
                        <div className="glass-card rounded-2xl p-6 border border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent text-center relative overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

                            <h3 className="text-2xl font-bold text-green-400 mb-2">Race Completed! 🎉</h3>
                            <p className="text-muted-foreground mb-6">
                                {wpm > bestWpm ? "New Personal Best!" : "Great run!"}
                            </p>

                            <div className="flex justify-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={startGame}
                                    className="px-8 py-3 rounded-xl bg-green-500 text-white font-bold shadow-lg shadow-green-500/25 hover:bg-green-600 transition-colors"
                                >
                                    Race Again
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TypingRaceBoard;
