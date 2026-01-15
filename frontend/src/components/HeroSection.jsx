import { motion } from "framer-motion";
import { Play, Zap } from "lucide-react";
import logo from "@/assets/no_bg_logoo.png";
import ParticleGrid from "./ParticleGrid";

const HeroSection = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-obsidian" />
            <ParticleGrid />

            {/* Hero Glow Behind Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] hero-glow pointer-events-none" />

            {/* Additional Ambient Glow */}
            <motion.div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
                style={{
                    background: "radial-gradient(ellipse, hsl(24 100% 50% / 0.15), transparent 60%)",
                    filter: "blur(60px)",
                }}
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.7, 0.5],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
                {/* Logo with Glow - Blended with Background */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative inline-block mb-8"
                >
                    {/* Large Ambient Glow Behind */}
                    <div
                        className="absolute -inset-32 pointer-events-none"
                        style={{
                            background: "radial-gradient(ellipse 70% 55% at 50% 50%, hsl(24 100% 50% / 0.5), hsl(32 100% 55% / 0.25) 45%, transparent 75%)",
                            filter: "blur(50px)",
                        }}
                    />
                    {/* Logo Container */}
                    <div className="relative">
                        {/* Gradient overlay to blend navy into obsidian */}
                        <div
                            className="absolute inset-0 pointer-events-none z-10 rounded-lg"
                            style={{
                                background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, hsl(240 10% 3.9%) 70%, hsl(240 10% 3.9%) 100%)",
                            }}
                        />
                        <img
                            src={logo}
                            alt="PlugLegacy"
                            className="h-20 md:h-32 lg:h-39 w-auto mx-auto relative"
                            style={{
                                filter: "drop-shadow(0 0 60px hsl(24 100% 50% / 0.7))",
                            }}
                        />
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
                >
                    <span className="gradient-text">CLASSIC GAMES.</span>
                    <br />
                    <span className="text-foreground">RECHARGED.</span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    The real-time multiplayer hub where timeless strategy meets modern competition.
                    <span className="text-foreground font-medium"> Plug in and dominate.</span>
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <motion.a
                        href="#play"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-glow pulse-glow px-8 py-4 rounded-full text-lg font-semibold text-primary-foreground flex items-center gap-2 group"
                    >
                        <Zap className="w-5 h-5 group-hover:animate-pulse" />
                        Start Playing Now
                    </motion.a>

                    <motion.a
                        href="#trailer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="glass-card-hover px-8 py-4 rounded-full text-lg font-medium text-foreground flex items-center gap-2"
                    >
                        <Play className="w-5 h-5" />
                        Watch Trailer
                    </motion.a>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-6 h-10 rounded-full border-2 border-foreground/30 flex items-start justify-center p-2"
                    >
                        <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-1 h-2 bg-primary rounded-full"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
