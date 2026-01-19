import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Filter, Search, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const games = [
    { id: "all", name: "All Games", icon: "🎮" },
    { id: "chess", name: "Chess", icon: "♟️" },
    { id: "sudoku", name: "Sudoku", icon: "🔢" },
    { id: "wordle", name: "Wordle", icon: "📝" },
    { id: "connect-4", name: "Connect 4", icon: "🔴" },
    { id: "tetris", name: "Tetris", icon: "🧱" },
];

const mockLeaderboard = [
    { rank: 1, username: "GrandMaster_X", avatar: "👑", elo: 2847, wins: 1523, losses: 234, winRate: 86.7, game: "chess" },
    { rank: 2, username: "NeonSlayer", avatar: "🔥", elo: 2756, wins: 1289, losses: 301, winRate: 81.1, game: "chess" },
    { rank: 3, username: "QuantumQueen", avatar: "👸", elo: 2698, wins: 987, losses: 198, winRate: 83.3, game: "sudoku" },
    { rank: 4, username: "ByteStorm", avatar: "⚡", elo: 2634, wins: 1456, losses: 412, winRate: 77.9, game: "tetris" },
    { rank: 5, username: "CryptoKnight", avatar: "🛡️", elo: 2589, wins: 876, losses: 234, winRate: 78.9, game: "chess" },
    { rank: 6, username: "PixelProwler", avatar: "🎯", elo: 2545, wins: 1234, losses: 398, winRate: 75.6, game: "wordle" },
    { rank: 7, username: "VoidWalker", avatar: "🌀", elo: 2498, wins: 765, losses: 287, winRate: 72.7, game: "connect-4" },
    { rank: 8, username: "ShadowByte", avatar: "🌙", elo: 2456, wins: 1098, losses: 456, winRate: 70.6, game: "chess" },
    { rank: 9, username: "NovaStrike", avatar: "💫", elo: 2412, wins: 654, losses: 298, winRate: 68.7, game: "sudoku" },
    { rank: 10, username: "TitanCore", avatar: "🤖", elo: 2389, wins: 987, losses: 476, winRate: 67.4, game: "tetris" },
];

const Leaderboard = () => {
    const navigate = useNavigate();
    const [selectedGame, setSelectedGame] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const filteredLeaderboard = mockLeaderboard.filter((player) => {
        const matchesGame = selectedGame === "all" || player.game === selectedGame;
        const matchesSearch = player.username.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesGame && matchesSearch;
    });

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
        return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">{rank}</span>;
    };

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
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-3xl opacity-20"
                    style={{ background: "radial-gradient(circle, hsl(45 93% 47%), transparent 60%)" }}
                />
            </div>

            {/* Header */}
            <header className="relative z-10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <motion.img
                        src={logo}
                        alt="PlugLegacy"
                        className="h-8 cursor-pointer"
                        onClick={() => navigate("/")}
                        whileHover={{ scale: 1.05 }}
                    />
                    <button
                        onClick={() => navigate("/games")}
                        className="btn-glow px-6 py-2 rounded-full text-sm font-semibold"
                    >
                        Play Now
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 px-6 py-8">
                <div className="max-w-5xl mx-auto">
                    {/* Title */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-center mb-8"
                    >
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <Trophy className="w-10 h-10 text-primary" />
                            <h1 className="text-4xl md:text-5xl font-bold gradient-text">Leaderboard</h1>
                        </div>
                        <p className="text-muted-foreground">Global rankings of the best players</p>
                    </motion.div>

                    {/* Filters */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-4 rounded-2xl mb-6"
                    >
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search players..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-glass-border rounded-xl focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>

                            {/* Game Filter */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-glass-border rounded-xl hover:border-primary/50 transition-colors min-w-[180px]"
                                >
                                    <Filter className="w-5 h-5 text-muted-foreground" />
                                    <span>{games.find((g) => g.id === selectedGame)?.name}</span>
                                    <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                                </button>

                                {isFilterOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl overflow-hidden z-20"
                                    >
                                        {games.map((game) => (
                                            <button
                                                key={game.id}
                                                onClick={() => {
                                                    setSelectedGame(game.id);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition-colors ${selectedGame === game.id ? "bg-primary/20 text-primary" : ""}`}
                                            >
                                                <span>{game.icon}</span>
                                                <span>{game.name}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Leaderboard Table */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card rounded-2xl overflow-hidden"
                    >
                        {/* Table Header */}
                        <div className="grid grid-cols-[60px_1fr_100px_100px_100px] md:grid-cols-[80px_1fr_120px_120px_120px] gap-4 px-6 py-4 bg-white/5 border-b border-glass-border text-sm font-semibold text-muted-foreground">
                            <span>Rank</span>
                            <span>Player</span>
                            <span className="text-center">ELO</span>
                            <span className="text-center hidden md:block">W/L</span>
                            <span className="text-center">Win Rate</span>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-glass-border">
                            {filteredLeaderboard.map((player, index) => (
                                <motion.div
                                    key={player.username}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => navigate(`/profile/${player.username.toLowerCase()}`)}
                                    className="grid grid-cols-[60px_1fr_100px_100px_100px] md:grid-cols-[80px_1fr_120px_120px_120px] gap-4 px-6 py-4 hover:bg-white/5 cursor-pointer transition-colors items-center"
                                >
                                    {/* Rank */}
                                    <div className="flex justify-center">{getRankIcon(player.rank)}</div>

                                    {/* Player */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-xl border border-primary/30">
                                            {player.avatar}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{player.username}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{player.game} Main</p>
                                        </div>
                                    </div>

                                    {/* ELO */}
                                    <div className="text-center">
                                        <span className="font-bold text-primary">{player.elo}</span>
                                    </div>

                                    {/* W/L */}
                                    <div className="text-center hidden md:block">
                                        <span className="text-green-400">{player.wins}</span>
                                        <span className="text-muted-foreground">/</span>
                                        <span className="text-red-400">{player.losses}</span>
                                    </div>

                                    {/* Win Rate */}
                                    <div className="text-center">
                                        <span className={`font-semibold ${player.winRate >= 75 ? "text-green-400" : player.winRate >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                                            {player.winRate}%
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </main>
        </motion.div>
    );
};

export default Leaderboard;
