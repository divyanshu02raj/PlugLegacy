import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX, Palette, Lock, User, Bell, Monitor, Save, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import { resetOnboarding } from "@/components/OnboardingTutorial";

const boardThemes = [
    { id: "glass", name: "Glass", preview: "bg-gradient-to-br from-white/10 to-white/5" },
    { id: "wood", name: "Classic Wood", preview: "bg-gradient-to-br from-amber-800 to-amber-900" },
    { id: "neon", name: "Neon", preview: "bg-gradient-to-br from-purple-600 to-cyan-600" },
    { id: "midnight", name: "Midnight", preview: "bg-gradient-to-br from-slate-800 to-slate-900" },
];

const Settings = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();

    const [settings, setSettings] = useState({
        masterVolume: 75,
        musicVolume: 50,
        sfxVolume: 80,
        notifications: true,
        soundEnabled: true,
        boardTheme: "glass",
    });

    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: "",
    });

    const handleSave = () => {
        toast({
            title: "Settings Saved",
            description: "Your preferences have been updated successfully.",
        });
    };

    const handlePasswordChange = () => {
        if (passwords.new !== passwords.confirm) {
            toast({
                title: "Error",
                description: "New passwords do not match.",
                variant: "destructive",
            });
            return;
        }
        toast({
            title: "Password Updated",
            description: "Your password has been changed successfully.",
        });
        setPasswords({ current: "", new: "", confirm: "" });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-background"
        >
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-background to-obsidian" />
                <div className="absolute inset-0 grid-pattern opacity-30" />
            </div>

            {/* Header */}
            <header className="relative z-10 px-6 py-4">
                <div className="max-w-3xl mx-auto">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </motion.button>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 px-6 py-8">
                <div className="max-w-3xl mx-auto">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-3xl font-bold mb-8"
                    >
                        Settings
                    </motion.h1>

                    {/* Sound Settings */}
                    <motion.section
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card rounded-2xl p-6 mb-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/20 rounded-xl">
                                <Volume2 className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold">Sound</h2>
                            <button
                                onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                                className={`ml-auto px-4 py-2 rounded-lg text-sm font-medium transition-colors ${settings.soundEnabled ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                            >
                                {settings.soundEnabled ? "Enabled" : "Disabled"}
                            </button>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: "Master Volume", key: "masterVolume" },
                                { label: "Music", key: "musicVolume" },
                                { label: "Sound Effects", key: "sfxVolume" },
                            ].map((item) => (
                                <div key={item.key}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-muted-foreground">{item.label}</span>
                                        <span className="text-sm font-medium">{settings[item.key]}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={settings[item.key]}
                                        onChange={(e) => setSettings({ ...settings, [item.key]: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                                        disabled={!settings.soundEnabled}
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* App Theme (Dark/Light Mode) */}
                    <motion.section
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="glass-card rounded-2xl p-6 mb-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <Monitor className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">App Theme</h2>
                                    <p className="text-sm text-muted-foreground">Switch between dark and light mode</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl">
                                <button
                                    onClick={() => setTheme("dark")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                        theme === "dark" 
                                            ? "bg-primary text-white shadow-lg" 
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <Moon className="w-4 h-4" />
                                    Dark
                                </button>
                                <button
                                    onClick={() => setTheme("light")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                        theme === "light" 
                                            ? "bg-primary text-white shadow-lg" 
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <Sun className="w-4 h-4" />
                                    Light
                                </button>
                            </div>
                        </div>
                    </motion.section>

                    {/* Board Theme */}
                    <motion.section
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card rounded-2xl p-6 mb-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/20 rounded-xl">
                                <Palette className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold">Board Theme</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {boardThemes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setSettings({ ...settings, boardTheme: t.id })}
                                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${settings.boardTheme === t.id ? "border-primary ring-2 ring-primary/30" : "border-glass-border hover:border-primary/50"}`}
                                >
                                    <div className={`absolute inset-0 ${t.preview}`} />
                                    <div className="absolute inset-0 flex items-end p-2">
                                        <span className="text-xs font-medium bg-black/50 px-2 py-1 rounded text-white">{t.name}</span>
                                    </div>
                                    {settings.boardTheme === t.id && (
                                        <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                            <span className="text-xs">✓</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.section>

                    {/* Notifications */}
                    <motion.section
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card rounded-2xl p-6 mb-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <Bell className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Notifications</h2>
                                    <p className="text-sm text-muted-foreground">Game invites, friend requests, etc.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                                className={`relative w-14 h-8 rounded-full transition-colors ${settings.notifications ? "bg-primary" : "bg-white/10"}`}
                            >
                                <span className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.notifications ? "left-7" : "left-1"}`} />
                            </button>
                        </div>
                    </motion.section>

                    {/* Change Password */}
                    <motion.section
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card rounded-2xl p-6 mb-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/20 rounded-xl">
                                <Lock className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold">Change Password</h2>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="password"
                                placeholder="Current Password"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-xl focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            <input
                                type="password"
                                placeholder="New Password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-xl focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-xl focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            <button
                                onClick={handlePasswordChange}
                                className="btn-glow px-6 py-3 rounded-xl font-semibold"
                            >
                                Update Password
                            </button>
                        </div>
                    </motion.section>

                    {/* Reset Onboarding */}
                    <motion.section
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.45 }}
                        className="glass-card rounded-2xl p-6 mb-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-xl">
                                    <User className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Tutorial</h2>
                                    <p className="text-sm text-muted-foreground">Show the welcome tutorial again</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    resetOnboarding();
                                    toast({
                                        title: "Tutorial Reset",
                                        description: "Refresh the page to see the onboarding tutorial.",
                                    });
                                }}
                                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg font-medium hover:bg-blue-500/30 transition-colors"
                            >
                                Reset Tutorial
                            </button>
                        </div>
                    </motion.section>

                    {/* Save Button */}
                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        className="w-full btn-glow py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        Save All Settings
                    </motion.button>
                </div>
            </main>
        </motion.div>
    );
};

export default Settings;
