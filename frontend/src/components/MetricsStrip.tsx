import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const metrics = [
  { value: 1500000, suffix: "+", label: "Matches Played" },
  { value: 85, suffix: "", label: "Countries Connected" },
  { value: 99.9, suffix: "%", label: "Uptime" },
  { value: 50000, suffix: "+", label: "Active Players" },
];

const AnimatedCounter = ({ value, suffix }: { value: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + "K";
    }
    return num.toString();
  };

  return (
    <span ref={ref}>
      {formatNumber(count)}{suffix}
    </span>
  );
};

const MetricsStrip = () => {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-obsidian-light" />
      
      {/* Glass Strip */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto px-4"
        >
          <div className="glass-card p-8 md:p-12 rounded-3xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-5xl font-bold gradient-text mb-2">
                    <AnimatedCounter value={metric.value} suffix={metric.suffix} />
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground">
                    {metric.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MetricsStrip;
