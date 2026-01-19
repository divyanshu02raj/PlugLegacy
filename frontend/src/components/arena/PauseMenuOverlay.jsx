import { motion, AnimatePresence } from "framer-motion";
import { Play, Settings, Flag, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PauseMenuOverlay = ({ isOpen, onResume, onResign, isMuted, onToggleMute }) => {
    const navigate = useNavigate();

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
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        onClick={onResume}
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative glass-card rounded-3xl p-8 text-center max-w-sm w-full"
                    >
                        <h2 className="text-2xl font-bold mb-2">Game Paused</h2>
                        <p className="text-muted-foreground mb-8">What would you like to do?</p>

                        <div className="space-y-3">
                            {/* Resume */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onResume}
                                className="w-full btn-glow py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3"
                            >
                                <Play className="w-6 h-6" />
                                Resume Game
                            </motion.button>

                            {/* Sound Toggle */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onToggleMute}
                                className="w-full glass-card-hover py-4 rounded-xl font-medium flex items-center justify-center gap-3 border border-glass-border"
                            >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                {isMuted ? "Unmute Sound" : "Mute Sound"}
                            </motion.button>

                            {/* Settings */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate("/settings")}
                                className="w-full glass-card-hover py-4 rounded-xl font-medium flex items-center justify-center gap-3 border border-glass-border"
                            >
                                <Settings className="w-5 h-5" />
                                Settings
                            </motion.button>

                            {/* Resign */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onResign}
                                className="w-full py-4 rounded-xl font-medium flex items-center justify-center gap-3 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                                <Flag className="w-5 h-5" />
                                Resign
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PauseMenuOverlay;
