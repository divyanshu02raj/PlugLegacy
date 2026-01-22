import { Bot, Sword, Gamepad2, Skull, Crown, Zap, Shield, Ghost, Flame } from "lucide-react";

export const AVATARS = [
    { id: 1, icon: Bot, name: "Automaton", color: "from-cyan-400 to-blue-600" },
    { id: 2, icon: Sword, name: "Shinobi", color: "from-purple-400 to-pink-600" },
    { id: 3, icon: Gamepad2, name: "Retro", color: "from-green-400 to-emerald-600" },
    { id: 4, icon: Skull, name: "Phantom", color: "from-gray-400 to-zinc-600" },
    { id: 5, icon: Crown, name: "Royal", color: "from-yellow-400 to-amber-600" },
    { id: 6, icon: Zap, name: "Electric", color: "from-orange-400 to-red-500" },
    { id: 7, icon: Shield, name: "Guardian", color: "from-blue-400 to-indigo-600" },
    { id: 8, icon: Ghost, name: "Specter", color: "from-violet-400 to-purple-600" },
    { id: 9, icon: Flame, name: "Inferno", color: "from-red-400 to-orange-600" },
];

export const getAvatarByName = (name) => {
    return AVATARS.find(avatar => avatar.name === name) || AVATARS[0]; // Default to Automaton if not found
};
