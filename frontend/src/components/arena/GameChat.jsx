import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, ShieldAlert } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

const QUICK_EMOTES = ["😂", "😮", "😡", "👏", "🔥", "💀"];

const GameChat = ({ isDisabled = false, onlineCount = 1, roomId }) => {
    const scrollRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const { socket } = useSocket();

    // Get user info from local storage for avatar/name
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const myUsername = user.username || "You";
    const myAvatar = user.avatar || "👤"; // Should map this properly if it's a name like "robot_1"

    // Auto-scroll
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Socket Listener
    useEffect(() => {
        if (!socket || !roomId) return;

        const handleIncomingMessage = (msg) => {
            // Check if message is from self to avoid duplication if we optimized locally, 
            // but backend broadcasts to everyone including sender usually (or we can filter).
            // In socketManager I used io.to(roomId), so sender receives it to.
            // So we don't need to add it locally in sendMessage AND receive it.
            // Let's rely on server echo for consistency or handle local optimistic update.
            // Current socketManager emits to room.

            setMessages(prev => {
                // simple dedup check just in case
                if (prev.some(m => m.id === msg.id)) return prev;

                return [...prev, {
                    ...msg,
                    isPlayer: msg.senderId === socket.id // Determine if it's me
                }];
            });
        };

        socket.on('game_chat_message', handleIncomingMessage);

        return () => {
            socket.off('game_chat_message', handleIncomingMessage);
        };
    }, [socket, roomId]);

    const sendMessage = (text) => {
        if (!text.trim()) return;

        if (isDisabled || !roomId || !socket) {
            // Local fallback for testing/offline or just ignore?
            // If disabled, we shouldn't be here.
            // If no room, maybe just local echo?
            return;
        }

        // Emit to server
        socket.emit('game_chat_message', {
            roomId,
            message: text,
            username: myUsername,
            avatar: "👤" // sending generic emoji for now as avatar rendering in chat uses emoji
        });

        setInputValue("");
    };

    const sendEmote = (emote) => {
        sendMessage(emote);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="h-full flex flex-col glass-card rounded-2xl border border-glass-border overflow-hidden relative"
        >
            {isDisabled && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6">
                    <ShieldAlert className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
                    <h3 className="font-bold text-muted-foreground">Chat Unavailable</h3>
                    <p className="text-sm text-muted-foreground/60 mt-1">Chat is only available in Multiplayer matches.</p>
                </div>
            )}
            {/* Header */}
            <div className="px-4 py-3 border-b border-glass-border flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Live Chat</h3>
                <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {onlineCount} online
                </span>
            </div>

            {/* Safety Notice */}
            <div className="px-4 py-2 bg-yellow-500/5 border-b border-yellow-500/10 flex items-center gap-2">
                <ShieldAlert className="w-3 h-3 text-yellow-500/50" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-yellow-500/50">
                    Chat is monitored. Be respectful.
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-glass-border">
                <AnimatePresence initial={false}>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex gap-2 ${msg.isPlayer ? "flex-row-reverse" : ""}`}
                        >
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-lg bg-obsidian-light flex items-center justify-center text-lg shrink-0">
                                {msg.avatar}
                            </div>

                            {/* Message Bubble */}
                            <div
                                className={`
                  max-w-[80%] px-3 py-2 rounded-2xl
                  ${msg.isPlayer
                                        ? "bg-primary/20 border border-primary/30 rounded-tr-sm"
                                        : "bg-glass border border-glass-border rounded-tl-sm"
                                    }
                `}
                            >
                                <p className="text-xs text-muted-foreground mb-0.5">{msg.username}</p>
                                <p className="text-sm break-words">{msg.message}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={scrollRef} />
            </div>

            {/* Quick Emotes */}
            <div className="px-4 py-2 border-t border-glass-border">
                <div className="flex items-center justify-between gap-1">
                    {QUICK_EMOTES.map((emote) => (
                        <motion.button
                            key={emote}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => sendEmote(emote)}
                            className="w-10 h-10 rounded-xl bg-glass hover:bg-glass-hover border border-glass-border 
                flex items-center justify-center text-xl transition-colors"
                        >
                            {emote}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-glass-border">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage(inputValue);
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-obsidian-light border border-glass-border
              text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50
              transition-colors"
                    />
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 rounded-xl bg-primary text-primary-foreground"
                    >
                        <Send className="w-5 h-5" />
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
};

export default GameChat;
