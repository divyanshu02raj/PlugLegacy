import { motion } from "framer-motion";
import { Bot } from "lucide-react";

const BotCard = ({ count, onClick, color }) => (
    <motion.button
        whileHover={{ scale: 1.05, translateY: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="flex flex-col items-center justify-center p-4 glass-card rounded-xl border border-glass-border hover:bg-white/5 transition-all w-full md:w-40 gap-3 group"
    >
        <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            bg-gradient-to-br ${color} shadow-lg group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-shadow
        `}>
            <div className={`flex items-center justify-center ${count === 3 ? '-space-x-1' : 'gap-1'}`}>
                {Array(count).fill(0).map((_, i) => (
                    <Bot key={i} className={`${count === 3 ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-white`} />
                ))}
            </div>
        </div>
        <div className="text-center">
            <h3 className="font-bold text-base text-foreground">
                {count} Bot{count > 1 ? 's' : ''}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
                {count === 1 ? "1v1 duel" : count === 2 ? "3-player game" : "Full 4-player"}
            </p>
        </div>
    </motion.button>
);

const LudoBotSelection = ({ onSelectBotCount, onBack }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] gap-4 animate-in fade-in zoom-in duration-500">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
                    How Many Bots?
                </h2>
                <p className="text-muted-foreground mt-2">Choose the number of AI opponents</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
                <BotCard
                    count={1}
                    color="from-orange-500 to-red-600"
                    onClick={() => onSelectBotCount(1)}
                />

                <BotCard
                    count={2}
                    color="from-yellow-500 to-orange-600"
                    onClick={() => onSelectBotCount(2)}
                />

                <BotCard
                    count={3}
                    color="from-green-500 to-emerald-600"
                    onClick={() => onSelectBotCount(3)}
                />
            </div>

            <button
                onClick={onBack}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            >
                ← Back to mode selection
            </button>
        </div>
    );
};

export default LudoBotSelection;
