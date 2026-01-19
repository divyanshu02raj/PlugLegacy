import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Target, Flame, Clock, UserPlus, Swords, Shield, Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const mockProfile = {
    username: "ProPlayer99",
    avatar: "🤖",
    level: 42,
    title: "Grandmaster",
    joinDate: "March 2024",
    totalWins: 1523,
    totalLosses: 234,
    winStreak: 12,
    elo: 2456,
    gamesPlayed: 1757,
    favoriteGame: "Chess",
    recentMatches: [
        { game: "Chess", opponent: "NeonSlayer", result: "win", eloChange: +15, time: "2 hours ago" },
        { game: "Chess", opponent: "ByteStorm", result: "win", eloChange: +12, time: "5 hours ago" },
        { game: "Connect 4", opponent: "QuantumQueen", result: "loss", eloChange: -8, time: "Yesterday" },
        { game: "Sudoku", opponent: "CryptoKnight", result: "win", eloChange: +10, time: "2 days ago" },
        { game: "Chess", opponent: "VoidWalker", result: "win", eloChange: +18, time: "3 days ago" },
    ],
    achievements: [
        { icon: "🏆", name: "Champion", desc: "Win 1000 matches" },
        { icon: "🔥", name: "On Fire", desc: "10 win streak" },
        { icon: "⚡", name: "Speed Demon", desc: "Win in under 1 minute" },
        { icon: "🎯", name: "Perfectionist", desc: "100% accuracy game" },
    ],
};

const Profile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isFriend, setIsFriend] = useState(false);

    const winRate = ((mockProfile.totalWins / mockProfile.gamesPlayed) * 100).toFixed(1);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-background"
        >
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-background to-obsidian" />
                <div className="absolute inset-0 grid-pattern opacity-30" />
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-3xl opacity-20"
                    style={{ background: "radial-gradient(circle, hsl(24 100% 50%), transparent 60%)" }}
                />
            </div>

            {/* Header */}
            <header className="relative z-10 px-6 py-4">
                <div className="max-w-5xl mx-auto">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </motion.button>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 px-6 py-8">
                <div className="max-w-5xl mx-auto">
                    {/* Profile Card */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="glass-card rounded-3xl p-8 mb-6"
                    >
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center text-6xl border-4 border-primary/50 shadow-lg shadow-primary/20">
                                    {mockProfile.avatar}
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary rounded-full text-xs font-bold text-primary-foreground">
                                    LVL {mockProfile.level}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                                    <h1 className="text-3xl font-bold">{mockProfile.username}</h1>
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-medium">
                                        <Star className="w-4 h-4" />
                                        {mockProfile.title}
                                    </span>
                                </div>
                                <p className="text-muted-foreground mb-4">Playing since {mockProfile.joinDate}</p>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsFriend(!isFriend)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${isFriend ? "bg-green-500/20 border border-green-500/30 text-green-400" : "btn-glow"}`}
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        {isFriend ? "Friends" : "Add Friend"}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold glass-card-hover border border-glass-border"
                                    >
                                        <Swords className="w-5 h-5" />
                                        Challenge
                                    </motion.button>
                                </div>
                            </div>

                            {/* ELO Badge */}
                            <div className="text-center p-6 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl border border-primary/30">
                                <p className="text-sm text-muted-foreground mb-1">ELO Rating</p>
                                <p className="text-4xl font-bold gradient-text">{mockProfile.elo}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                            { icon: Trophy, label: "Total Wins", value: mockProfile.totalWins, color: "text-green-400" },
                            { icon: Target, label: "Win Rate", value: `${winRate}%`, color: "text-blue-400" },
                            { icon: Flame, label: "Win Streak", value: mockProfile.winStreak, color: "text-orange-400" },
                            { icon: Clock, label: "Games Played", value: mockProfile.gamesPlayed, color: "text-purple-400" },
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                className="glass-card p-4 rounded-2xl text-center"
                            >
                                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Recent Matches */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card rounded-2xl p-6"
                        >
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Swords className="w-5 h-5 text-primary" />
                                Recent Matches
                            </h2>
                            <div className="space-y-3">
                                {mockProfile.recentMatches.map((match, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${match.result === "win" ? "bg-green-500" : "bg-red-500"}`} />
                                            <div>
                                                <p className="font-medium">{match.game}</p>
                                                <p className="text-xs text-muted-foreground">vs {match.opponent}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${match.eloChange > 0 ? "text-green-400" : "text-red-400"}`}>
                                                {match.eloChange > 0 ? "+" : ""}{match.eloChange}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{match.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Achievements */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card rounded-2xl p-6"
                        >
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Achievements
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {mockProfile.achievements.map((achievement, index) => (
                                    <div
                                        key={index}
                                        className="p-4 bg-white/5 rounded-xl text-center hover:bg-white/10 transition-colors"
                                    >
                                        <span className="text-3xl mb-2 block">{achievement.icon}</span>
                                        <p className="font-semibold text-sm">{achievement.name}</p>
                                        <p className="text-xs text-muted-foreground">{achievement.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};

export default Profile;
