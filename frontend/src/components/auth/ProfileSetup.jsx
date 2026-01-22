import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sword, Gamepad2, Skull, Crown, Zap, Shield, Ghost, Flame, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

const avatars = [
    { id: 1, icon: Bot, name: "Automaton", color: "from-cyan-400 to-blue-600" },
    { id: 2, icon: Sword, name: "Shinobi", color: "from-purple-400 to-pink-600" },
    { id: 3, icon: Gamepad2, name: "Retro", color: "from-green-400 to-emerald-600" },
    { id: 4, icon: Skull, name: "Phantom", color: "from-gray-400 to-zinc-600" },
    { id: 5, icon: Crown, name: "Royal", color: "from-yellow-400 to-amber-600" },
    { id: 6, icon: Zap, name: "Electric", color: "from-orange-400 to-red-500" },
    { id: 7, icon: Shield, name: "Guardian", color: "from-blue-400 to-indigo-600" },
    { id: 8, icon: Ghost, name: "Specter", color: "from-violet-400 to-purple-600" },
    { id: 9, icon: Flame, name: "Inferno", color: "from-red-400 to-orange-600" },
];

const ProfileSetup = () => {
    const navigate = useNavigate();
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [isExiting, setIsExiting] = useState(false);

    const handleEnterLobby = async () => {
        if (!selectedAvatar) return;
        setIsExiting(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        navigate("/games");
    };

    const selectedAvatarData = avatars.find(a => a.id === selectedAvatar);

    return (
        <AnimatePresence mode="wait">
            {!isExiting ? (
                <AuthLayout key="setup">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="inline-block px-4 py-1.5 rounded-full glass-card text-xs font-medium text-primary mb-4"
                        >
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            FINAL STEP
                        </motion.span>
                        <motion.h1
                            className="text-3xl md:text-4xl font-bold mb-2"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <span className="text-foreground">Identify </span>
                            <span className="gradient-text">Yourself</span>
                        </motion.h1>
                        <motion.p
                            className="text-muted-foreground text-sm"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            Choose your avatar to enter the arena
                        </motion.p>
                    </div>

                    {/* Avatar Grid */}
                    <motion.div
                        className="grid grid-cols-3 gap-3 mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {avatars.map((avatar, index) => {
                            const Icon = avatar.icon;
                            const isSelected = selectedAvatar === avatar.id;

                            return (
                                <motion.button
                                    key={avatar.id}
                                    onClick={() => setSelectedAvatar(avatar.id)}
                                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 overflow-hidden group ${isSelected
                                        ? "bg-glass-hover"
                                        : "bg-obsidian-light/30 hover:bg-glass border border-transparent hover:border-glass-border"
                                        }`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + index * 0.04 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {/* Selection Glow */}
                                    {isSelected && (
                                        <>
                                            <motion.div
                                                className="absolute inset-0 rounded-2xl border-2 border-primary"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            />
                                            <motion.div
                                                className="absolute inset-0 rounded-2xl"
                                                style={{
                                                    background: "radial-gradient(circle at center, hsl(24 100% 50% / 0.15), transparent 70%)",
                                                }}
                                            />
                                            <motion.div
                                                className="absolute inset-0 rounded-2xl border-2 border-primary"
                                                animate={{
                                                    scale: [1, 1.08, 1],
                                                    opacity: [0.6, 0, 0.6],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                }}
                                            />
                                        </>
                                    )}

                                    {/* Avatar Icon Container */}
                                    <motion.div
                                        className={`relative transition-all duration-300 ${isSelected ? "" : "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"
                                            }`}
                                        animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
                                    >
                                        <div
                                            className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${avatar.color} flex items-center justify-center shadow-lg`}
                                            style={isSelected ? {
                                                boxShadow: `0 8px 32px rgba(249, 115, 22, 0.3)`,
                                            } : {}}
                                        >
                                            <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                                        </div>
                                    </motion.div>

                                    <span
                                        className={`text-xs font-medium transition-colors ${isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                            }`}
                                    >
                                        {avatar.name}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </motion.div>

                    {/* Selected Avatar Preview */}
                    <AnimatePresence>
                        {selectedAvatarData && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="glass-card p-4 rounded-xl mb-6 flex items-center gap-4"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedAvatarData.color} flex items-center justify-center`}>
                                    <selectedAvatarData.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-foreground font-semibold">{selectedAvatarData.name}</p>
                                    <p className="text-muted-foreground text-xs">Ready to compete</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Enter Button */}
                    <motion.button
                        onClick={handleEnterLobby}
                        disabled={!selectedAvatar}
                        className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 group ${selectedAvatar
                            ? "btn-glow pulse-glow text-primary-foreground"
                            : "bg-glass border border-glass-border text-muted-foreground cursor-not-allowed"
                            }`}
                        whileHover={selectedAvatar ? { scale: 1.02 } : {}}
                        whileTap={selectedAvatar ? { scale: 0.98 } : {}}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <Zap className={`w-5 h-5 ${selectedAvatar ? "group-hover:animate-pulse" : ""}`} />
                        <span>ENTER THE ARENA</span>
                        {selectedAvatar && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </motion.button>
                </AuthLayout>
            ) : (
                <motion.div
                    key="exit"
                    className="min-h-screen bg-obsidian flex items-center justify-center"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="text-center"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 0.8, opacity: 0, filter: "blur(20px)" }}
                        transition={{ duration: 0.5 }}
                    >
                        {selectedAvatarData && (
                            <motion.div
                                className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${selectedAvatarData.color} flex items-center justify-center mb-6`}
                                animate={{
                                    boxShadow: [
                                        "0 0 40px rgba(249, 115, 22, 0.4)",
                                        "0 0 80px rgba(249, 115, 22, 0.6)",
                                        "0 0 40px rgba(249, 115, 22, 0.4)",
                                    ],
                                }}
                                transition={{ duration: 0.5 }}
                            >
                                <selectedAvatarData.icon className="w-12 h-12 text-white" />
                            </motion.div>
                        )}
                        <p className="text-foreground font-bold text-xl">Entering Arena...</p>
                        <p className="text-muted-foreground text-sm mt-2">Prepare for battle</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProfileSetup;
