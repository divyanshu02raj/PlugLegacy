import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Maximize2, Volume2, VolumeX } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import logo from "@/assets/logo.png";
import PlayerHUD from "@/components/arena/PlayerHUD";
import GameBoard from "@/components/arena/GameBoard";
import GameChat from "@/components/arena/GameChat";
import GameInfoPanel from "@/components/arena/GameInfoPanel";
import MobileDrawer, { MobileMenuButton } from "@/components/arena/MobileDrawer";

// Game metadata
const gameInfo: Record<string, { name: string; icon: string; color: string }> = {
  chess: { name: "Chess", icon: "♟️", color: "hsl(24 100% 50%)" },
  sudoku: { name: "Sudoku", icon: "🔢", color: "hsl(200 95% 48%)" },
  wordle: { name: "Wordle", icon: "📝", color: "hsl(142 76% 36%)" },
  snake: { name: "Snake", icon: "🐍", color: "hsl(142 71% 45%)" },
  tetris: { name: "Tetris", icon: "🧱", color: "hsl(280 87% 50%)" },
  "2048": { name: "2048", icon: "🔲", color: "hsl(30 80% 55%)" },
  "connect-4": { name: "Connect 4", icon: "🔴", color: "hsl(0 84% 60%)" },
  ludo: { name: "Ludo", icon: "🎲", color: "hsl(45 93% 47%)" },
  pong: { name: "Pong", icon: "🏓", color: "hsl(170 75% 40%)" },
  skribbl: { name: "Skribbl", icon: "🎨", color: "hsl(340 80% 55%)" },
  crossword: { name: "Crossword", icon: "✏️", color: "hsl(180 65% 45%)" },
  reversi: { name: "Reversi", icon: "⚫", color: "hsl(0 0% 40%)" },
  "tic-tac-toe": { name: "Tic-Tac-Toe", icon: "❌", color: "hsl(210 90% 55%)" },
  "typing-race": { name: "Typing Race", icon: "⌨️", color: "hsl(50 90% 50%)" },
  "speed-math": { name: "Speed Math", icon: "➕", color: "hsl(220 85% 55%)" },
  "reaction-time": { name: "Reaction Time", icon: "⚡", color: "hsl(24 100% 50%)" },
  "memory-match": { name: "Memory Match", icon: "🃏", color: "hsl(320 70% 50%)" },
  "brick-breaker": { name: "Brick Breaker", icon: "🧱", color: "hsl(15 85% 55%)" },
  "logic-grid": { name: "Logic Grid", icon: "🧩", color: "hsl(260 67% 55%)" },
  "number-recall": { name: "Number Recall", icon: "🧠", color: "hsl(190 75% 45%)" },
  "snakes-ladders": { name: "Snakes & Ladders", icon: "🪜", color: "hsl(120 60% 45%)" },
  "snake-arena": { name: "Snake Arena", icon: "🐍", color: "hsl(142 85% 35%)" },
};

const GameArena = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMuted, setIsMuted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<"chat" | "info">("chat");
  
  const game = gameInfo[gameId || ""] || { name: "Tic-Tac-Toe", icon: "❌", color: "hsl(210 90% 55%)" };

  // Mock data
  const isPlayerTurn = true;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background overflow-hidden"
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-background to-obsidian" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <motion.div
          animate={{ opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${game.color.replace(")", " / 0.3)")}, transparent 60%)` }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Top Header Bar */}
        <header className="shrink-0 px-4 lg:px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="glass-card px-4 lg:px-6 py-2.5 rounded-2xl flex items-center justify-between">
              {/* Left - Back & Game Info */}
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/games")}
                  className="p-2 rounded-xl glass-card-hover border border-glass-border"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{game.icon}</span>
                  <div>
                    <h1 className="font-bold">{game.name}</h1>
                    <p className="text-xs text-muted-foreground">Ranked Match</p>
                  </div>
                </div>
              </div>

              {/* Center - Logo */}
              <img src={logo} alt="PlugLegacy" className="h-6 lg:h-8 hidden sm:block" />

              {/* Right - Controls */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-xl glass-card-hover border border-glass-border"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-xl glass-card-hover border border-glass-border hidden sm:block"
                >
                  <Maximize2 className="w-5 h-5" />
                </motion.button>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">LIVE</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Arena */}
        <main className="flex-1 px-4 lg:px-6 py-4 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full">
            {isMobile ? (
              /* Mobile Layout */
              <div className="h-full flex flex-col">
                {/* Opponent HUD */}
                <PlayerHUD
                  position="top"
                  username="ProPlayer99"
                  avatar="🤖"
                  time="2:45"
                  isActive={!isPlayerTurn}
                  score={1}
                />

                {/* Game Board */}
                <div className="flex-1 flex items-center justify-center py-4">
                  <GameBoard />
                </div>

                {/* Player HUD */}
                <PlayerHUD
                  position="bottom"
                  username="You"
                  avatar="🎮"
                  time="2:52"
                  isActive={isPlayerTurn}
                  score={1}
                />

                {/* Mobile Menu Button */}
                <MobileMenuButton onClick={() => setIsDrawerOpen(true)} />

                {/* Mobile Drawer */}
                <MobileDrawer
                  isOpen={isDrawerOpen}
                  onClose={() => setIsDrawerOpen(false)}
                  activeTab={activeDrawerTab}
                  setActiveTab={setActiveDrawerTab}
                />
              </div>
            ) : (
              /* Desktop Layout - Three Columns */
              <div className="h-full grid grid-cols-[280px_1fr_320px] gap-6">
                {/* Left - Game Info Panel */}
                <GameInfoPanel />

                {/* Center - Board Area */}
                <div className="flex flex-col">
                  {/* Opponent HUD */}
                  <PlayerHUD
                    position="top"
                    username="ProPlayer99"
                    avatar="🤖"
                    time="2:45"
                    isActive={!isPlayerTurn}
                    score={1}
                  />

                  {/* Game Board */}
                  <div className="flex-1 flex items-center justify-center">
                    <GameBoard />
                  </div>

                  {/* Player HUD */}
                  <PlayerHUD
                    position="bottom"
                    username="You"
                    avatar="🎮"
                    time="2:52"
                    isActive={isPlayerTurn}
                    score={1}
                  />
                </div>

                {/* Right - Chat Sidebar */}
                <GameChat />
              </div>
            )}
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default GameArena;
