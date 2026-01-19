import { motion } from "framer-motion";
import { Zap, Twitter, Github, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const FooterCTA = () => {
    return (
        <section id="community" className="relative py-32 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-obsidian" />

            {/* Large Ambient Glow */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px]"
                style={{
                    background: "radial-gradient(ellipse, hsl(24 100% 50% / 0.15), transparent 60%)",
                    filter: "blur(80px)",
                }}
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                {/* Main CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-2 rounded-full glass-card text-sm font-medium text-primary mb-6"
                    >
                        🔌 The Final Plug
                    </motion.span>

                    <h2 className="text-5xl md:text-7xl font-bold mb-6">
                        <span className="text-foreground">Ready to </span>
                        <span className="gradient-text">Connect?</span>
                    </h2>

                    <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
                        Join thousands of players competing in real-time. Your legacy starts now.
                    </p>

                    <Link
                        to="/signup"
                        className="inline-flex items-center gap-3 btn-glow pulse-glow px-12 py-6 rounded-full text-xl font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
                    >
                        <Zap className="w-6 h-6" />
                        JOIN THE ARENA
                    </Link>
                </motion.div>

                {/* Footer */}
                <motion.footer
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mt-32 pt-8 border-t border-glass-border"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Copyright */}
                        <p className="text-muted-foreground text-sm">
                            © 2024 PlugLegacy. All rights reserved.
                        </p>

                        {/* Links */}
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                                Privacy
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                                Terms
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                                Support
                            </a>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            <motion.a
                                href="#"
                                whileHover={{ scale: 1.2, y: -2 }}
                                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Twitter className="w-5 h-5" />
                            </motion.a>
                            <motion.a
                                href="#"
                                whileHover={{ scale: 1.2, y: -2 }}
                                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Github className="w-5 h-5" />
                            </motion.a>
                            <motion.a
                                href="#"
                                whileHover={{ scale: 1.2, y: -2 }}
                                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                            </motion.a>
                        </div>
                    </div>
                </motion.footer>
            </div>
        </section>
    );
};

export default FooterCTA;
