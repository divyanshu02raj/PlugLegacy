import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ChevronRight, ChevronLeft, ChevronDown, UserPlus, UserMinus, Swords, MessageCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { friendService } from "../services/api";
import { getAvatarByName } from "../constants/avatars";

const FriendsListSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    // Data States
    const [friends, setFriends] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);

    // Collapsible States
    const [sections, setSections] = useState({
        online: true,
        offline: true,
        incoming: true,
        outgoing: true
    });

    const toggleSection = (section) => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const fetchData = async () => {
        try {
            const [friendsData, incomingData, outgoingData] = await Promise.all([
                friendService.getFriends(),
                friendService.getRequests(),
                friendService.getSentRequests()
            ]);
            setFriends(friendsData);
            setIncomingRequests(incomingData);
            setOutgoingRequests(outgoingData);
        } catch (error) {
            console.error("Failed to fetch sidebar data", error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }

        const handleUpdate = () => {
            if (isOpen) fetchData();
        };

        window.addEventListener('friend-update', handleUpdate);
        return () => window.removeEventListener('friend-update', handleUpdate);
    }, [isOpen]);

    // Filtering & Categorization
    // Mocking online status for now as random since backend doesn't support it yet
    const onlineFriends = friends.filter(f => false); // All offline for now
    const offlineFriends = friends;

    const filterList = (list) => list.filter(item =>
        item.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredOnline = filterList(onlineFriends);
    const filteredOffline = filterList(offlineFriends);
    const filteredIncoming = filterList(incomingRequests);
    const filteredOutgoing = filterList(outgoingRequests);

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
                <span className="text-xs font-medium">{friends.length}</span>
                {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </motion.button>

            {/* Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
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
                                        Social
                                    </h2>
                                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-white/5 border border-glass-border rounded-lg text-sm focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {/* Online Section */}
                                <CollapsibleSection
                                    title="Online"
                                    count={filteredOnline.length}
                                    isOpen={sections.online}
                                    onToggle={() => toggleSection('online')}
                                >
                                    {filteredOnline.map(friend => (
                                        <FriendItem key={friend._id} user={friend} status="online" navigate={navigate} />
                                    ))}
                                </CollapsibleSection>

                                {/* Offline Section */}
                                <CollapsibleSection
                                    title="Offline"
                                    count={filteredOffline.length}
                                    isOpen={sections.offline}
                                    onToggle={() => toggleSection('offline')}
                                >
                                    {filteredOffline.map(friend => (
                                        <FriendItem key={friend._id} user={friend} status="offline" navigate={navigate} />
                                    ))}
                                </CollapsibleSection>

                                {/* Incoming Requests */}
                                <CollapsibleSection
                                    title="Incoming Requests"
                                    count={filteredIncoming.length}
                                    isOpen={sections.incoming}
                                    onToggle={() => toggleSection('incoming')}
                                >
                                    {filteredIncoming.map(user => (
                                        <RequestItem key={user._id} user={user} type="incoming" navigate={navigate} />
                                    ))}
                                </CollapsibleSection>

                                {/* Outgoing Requests */}
                                <CollapsibleSection
                                    title="Outgoing Requests"
                                    count={filteredOutgoing.length}
                                    isOpen={sections.outgoing}
                                    onToggle={() => toggleSection('outgoing')}
                                >
                                    {filteredOutgoing.map(user => (
                                        <RequestItem key={user._id} user={user} type="outgoing" navigate={navigate} />
                                    ))}
                                </CollapsibleSection>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

const CollapsibleSection = ({ title, count, isOpen, onToggle, children }) => (
    <div className="border border-glass-border rounded-xl overflow-hidden bg-white/5">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
        >
            <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase ${count > 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {title}
                </span>
                <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {count}
                </span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-2 pt-0 space-y-1">
                        {count === 0 ? (
                            <p className="text-xs text-muted-foreground p-2 text-center italic">None</p>
                        ) : children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const FriendItem = ({ user, status, navigate }) => {
    const avatarData = getAvatarByName(user.avatar);
    const AvatarIcon = avatarData.icon;

    return (
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors group">
            <div className="relative">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarData.color} flex items-center justify-center`}>
                    <AvatarIcon className="w-4 h-4 text-white" />
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${status === 'online' ? "bg-green-500" : "bg-gray-500"}`} />
            </div>
            <div className="flex-1 min-w-0 pointer-events-none lg:pointer-events-auto" onClick={() => navigate(`/profile/${user._id}`)}>
                <p className="text-sm font-medium truncate cursor-pointer hover:text-primary">{user.username}</p>
                <p className="text-[10px] text-muted-foreground">ELO: {user.elo}</p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 hover:bg-white/10 rounded-md" title="Message">
                    <MessageCircle className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};

const RequestItem = ({ user, type, navigate }) => {
    const avatarData = getAvatarByName(user.avatar);
    const AvatarIcon = avatarData.icon;

    const handleAction = async (action) => {
        try {
            if (action === 'accept') {
                await friendService.acceptRequest(user._id);
            } else if (action === 'reject') {
                await friendService.rejectRequest(user._id);
            } else if (action === 'cancel') {
                // Determine if we need a cancelOutgoing request endpoint or if reject works (usually generic remove/reject)
                // Using removeFriend for verify
                await friendService.removeFriend(user._id); // Assuming cancel is removing the request
            }
        } catch (error) {
            console.error("Action failed", error);
        }
    };

    return (
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarData.color} flex items-center justify-center shrink-0`}>
                <AvatarIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0" onClick={() => navigate(`/profile/${user._id}`)}>
                <p className="text-sm font-medium truncate cursor-pointer hover:text-primary">{user.username}</p>
                <p className="text-[10px] text-muted-foreground">{type === 'incoming' ? "Wants to connect" : "Request sent"}</p>
            </div>

            {type === 'incoming' ? (
                <div className="flex gap-1">
                    <button onClick={() => handleAction('accept')} className="p-1.5 bg-green-500/20 text-green-400 rounded-md hover:bg-green-500/30">
                        <UserPlus className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleAction('reject')} className="p-1.5 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30">
                        <UserMinus className="w-3.5 h-3.5" />
                    </button>
                </div>
            ) : (
                <button onClick={() => handleAction('cancel')} className="p-1.5 hover:bg-white/10 rounded-md text-muted-foreground hover:text-red-400">
                    <UserMinus className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
};

export default FriendsListSidebar;
