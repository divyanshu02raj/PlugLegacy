import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, Zap, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    navigate("/");
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    navigate("/");
  };

  return (
    <AuthLayout>
      {/* Header - Matching Landing Page Style */}
      <div className="text-center mb-8">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-block px-4 py-1.5 rounded-full glass-card text-xs font-medium text-primary mb-4"
        >
          ⚡ PLAYER ACCESS
        </motion.span>
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-foreground">Welcome Back, </span>
          <span className="gradient-text">Player</span>
        </motion.h1>
        <motion.p
          className="text-muted-foreground text-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Connect to the arena and dominate
        </motion.p>
      </div>

      {/* Google Auth Button - Premium Design */}
      <motion.button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full group relative overflow-hidden bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50"
        style={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.2), 0 0 40px rgba(255,255,255,0.05)",
        }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span className="text-base">Continue with Google</span>
        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </motion.button>

      {/* Divider - Styled */}
      <motion.div
        className="flex items-center gap-4 my-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />
        <span className="text-muted-foreground/60 text-xs font-medium tracking-wider">OR CONTINUE WITH EMAIL</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />
      </motion.div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          <label className="block text-sm font-medium text-foreground/80 mb-2">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-electric-amber/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity" />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <motion.input
              type="email"
              placeholder="player@pluglegacy.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`relative w-full bg-obsidian-light/50 border ${errors.email ? "border-destructive" : "border-glass-border"} rounded-xl px-4 py-4 pl-12 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300`}
              animate={errors.email ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            />
          </div>
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-destructive text-xs mt-2 flex items-center gap-1"
              >
                <span className="w-1 h-1 rounded-full bg-destructive" />
                {errors.email}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Password Field */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <label className="block text-sm font-medium text-foreground/80 mb-2">Password</label>
          <div className="relative group">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-electric-amber/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity" />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <motion.input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`relative w-full bg-obsidian-light/50 border ${errors.password ? "border-destructive" : "border-glass-border"} rounded-xl px-4 py-4 pl-12 pr-12 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300`}
              animate={errors.password ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <AnimatePresence>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-destructive text-xs mt-2 flex items-center gap-1"
              >
                <span className="w-1 h-1 rounded-full bg-destructive" />
                {errors.password}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Remember Me & Forgot Password */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
        >
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                rememberMe
                  ? "bg-primary border-primary shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                  : "border-glass-border group-hover:border-primary/50 bg-obsidian-light/30"
              }`}
            >
              {rememberMe && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3 text-primary-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                >
                  <polyline points="20 6 9 17 4 12" />
                </motion.svg>
              )}
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Remember me
            </span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:text-foreground transition-colors font-medium"
          >
            Forgot Password?
          </Link>
        </motion.div>

        {/* Submit Button - Matching Landing Page CTA */}
        <motion.button
          type="submit"
          disabled={isLoading}
          className="w-full btn-glow pulse-glow py-4 rounded-xl text-primary-foreground font-bold text-base flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Zap className="w-5 h-5 group-hover:animate-pulse" />
              <span>CONNECT TO ARENA</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </motion.button>
      </form>

      {/* Footer */}
      <motion.div
        className="text-center mt-8 pt-6 border-t border-glass-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <p className="text-muted-foreground text-sm">
          New to the network?{" "}
          <Link
            to="/signup"
            className="text-primary hover:text-foreground font-semibold transition-colors inline-flex items-center gap-1"
          >
            Create Account
            <ArrowRight className="w-3 h-3" />
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default Login;
