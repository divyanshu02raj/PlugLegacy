import { motion } from "framer-motion";
import { Bot, Users, UserPlus } from "lucide-react";

const ModeCard = ({ title, icon: Icon, description, onClick, color }) => (
    <motion.button
        whileHover={{ scale: 1.05, translateY: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="flex flex-col items-center justify-center p-6 glass-card rounded-2xl border border-glass-border hover:bg-white/5 transition-all w-full md:w-64 gap-4 group"
    >
        <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            bg-gradient-to-br ${color} shadow-lg group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-shadow
        `}>
            <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="text-center">
            <h3 className="font-bold text-lg text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
        </div>
    </motion.button>
);

const ChessModeSelection = ({ onSelectMode }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] gap-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-600 bg-clip-text text-transparent">
                    Choose Your Opponent
                </h2>
                <p className="text-muted-foreground mt-2">Select a game mode to begin</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
                <ModeCard
                    title="Vs Computer"
                    icon={Bot}
                    description="Practice against our AI engine. Play offline."
                    color="from-orange-500 to-amber-600"
                    onClick={() => onSelectMode('computer')}
                />

                <ModeCard
                    title="Find Match"
                    icon={Users}
                    description="Ranked matchmaking with random players."
                    color="from-blue-500 to-cyan-600"
                    onClick={() => onSelectMode('stranger')}
                />

                <ModeCard
                    title="Play Friend"
                    icon={UserPlus}
                    description="Create a private room and invite a friend."
                    color="from-purple-500 to-pink-600"
                    onClick={() => onSelectMode('friend')}
                />
            </div>
        </div>
    );
};

export default ChessModeSelection;
