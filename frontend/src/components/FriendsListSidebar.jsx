import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ChevronRight, ChevronLeft, Swords, MessageCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockFriends = [
    { id: 1, username: "NeonSlayer", avatar: "🔥", status: "online", playing: "Chess" },
    { id: 2, username: "QuantumQueen", avatar: "👸", status: "online", playing: null },
    { id: 3, username: "ByteStorm", avatar: "⚡", status: "online", playing: "Tetris" },
    { id: 4, username: "CryptoKnight", avatar: "🛡️", status: "away", playing: null },
    { id: 5, username: "VoidWalker", avatar: "🌀", status: "offline", playing: null },
    { id: 6, username: "ShadowByte", avatar: "🌙", status: "offline", playing: null },
];

const FriendsListSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const onlineFriends = mockFriends.filter((f) => f.status === "online" || f.status === "away");
    const offlineFriends = mockFriends.filter((f) => f.status === "offline");

    const filteredOnline = onlineFriends.filter((f) =>
        f.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredOffline = offlineFriends.filter((f) =>
        f.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case "online":
                return "bg-green-500";
            case "away":
                return "bg-yellow-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed right-0 top-1/2 -translate-y-1/2 z-40 p-3 glass-card rounded-l-xl border border-r-0 border-glass-border hidden lg:flex items-center gap-2"
            >
                <Users className="w-5 h-5" />
                <span className="text-xs font-medium">{onlineFriends.length}</span>
                {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </motion.button>

            {/* Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.aside
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed right-0 top-0 bottom-0 w-80 glass-card border-l border-glass-border z-50 flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-glass-border">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-bold text-lg flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        Friends
                                    </h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search friends..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-white/5 border border-glass-border rounded-lg text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Friends List */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {/* Online */}
                                {filteredOnline.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                                            Online — {filteredOnline.length}
                                        </h3>
                                        <div className="space-y-2">
                                            {filteredOnline.map((friend) => (
                                                <FriendItem key={friend.id} friend={friend} navigate={navigate} getStatusColor={getStatusColor} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Offline */}
                                {filteredOffline.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                                            Offline — {filteredOffline.length}
                                        </h3>
                                        <div className="space-y-2">
                                            {filteredOffline.map((friend) => (
                                                <FriendItem key={friend.id} friend={friend} navigate={navigate} getStatusColor={getStatusColor} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

const FriendItem = ({ friend, navigate, getStatusColor }) => (
    <motion.div
        whileHover={{ x: 4 }}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
    >
        {/* Avatar */}
        <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                {friend.avatar}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${getStatusColor(friend.status)}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
            <p
                className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate(`/profile/${friend.username.toLowerCase()}`)}
            >
                {friend.username}
            </p>
            {friend.playing ? (
                <p className="text-xs text-green-400">Playing {friend.playing}</p>
            ) : (
                <p className="text-xs text-muted-foreground capitalize">{friend.status}</p>
            )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Message">
                <MessageCircle className="w-4 h-4" />
            </button>
            {friend.status !== "offline" && (
                <button className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors text-primary" title="Challenge">
                    <Swords className="w-4 h-4" />
                </button>
            )}
        </div>
    </motion.div>
);

export default FriendsListSidebar;
