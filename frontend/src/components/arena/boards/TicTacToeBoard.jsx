import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Users, RotateCcw, Trophy, ArrowLeft, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService, userService } from "../../../services/api";
import { useSocket } from "@/context/SocketContext";
import TicTacToeFriendLobby from "./TicTacToeFriendLobby";

const checkWinner = (board) => {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
        [0, 4, 8], [2, 4, 6], // diagonals
    ];

    for (const line of lines) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], line };
        }
    }
    return null;
};

// Minimax AI Algorithm
const minimax = (board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) => {
    const result = checkWinner(board);

    // Terminal states
    if (result?.winner === "O") return 10 - depth; // AI wins (O)
    if (result?.winner === "X") return depth - 10; // Human wins (X)
    if (board.every(cell => cell !== null)) return 0; // Draw

    if (isMaximizing) {
        let maxScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = "O";
                const score = minimax(board, depth + 1, false, alpha, beta);
                board[i] = null;
                maxScore = Math.max(score, maxScore);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
        }
        return maxScore;
    } else {
        let minScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = "X";
                const score = minimax(board, depth + 1, true, alpha, beta);
                board[i] = null;
                minScore = Math.min(score, minScore);
                beta = Math.min(beta, score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
        }
        return minScore;
    }
};

const getBestMove = (board) => {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = "O";
            const score = minimax(board, 0, false);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
};

