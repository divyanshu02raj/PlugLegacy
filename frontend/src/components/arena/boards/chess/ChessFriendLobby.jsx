import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Search, ArrowLeft } from "lucide-react";
import { friendService } from "../../../../services/api";
import { useSocket } from "../../../../context/SocketContext";
import { toast } from "sonner";

const ChessFriendLobby = ({ onBack }) => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
    const [invitedUsers, setInvitedUsers] = useState(new Set());
    const [onlineFriends, setOnlineFriends] = useState(new Set()); // Track online friend IDs

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const data = await friendService.getFriends();
                setFriends(data);
            } catch (error) {
                console.error("Error loading friends", error);
                toast.error("Could not load friends list");
            } finally {
                setLoading(false);
            }
        };
        fetchFriends();
    }, []);

    // Listen for online status updates
    useEffect(() => {
        if (!socket) return;

        const handleOnlineList = (ids) => {
            setOnlineFriends(new Set(ids));
        };

        const handleFriendOnline = ({ userId }) => {
            setOnlineFriends(prev => new Set(prev).add(userId));
        };

        const handleFriendOffline = ({ userId }) => {
            setOnlineFriends(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        };

        socket.on('online_friends_list', handleOnlineList);
        socket.on('friend_online', handleFriendOnline);
        socket.on('friend_offline', handleFriendOffline);

        // Request initial status
        socket.emit('request_online_friends');

        return () => {
            socket.off('online_friends_list', handleOnlineList);
            socket.off('friend_online', handleFriendOnline);
            socket.off('friend_offline', handleFriendOffline);
        };
    }, [socket]);

    const handleInvite = (friend) => {
        if (!socket) {
            toast.error("Not connected to server");
            return;
        }

        socket.emit('send_game_invite', {
            toUserId: friend._id,
            gameType: 'chess',
            fromUsername: 'Friend' // Replace with actual username if available in context
        });

        setInvitedUsers(prev => new Set(prev).add(friend._id));
        toast.success(`Invite sent to ${friend.username}`);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-[600px] gap-6 animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div className="w-full flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <div className="text-center flex-1 pr-9">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        Play with Friend
                    </h2>
                    <p className="text-sm text-white/50">Invite an online friend to start</p>
                </div>
            </div>

            {/* Friend List */}
            <div className="w-full min-h-[300px] glass-card rounded-2xl p-4 border border-white/10 flex flex-col gap-2">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-white/30">Loading friends...</div>
                ) : friends.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/30 gap-3">
                        <Users className="w-12 h-12 opacity-50" />
                        <p>No friends found. Add some friends first!</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {friends
                            .sort((a, b) => {
                                const aOnline = onlineFriends.has(a._id);
                                const bOnline = onlineFriends.has(b._id);
                                if (aOnline === bOnline) return 0;
                                return aOnline ? -1 : 1;
                            })
                            .map((friend) => {
                                const isOnline = onlineFriends.has(friend._id);
                                return (
                                    <motion.div
                                        key={friend._id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
                                                {friend.username?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-bold text-white group-hover:text-purple-300 transition-colors">
                                                    {friend.username}
                                                </h4>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ${isOnline ? "bg-emerald-500" : "bg-gray-500"}`}></span>
                                                    <span className={`text-xs ${isOnline ? "text-emerald-400" : "text-gray-500"}`}>
                                                        {isOnline ? "Online" : "Offline"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleInvite(friend)}
                                            disabled={!isOnline || invitedUsers.has(friend._id)}
                                            className={`
                                            px-4 py-1.5 rounded-full text-sm font-semibold transition-all
                                            ${(!isOnline || invitedUsers.has(friend._id))
                                                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                                                    : "bg-purple-500 text-white hover:bg-purple-600 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                                                }
                                        `}
                                        >
                                            {invitedUsers.has(friend._id) ? "Invited" : "Invite"}
                                        </button>
                                    </motion.div>
                                );
                            })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChessFriendLobby;
