import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Maximize2, Volume2, VolumeX } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSocket } from "@/context/SocketContext";
import { useIsMobile } from "@/hooks/use-mobile";
import logo from "@/assets/logo.png";
import PlayerHUD from "@/components/arena/PlayerHUD";
import GameBoard from "@/components/arena/GameBoard";
import GameChat from "@/components/arena/GameChat";
import GameInfoPanel from "@/components/arena/GameInfoPanel";
import MobileDrawer, { MobileMenuButton } from "@/components/arena/MobileDrawer";
import VideoOverlay from "@/components/arena/VideoOverlay";
import { userService } from "@/services/api";

// Game metadata - All supported games
const gameInfo = {
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
};

const GameArena = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { socket } = useSocket();
    const isMobile = useIsMobile();
    const [isMuted, setIsMuted] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeDrawerTab, setActiveDrawerTab] = useState("chat");

    // Game Active Mode (state from child board)
    const [activeGameMode, setActiveGameMode] = useState(location.state?.multiplayer ? 'friend' : null);
    const isGameActive = !!activeGameMode;
    const [moves, setMoves] = useState([]);

    // Reset game state when moving between modes or back to menu
    useEffect(() => {
        if (!activeGameMode) {
            setMoves([]);
            setScores({ player: 0, opponent: 0 });
        }
    }, [activeGameMode]);

    const game = gameInfo[gameId || ""] || { name: "Tic-Tac-Toe", icon: "❌", color: "hsl(210 90% 55%)" };

    // Player Data
    const { players } = location.state || {};
    const myId = socket?.id;
    const opponentId = Object.keys(players || {}).find(id => id !== myId);

    // Fallback to local user data if not in multiplayer state
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    const me = players?.[myId] || {
        username: localUser.username || "You",
        avatar: localUser.avatar || "👤",
        score: localUser.wins || 0,
        elo: localUser.elo
    };

    let opponent = players?.[opponentId] || { username: "Waiting...", avatar: "⏳", score: 0 };
    if (activeGameMode === 'computer') {
        opponent = { username: "Stockfish AI", avatar: "🤖", score: 0 };
    }

    // Mock data
    const isPlayerTurn = true;

    // Call State (Voice & Video)
    const [isCallActive, setIsCallActive] = useState(false);
    const [isCallMuted, setIsCallMuted] = useState(false);
    const [isLocalVideoOn, setIsLocalVideoOn] = useState(false);

    const handleStartCall = (type) => {
        setIsCallActive(true);
        setIsLocalVideoOn(type === 'video');
        setIsCallMuted(false);
    };

    const handleEndCall = () => {
        setIsCallActive(false);
        setIsLocalVideoOn(false);
        setIsCallMuted(false);
    };

    const boardRef = useRef(null);
    const [isResignModalOpen, setIsResignModalOpen] = useState(false);

    const handleResignClick = () => {
        setIsResignModalOpen(true);
    };

    const confirmResign = () => {
        boardRef.current?.resign();
        setIsResignModalOpen(false);
    };

    const cancelResign = () => {
        setIsResignModalOpen(false);
    };

    const handleOfferDraw = () => {
        boardRef.current?.offerDraw();
    };

    const [scores, setScores] = useState({ player: 0, opponent: 0 });

    // Handle material score updates from ChessBoard
    const handleScoreUpdate = ({ w, b }) => {
        // Determine player colors
        let myColor = 'w';
        if (activeGameMode === 'computer') {
            myColor = 'w'; // User is always white vs computer for now
        } else if (activeGameMode === 'friend' && players?.[myId]) {
            myColor = players[myId].color;
        }

        setScores(prev => ({
            ...prev,
            player: myColor === 'w' ? w : b,
            opponent: myColor === 'w' ? b : w
        }));
    };

    const handleGameEnd = async (result) => {
        if (!result) return;

        setScores(prev => {
            let newScores = { ...prev };
            if (result.winner === 'Draw') {
                newScores.player += 0.5;
                newScores.opponent += 0.5;
            } else {
                // Determine my color
                let myColor = 'w'; // Default for computer
                if (activeGameMode === 'friend' && players?.[myId]) {
                    myColor = players[myId].color;
                }
                // Map "White"/"Black" string from ChessBoard to 'w'/'b'
                const winnerCode = result.winner === 'White' ? 'w' : 'b';

                if (winnerCode === myColor) {
                    newScores.player += 1;
                } else {
                    newScores.opponent += 1;
                }
            }
            return newScores;
        });

        // Save Match Result to Backend
        try {
            let myColor = 'w';
            if (activeGameMode === 'friend' && players?.[myId]) {
                myColor = players[myId].color;
            }

            const winnerCode = result.winner === 'White' ? 'w' : (result.winner === 'Black' ? 'b' : 'draw');
            // Logic: if draw -> draw. if winner matches my color -> win. else -> loss.
            const matchResult = result.winner === 'Draw' ? 'draw' : (winnerCode === myColor ? 'win' : 'loss');

            const matchData = {
                gameId: gameId || 'chess',
                result: matchResult,
                opponent: {
                    username: opponent.username,
                    avatar: opponent.avatar,
                    id: activeGameMode === 'friend' ? opponentId : null
                },
                score: scores.player, // Note: this is session score, not game material score. Material is not passed here easily unless we change prop.
                // Actually result.reason might have info, or we just rely on win/loss.
                // For now, let's use 0 or leave it, backend handles win/loss logic mainly.
                moves: JSON.stringify(moves),
                playerColor: myColor,
                duration: 0
            };

            await userService.saveMatch(matchData);
            // Could refresh profile here if we had a way to trigger it globally
        } catch (error) {
            console.error("Failed to save match result:", error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen bg-background overflow-hidden"
        >
            <AnimatePresence>
                {isCallActive && (
                    <VideoOverlay
                        onClose={handleEndCall}
                        isMuted={isCallMuted}
                        setIsMuted={setIsCallMuted}
                        isCameraOff={!isLocalVideoOn}
                        setIsCameraOff={(val) => setIsLocalVideoOn(!val)}
                    />
                )}
            </AnimatePresence>
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
                                {isGameActive && (
                                    <PlayerHUD
                                        position="top"
                                        username={opponent.username}
                                        avatar={opponent.avatar}
                                        isActive={!isPlayerTurn}
                                        score={scores.opponent}
                                    />
                                )}

                                {/* Game Board */}
                                <div className="flex-1 flex items-center justify-center py-4 overflow-auto">
                                    <GameBoard
                                        gameId={gameId}
                                        onGameStateChange={setActiveGameMode}
                                        onMove={setMoves}
                                        onGameOver={handleGameEnd}
                                        onScoreUpdate={handleScoreUpdate}
                                        whitePlayerName={activeGameMode === 'computer' ? "Your Score" : (players?.[Object.keys(players).find(key => players[key].color === 'w')]?.username || "White")}
                                        blackPlayerName={activeGameMode === 'computer' ? "Computer's Score" : (players?.[Object.keys(players).find(key => players[key].color === 'b')]?.username || "Black")}
                                    />
                                </div>

                                {/* Player HUD */}
                                {isGameActive && (
                                    <PlayerHUD
                                        position="bottom"
                                        username={me.username}
                                        avatar={me.avatar}
                                        isActive={isPlayerTurn}
                                        score={scores.player}
                                        isFriend={true}
                                        isCallActive={isCallActive}
                                        isCallMuted={isCallMuted}
                                        isLocalVideoOn={isLocalVideoOn}
                                        onStartCall={handleStartCall}
                                        onToggleMute={setIsCallMuted}
                                        onToggleVideo={setIsLocalVideoOn}
                                        hideMedia={activeGameMode === 'computer'}
                                        hideActions={activeGameMode === 'computer'}
                                    />
                                )}

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
                            <div className="h-full grid grid-cols-[280px_minmax(0,1fr)_320px] gap-6">
                                {/* Left - Game Info Panel */}
                                <GameInfoPanel
                                    user={me}
                                    gameMode={activeGameMode}
                                    moves={moves}
                                />

                                {/* Center - Board Area */}
                                <div className="flex flex-col h-full overflow-hidden">
                                    {/* Opponent HUD */}
                                    {isGameActive && (
                                        <PlayerHUD
                                            position="top"
                                            username={opponent.username}
                                            avatar={opponent.avatar}
                                            isActive={!isPlayerTurn}
                                            score={scores.opponent}
                                        />
                                    )}

                                    {/* Game Board */}
                                    <div className="flex-1 min-h-0 flex items-center justify-center overflow-auto">
                                        <GameBoard
                                            ref={boardRef}
                                            gameId={gameId}
                                            onGameStateChange={setActiveGameMode}
                                            onMove={setMoves}
                                            onGameOver={handleGameEnd}
                                            onScoreUpdate={handleScoreUpdate}
                                            whitePlayerName={activeGameMode === 'computer' ? "Your Score" : (players?.[Object.keys(players).find(key => players[key].color === 'w')]?.username || "White")}
                                            blackPlayerName={activeGameMode === 'computer' ? "Computer's Score" : (players?.[Object.keys(players).find(key => players[key].color === 'b')]?.username || "Black")}
                                        />
                                    </div>

                                    {/* Player HUD */}
                                    {isGameActive && (
                                        <PlayerHUD
                                            position="bottom"
                                            username={me.username}
                                            avatar={me.avatar}
                                            isActive={isPlayerTurn}
                                            score={scores.player}
                                            isFriend={true}
                                            isCallActive={isCallActive}
                                            isCallMuted={isCallMuted}
                                            isLocalVideoOn={isLocalVideoOn}
                                            onStartCall={handleStartCall}
                                            onToggleMute={setIsCallMuted}
                                            onToggleVideo={setIsLocalVideoOn}
                                            hideMedia={activeGameMode === 'computer'}
                                            onResign={handleResignClick}
                                            onDraw={handleOfferDraw}
                                        />
                                    )}
                                </div>

                                {/* Right - Chat Sidebar */}
                                <GameChat
                                    isDisabled={activeGameMode !== 'friend'}
                                    onlineCount={Object.keys(players || {}).length || 1}
                                />
                            </div>
                        )}
                    </div>
                </main>

                {/* Resign Confirmation Modal */}
                <AnimatePresence>
                    {isResignModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-[#0f1014] rounded-2xl border border-white/10 p-6 max-w-sm w-full shadow-2xl"
                            >
                                <h3 className="text-xl font-bold text-white mb-2">Resign Game?</h3>
                                <p className="text-white/60 mb-6 text-sm">Are you sure you want to resign? This will count as a loss.</p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={cancelResign}
                                        className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmResign}
                                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
                                    >
                                        Resign
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default GameArena;
