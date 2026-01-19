import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Gamepad2, Trophy, Users, Zap, Sparkles } from "lucide-react";

const ONBOARDING_KEY = "pluglegacy-onboarding-complete";

const steps = [
    {
        id: 1,
        icon: Sparkles,
        title: "Welcome to PlugLegacy! 🎮",
        description: "The ultimate multiplayer gaming arena. Challenge friends, climb leaderboards, and become a legend.",
        gradient: "from-primary to-orange-500",
    },
    {
        id: 2,
        icon: Gamepad2,
        title: "21+ Games to Master",
        description: "From Chess and Sudoku to Tetris and Wordle — pick your battlefield and start playing instantly.",
        gradient: "from-purple-500 to-pink-500",
    },
    {
        id: 3,
        icon: Trophy,
        title: "Compete & Rank Up",
        description: "Every match affects your ELO rating. Climb the global leaderboards and prove you're the best.",
        gradient: "from-yellow-500 to-amber-500",
    },
    {
        id: 4,
        icon: Users,
        title: "Play with Friends",
        description: "Add friends, challenge them to matches, and chat in real-time during games.",
        gradient: "from-green-500 to-emerald-500",
    },
    {
        id: 5,
        icon: Zap,
        title: "You're Ready!",
        description: "Dive into the Game Library and start your journey. Good luck, player!",
        gradient: "from-cyan-500 to-blue-500",
    },
];

const OnboardingTutorial = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
        if (!hasCompleted) {
            // Small delay for dramatic effect
            setTimeout(() => setIsVisible(true), 500);
        }
    }, []);

    const handleComplete = () => {
        localStorage.setItem(ONBOARDING_KEY, "true");
        setIsVisible(false);
        onComplete?.();
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const step = steps[currentStep];
    const StepIcon = step.icon;

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            >
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    onClick={handleSkip}
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="relative w-full max-w-md overflow-hidden"
                >
                    {/* Glow effect */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${step.gradient} rounded-3xl blur-xl opacity-50`} />
                    
                    <div className="relative glass-card rounded-3xl p-8">
                        {/* Close button */}
                        <button
                            onClick={handleSkip}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Step indicator */}
                        <div className="flex justify-center gap-2 mb-8">
                            {steps.map((_, idx) => (
                                <motion.div
                                    key={idx}
                                    animate={{
                                        width: idx === currentStep ? 24 : 8,
                                        backgroundColor: idx === currentStep ? "hsl(24 100% 50%)" : "rgba(255,255,255,0.2)",
                                    }}
                                    className="h-2 rounded-full"
                                />
                            ))}
                        </div>

                        {/* Icon */}
                        <motion.div
                            key={currentStep}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            className="flex justify-center mb-6"
                        >
                            <div className={`p-6 rounded-2xl bg-gradient-to-br ${step.gradient}`}>
                                <StepIcon className="w-12 h-12 text-white" />
                            </div>
                        </motion.div>

                        {/* Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="text-center mb-8"
                            >
                                <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
                                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation */}
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={handlePrev}
                                disabled={currentStep === 0}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                                    currentStep === 0
                                        ? "opacity-30 cursor-not-allowed"
                                        : "bg-white/10 hover:bg-white/20"
                                }`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>

                            <button
                                onClick={handleSkip}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Skip tutorial
                            </button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNext}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r ${step.gradient} text-white shadow-lg`}
                            >
                                {currentStep === steps.length - 1 ? "Let's Go!" : "Next"}
                                <ChevronRight className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Export helper to reset onboarding (for testing)
export const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
};

export default OnboardingTutorial;
