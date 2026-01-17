import { motion } from "framer-motion";
import { Play, Trophy, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FeaturedBanner = () => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl"
        >
            {/* Background Layers */}
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian-light via-obsidian to-obsidian-light" />

            {/* Animated Gradient Orbs */}
            <motion.div
                animate={{
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    x: [0, -30, 0],
                    y: [0, 20, 0],
                    scale: [1.2, 1, 1.2],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 left-1/4 w-72 h-72 bg-primary/15 rounded-full blur-3xl"
            />

            {/* Chess Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-20 text-9xl opacity-30">♚</div>
                <div className="absolute bottom-10 right-40 text-7xl opacity-20">♛</div>
                <div className="absolute top-1/2 right-10 text-6xl opacity-25">♜</div>
            </div>

            {/* Glass Overlay */}
            <div className="absolute inset-0 backdrop-blur-[2px]" />

            {/* Border */}
            <div className="absolute inset-0 rounded-3xl border border-glass-border" />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-between p-10 min-h-[320px]">
                {/* Left Content */}
                <div className="max-w-xl space-y-6">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30"
                    >
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">FEATURED EVENT</span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-5xl md:text-6xl font-black leading-tight"
                    >
                        <span className="text-foreground">Chess</span>
                        <br />
                        <span className="gradient-text">Weekly Tournament</span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-muted-foreground"
                    >
                        Battle the best minds across the globe. Climb the ranks and claim your spot on the leaderboard.
                    </motion.p>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-6"
                    >
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-5 h-5 text-primary" />
                            <span className="font-medium">2.4k Registered</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Zap className="w-5 h-5 text-primary" />
                            <span className="font-medium">Starts in 2 hours</span>
                        </div>
                    </motion.div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-4 pt-2"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/play/chess")}
                            className="btn-glow pulse-glow px-8 py-4 rounded-xl font-bold text-primary-foreground flex items-center gap-3"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Join Tournament
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 rounded-xl font-bold glass-card-hover flex items-center gap-3"
                        >
                            View Details
                        </motion.button>
                    </motion.div>
                </div>

                {/* Right Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
                    className="hidden lg:block"
                >
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="text-[180px] filter drop-shadow-2xl"
                        style={{
                            textShadow: "0 0 60px hsl(24 100% 50% / 0.5), 0 20px 40px rgba(0,0,0,0.5)"
                        }}
                    >
                        ♚
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default FeaturedBanner;
