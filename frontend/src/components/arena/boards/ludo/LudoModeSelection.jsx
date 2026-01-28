import { motion } from "framer-motion";
import { Bot, Users, UserPlus } from "lucide-react";

const ModeCard = ({ title, icon: Icon, description, onClick, color }) => (
    <motion.button
        whileHover={{ scale: 1.05, translateY: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="flex flex-col items-center justify-center p-4 glass-card rounded-xl border border-glass-border hover:bg-white/5 transition-all w-full md:w-56 gap-3 group"
    >
        <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            bg-gradient-to-br ${color} shadow-lg group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-shadow
        `}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-center">
            <h3 className="font-bold text-base text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
    </motion.button>
);

const LudoModeSelection = ({ onSelectMode }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] gap-4 animate-in fade-in zoom-in duration-500">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
                    Choose Your Game Mode
                </h2>
                <p className="text-muted-foreground mt-2">Select how you want to play Ludo</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
                <ModeCard
                    title="Vs Computer"
                    icon={Bot}
                    description="Play against 3 AI opponents. Practice offline."
                    color="from-red-500 to-orange-600"
                    onClick={() => onSelectMode('computer')}
                />

                <ModeCard
                    title="Find Match"
                    icon={Users}
                    description="Join a game with random players online."
                    color="from-green-500 to-emerald-600"
                    onClick={() => onSelectMode('stranger')}
                />

                <ModeCard
                    title="Play Friend"
                    icon={UserPlus}
                    description="Create a private room and invite friends."
                    color="from-blue-500 to-purple-600"
                    onClick={() => onSelectMode('friend')}
                />
            </div>
        </div>
    );
};

export default LudoModeSelection;
