import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const ParticleGrid = () => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const generateParticles = () => {
            const newParticles = [];
            for (let i = 0; i < 50; i++) {
                newParticles.push({
                    id: i,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 4 + 2,
                    duration: Math.random() * 10 + 8,
                    delay: Math.random() * 5,
                });
            }
            setParticles(newParticles);
        };
        generateParticles();
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Grid Pattern */}
            <div className="absolute inset-0 grid-pattern opacity-30" />

            {/* Animated Particles */}
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="particle-glow"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                    }}
                    animate={{
                        y: [0, -100, -200],
                        opacity: [0.3, 0.8, 0],
                        scale: [1, 1.2, 0.8],
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            ))}

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20">
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(24 100% 50%)" stopOpacity="0" />
                        <stop offset="50%" stopColor="hsl(24 100% 50%)" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="hsl(24 100% 50%)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[...Array(8)].map((_, i) => (
                    <motion.line
                        key={i}
                        x1={`${10 + i * 12}%`}
                        y1="0%"
                        x2={`${30 + i * 8}%`}
                        y2="100%"
                        stroke="url(#lineGradient)"
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.3 }}
                        transition={{
                            duration: 3,
                            delay: i * 0.2,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
};

export default ParticleGrid;
