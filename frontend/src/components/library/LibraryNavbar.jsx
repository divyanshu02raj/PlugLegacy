import { motion, AnimatePresence } from "framer-motion";
import { Search, Settings, User, Loader2, LogOut, Gamepad2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import { userService, authService } from "../../services/api";
import { getAvatarByName } from "../../constants/avatars";

const GAMES = [
    { id: 'chess', name: 'Chess', type: 'game', route: '/play/chess', color: 'from-orange-500 to-amber-500' },
    { id: 'sudoku', name: 'Sudoku', type: 'game', route: '/play/sudoku', color: 'from-blue-500 to-cyan-500' }
];

const LibraryNavbar = () => {
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const users = await userService.getAllUsers();
                setAllUsers(users);

                const user = authService.getCurrentUser();
                if (user) {
                    setCurrentUser(user);
                }
            } catch (error) {
                console.error("Failed to load users for search", error);
            }
        };
        fetchUsers();

        const handleUserUpdate = () => {
            const user = authService.getCurrentUser();
            if (user) {
                setCurrentUser(user);
            }
        }

        window.addEventListener('user-update', handleUserUpdate);
        return () => window.removeEventListener('user-update', handleUserUpdate);
    }, []);

    useEffect(() => {
        if (!searchValue.trim()) {
            setSearchResults([]);
            return;
        }

        const query = searchValue.toLowerCase();

        // Filter Users
        const userResults = allUsers.filter(user =>
            user.username.toLowerCase().includes(query)
        ).map(user => ({ ...user, type: 'user' }));

        // Filter Games
        const gameResults = GAMES.filter(game =>
            game.name.toLowerCase().includes(query)
        );

        // Combine and limit
        const results = [...gameResults, ...userResults].slice(0, 5);

        setSearchResults(results);
    }, [searchValue, allUsers]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleResultClick = (result) => {
        if (result.type === 'game') {
            navigate(result.route);
        } else {
            navigate(`/profile/${result._id}`);
        }
        setSearchValue("");
        setSearchFocused(false);
    };

    const handleLogout = () => {
        authService.logout();
        setCurrentUser(null);
        navigate("/login");
    };

    const userAvatarData = currentUser ? getAvatarByName(currentUser.avatar) : null;
    const UserIcon = userAvatarData ? userAvatarData.icon : User;

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
                        ref={searchRef}
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
                                placeholder="Search players & games..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
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

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {searchFocused && searchValue && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-obsidian border border-glass-border rounded-xl shadow-2xl overflow-hidden py-2"
                                >
                                    {searchResults.length > 0 ? (
                                        searchResults.map((result) => {
                                            if (result.type === 'game') {
                                                return (
                                                    <div
                                                        key={result.id}
                                                        onClick={() => handleResultClick(result)}
                                                        className="px-4 py-3 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors"
                                                    >
                                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${result.color} flex items-center justify-center`}>
                                                            <Gamepad2 className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-foreground">{result.name}</p>
                                                            <p className="text-xs text-muted-foreground">Game</p>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // User result
                                            const avatarData = getAvatarByName(result.avatar);
                                            const AvatarIcon = avatarData.icon;
                                            return (
                                                <div
                                                    key={result._id}
                                                    onClick={() => handleResultClick(result)}
                                                    className="px-4 py-3 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors"
                                                >
                                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarData.color} flex items-center justify-center`}>
                                                        <AvatarIcon className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm text-foreground">{result.username}</p>
                                                        <p className="text-xs text-muted-foreground">Level {Math.floor(result.wins / 10) + 1}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="px-4 py-3 text-center text-muted-foreground text-sm">
                                            No results found
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
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

                        {/* Profile Dropdown */}
                        <div
                            className="relative z-50"
                            onMouseEnter={() => setIsProfileOpen(true)}
                            onMouseLeave={() => setIsProfileOpen(false)}
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate("/profile")}
                                className="flex items-center gap-3 px-4 py-2 rounded-xl glass-card-hover"
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${userAvatarData ? `bg-gradient-to-br ${userAvatarData.color}` : "bg-primary/20 border border-primary/30"}`}>
                                    <UserIcon className={`w-4 h-4 ${userAvatarData ? "text-white" : "text-primary"}`} />
                                </div>
                                <span className="text-sm font-medium text-foreground hidden sm:block">
                                    {currentUser ? currentUser.username : "Profile"}
                                </span>
                            </motion.button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl overflow-hidden shadow-xl border border-glass-border"
                                    >
                                        <div className="p-1">
                                            <button
                                                onClick={() => navigate("/profile")}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium text-left"
                                            >
                                                <User className="w-4 h-4 text-primary" />
                                                Profile
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium text-left text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Logout
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default LibraryNavbar;
