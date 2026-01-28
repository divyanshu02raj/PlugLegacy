import { useState } from "react";
import { motion } from "framer-motion";
import { Flag, Handshake, Settings, Mic, MicOff, Video, VideoOff, Lock, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AVATARS } from "../../constants/avatars";

const PlayerHUD = ({
    position, username, avatar, time, isActive,
    score = 0, isFriend = false,
    isCallActive = false, isCallMuted = false, isLocalVideoOn = false,
    onStartCall, onToggleMute, onToggleVideo, onResign, onDraw,
    hideMedia = false, hideActions = false, hideTurn = false,
    isPlayer: isPlayerProp // Alias to avoid conflict with derived var
}) => {
    const isPlayer = isPlayerProp !== undefined ? isPlayerProp : position === "bottom";
    const { toast } = useToast();

    const handleMediaClick = (type) => {
        if (!isFriend) return;

        if (type === 'video') {
            if (!isCallActive) {
                toast({ title: "Video Call", description: `Calling ${username}...` });
                if (onStartCall) onStartCall('video');
            } else {
                if (onToggleVideo) onToggleVideo(!isLocalVideoOn);
            }
        } else if (type === 'mic') {
            if (!isCallActive) {
                toast({ title: "Voice Call", description: `Calling ${username}...` });
                if (onStartCall) onStartCall('voice');
            } else {
                if (onToggleMute) onToggleMute(!isCallMuted);
            }
        }
    };

    const MediaButton = ({ type, isOn, icon: Icon, offIcon: OffIcon }) => (
        <div className="relative group">
            <motion.button
                whileHover={isFriend ? { scale: 1.05 } : {}}
                whileTap={isFriend ? { scale: 0.95 } : {}}
                onClick={() => handleMediaClick(type)}
                className={`
                    w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200
                    ${!isFriend
                        ? "bg-glass border-white/5 text-gray-600 cursor-not-allowed"
                        : isOn
                            ? "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                            : "bg-glass border-glass-border text-muted-foreground hover:bg-glass-hover hover:text-white"
                    }
                `}
            >
                {isOn ? <Icon className="w-5 h-5" /> : <OffIcon className="w-5 h-5" />}
            </motion.button>

            {!isFriend && (
                <>
                    <div className="absolute -top-1 -right-1 bg-neutral-900 rounded-full p-0.5 border border-white/10">
                        <Lock className="w-3 h-3 text-gray-500" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                        Add friend to enable
                    </div>
                </>
            )}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: position === "top" ? -20 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`relative ${position === "top" ? "mb-4" : "mt-2"}`}
        >
            {/* Main HUD Bar */}
            <motion.div
                animate={{
                    boxShadow: isActive
                        ? isPlayer
                            ? "0 0 30px hsl(142 71% 45% / 0.4), inset 0 0 20px hsl(142 71% 45% / 0.1)"
                            : "0 0 30px hsl(0 84% 60% / 0.4), inset 0 0 20px hsl(0 84% 60% / 0.1)"
                        : "none",
                }}
                className={`
          relative glass-card px-6 py-3 rounded-2xl flex items-center gap-4
          ${isActive
                        ? isPlayer
                            ? "border-green-500/50"
                            : "border-red-500/50"
                        : "border-glass-border"
                    }
        `}
            >
                {/* Active Indicator Glow */}
                {isActive && (
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={`absolute inset-0 rounded-2xl ${isPlayer
                            ? "bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent"
                            : "bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent"
                            }`}
                    />
                )}

                {/* Avatar */}
                <div className="relative">
                    <motion.div
                        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`
              w-12 h-12 rounded-xl overflow-hidden border-2
              ${isActive
                                ? isPlayer
                                    ? "border-green-500"
                                    : "border-red-500"
                                : "border-glass-border"
                            }
            `}
                    >
                        {(() => {
                            const isUrl = avatar?.startsWith('http') || avatar?.startsWith('data:');
                            const isFile = avatar?.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i);
                            const isImage = isUrl || isFile;

                            // Check for known avatar name OR special bot mapping
                            const knownAvatar = AVATARS.find(a => a.name === avatar) || (avatar === "🤖" ? AVATARS.find(a => a.name === "Automaton") : null);

                            if (isImage) {
                                return (
                                    <img
                                        src={isUrl ? avatar : (avatar.startsWith('/') ? avatar : `/${avatar}`)}
                                        alt={username}
                                        className="w-full h-full object-cover"
                                    />
                                );
                            }

                            if (knownAvatar) {
                                const Icon = knownAvatar.icon;
                                return (
                                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${knownAvatar.color}`}>
                                        <Icon className="w-3/5 h-3/5 text-white" />
                                    </div>
                                );
                            }

                            const displayText = avatar || username?.charAt(0).toUpperCase() || "👤";
                            const isEmoji = displayText.length <= 2;

                            return (
                                <span className={`${isEmoji ? 'text-2xl' : 'text-[10px] leading-tight break-words p-1'} flex items-center justify-center h-full bg-obsidian-light text-foreground font-bold overflow-hidden text-center`}>
                                    {displayText}
                                </span>
                            );
                        })()}
                    </motion.div>

                    {/* Online Indicator */}
                    <span className={`
            absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background
            ${isActive ? (isPlayer ? "bg-green-500" : "bg-red-500") : "bg-muted-foreground"}
          `} />
                </div>

                <div className="flex-1">
                    <h3 className="font-bold text-lg">{username}</h3>
                </div>

                {/* Timer */}
                <motion.div
                    animate={isActive ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                    className={`
            px-5 py-2 rounded-xl font-mono text-2xl font-bold
            ${isActive
                            ? isPlayer
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            : "bg-glass text-muted-foreground"
                        }
          `}
                >
                    {time}
                </motion.div>

                {/* Turn Indicator */}
                {isActive && !hideTurn && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`
              px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
              ${isPlayer
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }
            `}
                    >
                        {isPlayer ? "Your Turn" : "Thinking..."}
                    </motion.div>
                )}
            </motion.div>

            {/* Action Buttons (Video/Mic + Game Actions) */}
            {isPlayer && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-6 mt-3"
                >
                    {/* Media Controls */}
                    {!hideMedia && (
                        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                            <MediaButton
                                type="mic"
                                isOn={isCallActive && !isCallMuted}
                                icon={Mic}
                                offIcon={MicOff}
                            />
                            <MediaButton
                                type="video"
                                isOn={isLocalVideoOn}
                                icon={Video}
                                offIcon={VideoOff}
                            />
                        </div>
                    )}

                    {/* Game Actions */}
                    {!hideActions && (
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onResign}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card border border-glass-border transition-colors duration-200 text-red-400 hover:bg-red-500/20"
                            >
                                <Flag className="w-4 h-4" />
                                <span className="text-sm font-medium">Resign</span>
                            </motion.button>

                            {!hideMedia && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onDraw}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card border border-glass-border transition-colors duration-200 text-yellow-400 hover:bg-yellow-500/20"
                                >
                                    <Handshake className="w-4 h-4" />
                                    <span className="text-sm font-medium">Offer Draw</span>
                                </motion.button>
                            )}
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

export default PlayerHUD;
