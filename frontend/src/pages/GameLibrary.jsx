import { motion } from "framer-motion";
import LibraryNavbar from "@/components/library/LibraryNavbar";
import FeaturedBanner from "@/components/library/FeaturedBanner";
import GameRow from "@/components/library/GameRow";

// All games data
const allGames = {
    trending: [
        { id: "chess", name: "Chess", icon: "♟️", players: 4521, tag: "Multiplayer", color: "hsl(24 100% 50% / 0.4)" },
        { id: "wordle", name: "Wordle", icon: "📝", players: 3892, tag: "Solo", color: "hsl(142 76% 36% / 0.4)" },
        { id: "snake", name: "Snake", icon: "🐍", players: 2156, tag: "Solo", color: "hsl(142 71% 45% / 0.4)" },
        { id: "tetris", name: "Tetris", icon: "🧱", players: 1823, tag: "Solo", color: "hsl(280 87% 50% / 0.4)" },
        { id: "sudoku", name: "Sudoku", icon: "🔢", players: 1654, tag: "Solo", color: "hsl(200 95% 48% / 0.4)" },
        { id: "ludo", name: "Ludo", icon: "🎲", players: 1432, tag: "Multiplayer", color: "hsl(45 93% 47% / 0.4)" },
    ],
    brainTeasers: [
        { id: "sudoku", name: "Sudoku", icon: "🔢", players: 1654, tag: "Solo", color: "hsl(200 95% 48% / 0.4)" },
        { id: "2048", name: "2048", icon: "🔲", players: 1287, tag: "Solo", color: "hsl(30 80% 55% / 0.4)" },
        { id: "crossword", name: "Crossword", icon: "✏️", players: 892, tag: "Solo", color: "hsl(180 65% 45% / 0.4)" },
        { id: "logic-grid", name: "Logic Grid", icon: "🧩", players: 567, tag: "Solo", color: "hsl(260 67% 55% / 0.4)" },
        { id: "memory-match", name: "Memory Match", icon: "🃏", players: 743, tag: "Solo", color: "hsl(320 70% 50% / 0.4)" },
        { id: "number-recall", name: "Number Recall", icon: "🧠", players: 421, tag: "Solo", color: "hsl(190 75% 45% / 0.4)" },
    ],
    strategyBoard: [
        { id: "connect-4", name: "Connect 4", icon: "🔴", players: 1123, tag: "Multiplayer", color: "hsl(0 84% 60% / 0.4)" },
        { id: "chess", name: "Chess", icon: "♟️", players: 4521, tag: "Multiplayer", color: "hsl(24 100% 50% / 0.4)" },
        { id: "ludo", name: "Ludo", icon: "🎲", players: 1432, tag: "Multiplayer", color: "hsl(45 93% 47% / 0.4)" },
        { id: "reversi", name: "Reversi", icon: "⚫", players: 654, tag: "Multiplayer", color: "hsl(0 0% 40% / 0.4)" },
        { id: "tic-tac-toe", name: "Tic-Tac-Toe", icon: "❌", players: 2341, tag: "Multiplayer", color: "hsl(210 90% 55% / 0.4)" },
        { id: "snakes-ladders", name: "Snakes & Ladders", icon: "🪜", players: 876, tag: "Multiplayer", color: "hsl(120 60% 45% / 0.4)" },
    ],
    arcadeAction: [
        { id: "pong", name: "Pong", icon: "🏓", players: 567, tag: "Multiplayer", color: "hsl(170 75% 40% / 0.4)" },
        { id: "brick-breaker", name: "Brick Breaker", icon: "🧱", players: 743, tag: "Solo", color: "hsl(15 85% 55% / 0.4)" },
        { id: "tetris", name: "Tetris", icon: "🧱", players: 1823, tag: "Solo", color: "hsl(280 87% 50% / 0.4)" },
        { id: "snake", name: "Snake", icon: "🐍", players: 2156, tag: "Solo", color: "hsl(142 71% 45% / 0.4)" },
        { id: "snake-arena", name: "Snake Arena", icon: "🐍", players: 432, tag: "Multiplayer", color: "hsl(142 85% 35% / 0.4)" },
    ],
    speedSkill: [
        { id: "speed-math", name: "Speed Math", icon: "➕", players: 654, tag: "Solo", color: "hsl(220 85% 55% / 0.4)" },
        { id: "typing-race", name: "Typing Race", icon: "⌨️", players: 876, tag: "Multiplayer", color: "hsl(50 90% 50% / 0.4)" },
        { id: "reaction-time", name: "Reaction Time", icon: "⚡", players: 543, tag: "Solo", color: "hsl(24 100% 50% / 0.4)" },
        { id: "number-recall", name: "Number Recall", icon: "🧠", players: 421, tag: "Solo", color: "hsl(190 75% 45% / 0.4)" },
    ],
    partyMode: [
        { id: "skribbl", name: "Skribbl", icon: "🎨", players: 2341, tag: "Multiplayer", color: "hsl(340 80% 55% / 0.4)" },
        { id: "ludo", name: "Ludo", icon: "🎲", players: 1432, tag: "Multiplayer", color: "hsl(45 93% 47% / 0.4)" },
        { id: "tic-tac-toe", name: "Tic-Tac-Toe", icon: "❌", players: 2341, tag: "Multiplayer", color: "hsl(210 90% 55% / 0.4)" },
        { id: "connect-4", name: "Connect 4", icon: "🔴", players: 1123, tag: "Multiplayer", color: "hsl(0 84% 60% / 0.4)" },
        { id: "typing-race", name: "Typing Race", icon: "⌨️", players: 876, tag: "Multiplayer", color: "hsl(50 90% 50% / 0.4)" },
    ],
};

const GameLibrary = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-background"
        >
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-background to-obsidian" />

                {/* Ambient Glows */}
                <motion.div
                    animate={{
                        opacity: [0.3, 0.5, 0.3],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        opacity: [0.2, 0.4, 0.2],
                        scale: [1.1, 1, 1.1],
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl"
                />

                {/* Grid Pattern */}
                <div className="absolute inset-0 grid-pattern opacity-30" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Navbar */}
                <LibraryNavbar />

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">
                    {/* Featured Banner */}
                    <FeaturedBanner />

                    {/* Game Rows */}
                    <div className="space-y-10">
                        <GameRow title="🔥 Trending Now" games={allGames.trending} index={0} />
                        <GameRow title="🧠 Brain Teasers" games={allGames.brainTeasers} index={1} />
                        <GameRow title="♟️ Strategy & Board" games={allGames.strategyBoard} index={2} />
                        <GameRow title="🕹️ Arcade Action" games={allGames.arcadeAction} index={3} />
                        <GameRow title="⚡ Speed & Skill" games={allGames.speedSkill} index={4} />
                        <GameRow title="🎉 Party Mode" games={allGames.partyMode} index={5} />
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative mt-20 py-8 border-t border-glass-border">
                    <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
                        <span>© 2024 PlugLegacy. All rights reserved.</span>
                        <div className="flex items-center gap-6">
                            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                            <a href="#" className="hover:text-foreground transition-colors">Support</a>
                        </div>
                    </div>
                </footer>
            </div>
        </motion.div>
    );
};

export default GameLibrary;
