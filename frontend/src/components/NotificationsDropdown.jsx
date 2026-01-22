import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Swords, UserPlus, Trophy, X, Check } from "lucide-react";
import { friendService } from "../services/api";

const mockNotifications = [
    {
        id: 1,
        type: "invite",
        title: "Game Invite",
        message: "Alex challenged you to a Chess match",
        time: "2 min ago",
        read: false,
    },
    {
        id: 3,
        type: "tournament",
        title: "Tournament Starting",
        message: "Weekly Chess Tournament starts in 1 hour",
        time: "1 hour ago",
        read: true,
    },
];

const NotificationsDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);
    const [friendRequests, setFriendRequests] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchFriendRequests();
        }

        const handleUpdate = () => {
            fetchFriendRequests();
        };

        window.addEventListener('friend-update', handleUpdate);
        return () => window.removeEventListener('friend-update', handleUpdate);
    }, [isOpen]);

    const fetchFriendRequests = async () => {
        try {
            const requests = await friendService.getRequests();
            setFriendRequests(requests);
        } catch (error) {
            console.error("Failed to fetch friend requests", error);
        }
    };

    const handleAccept = async (id) => {
        try {
            await friendService.acceptRequest(id);
            // Refresh requests
            fetchFriendRequests();
        } catch (error) {
            console.error("Failed to accept request", error);
        }
    };

    const handleReject = async (id) => {
        try {
            await friendService.rejectRequest(id);
            // Refresh requests
            fetchFriendRequests();
        } catch (error) {
            console.error("Failed to reject request", error);
        }
    };

    const totalNotifications = notifications.length + friendRequests.length;
    const unreadCount = notifications.filter((n) => !n.read).length + friendRequests.length;

    const getIcon = (type) => {
        switch (type) {
            case "invite":
                return <Swords className="w-5 h-5 text-primary" />;
            case "friend":
                return <UserPlus className="w-5 h-5 text-blue-400" />;
            case "tournament":
                return <Trophy className="w-5 h-5 text-yellow-400" />;
            default:
                return <Bell className="w-5 h-5" />;
        }
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl glass-card-hover border border-glass-border"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs font-bold flex items-center justify-center text-primary-foreground">
                        {unreadCount}
                    </span>
                )}
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-80 glass-card rounded-2xl overflow-hidden z-50 shadow-xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border">
                                <h3 className="font-semibold">Notifications</h3>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-[400px] overflow-y-auto">
                                {totalNotifications === 0 ? (
                                    <div className="px-4 py-8 text-center text-muted-foreground">
                                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>No notifications</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        {/* Friend Requests */}
                                        {friendRequests.map((request) => (
                                            <motion.div
                                                key={request._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex items-start gap-3 px-4 py-3 border-b border-glass-border bg-primary/5 hover:bg-white/10 transition-colors"
                                            >
                                                <div className="shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                    <UserPlus className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm">Friend Request</p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        <span className="font-bold text-foreground">{request.username}</span> sent you a request
                                                    </p>
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleAccept(request._id)}
                                                            className="flex items-center gap-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs rounded-full transition-colors"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(request._id)}
                                                            className="flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded-full transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                            Decline
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {/* Other Notifications */}
                                        {notifications.map((notification) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={`flex items-start gap-3 px-4 py-3 border-b border-glass-border hover:bg-white/5 transition-colors ${!notification.read ? "bg-primary/5" : ""}`}
                                            >
                                                <div className="shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm">{notification.title}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                                                </div>
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors"
                                                    >
                                                        <Check className="w-4 h-4 text-green-400" />
                                                    </button>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationsDropdown;
