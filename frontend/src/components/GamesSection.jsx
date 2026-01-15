import { motion } from "framer-motion";
import { Crown, Grid3X3, Hash, Type } from "lucide-react";
import GameCard from "./GameCard";

const games = [
    {
        name: "Chess",
        icon: <Crown className="w-16 h-16 text-amber-400" />,
        players: 12453,
        color: "hsl(45 100% 50% / 0.3)",
    },
    {
        name: "Sudoku",
        icon: <Grid3X3 className="w-16 h-16 text-blue-400" />,
        players: 8721,
        color: "hsl(210 100% 50% / 0.3)",
    },
    {
        name: "Connect 4",
        icon: <div className="flex gap-1">
            <div className="w-5 h-5 rounded-full bg-red-500" />
            <div className="w-5 h-5 rounded-full bg-yellow-500" />
            <div className="w-5 h-5 rounded-full bg-red-500" />
            <div className="w-5 h-5 rounded-full bg-yellow-500" />
        </div>,
        players: 6234,
        color: "hsl(0 100% 50% / 0.3)",
    },
    {
        name: "Wordle",
        icon: <Type className="w-16 h-16 text-green-400" />,
        players: 15892,
        color: "hsl(120 100% 40% / 0.3)",
    },
];

const GamesSection = () => {
    return (
        <section id="games" className="relative py-32 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-obsidian-light" />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-transparent to-obsidian" />

            <div className="relative z-10 max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-2 rounded-full glass-card text-sm font-medium text-primary mb-4"
                    >
                        🎮 Choose Your Battle
                    </motion.span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Timeless Games,</span>
                        <br />
                        <span className="text-foreground">Modern Arena</span>
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Jump into competitive matches with players from around the globe.
                        Every game. Every moment. Real-time.
                    </p>
                </motion.div>

                {/* Game Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {games.map((game, index) => (
                        <GameCard
                            key={game.name}
                            name={game.name}
                            icon={game.icon}
                            players={game.players}
                            color={game.color}
                            index={index}
                        />
                    ))}
                </div>

                {/* View All Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-12"
                >
                    <a
                        href="#all-games"
                        className="text-primary hover:text-electric-amber transition-colors font-medium inline-flex items-center gap-2"
                    >
                        View All Games
                        <span className="text-xl">→</span>
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default GamesSection;
