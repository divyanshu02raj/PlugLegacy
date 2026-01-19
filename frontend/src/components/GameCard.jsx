import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const GameCard = ({ name, icon, players, color, index, id }) => {
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const navigate = useNavigate();

    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        setRotateX(-mouseY / 10);
        setRotateY(mouseX / 10);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    const handleClick = () => {
        if (id) {
            navigate(`/play/${id}`);
        } else {
            navigate('/games');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transformStyle: "preserve-3d",
            }}
            className="relative group cursor-pointer"
        >
            {/* Glow Effect on Hover */}
            <div
                className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                style={{ background: color }}
            />

            {/* Card */}
            <div className="relative glass-card p-8 rounded-3xl h-80 flex flex-col items-center justify-center gap-6 group-hover:border-primary/40 transition-all duration-300">
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div
                        className="absolute inset-0 rounded-3xl"
                        style={{
                            background: `linear-gradient(135deg, ${color}, transparent 50%)`,
                            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                            maskComposite: "exclude",
                            WebkitMaskComposite: "xor",
                            padding: "1px",
                        }}
                    />
                </div>

                {/* Icon */}
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="text-6xl"
                    style={{ transform: "translateZ(50px)" }}
                >
                    {icon}
                </motion.div>

                {/* Name */}
                <h3
                    className="text-2xl font-bold text-foreground"
                    style={{ transform: "translateZ(30px)" }}
                >
                    {name}
                </h3>

                {/* Active Players */}
                <div
                    className="flex items-center gap-2 text-muted-foreground"
                    style={{ transform: "translateZ(20px)" }}
                >
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">
                        {players.toLocaleString()} playing
                    </span>
                </div>

                {/* Play Button - Appears on Hover */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ scale: 1.05 }}
                    className="absolute bottom-6 btn-glow px-6 py-2 rounded-full text-sm font-semibold text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                    Play Now
                </motion.button>
            </div>
        </motion.div>
    );
};

export default GameCard;
