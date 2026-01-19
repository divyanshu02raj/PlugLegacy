import { motion, AnimatePresence } from "framer-motion";
import { Trophy, XCircle, RotateCcw, Home, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GameOverOverlay = ({ isOpen, result, eloChange, onRematch, onClose }) => {
    const navigate = useNavigate();
    const isVictory = result === "victory";

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Glow Effect */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-30 pointer-events-none"
                        style={{
                            background: isVictory
                                ? "radial-gradient(circle, hsl(45 93% 47%), transparent 60%)"
                                : "radial-gradient(circle, hsl(0 84% 60%), transparent 60%)",
                        }}
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="relative glass-card rounded-3xl p-8 md:p-12 text-center max-w-md w-full"
                    >
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", damping: 10 }}
                            className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${isVictory ? "bg-gradient-to-br from-yellow-400 to-orange-500" : "bg-gradient-to-br from-red-500 to-red-700"}`}
                        >
                            {isVictory ? (
                                <Trophy className="w-12 h-12 text-white" />
                            ) : (
                                <XCircle className="w-12 h-12 text-white" />
                            )}
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className={`text-5xl font-black mb-2 ${isVictory ? "text-yellow-400" : "text-red-400"}`}
                        >
                            {isVictory ? "VICTORY" : "DEFEAT"}
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-muted-foreground mb-6"
                        >
                            {isVictory ? "Well played! You dominated the game." : "Better luck next time!"}
                        </motion.p>

                        {/* ELO Change */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6, type: "spring" }}
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full mb-8 ${isVictory ? "bg-green-500/20 border border-green-500/30" : "bg-red-500/20 border border-red-500/30"}`}
                        >
                            <span className="text-sm text-muted-foreground">ELO</span>
                            <span className={`text-2xl font-bold ${isVictory ? "text-green-400" : "text-red-400"}`}>
                                {isVictory ? "+" : ""}{eloChange}
                            </span>
                        </motion.div>

                        {/* Actions */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="flex flex-col gap-3"
                        >
                            <button
                                onClick={onRematch}
                                className="btn-glow w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Rematch
                            </button>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate("/games")}
                                    className="flex-1 glass-card-hover py-3 rounded-xl font-medium flex items-center justify-center gap-2 border border-glass-border"
                                >
                                    <Home className="w-4 h-4" />
                                    Home
                                </button>
                                <button
                                    className="flex-1 glass-card-hover py-3 rounded-xl font-medium flex items-center justify-center gap-2 border border-glass-border"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GameOverOverlay;
