import { motion } from "framer-motion";
import { History, Trophy, Zap, Clock, Target, Users } from "lucide-react";

const GameInfoPanel = ({ user, gameMode = "Selection", moves = [] }) => {
    // Calculate Stats
    const totalGames = (user?.wins || 0) + (user?.losses || 0);
    const winRate = totalGames > 0 ? Math.round((user?.wins / totalGames) * 100) : 0;

    const REAL_STATS = [
        { icon: Trophy, label: "Win Rate", value: `${winRate}%`, color: "text-yellow-400" },
        { icon: Zap, label: "Wins", value: user?.wins || 0, color: "text-primary" },
        { icon: Clock, label: "Losses", value: user?.losses || 0, color: "text-red-400" },
        { icon: Target, label: "Rating", value: user?.elo || 1000, color: "text-green-400" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="h-full flex flex-col gap-4"
        >
            {/* Match Info Card */}
            <div className="glass-card rounded-2xl border border-glass-border p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Match Info</h3>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Mode</span>
                        <span className="font-medium capitalize">{gameMode === 'computer' ? 'Vs Computer' : (gameMode === 'friend' ? 'Friend Match' : 'Selection')}</span>
                    </div>
                </div>
            </div>

            {/* Your Stats */}
            <div className="glass-card rounded-2xl border border-glass-border p-4">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Your Stats
                </h3>

                <div className="grid grid-cols-2 gap-3">
                    {REAL_STATS.map(({ icon: Icon, label, value, color }) => (
                        <div key={label} className="bg-obsidian-light rounded-xl p-3 text-center">
                            <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                            <p className="text-lg font-bold">{value}</p>
                            <p className="text-xs text-muted-foreground">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Move History */}
            <div className="flex-1 glass-card rounded-2xl border border-glass-border p-4 overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <History className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Move History</h3>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-glass-border">
                    {moves.length > 0 ? moves.map((move, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10"
                        >
                            <span className="w-6 h-6 rounded-lg bg-obsidian flex items-center justify-center text-xs font-bold">
                                {index + 1}
                            </span>
                            <span className="flex-1 text-sm">{move}</span>
                        </motion.div>
                    )) : (
                        <div className="text-center text-muted-foreground py-8">
                            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No moves yet</p>
                            <p className="text-xs opacity-50">Game hasn't started</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default GameInfoPanel;
