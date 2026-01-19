import { motion } from "framer-motion";
import { Search, Settings, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import NotificationsDropdown from "@/components/NotificationsDropdown";

const LibraryNavbar = () => {
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const navigate = useNavigate();

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="sticky top-0 z-50 px-6 py-4"
        >
            <div className="max-w-7xl mx-auto">
                <div className="glass-card px-6 py-3 flex items-center justify-between gap-6">
                    {/* Logo */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate("/")}
                        className="cursor-pointer flex-shrink-0"
                    >
                        <img
                            src={logo}
                            alt="PlugLegacy"
                            className="h-10 w-auto"
                            style={{
                                filter: "drop-shadow(0 0 10px hsl(24 100% 50% / 0.3))",
                            }}
                        />
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        animate={{
                            scale: searchFocused ? 1.02 : 1,
                        }}
                        className="flex-1 max-w-2xl relative"
                    >
                        <div
                            className={`
                relative flex items-center gap-3 px-5 py-3 rounded-xl
                bg-black/40 border transition-all duration-300
                ${searchFocused
                                    ? "border-primary/50 shadow-[0_0_20px_hsl(24_100%_50%/0.2)]"
                                    : "border-glass-border"
                                }
              `}
                        >
                            <Search className={`w-5 h-5 transition-colors ${searchFocused ? "text-primary" : "text-muted-foreground"}`} />
                            <input
                                type="text"
                                placeholder="Search games, friends, or rooms..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
                            />
                            {searchValue && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => setSearchValue("")}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    ✕
                                </motion.button>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Notifications Dropdown */}
                        <NotificationsDropdown />

                        {/* Settings */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/settings")}
                            className="p-3 rounded-xl glass-card-hover"
                        >
                            <Settings className="w-5 h-5 text-muted-foreground" />
                        </motion.button>

                        {/* Profile */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/profile")}
                            className="flex items-center gap-3 px-4 py-2 rounded-xl glass-card-hover"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground hidden sm:block">Player</span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default LibraryNavbar;
