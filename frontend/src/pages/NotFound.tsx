import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
      {/* Ambient Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, hsl(24 100% 50% / 0.15), transparent 60%)",
          filter: "blur(80px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center"
      >
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-8xl md:text-9xl font-bold gradient-text mb-4"
        >
          404
        </motion.h1>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
          Page Not Found
        </h2>
        
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like you've wandered into uncharted territory. The page you're looking for doesn't exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-glow px-8 py-4 rounded-full text-lg font-semibold text-primary-foreground flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="glass-card-hover px-8 py-4 rounded-full text-lg font-medium text-foreground flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
