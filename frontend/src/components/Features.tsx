//frontend\src\components\Features.tsx
import { motion } from 'framer-motion';
import { Users, Trophy, MessageSquare, Plug } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Real-time Multiplayer',
    description: 'Connect instantly with players worldwide. Zero lag, pure competition.',
    gradient: 'from-orange-500/20 to-red-500/20'
  },
  {
    icon: Trophy,
    title: 'Global Leaderboards',
    description: 'Climb the ranks and prove your skills. Track your progress and dominate.',
    gradient: 'from-orange-500/20 to-yellow-500/20'
  },
  {
    icon: MessageSquare,
    title: 'In-Game Chat',
    description: 'Communicate with opponents and teammates. Make new friends while you play.',
    gradient: 'from-orange-500/20 to-pink-500/20'
  },
  {
    icon: Plug,
    title: 'Plug-in Architecture',
    description: 'Extensible platform designed for the future. More games, more features.',
    gradient: 'from-orange-500/20 to-cyan-500/20'
  }
];

export default function Features() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-orange-400 bg-clip-text text-transparent mb-4">
            Built for Gamers
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Everything you need for the ultimate multiplayer gaming experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`group relative bg-gradient-to-br ${feature.gradient} backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-orange-400/50 hover:shadow-xl hover:shadow-orange-500/20 transition-all`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
