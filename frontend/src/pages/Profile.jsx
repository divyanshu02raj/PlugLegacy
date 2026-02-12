import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Target, Flame, Clock, UserPlus, Swords, Shield, Star, Settings, Loader2, UserMinus, AlertTriangle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { userService, friendService } from "../services/api";
import { getAvatarByName } from "../constants/avatars";
import EditProfileModal from "../components/profile/EditProfileModal";

const Profile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [friendStatus, setFriendStatus] = useState('none'); // none, friend, sent, received
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // 1. Get My Profile (for relationship status)
                const me = await userService.getProfile();

                // 2. Get Target Profile
                let target = me;
                if (id && id !== me._id) {
                    target = await userService.getUserById(id);
                }

                // 3. Set Profile Data
                const formattedMatches = (target.matches || []).map(m => {
                    const myPlayer = m.players.find(p => p.userId === target._id) || m.players[0]; // Fallback to first if schema issue
                    const opponentPlayer = m.players.find(p => p.userId !== target._id);

                    let eloChange = 0;
                    if (myPlayer?.result === 'win') eloChange = 10;
                    if (myPlayer?.result === 'loss') eloChange = -10;

                    return {
                        result: myPlayer?.result || 'draw',
                        game: (m.gameId || 'chess').charAt(0).toUpperCase() + (m.gameId || 'chess').slice(1),
                        opponent: opponentPlayer?.username || "Opponent",
                        eloChange,
                        score: myPlayer?.score || 0,
                        time: new Date(m.timestamp).toLocaleDateString()
                    };
                });

                setProfile({
                    ...target,
                    joinDate: new Date(target.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                    recentMatches: formattedMatches,
                    achievements: [
                        { icon: "🏆", name: "Gladiator", desc: "Joined the Arena" },
                        { icon: "🌱", name: "New Blood", desc: "First Login" }
                    ]
                });

                // 4. Determine Status
                if (id && id !== me._id) {
                    if (me.friends.includes(id)) {
                        setFriendStatus('friend');
                    } else if (me.sentFriendRequests.includes(id)) {
                        setFriendStatus('sent');
                    } else if (me.friendRequests.includes(id)) {
                        setFriendStatus('received');
                    } else {
                        setFriendStatus('none');
                    }
                }

            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

        window.addEventListener('friend-update', fetchProfile);
        return () => window.removeEventListener('friend-update', fetchProfile);
    }, [id]);

    const handleFriendAction = async () => {
        if (!id) return;
        try {
            if (friendStatus === 'none') {
                await friendService.sendRequest(id);
                setFriendStatus('sent');
            } else if (friendStatus === 'received') {
                await friendService.acceptRequest(id);
                setFriendStatus('friend');
            } else if (friendStatus === 'friend') {
                setShowUnfriendConfirm(true);
            }
        } catch (error) {
            console.error("Action failed:", error);
        }
    };

    const confirmUnfriend = async () => {
        try {
            await friendService.removeFriend(id);
            setFriendStatus('none');
            setShowUnfriendConfirm(false);
        } catch (error) {
            console.error("Unfriend failed", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!profile) return <div className="text-center mt-20">User not found</div>;

    const winRate = profile.gamesPlayed > 0
        ? ((profile.wins / profile.gamesPlayed) * 100).toFixed(1)
        : "0.0";

    const avatarData = getAvatarByName(profile.avatar);
    const AvatarIcon = avatarData.icon;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-background"
        >
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-background to-obsidian" />
                <div className="absolute inset-0 grid-pattern opacity-30" />
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-3xl opacity-20"
                    style={{ background: "radial-gradient(circle, hsl(24 100% 50%), transparent 60%)" }}
                />
            </div>

            {/* Header */}
            <header className="relative z-10 px-6 py-4">
                <div className="max-w-5xl mx-auto">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </motion.button>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 px-6 py-8">
                <div className="max-w-5xl mx-auto">
                    {/* Profile Card */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="glass-card rounded-3xl p-8 mb-6"
                    >
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${avatarData.color} flex items-center justify-center border-4 border-primary/50 shadow-lg shadow-primary/20`}>
                                    <AvatarIcon className="w-14 h-14 text-white" />
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary rounded-full text-xs font-bold text-primary-foreground">
                                    LVL {profile.level}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                                    <h1 className="text-3xl font-bold">{profile.username}</h1>
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-medium">
                                        <Star className="w-4 h-4" />
                                        {profile.title}
                                    </span>
                                </div>
                                <p className="text-muted-foreground mb-4">Playing since {new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    {!id ? (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowEditModal(true)}
                                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold btn-glow"
                                        >
                                            <Settings className="w-5 h-5" />
                                            Edit Profile
                                        </motion.button>
                                    ) : (
                                        <>
                                            <motion.button
                                                whileHover={friendStatus !== 'sent' ? { scale: 1.05 } : {}}
                                                whileTap={friendStatus !== 'sent' ? { scale: 0.95 } : {}}
                                                onClick={handleFriendAction}
                                                disabled={friendStatus === 'sent'}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${friendStatus === 'friend' ? "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30" :
                                                    friendStatus === 'sent' ? "bg-white/10 text-muted-foreground cursor-default" :
                                                        "btn-glow"
                                                    }`}
                                            >
                                                {friendStatus === 'friend' ? <UserMinus className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                                                {friendStatus === 'friend' ? "Unfriend" :
                                                    friendStatus === 'sent' ? "Request Sent" :
                                                        friendStatus === 'received' ? "Accept Request" :
                                                            "Add Friend"}
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold glass-card-hover border border-glass-border"
                                            >
                                                <Swords className="w-5 h-5" />
                                                Challenge
                                            </motion.button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* ELO Badge */}
                            <div className="text-center p-6 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl border border-primary/30">
                                <p className="text-sm text-muted-foreground mb-1">ELO Rating</p>
                                <p className="text-4xl font-bold gradient-text">{profile.elo}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                            { icon: Trophy, label: "Total Wins", value: profile.wins, color: "text-green-400" },
                            { icon: Target, label: "Win Rate", value: `${winRate}%`, color: "text-blue-400" },
                            { icon: Flame, label: "Win Streak", value: 0, color: "text-orange-400" }, // Mock 0 for now
                            { icon: Clock, label: "Games Played", value: profile.gamesPlayed, color: "text-purple-400" },
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                className="glass-card p-4 rounded-2xl text-center"
                            >
                                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Recent Matches */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card rounded-2xl p-6"
                        >
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Swords className="w-5 h-5 text-primary" />
                                Recent Matches
                            </h2>
                            <div className="space-y-3">
                                {profile.recentMatches.map((match, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${match.result === "win" ? "bg-green-500" :
                                                match.result === "loss" ? "bg-red-500" :
                                                    "bg-amber-500" // For score-based/draw
                                                }`} />
                                            <div>
                                                <p className="font-medium">{match.game}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {match.opponent === "Opponent" || match.opponent === "Single Player" ? "Single Player" : `vs ${match.opponent}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {match.result === "win" || match.result === "loss" ? (
                                                <p className={`font-bold ${match.eloChange > 0 ? "text-green-400" : "text-red-400"}`}>
                                                    {match.eloChange > 0 ? "+" : ""}{match.eloChange} Elo
                                                </p>
                                            ) : (
                                                <p className="font-bold text-amber-400">Played</p>
                                            )}
                                            <p className="text-xs text-muted-foreground font-mono">
                                                {match.game === 'Crossword'
                                                    ? `${Math.floor(match.score / 60)}:${(match.score % 60).toString().padStart(2, '0')}`
                                                    : `${match.score} pts`
                                                }
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/60">{match.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Achievements */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card rounded-2xl p-6"
                        >
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Achievements
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {profile.achievements.map((achievement, index) => (
                                    <div
                                        key={index}
                                        className="p-4 bg-white/5 rounded-xl text-center hover:bg-white/10 transition-colors"
                                    >
                                        <span className="text-3xl mb-2 block">{achievement.icon}</span>
                                        <p className="font-semibold text-sm">{achievement.name}</p>
                                        <p className="text-xs text-muted-foreground">{achievement.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {showEditModal && (
                <EditProfileModal
                    user={profile}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={(updatedUser) => {
                        setProfile({ ...profile, ...updatedUser });
                        setShowEditModal(false);
                    }}
                />
            )}

            {/* Unfriend Confirmation Modal */}
            {showUnfriendConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card w-full max-w-md p-6 rounded-2xl border border-red-500/30"
                    >
                        <div className="flex items-center gap-3 text-red-400 mb-4">
                            <div className="p-3 bg-red-500/10 rounded-full">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold">Unfriend {profile.username}?</h3>
                        </div>

                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to remove {profile.username} from your friends list? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowUnfriendConfirm(false)}
                                className="px-4 py-2 rounded-xl hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmUnfriend}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-semibold"
                            >
                                Unfriend
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>

    );
};

export default Profile;
