import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import ParticleGrid from "../ParticleGrid";

const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-obsidian relative overflow-hidden flex items-center justify-center px-4 py-12">
            {/* Same Background as Landing Page */}
            <div className="absolute inset-0 bg-obsidian" />
            <ParticleGrid />

            {/* Hero-style Ambient Glow */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(24 100% 50% / 0.15), hsl(32 100% 55% / 0.08) 50%, transparent 70%)",
                    filter: "blur(60px)",
                }}
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.6, 0.8, 0.6],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Secondary Ambient Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-electric-amber/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-lg">
                {/* Logo with Landing Page Style Glow */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative text-center mb-8"
                >
                    {/* Large Ambient Glow Behind Logo */}
                    <div
                        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-80 h-48 pointer-events-none"
                        style={{
                            background: "radial-gradient(ellipse 70% 55% at 50% 50%, hsl(24 100% 50% / 0.5), hsl(32 100% 55% / 0.25) 45%, transparent 75%)",
                            filter: "blur(40px)",
                        }}
                    />
                    <div className="relative inline-block">
                        {/* Gradient overlay to blend */}
                        <div
                            className="absolute inset-0 pointer-events-none z-10 rounded-lg"
                            style={{
                                background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, hsl(240 10% 3.9%) 70%, hsl(240 10% 3.9%) 100%)",
                            }}
                        />
                        <img
                            src={logo}
                            alt="PlugLegacy"
                            className="h-24 md:h-28 w-auto mx-auto relative"
                            style={{
                                filter: "drop-shadow(0 0 40px hsl(24 100% 50% / 0.6))",
                            }}
                        />
                    </div>
                </motion.div>

                {/* Glass Card - Landing Page Style */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                    className="glass-card-hover p-8 md:p-10 rounded-3xl overflow-hidden relative"
                >
                    {/* Top Glow Effect Inside Card */}
                    <div
                        className="absolute inset-0 rounded-3xl pointer-events-none"
                        style={{
                            background: "radial-gradient(ellipse 80% 40% at 50% -10%, hsl(24 100% 50% / 0.08), transparent 60%)",
                        }}
                    />

                    {/* Large Decorative Icon - Like Features Section */}
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 opacity-[0.03] pointer-events-none">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-foreground">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        {children}
                    </div>
                </motion.div>

                {/* Bottom Attribution */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center text-muted-foreground/50 text-xs mt-6"
                >
                    Powered by PlugLegacy Network
                </motion.p>
            </div>
        </div>
    );
};

export default AuthLayout;
