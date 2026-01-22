import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2, Mail, User } from "lucide-react";
import { userService } from "../../services/api";
import { AVATARS } from "../../constants/avatars";

const EditProfileModal = ({ user, onClose, onUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: user.username,
        email: user.email,
        avatar: user.avatar,
    });
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const updatedUser = await userService.updateProfile(formData);
            onUpdate(updatedUser);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-lg bg-obsidian border border-glass-border rounded-2xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-glass-border flex items-center justify-between">
                        <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full bg-black/20 border border-glass-border rounded-xl py-2.5 pl-10 pr-4 text-foreground focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Username"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-black/20 border border-glass-border rounded-xl py-2.5 pl-10 pr-4 text-foreground focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Email"
                                    />
                                </div>
                            </div>

                            {/* Avatar Selection */}
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-3">Avatar</label>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                    {AVATARS.map((avatar) => {
                                        const Icon = avatar.icon;
                                        const isSelected = formData.avatar === avatar.name;
                                        return (
                                            <button
                                                type="button"
                                                key={avatar.id}
                                                onClick={() => setFormData({ ...formData, avatar: avatar.name })}
                                                className={`aspect-square rounded-xl flex items-center justify-center transition-all ${isSelected
                                                        ? `bg-gradient-to-br ${avatar.color} ring-2 ring-offset-2 ring-offset-obsidian ring-primary`
                                                        : "bg-white/5 hover:bg-white/10"
                                                    }`}
                                            >
                                                <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-glass-border">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EditProfileModal;
