import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, History, ChevronUp } from "lucide-react";
import GameChat from "./GameChat";
import GameInfoPanel from "./GameInfoPanel";

const MobileDrawer = ({ isOpen, onClose, activeTab, setActiveTab }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 h-[70vh] bg-background border-t border-glass-border rounded-t-3xl z-50 overflow-hidden"
                    >
                        {/* Handle */}
                        <div className="flex justify-center py-3">
                            <div className="w-12 h-1.5 rounded-full bg-glass-border" />
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-2 px-4 pb-3">
                            <button
                                onClick={() => setActiveTab("chat")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors ${activeTab === "chat"
                                        ? "bg-primary/20 text-primary border border-primary/30"
                                        : "bg-glass border border-glass-border text-muted-foreground"
                                    }`}
                            >
                                <MessageCircle className="w-4 h-4" />
                                Chat
                            </button>
                            <button
                                onClick={() => setActiveTab("info")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors ${activeTab === "info"
                                        ? "bg-primary/20 text-primary border border-primary/30"
                                        : "bg-glass border border-glass-border text-muted-foreground"
                                    }`}
                            >
                                <History className="w-4 h-4" />
                                Game Info
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2.5 rounded-xl bg-glass border border-glass-border text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="h-[calc(100%-80px)] px-4 pb-4 overflow-hidden">
                            {activeTab === "chat" ? (
                                <GameChat />
                            ) : (
                                <div className="h-full overflow-y-auto">
                                    <GameInfoPanel />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export const MobileMenuButton = ({ onClick }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="fixed bottom-6 right-6 z-30 p-4 rounded-2xl btn-glow shadow-lg flex items-center gap-2"
        >
            <ChevronUp className="w-5 h-5" />
            <span className="font-medium">Menu</span>
        </motion.button>
    );
};

export default MobileDrawer;
