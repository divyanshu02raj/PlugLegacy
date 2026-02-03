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
import { useWebRTC } from "@/hooks/useWebRTC";
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

// ... existing imports ...

const GameArena = () => {
    // Hooks and Context
    const navigate = useNavigate();
    const location = useLocation();
    const { socket } = useSocket();
    const isMobile = useIsMobile();
    const boardRef = useRef(null);
    const { gameId } = useParams();

    // Restore 'game' variable
    const game = gameInfo[gameId || ""] || { name: "Tic-Tac-Toe", icon: "❌", color: "hsl(210 90% 55%)" };

    // Initial State - UI
    const [isMuted, setIsMuted] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeDrawerTab, setActiveDrawerTab] = useState("chat");
    const [isResignModalOpen, setIsResignModalOpen] = useState(false);
    const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

    // Fetch fresh stats on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await userService.getProfile();
                setUserInfo(prev => ({ ...prev, ...profile }));
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchProfile();
    }, []);

    // Game State
    const [players, setPlayers] = useState(location.state?.players || {});
    const [moves, setMoves] = useState([]);
    const [activeGameMode, setActiveGameMode] = useState("friend");
    const [activeDifficulty, setActiveDifficulty] = useState(null);
    const [scores, setScores] = useState({ player: 0, opponent: 0 });
    const [isGameActive, setIsGameActive] = useState(true);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true); // Default (updates via onTurnChange)
    const [winner, setWinner] = useState(null);

    // Derived User Info
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    const myColor = activeGameMode === 'computer' ? 'w' : (Object.keys(players).find(key => players[key]?.username === localUser.username) === 'w' ? 'w' : 'b');

    const me = {
        ...userInfo, // Spread first so username can be overridden
        username: (userInfo.username || "You") + (gameId === 'tic-tac-toe' ? " (X)" : ""),
        avatar: userInfo.avatar || "👤",
        color: myColor
    };

    const opponent = Object.values(players).find(p => p.username !== localUser.username) || {
        username: "Opponent" + (gameId === 'tic-tac-toe' ? " (O)" : ""),
        avatar: "👤",
        color: myColor === 'w' ? 'b' : 'w'
    };

    // Games that are strictly single-player for now
    const isSinglePlayerGame = [
        "snake", "tetris", "2048", "sudoku", "wordle",
        "memory-match", "crossword", "logic-grid", "number-recall",
        "typing-race", "speed-math", "reaction-time", "brick-breaker"
    ].includes(gameId);

    // Handlers
    const handleGameStateChange = (mode, difficulty = null) => {
        setActiveGameMode(mode);
        if (difficulty) setActiveDifficulty(difficulty);
    };

    const handleGameEnd = (result) => {
        setIsGameActive(false);
        setWinner(result);
        console.log("Game Over:", result);
    };

    const handleScoreUpdate = (newScores) => {
        if (newScores) setScores(newScores);
    };

    const handleResignClick = () => setIsResignModalOpen(true);

    const confirmResign = () => {
        if (socket && location.state?.roomId) {
            socket.emit('resign_game', { roomId: location.state.roomId });
        }
        setIsResignModalOpen(false);
        setIsGameActive(false); // Optimistic update
    };

    const cancelResign = () => setIsResignModalOpen(false);

    const handleOfferDraw = () => {
        if (socket && location.state?.roomId) {
            socket.emit('offer_draw', { roomId: location.state.roomId });
        }
    };

    const handleTurnChange = (turnColor) => {
        setIsPlayerTurn(turnColor === me.color);
    };

    const roomId = location.state?.roomId; // Extract roomId clearly
    // CONTEXT: Debugging Black Screen - Fixed Import, Re-enabling Hook
    const {
        localStream,
        remoteStream,
        isCallIncoming,
        isCallActive, // Replaces local state
        startCall,
        answerCall,
        declineCall,
        endCall,
        incomingCallData
    } = useWebRTC(roomId);

    // Dummy values removed

    // Call State (Voice & Video) - Local UI toggles
    const [isCallMuted, setIsCallMuted] = useState(false);
    const [isLocalVideoOn, setIsLocalVideoOn] = useState(true); // Default true when video call starts

    // Sync Mute/Video Toggles with specific Tracks
    useEffect(() => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !isCallMuted);
            localStream.getVideoTracks().forEach(track => track.enabled = isLocalVideoOn);
        }
    }, [isCallMuted, isLocalVideoOn, localStream]);

    const handleStartCall = async (type) => {
        setIsLocalVideoOn(type === 'video');
        setIsCallMuted(false);
        try {
            await startCall(type);
        } catch (e) {
            console.error(e);
            alert(`Failed to start call: ${e.name} - ${e.message}`);
        }
    };

    const handleAnswerCall = async () => {
        try {
            await answerCall();
        } catch (e) {
            console.error(e);
            alert(`Failed to answer call: ${e.name} - ${e.message}`);
        }
    };

    const handleEndCall = () => {
        endCall();
        setIsLocalVideoOn(false); // Reset defaults
        setIsCallMuted(false);
    };

    // Socket: Join Room & Game Events
    useEffect(() => {
        if (!socket || !roomId) return;

        console.log("Joining room:", roomId);
        socket.emit("join_game_room", roomId);

        const handleGameMove = ({ move, turn }) => {
            setMoves((prev) => [...prev, move]);
            // If it's a chess move, we might need to update the board state locally via ref or props
            // For now, updating 'moves' triggers re-renders. 
            // The GameBoard component should preferably listen to 'moves' or we pass the move to it.
            // Assumption: GameBoard updates itself or we pass 'moves' to it.
            // We also update turn:
            setIsPlayerTurn(turn === me.color);
        };

        const handleGameEndEvent = ({ result, winner }) => {
            handleGameEnd(result);
            if (winner) setWinner(winner);
        };

        const handleOpponentResigned = () => {
            handleGameEnd("win"); // You win if they resign
            // Show toast or modal?
        };

        const handleDrawOffered = () => {
            // Show draw offer modal (TODO)
            const accept = window.confirm("Opponent offered a draw. Accept?");
            if (accept) {
                socket.emit("accept_draw", { roomId });
                handleGameEnd("draw");
            } else {
                // socket.emit("decline_draw", { roomId });
            }
        };

        socket.on("game_move", handleGameMove);
        socket.on("game_over", handleGameEndEvent);
        socket.on("opponent_resigned", handleOpponentResigned);
        socket.on("draw_offered", handleDrawOffered);

        return () => {
            socket.off("game_move", handleGameMove);
            socket.off("game_over", handleGameEndEvent);
            socket.off("opponent_resigned", handleOpponentResigned);
            socket.off("draw_offered", handleDrawOffered);
        };
    }, [socket, roomId, me.color]);

    // Cleanup: Leave room on unmount (optional, socket disconnect handles it usually)
    useEffect(() => {
        return () => {
            if (socket && roomId) {
                socket.emit("leave_room", roomId);
            }
        };
    }, [socket, roomId]);

    // ... existing boardRef ...

    return (
        <motion.div>
            {/* Incoming Call Modal */}
            <AnimatePresence>
                {isCallIncoming && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] glass-card px-6 py-4 rounded-2xl border border-green-500/30 flex items-center gap-6 shadow-2xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-xl">
                                    📞
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Incoming {incomingCallData?.type} Call</h3>
                                <p className="text-xs text-white/50">Requesting connection...</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={declineCall}
                                className="p-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                            >
                                <VolumeX className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleAnswerCall}
                                className="p-2.5 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCallActive && !isSinglePlayerGame && (
                    <VideoOverlay
                        onClose={handleEndCall}
                        isMuted={isCallMuted}
                        setIsMuted={setIsCallMuted}
                        isCameraOff={!isLocalVideoOn}
                        setIsCameraOff={(val) => setIsLocalVideoOn(!val)}
                        localStream={localStream}
                        remoteStream={remoteStream}
                    />
                )}
            </AnimatePresence>

            {/* ... rest of content ... */}
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
                                {/* Top HUD Area */}
                                {isGameActive && (
                                    isSinglePlayerGame ? (
                                        /* Single Player: Show Player HUD at Top */
                                        <PlayerHUD
                                            position="top"
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
                                            hideMedia={true}
                                            hideActions={true}
                                            hideTurn={true}
                                            isPlayer={true}
                                            onResign={handleResignClick}
                                            onDraw={handleOfferDraw}
                                        />
                                    ) : (
                                        /* Multiplayer: Show Opponent HUD at Top */
                                        <PlayerHUD
                                            position="top"
                                            username={opponent.username}
                                            avatar={opponent.avatar}
                                            isActive={!isPlayerTurn}
                                            score={scores.opponent}
                                        />
                                    )
                                )}

                                {/* Game Board */}
                                <div className="flex-1 flex items-center justify-center py-4 overflow-auto">
                                    <GameBoard
                                        gameId={gameId}
                                        onGameStateChange={handleGameStateChange}
                                        onMove={setMoves}
                                        onGameOver={handleGameEnd}
                                        onScoreUpdate={handleScoreUpdate}
                                        whitePlayerName={activeGameMode === 'computer' ? "Your Score" : (players?.[Object.keys(players).find(key => players[key].color === 'w')]?.username || "White")}
                                        blackPlayerName={activeGameMode === 'computer' ? "Computer's Score" : (players?.[Object.keys(players).find(key => players[key].color === 'b')]?.username || "Black")}
                                    />
                                </div>

                                {/* Bottom HUD Area - Multiplayer Only */}
                                {isGameActive && !isSinglePlayerGame && (
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
                                        hideTurn={false}
                                        onResign={handleResignClick}
                                        onDraw={handleOfferDraw}
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
                                    gameMode={isSinglePlayerGame ? 'single-player' : activeGameMode}
                                    gameDifficulty={activeDifficulty}
                                    moves={moves}
                                />

                                {/* Center - Board Area */}
                                <div className="flex flex-col h-full overflow-hidden">
                                    {/* Top HUD Area */}
                                    {isGameActive && !isSinglePlayerGame && (
                                        isSinglePlayerGame ? (
                                            /* Single Player: Show Player HUD at Top */
                                            <PlayerHUD
                                                position="top"
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
                                                hideMedia={true}
                                                hideActions={true}
                                                hideTurn={true}
                                                isPlayer={true}
                                                onResign={handleResignClick}
                                                onDraw={handleOfferDraw}
                                            />
                                        ) : (
                                            /* Multiplayer: Show Opponent HUD at Top */
                                            <PlayerHUD
                                                position="top"
                                                username={opponent.username}
                                                avatar={opponent.avatar}
                                                isActive={!isPlayerTurn}
                                                score={scores.opponent}
                                            />
                                        )
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
                                            onTurnChange={handleTurnChange} // Add this prop
                                            whitePlayerName={activeGameMode === 'computer' ? "Your Score" : (players?.[Object.keys(players).find(key => players[key].color === 'w')]?.username || "White")}
                                            blackPlayerName={activeGameMode === 'computer' ? "Computer's Score" : (players?.[Object.keys(players).find(key => players[key].color === 'b')]?.username || "Black")}
                                        />
                                    </div>

                                    {/* Bottom HUD Area - Multiplayer Only */}
                                    {isGameActive && !isSinglePlayerGame && (
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
                                            hideTurn={false}
                                            onResign={handleResignClick}
                                            onDraw={handleOfferDraw}
                                        />
                                    )}
                                </div>

                                {/* Right - Chat Sidebar */}
                                <GameChat
                                    isDisabled={activeGameMode !== 'friend' || isSinglePlayerGame}
                                    onlineCount={Object.keys(players || {}).length || 1}
                                    roomId={location.state?.roomId}
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
