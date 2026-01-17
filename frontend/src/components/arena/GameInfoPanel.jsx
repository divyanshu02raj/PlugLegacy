import { motion } from "framer-motion";
import { History, Trophy, Zap, Clock, Target, Users } from "lucide-react";

const MOCK_MOVES = [
    { turn: 1, player: "X", position: "Center", timestamp: "0:05" },
    { turn: 2, player: "O", position: "Top-Left", timestamp: "0:12" },
    { turn: 3, player: "X", position: "Top-Right", timestamp: "0:18" },
    { turn: 4, player: "O", position: "Bottom-Left", timestamp: "0:25" },
];

const STATS = [
    { icon: Trophy, label: "Win Rate", value: "67%", color: "text-yellow-400" },
    { icon: Zap, label: "Win Streak", value: "3", color: "text-primary" },
    { icon: Clock, label: "Avg Move", value: "4.2s", color: "text-blue-400" },
    { icon: Target, label: "Accuracy", value: "89%", color: "text-green-400" },
];

const GameInfoPanel = () => {
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
                        <span className="font-medium">Ranked 1v1</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Time Control</span>
                        <span className="font-medium">3:00 + 2s</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">ELO Range</span>
                        <span className="font-medium text-primary">1200-1400</span>
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
                    {STATS.map(({ icon: Icon, label, value, color }) => (
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
                    {MOCK_MOVES.map((move, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                flex items-center gap-3 p-2.5 rounded-xl
                ${move.player === "X"
                                    ? "bg-primary/10 border border-primary/20"
                                    : "bg-blue-500/10 border border-blue-500/20"
                                }
              `}
                        >
                            {/* Turn Number */}
                            <span className="w-6 h-6 rounded-lg bg-obsidian flex items-center justify-center text-xs font-bold">
                                {move.turn}
                            </span>

                            {/* Player Symbol */}
                            <span
                                className={`text-xl font-bold ${move.player === "X" ? "text-primary" : "text-blue-400"
                                    }`}
                                style={{
                                    textShadow: move.player === "X"
                                        ? "0 0 10px hsl(24 100% 50% / 0.5)"
                                        : "0 0 10px hsl(210 100% 60% / 0.5)",
                                }}
                            >
                                {move.player}
                            </span>

                            {/* Position */}
                            <span className="flex-1 text-sm">{move.position}</span>

                            {/* Timestamp */}
                            <span className="text-xs text-muted-foreground">{move.timestamp}</span>
                        </motion.div>
                    ))}

                    {MOCK_MOVES.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No moves yet</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default GameInfoPanel;
