import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
        >
            <div className="max-w-7xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 px-6 py-4 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img
                            src="/no_bg_logo.png"
                            alt="PlugLegacy Logo"
                            className="h-16 w-auto object-contain"
                        />
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#games" className="text-gray-200 hover:text-orange-400 transition-colors font-medium">
                            Games
                        </a>
                        <a href="#leaderboard" className="text-gray-200 hover:text-orange-400 transition-colors font-medium">
                            Leaderboard
                        </a>
                        <a href="#about" className="text-gray-200 hover:text-orange-400 transition-colors font-medium">
                            About
                        </a>
                        <a href="#login" className="text-gray-200 hover:text-orange-400 transition-colors font-medium">
                            Login
                        </a>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-orange-500/50 transition-shadow"
                    >
                        Play Now
                    </motion.button>
                </div>
            </div>
        </motion.nav>
    );
}
