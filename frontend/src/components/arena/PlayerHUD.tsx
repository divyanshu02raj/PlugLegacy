import { motion } from "framer-motion";
import { Flag, Handshake, Settings } from "lucide-react";

interface PlayerHUDProps {
  position: "top" | "bottom";
  username: string;
  avatar: string;
  time: string;
  isActive: boolean;
  score?: number;
}

const PlayerHUD = ({ position, username, avatar, time, isActive, score = 0 }: PlayerHUDProps) => {
  const isPlayer = position === "bottom";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: position === "top" ? -20 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`relative ${position === "top" ? "mb-4" : "mt-4"}`}
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
            className={`absolute inset-0 rounded-2xl ${
              isPlayer 
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
            <span className="text-3xl flex items-center justify-center h-full bg-obsidian-light">
              {avatar}
            </span>
          </motion.div>
          
          {/* Online Indicator */}
          <span className={`
            absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background
            ${isActive ? (isPlayer ? "bg-green-500" : "bg-red-500") : "bg-muted-foreground"}
          `} />
        </div>

        {/* Username & Score */}
        <div className="flex-1">
          <h3 className="font-bold text-lg">{username}</h3>
          <p className="text-sm text-muted-foreground">Score: {score}</p>
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
        {isActive && (
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

      {/* Action Buttons (Only for player) */}
      {isPlayer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-3 mt-3"
        >
          {[
            { icon: Flag, label: "Resign", color: "text-red-400 hover:bg-red-500/20" },
            { icon: Handshake, label: "Offer Draw", color: "text-yellow-400 hover:bg-yellow-500/20" },
            { icon: Settings, label: "Settings", color: "text-muted-foreground hover:bg-glass-hover" },
          ].map(({ icon: Icon, label, color }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl glass-card border border-glass-border
                transition-colors duration-200 ${color}
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PlayerHUD;
