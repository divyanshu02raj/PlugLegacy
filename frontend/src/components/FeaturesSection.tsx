import { motion } from "framer-motion";
import { Zap, Puzzle, Trophy, MessageCircle, Globe, Shield } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Zero-Lag Multiplayer",
    description: "WebSocket-powered real-time gameplay. Every move synced instantly across the globe.",
    size: "large",
    gradient: "from-orange-500/20 to-amber-500/20",
  },
  {
    icon: Puzzle,
    title: "Plug-in Architecture",
    description: "Infinitely scalable. Add new games without touching the core.",
    size: "small",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Trophy,
    title: "Global ELO Leaderboards",
    description: "Compete for the top spot. Real rankings, real glory.",
    size: "small",
    gradient: "from-yellow-500/20 to-orange-500/20",
  },
  {
    icon: MessageCircle,
    title: "Cross-Platform Chat",
    description: "Talk strategy or trash. Seamless communication across all devices.",
    size: "medium",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Globe,
    title: "85+ Countries",
    description: "A truly global arena.",
    size: "small",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: Shield,
    title: "Anti-Cheat System",
    description: "Fair play guaranteed.",
    size: "small",
    gradient: "from-red-500/20 to-rose-500/20",
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const sizeClasses = {
    large: "md:col-span-2 md:row-span-2",
    medium: "md:col-span-2",
    small: "",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative ${sizeClasses[feature.size as keyof typeof sizeClasses]}`}
    >
      <div className="h-full glass-card-hover p-8 rounded-3xl overflow-hidden">
        {/* Background Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6"
          >
            <feature.icon className="w-7 h-7 text-primary" />
          </motion.div>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed flex-grow">
            {feature.description}
          </p>

          {/* Decorative Element */}
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-30 transition-opacity">
            <feature.icon className="w-full h-full" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-obsidian" />
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-electric-amber/10 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full glass-card text-sm font-medium text-primary mb-4"
          >
            ⚡ The Engine
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Built for </span>
            <span className="gradient-text">Champions</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Under the hood, PlugLegacy runs on cutting-edge technology designed for competitive gaming.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
