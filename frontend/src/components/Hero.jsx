import { motion } from 'framer-motion';
import { Play, Zap } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 pt-24 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />

            <div className="max-w-7xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    <motion.h1
                        className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-white via-gray-100 to-orange-400 bg-clip-text text-transparent leading-tight"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Classic Games.<br />Modern Connections.
                    </motion.h1>

                    <motion.p
                        className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        The all-in-one multiplayer hub for Sudoku, Chess, Tic-Tac-Toe, and more.
                        Challenge friends in real-time.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-orange-500/50 transition-all flex items-center space-x-2"
                        >
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 rounded-2xl bg-orange-400 opacity-0 group-hover:opacity-20 blur-xl"
                            />
                            <Play className="w-5 h-5" fill="currentColor" />
                            <span>Start Gaming</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all"
                        >
                            Watch Demo
                        </motion.button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
                    >
                        {[
                            { game: 'Chess', icon: '♟️' },
                            { game: 'Sudoku', icon: '🔢' },
                            { game: '2048', icon: '🎯' },
                            { game: 'Wordle', icon: '📝' }
                        ].map((item, index) => (
                            <motion.div
                                key={item.game}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 + index * 0.1 }}
                                whileHover={{ y: -10, scale: 1.05 }}
                                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/20 transition-all group"
                            >
                                <div className="text-4xl mb-2">{item.icon}</div>
                                <h3 className="text-white font-semibold text-lg group-hover:text-orange-400 transition-colors">
                                    {item.game}
                                </h3>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
        </section>
    );
}
