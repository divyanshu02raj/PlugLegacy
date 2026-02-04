import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { History, Trophy, Zap, Clock, Target, Users, Lock } from "lucide-react";

const GameInfoPanel = ({ user, gameMode = "Selection", gameDifficulty = null, moves = [] }) => {
    const scrollRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [moves]);

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
            {/* Match Info Card - Fixed Height (~100px) */}
            {gameMode !== 'selection' && (
                <div className="glass-card rounded-2xl border border-glass-border p-4 shrink-0 h-[100px] flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="font-bold">Match Info</h3>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Mode</span>
                            <span className="font-medium capitalize truncate pl-2">
                                {gameMode === 'computer'
                                    ? `Vs Computer ${gameDifficulty ? `(${gameDifficulty})` : ''}`
                                    : (gameMode === 'friend' ? 'Friend Match' :
                                        (gameMode === 'single-player' ? 'Single Player' : 'Selection'))}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Your Stats - Fixed Height (~220px) */}
            <div className="glass-card rounded-2xl border border-glass-border p-4 shrink-0 h-[220px] flex flex-col relative overflow-hidden">
                <h3 className="font-bold mb-3 flex items-center gap-2 shrink-0">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Your Stats
                </h3>

                <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
                    {REAL_STATS.map(({ icon: Icon, label, value, color }) => (
                        <div key={label} className="bg-obsidian-light rounded-xl p-2 text-center flex flex-col justify-center">
                            <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                            <p className="text-base font-bold truncate">{value}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Lock Overlay for Single Player */}
                {/* Lock Overlay for Single Player / Computer / Selection */}
                {(gameMode === 'single-player' || gameMode === 'computer' || gameMode === 'selection') && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                        <Lock className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-bold text-muted-foreground">Stats Unavailable</p>
                        <p className="text-xs text-muted-foreground/60">
                            {gameMode === 'selection' ? 'Select a Mode' : 'Single Player Mode'}
                        </p>
                    </div>
                )}
            </div>

            {/* Move History - Fixed Height (~380px) */}
            <div className="h-[380px] glass-card rounded-2xl border border-glass-border p-4 flex flex-col overflow-hidden shrink-0 relative">
                <div className="flex items-center gap-2 mb-4">
                    <History className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Move History</h3>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-glass-border">
                    {moves.length > 0 ? (
                        <div className="space-y-1">
                            {(() => {
                                const rows = [];
                                for (let i = 0; i < moves.length; i += 2) {
                                    rows.push({
                                        turn: Math.floor(i / 2) + 1,
                                        white: moves[i],
                                        black: moves[i + 1]
                                    });
                                }
                                return rows.map((row, i) => (
                                    <motion.div
                                        key={row.turn}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="grid grid-cols-[24px_1fr_1fr] gap-2 items-center py-1"
                                    >
                                        {/* Turn Number */}
                                        <span className="text-xs text-muted-foreground font-mono opacity-50">
                                            {row.turn}.
                                        </span>

                                        {/* White Move */}
                                        <div className="flex justify-start">
                                            <span className="px-3 py-1 rounded-full bg-white text-black text-xs font-bold shadow-sm min-w-[3rem] text-center">
                                                {row.white}
                                            </span>
                                        </div>

                                        {/* Black Move */}
                                        <div className="flex justify-end">
                                            {row.black && (
                                                <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-bold border border-white/20 shadow-sm min-w-[3rem] text-center">
                                                    {row.black}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ));
                            })()}
                            <div ref={scrollRef} />
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No moves yet</p>
                            <p className="text-xs opacity-50">Game hasn't started</p>
                        </div>
                    )}
                </div>

                {/* Lock Overlay for Single Player */}
                {/* Lock Overlay for Single Player / Computer / Selection */}
                {(gameMode === 'single-player' || gameMode === 'computer' || gameMode === 'selection') && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                        <Lock className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-bold text-muted-foreground">History Unavailable</p>
                        <p className="text-xs text-muted-foreground/60">
                            {gameMode === 'selection' ? 'Select a Mode' : 'Single Player Mode'}
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default GameInfoPanel;