const getRandomMove = (board) => {
    const availableMoves = board.map((cell, idx) => cell === null ? idx : null).filter(idx => idx !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};

// Calculate dynamic win line position
// Accurate win line calculation using getBoundingClientRect
const getWinLineStyle = (line, cellRefs, boardRef) => {
    if (!line?.length || !cellRefs.current || !boardRef.current) return null;

    const startEl = cellRefs.current[line[0]];
    const midEl = cellRefs.current[line[1]];
    const endEl = cellRefs.current[line[2]];
    const boardEl = boardRef.current;

    if (!startEl || !midEl || !endEl) return null;

    const boardRect = boardEl.getBoundingClientRect();
    const r1 = startEl.getBoundingClientRect();
    const r2 = endEl.getBoundingClientRect();

    // Convert viewport → board-local coordinates
    const x1 = r1.left + r1.width / 2 - boardRect.left;
    const y1 = r1.top + r1.height / 2 - boardRect.top;
    const x2 = r2.left + r2.width / 2 - boardRect.left;
    const y2 = r2.top + r2.height / 2 - boardRect.top;

    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    return { x1, y1, length, angle };
};

const DIFFICULTIES = {
    EASY: { name: "Easy", color: "text-green-400", icon: "🎯", scoreMultiplier: 0.5 },
    MEDIUM: { name: "Medium", color: "text-yellow-400", icon: "⚡", scoreMultiplier: 0.75 },
    HARD: { name: "Hard", color: "text-red-400", icon: "🔥", scoreMultiplier: 1 },
};

const TicTacToeBoard = ({ onGameStateChange, onTurnChange, moves = [], myColor, roomId, players }) => {
    const navigate = useNavigate();
    const { socket } = useSocket();
    const [gameState, setGameState] = useState('menu'); // menu, playing, finished
    const [mode, setMode] = useState(null); // 'computer' or 'friend'
    const [difficulty, setDifficulty] = useState(null); // 'EASY', 'MEDIUM', 'HARD'
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });
    const [showModal, setShowModal] = useState(false);
    const hasSavedRef = useRef(false);
    const cellRefs = useRef([]);
    const boardRef = useRef(null);

    const result = checkWinner(board);
    const winner = result?.winner;
    const winLine = result?.line || [];
    const isDraw = !winner && board.every(cell => cell !== null);
    const isGameOver = winner || isDraw;

    // Calculate win line position using actual DOM elements
    const winLineStyle = useMemo(
        () => getWinLineStyle(result?.line, cellRefs, boardRef),
        [result, board]
    );

    // Initialize state on mount
    useEffect(() => {
        if (onGameStateChange) onGameStateChange('selection');
    }, []);

    // Auto-start when room is available (Deep link or Invite accept)
    useEffect(() => {
        if (roomId && gameState !== 'playing' && gameState !== 'finished') {
            setMode('friend');
            setGameState('playing');
            if (onGameStateChange) onGameStateChange('friend');
        } else if ((gameState === 'waiting' || gameState === 'lobby') && mode === 'friend' && Object.keys(players || {}).length >= 2) {
            setGameState('playing');
        }
    }, [players, gameState, mode, roomId]);

    // Show modal with delay after game ends
    useEffect(() => {
        if (isGameOver) {
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 3000); // 3 second delay
            return () => clearTimeout(timer);
        } else {
            setShowModal(false);
        }
    }, [isGameOver]);



    // Sync with Online Moves
    useEffect(() => {
        if (mode === 'friend' && roomId && moves.length >= 0) {
            const newBoard = Array(9).fill(null);
            moves.forEach((moveIndex, i) => {
                newBoard[moveIndex] = i % 2 === 0 ? "X" : "O";
            });
            setBoard(newBoard);
            setIsXNext(moves.length % 2 === 0);
        }
    }, [moves, mode, roomId]);

    // AI Move (Computer Mode)
    // AI Move (Computer Mode) and Turn Notification
    useEffect(() => {
        // Computer Mode
        if (mode === 'computer') {
            if (onTurnChange) {
                onTurnChange(isXNext ? 'w' : 'b');
            }

            if (!isXNext && !isGameOver && gameState === 'playing') {
                const timer = setTimeout(() => {
                    let move;

                    if (difficulty === 'EASY') {
                        move = getRandomMove(board);
                    } else if (difficulty === 'MEDIUM') {
                        // 50% optimal, 50% random
                        move = Math.random() < 0.5 ? getBestMove(board) : getRandomMove(board);
                    } else {
                        // HARD - Always optimal
                        move = getBestMove(board);
                    }

                    if (move !== null && move !== undefined) {
                        const newBoard = [...board];
                        newBoard[move] = "O";
                        setBoard(newBoard);
                        setIsXNext(true);
                    }
                }, 500); // Delay for realism
                return () => clearTimeout(timer);
            }
        }
        // Multiplayer Mode
        else if (mode === 'friend' && onTurnChange) {
            const isMyTurn = (isXNext && myColor === 'w') || (!isXNext && myColor === 'b');
            console.log("Turn Change Emit:", { isXNext, myColor, isMyTurn });
            onTurnChange(isMyTurn);
        }
    }, [isXNext, board, mode, difficulty, isGameOver, gameState, onTurnChange, myColor]);

    // Save Match on Game End
    useEffect(() => {
        if (isGameOver && !hasSavedRef.current && mode === 'computer') {
            hasSavedRef.current = true;

            let result, score;
            if (winner === 'X') {
                result = 'win';
                score = Math.round(100 * DIFFICULTIES[difficulty].scoreMultiplier);
                setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
            } else if (winner === 'O') {
                result = 'loss';
                score = 0;
                setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
            } else {
                result = 'draw';
                score = 25;
                setStats(prev => ({ ...prev, draws: prev.draws + 1 }));
            }

            const user = authService.getCurrentUser();
            if (user) {
                userService.saveMatch({
                    gameId: 'tic-tac-toe',
                    score: score,
                    result: result,
                    opponent: { username: `Computer (${DIFFICULTIES[difficulty].name})` }
                }).catch(err => console.error("Failed to save tic-tac-toe match:", err));
            }
        } else if (!isGameOver) {
            hasSavedRef.current = false;
        }
    }, [isGameOver, winner, mode, difficulty]);

    const handleCellClick = (index) => {
        if (board[index] || isGameOver || gameState !== 'playing') return;

        // Online Multiplayer Logic
        if (mode === 'friend' && roomId) {
            // Determine if it's my turn
            // MyColor 'w' = X (First), 'b' = O (Second)
            // isXNext true = X turn, false = O turn
            const isMyTurn = (isXNext && myColor === 'w') || (!isXNext && myColor === 'b');

            if (isMyTurn) {
                if (socket) {
                    socket.emit('game_move', {
                        roomId,
                        move: index
                    });
                } else {
                    console.error("Socket missing!");
                }
            } else {
                console.warn("Not my turn!");
            }
            return;
        }

        if (mode === 'computer' && !isXNext) return; // Wait for AI

        const newBoard = [...board];
        newBoard[index] = isXNext ? "X" : "O";
        setBoard(newBoard);
        setIsXNext(!isXNext);
        // Call onTurnChange is handled by useEffect for consistency or we can call here
    };

    const startGame = (selectedMode, selectedDifficulty = null) => {
        setMode(selectedMode);
        if (onGameStateChange) onGameStateChange(selectedMode, selectedDifficulty);
        setDifficulty(selectedDifficulty);

        // Check for friend online
        if (selectedMode === 'friend' && roomId && Object.keys(players || {}).length < 2) {
            setGameState('lobby'); // Was 'waiting'
            return;
        } else if (selectedMode === 'friend' && !roomId) {
            // No room yet - show lobby to invite
            setGameState('lobby');
            return;
        }

        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setGameState('playing');
        hasSavedRef.current = false;
    };

    const resetGame = () => {
        if (mode === 'computer') {
            // Go back to difficulty selection
            setGameState('difficulty');
            setBoard(Array(9).fill(null));
            setIsXNext(true);
            setShowModal(false);
            hasSavedRef.current = false;
        } else {
            // Friend mode
            if (roomId && socket) {
                // Online reset? usually requires vote. For now just clear local or emit reset
                // Assuming simple reset for local state
            }

            // Friend mode - ask for confirmation (Local only)
            if (!roomId && confirm('Does your friend want to play again?')) {
                setBoard(Array(9).fill(null));
                setIsXNext(true);
                setShowModal(false);
                hasSavedRef.current = false;
            } else if (!roomId) {
                backToMenu();
            } else {
                // Online: Just close modal, let them play or wait for opponent
                setShowModal(false);
                // Ideally we emit a 'rematch' request here
            }
        }
    };

    const backToMenu = () => {
        setGameState('menu');
        setMode(null);
        setDifficulty(null);
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        // Clear roomId from location state to prevent auto-start on next friend game
        navigate('.', { replace: true, state: {} });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto overflow-hidden"
        >
            {gameState === 'menu' ? (
                /* Mode Selection Menu */
                <div className="flex flex-col items-center justify-center min-h-[500px] glass-card rounded-3xl p-8 gap-8">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent mb-2">
                            Tic-Tac-Toe
                        </h2>
                        <p className="text-muted-foreground">Choose your game mode</p>
                    </div>

                    <div className="grid gap-4 w-full max-w-xs">
                        <motion.button
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setGameState('difficulty')}
                            className="relative p-6 rounded-xl border border-primary/30 bg-black/20 text-left overflow-hidden group hover:bg-black/40 transition-all"
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-primary" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 rounded-full bg-primary/20">
                                    <Bot className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-primary">Play with Computer</p>
                                    <p className="text-sm text-muted-foreground">Challenge the AI</p>
                                </div>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => startGame('friend')}
                            className="relative p-6 rounded-xl border border-cyan-500/30 bg-black/20 text-left overflow-hidden group hover:bg-black/40 transition-all"
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-cyan-500" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 rounded-full bg-cyan-500/20">
                                    <Users className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-cyan-400">Play with Friend</p>
                                    <p className="text-sm text-muted-foreground">Local 2-player</p>
                                </div>
                            </div>
                        </motion.button>
                    </div>

                    {/* Stats */}
                    {stats.wins + stats.losses + stats.draws > 0 && (
                        <div className="glass-card rounded-xl p-4 w-full max-w-xs">
                            <div className="flex items-center gap-2 mb-3">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                <p className="text-sm font-bold text-muted-foreground">Your Stats</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-green-400">{stats.wins}</p>
                                    <p className="text-xs text-muted-foreground">Wins</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-yellow-400">{stats.draws}</p>
                                    <p className="text-xs text-muted-foreground">Draws</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-red-400">{stats.losses}</p>
                                    <p className="text-xs text-muted-foreground">Losses</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : gameState === 'difficulty' ? (
                /* Difficulty Selection */
                <div className="flex flex-col items-center justify-center min-h-[500px] glass-card rounded-3xl p-8 gap-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">Select Difficulty</h2>
                        <p className="text-muted-foreground">Choose your challenge level</p>
                    </div>

                    <div className="grid gap-4 w-full max-w-xs">
                        {Object.entries(DIFFICULTIES).map(([key, config]) => (
                            <motion.button
                                key={key}
                                whileHover={{ scale: 1.02, x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => startGame('computer', key)}
                                className="relative p-4 rounded-xl border bg-black/20 text-left overflow-hidden group hover:bg-black/40 transition-all border-white/10"
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{config.icon}</span>
                                        <p className={`font-bold text-lg ${config.color}`}>{config.name}</p>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    <button
                        onClick={backToMenu}
                        className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>
            ) : gameState === 'lobby' || gameState === 'waiting' ? (
                /* Friend Lobby */
                <TicTacToeFriendLobby onBack={backToMenu} />
            ) : (
                /* Game Board */
                <>


                    {/* Board */}
                    <div className="relative w-full max-w-md mx-auto">
                        {/* Ambient Glow */}
                        <div className="absolute -inset-8 blur-3xl opacity-30">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-cyan-500/40" />
                        </div>

                        {/* Grid Container with gaps */}
                        <div ref={boardRef} className="relative grid grid-cols-3 gap-3 p-4">
                            {board.map((cell, index) => (
                                <motion.button
                                    key={index}
                                    ref={(el) => (cellRefs.current[index] = el)}
                                    whileHover={{ scale: cell || isGameOver ? 1 : 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleCellClick(index)}
                                    className={`
                                        aspect-square rounded-xl border border-white/10
                                        flex items-center justify-center
                                        ${!cell && !isGameOver && "cursor-pointer hover:bg-white/5"}
                                        transition-all duration-200 relative overflow-hidden
                                    `}
                                >


                                    <AnimatePresence>
                                        {cell && (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{
                                                    scale: winLine.includes(index) ? [1, 1.15, 1] : 1,
                                                    rotate: 0
                                                }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 15,
                                                    scale: { delay: 0.3, duration: 0.5 }
                                                }}
                                                className="relative z-10"
                                            >
                                                {cell === "X" ? (
                                                    <svg className="w-16 h-16 md:w-20 md:h-20" viewBox="0 0 100 100">
                                                        <defs>
                                                            <filter id={`glow-x-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                                                                <feGaussianBlur stdDeviation="3" result="blur" />
                                                                <feMerge>
                                                                    <feMergeNode in="blur" />
                                                                    <feMergeNode in="blur" />
                                                                    <feMergeNode in="SourceGraphic" />
                                                                </feMerge>
                                                            </filter>
                                                        </defs>
                                                        <motion.line
                                                            initial={{ pathLength: 0 }}
                                                            animate={{ pathLength: 1 }}
                                                            transition={{ duration: 0.25 }}
                                                            x1="20" y1="20" x2="80" y2="80"
                                                            stroke="hsl(var(--primary))"
                                                            strokeWidth="10"
                                                            strokeLinecap="round"
                                                            filter={`url(#glow-x-${index})`}
                                                        />
                                                        <motion.line
                                                            initial={{ pathLength: 0 }}
                                                            animate={{ pathLength: 1 }}
                                                            transition={{ duration: 0.25, delay: 0.1 }}
                                                            x1="80" y1="20" x2="20" y2="80"
                                                            stroke="hsl(var(--primary))"
                                                            strokeWidth="10"
                                                            strokeLinecap="round"
                                                            filter={`url(#glow-x-${index})`}
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-16 h-16 md:w-20 md:h-20" viewBox="0 0 100 100">
                                                        <defs>
                                                            <filter id={`glow-o-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                                                                <feGaussianBlur stdDeviation="3" result="blur" />
                                                                <feMerge>
                                                                    <feMergeNode in="blur" />
                                                                    <feMergeNode in="blur" />
                                                                    <feMergeNode in="SourceGraphic" />
                                                                </feMerge>
                                                            </filter>
                                                        </defs>
                                                        <motion.circle
                                                            initial={{ pathLength: 0 }}
                                                            animate={{ pathLength: 1 }}
                                                            transition={{ duration: 0.35 }}
                                                            cx="50" cy="50" r="30"
                                                            fill="none"
                                                            stroke="hsl(190 100% 50%)"
                                                            strokeWidth="10"
                                                            strokeLinecap="round"
                                                            filter={`url(#glow-o-${index})`}
                                                        />
                                                    </svg>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            ))}

                            {/* Glowing Lines in the gaps */}
                            {/* Vertical Lines */}
                            <motion.div
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                                className="absolute left-[calc(33.33%+0.2rem)] top-4 bottom-4 w-0.5"
                                style={{
                                    background: "linear-gradient(to bottom, transparent, hsl(var(--primary)), transparent)",
                                    boxShadow: "0 0 15px hsl(var(--primary)), 0 0 30px hsl(var(--primary))"
                                }}
                            />
                            <motion.div
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                                className="absolute left-[calc(66.67%-0.3rem)] top-4 bottom-4 w-0.5"
                                style={{
                                    background: "linear-gradient(to bottom, transparent, hsl(var(--primary)), transparent)",
                                    boxShadow: "0 0 15px hsl(var(--primary)), 0 0 30px hsl(var(--primary))"
                                }}
                            />

                            {/* Horizontal Lines */}
                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.4, duration: 0.4 }}
                                className="absolute top-[calc(33.33%+0.2rem)] left-4 right-4 h-0.5"
                                style={{
                                    background: "linear-gradient(to right, transparent, hsl(var(--primary)), transparent)",
                                    boxShadow: "0 0 15px hsl(var(--primary)), 0 0 30px hsl(var(--primary))"
                                }}
                            />
                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                                className="absolute top-[calc(66.67%-0.3rem)] left-4 right-4 h-0.5"
                                style={{
                                    background: "linear-gradient(to right, transparent, hsl(var(--primary)), transparent)",
                                    boxShadow: "0 0 15px hsl(var(--primary)), 0 0 30px hsl(var(--primary))"
                                }}
                            />

                            {/* Dynamic Win Line - Pixel Perfect */}
                            <AnimatePresence>
                                {winner && winLineStyle && (
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: winLineStyle.length }}
                                        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                                        className="absolute h-1 z-50 rounded-full pointer-events-none"
                                        style={{
                                            left: winLineStyle.x1,
                                            top: winLineStyle.y1,
                                            transform: `rotate(${winLineStyle.angle}deg)`,
                                            transformOrigin: "left center",
                                            background: "linear-gradient(90deg, hsl(var(--primary)), hsl(30 100% 60%), hsl(var(--primary)))",
                                            boxShadow: `
                                                0 0 10px hsl(var(--primary)),
                                                0 0 30px hsl(var(--primary)),
                                                0 0 60px hsl(30 100% 50%),
                                                0 0 100px hsl(var(--primary))
                                            `,
                                        }}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>



                    {/* Win/Draw Modal Overlay */}
                    <AnimatePresence>
                        {showModal && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                                onClick={resetGame}
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ type: "spring", duration: 0.5 }}
                                    className="glass-card rounded-3xl p-8 max-w-md mx-4 text-center"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {winner ? (
                                        <>
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1, rotate: 360 }}
                                                transition={{ delay: 0.2, type: "spring" }}
                                                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center"
                                            >
                                                <span className="text-4xl font-bold text-white">{winner}</span>
                                            </motion.div>

                                            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent mb-2">
                                                {winner === 'X' ? 'You Win!' : 'Opponent Won!'}
                                            </h2>
                                            {mode === 'computer' && (
                                                <p className="text-muted-foreground mb-6">
                                                    {winner === 'X' ? `+${Math.round(100 * DIFFICULTIES[difficulty].scoreMultiplier)} points` : 'Better luck next time!'}
                                                </p>
                                            )}

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={resetGame}
                                                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold hover:shadow-lg hover:shadow-primary/50 transition-all"
                                            >
                                                Play Again
                                            </motion.button>
                                        </>
                                    ) : (
                                        <>
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2, type: "spring" }}
                                                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center"
                                            >
                                                <span className="text-3xl">🤝</span>
                                            </motion.div>

                                            <h2 className="text-3xl font-bold text-muted-foreground mb-2">
                                                It's a Draw!
                                            </h2>
                                            {mode === 'computer' && (
                                                <p className="text-muted-foreground mb-6">+25 points</p>
                                            )}

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={resetGame}
                                                className="w-full py-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold hover:shadow-lg transition-all"
                                            >
                                                Play Again
                                            </motion.button>
                                        </>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </motion.div>
    );
};

export default TicTacToeBoard;
