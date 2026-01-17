import { motion } from "framer-motion";
import { Play, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const GameLibraryCard = ({ id, name, icon, players, tag, color, index = 0 }) => {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/play/${id}`);
    };

    const tagColors = {
        Solo: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        Multiplayer: "bg-primary/20 text-primary border-primary/30",
        "Co-op": "bg-green-500/20 text-green-400 border-green-500/30",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
            className="relative flex-shrink-0 w-48 cursor-pointer group"
        >
            {/* Glow Effect */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                className="absolute -inset-2 rounded-3xl blur-xl transition-opacity duration-500"
                style={{ background: color }}
            />

            {/* Card */}
            <motion.div
                animate={{
                    scale: isHovered ? 1.05 : 1,
                    y: isHovered ? -8 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative h-72 rounded-2xl overflow-hidden"
            >
                {/* Background */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: `linear-gradient(135deg, ${color}, transparent 80%)`
                    }}
                />
                <div className="absolute inset-0 bg-obsidian-light/80 backdrop-blur-sm" />

                {/* Animated Border */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    className="absolute inset-0 rounded-2xl"
                    style={{
                        background: `linear-gradient(135deg, ${color}, transparent 50%)`,
                        padding: "2px",
                        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        maskComposite: "exclude",
                        WebkitMaskComposite: "xor",
                    }}
                />

                {/* Glass Border */}
                <div className="absolute inset-0 rounded-2xl border border-glass-border group-hover:border-primary/40 transition-colors duration-300" />

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-between p-5">
                    {/* Tag */}
                    <div className={`self-start px-3 py-1 rounded-full text-xs font-medium border ${tagColors[tag]}`}>
                        {tag}
                    </div>

                    {/* Icon */}
                    <motion.div
                        animate={{
                            scale: isHovered ? 1.15 : 1,
                            rotate: isHovered ? 5 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="text-6xl"
                    >
                        {icon}
                    </motion.div>

                    {/* Info */}
                    <div className="w-full space-y-2">
                        <h3 className="text-lg font-bold text-foreground text-center truncate">
                            {name}
                        </h3>

                        {/* Player Count */}
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <Users className="w-3 h-3" />
                            <span className="text-xs font-medium">
                                {players >= 1000 ? `${(players / 1000).toFixed(1)}k` : players} playing
                            </span>
                        </div>
                    </div>

                    {/* Play Button Overlay */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: isHovered ? 1 : 0,
                            scale: isHovered ? 1 : 0.8,
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl"
                    >
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-glow p-4 rounded-full"
                        >
                            <Play className="w-6 h-6 text-primary-foreground fill-current" />
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default GameLibraryCard;
