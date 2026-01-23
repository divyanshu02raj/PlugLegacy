import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, ChevronRight, ChevronLeft, Check, X, Clock } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const GameInvitesSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [invites, setInvites] = useState([]);

    useEffect(() => {
        if (!socket) return;

        const handleInvite = (data) => {
            // data: { fromUserId, fromUsername, gameType, socketId }
            // Add to invites if not already there (dedupe by socketId + timestamp?)
            // We assume one invite per user for simplicity or just append.
            const newInvite = { ...data, receivedAt: Date.now() };
            setInvites(prev => [newInvite, ...prev]);

            // Auto-open if closed? Maybe not, to avoid intrusion.
            // But show badge.
        };

        socket.on('receive_game_invite', handleInvite);

        // Remove invite if game starts (handled by global listener too, but clean up here)
        const handleGameStart = () => {
            setInvites([]); // Clear all invites on game start? Or just the accepted one?
            // For now clear all to be safe so user doesn't click old invites.
            setIsOpen(false);
        };

        socket.on('game_start', handleGameStart);

        return () => {
            socket.off('receive_game_invite', handleInvite);
            socket.off('game_start', handleGameStart);
        };
    }, [socket]);

    const handleAccept = (invite) => {
        socket.emit('respond_game_invite', {
            accepted: true,
            toSocketId: invite.socketId,
            gameType: invite.gameType
        });
        // Optimistically remove
        setInvites(prev => prev.filter(i => i !== invite));
    };

    const handleDecline = (invite) => {
        // socket.emit('respond_game_invite', { accepted: false ... });
        setInvites(prev => prev.filter(i => i !== invite));
        toast.info("Invite declined");
    };

    if (!socket) return null;

    return (
        <>
            {/* Toggle Button - Positioned below Friends Sidebar */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed right-0 top-[60%] -translate-y-1/2 z-40 p-3 glass-card rounded-l-xl border border-r-0 border-glass-border hidden lg:flex items-center gap-2"
            >
                <Gamepad2 className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-medium">{invites.length}</span>
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
                            className="fixed right-0 top-0 bottom-0 w-80 glass-card border-l border-glass-border z-50 flex flex-col bg-obsidian/95"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-glass-border">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-bold text-lg flex items-center gap-2">
                                        <Gamepad2 className="w-5 h-5 text-purple-400" />
                                        Game Invites
                                    </h2>
                                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {invites.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm italic">
                                        <Gamepad2 className="w-8 h-8 opacity-20 mb-2" />
                                        No pending invites
                                    </div>
                                ) : (
                                    invites.map((invite, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-white">{invite.fromUsername}</span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Just now
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-300 mb-3">
                                                Invited you to play <span className="text-purple-400 font-bold uppercase">{invite.gameType}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAccept(invite)}
                                                    className="flex-1 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                                                >
                                                    <Check className="w-3 h-3" /> Accept
                                                </button>
                                                <button
                                                    onClick={() => handleDecline(invite)}
                                                    className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                                                >
                                                    <X className="w-3 h-3" /> Decline
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default GameInvitesSidebar;
