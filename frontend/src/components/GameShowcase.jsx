import { motion } from 'framer-motion';
import { Crown, Grid3x3, Dices, Circle } from 'lucide-react';

const games = [
    {
        name: 'Chess',
        icon: Crown,
        description: 'The timeless strategy game',
        color: 'from-amber-500 to-yellow-600',
        players: '1.2k+ active'
    },
    {
        name: 'Sudoku',
        icon: Grid3x3,
        description: 'Mind-bending number puzzles',
        color: 'from-blue-500 to-cyan-600',
        players: '800+ active'
    },
    {
        name: 'Ludo',
        icon: Dices,
        description: 'Classic board game fun',
        color: 'from-green-500 to-emerald-600',
        players: '2k+ active'
    },
    {
        name: 'Connect 4',
        icon: Circle,
        description: 'Strategic disc-dropping action',
        color: 'from-red-500 to-rose-600',
        players: '600+ active'
    }
];

export default function GameShowcase() {
    return (
        <section className="py-24 px-4 relative">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-orange-400 bg-clip-text text-transparent mb-4">
                        Master the Classics
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl">
                        Your favorite games, reimagined for multiplayer
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {games.map((game, index) => (
                        <motion.div
                            key={game.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10, scale: 1.05 }}
                            className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-orange-400/50 transition-all"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity`} />

                            <div className="relative z-10">
                                <div className={`w-16 h-16 bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <game.icon className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">
                                    {game.name}
                                </h3>

                                <p className="text-gray-400 mb-4 text-sm">
                                    {game.description}
                                </p>

                                <div className="flex items-center space-x-2 text-orange-400 text-sm font-semibold">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span>{game.players}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
