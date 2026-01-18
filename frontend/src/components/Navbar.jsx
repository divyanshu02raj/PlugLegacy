import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/small_logo.png";

const navLinks = [
    { name: "Games", href: "#games" },
    { name: "Features", href: "#features" },
    { name: "Community", href: "#community" },
    { name: "About", href: "#about" },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
        >
            <div className="max-w-7xl mx-auto">
                <div className="glass-card px-6 py-3 flex items-center justify-between">
                    {/* Logo with subtle glow */}
                    <a href="#" className="flex-shrink-0 relative">
                        <div
                            className="absolute inset-0 -m-4"
                            style={{
                                background: "radial-gradient(ellipse at center, hsl(24 100% 50% / 0.4), transparent 70%)",
                                filter: "blur(15px)",
                            }}
                        />
                        <div className="relative">
                            {/* Overlay to blend navy edges */}
                            <div
                                className="absolute inset-0 pointer-events-none z-10"
                                style={{
                                    background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, hsl(0 0% 100% / 0.03) 100%)",
                                }}
                            />
                            <img
                                src={logo}
                                alt="PlugLegacy"
                                className="relative h-14 md:h-20 w-auto object-contain"
                                style={{
                                    filter: "drop-shadow(0 0 20px hsl(24 100% 50% / 0.5))",
                                }}
                            />
                        </div>
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link, index) => (
                            <motion.a
                                key={link.name}
                                href={link.href}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index + 0.3 }}
                                className="text-foreground/80 hover:text-foreground transition-colors duration-300 text-sm font-medium"
                            >
                                {link.name}
                            </motion.a>
                        ))}
                        <motion.a
                            href="#play"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 }}
                            className="btn-glow pulse-glow px-6 py-2.5 rounded-full text-sm font-semibold text-primary-foreground"
                        >
                            Play Now
                        </motion.a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-foreground p-2"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden mt-2 glass-card p-4"
                    >
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="block py-3 text-foreground/80 hover:text-foreground transition-colors border-b border-glass-border last:border-0"
                            >
                                {link.name}
                            </a>
                        ))}
                        <a
                            href="#play"
                            className="btn-glow mt-4 block text-center px-6 py-3 rounded-full text-sm font-semibold text-primary-foreground"
                        >
                            Play Now
                        </a>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
};

export default Navbar;
