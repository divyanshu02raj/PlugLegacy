import { motion } from 'framer-motion';
import { Zap, Github, Twitter, MessageCircle } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative py-24 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent" />

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-orange-400 bg-clip-text text-transparent mb-6">
                        Ready to Plug In?
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                        Join thousands of players competing in real-time multiplayer games
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative bg-gradient-to-r from-orange-500 to-orange-600 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-orange-500/50 transition-all inline-flex items-center space-x-3"
                    >
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-2xl bg-orange-400 opacity-0 group-hover:opacity-20 blur-xl"
                        />
                        <Zap className="w-6 h-6" fill="currentColor" />
                        <span>Get Started Free</span>
                    </motion.button>
                </motion.div>

                <div className="border-t border-white/10 pt-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div>
                            <img
                                src="/chatgpt_image_jan_15,_2026,_04_16_58_pm.png"
                                alt="PlugLegacy Logo"
                                className="h-8 w-auto mb-4"
                            />
                            <p className="text-gray-400 text-sm">
                                Classic games, modern connections. The ultimate multiplayer gaming platform.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#games" className="hover:text-orange-400 transition-colors">Games</a></li>
                                <li><a href="#leaderboard" className="hover:text-orange-400 transition-colors">Leaderboard</a></li>
                                <li><a href="#about" className="hover:text-orange-400 transition-colors">About</a></li>
                                <li><a href="#support" className="hover:text-orange-400 transition-colors">Support</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Connect</h4>
                            <div className="flex space-x-4">
                                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-400/50 rounded-xl flex items-center justify-center transition-all group">
                                    <Github className="w-5 h-5 text-gray-400 group-hover:text-orange-400 transition-colors" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-400/50 rounded-xl flex items-center justify-center transition-all group">
                                    <Twitter className="w-5 h-5 text-gray-400 group-hover:text-orange-400 transition-colors" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-400/50 rounded-xl flex items-center justify-center transition-all group">
                                    <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-orange-400 transition-colors" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-gray-500 text-sm">
                        <p>&copy; 2026 PlugLegacy. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
