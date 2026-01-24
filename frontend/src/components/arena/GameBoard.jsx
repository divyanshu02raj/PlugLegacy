import { motion } from "framer-motion";
import { lazy, Suspense, forwardRef } from "react";

// Lazy load all game boards
const SudokuBoard = lazy(() => import("./boards/SudokuBoard"));
const Game2048Board = lazy(() => import("./boards/Game2048Board"));
const WordleBoard = lazy(() => import("./boards/WordleBoard"));
const CrosswordBoard = lazy(() => import("./boards/CrosswordBoard"));
const LogicGridBoard = lazy(() => import("./boards/LogicGridBoard"));
const MemoryMatchBoard = lazy(() => import("./boards/MemoryMatchBoard"));
const NumberRecallBoard = lazy(() => import("./boards/NumberRecallBoard"));
const TicTacToeBoard = lazy(() => import("./boards/TicTacToeBoard"));
const Connect4Board = lazy(() => import("./boards/Connect4Board"));
const ChessBoard = lazy(() => import("./boards/ChessBoard"));
const ReversiBoard = lazy(() => import("./boards/ReversiBoard"));
const LudoBoard = lazy(() => import("./boards/LudoBoard"));
const SnakesLaddersBoard = lazy(() => import("./boards/SnakesLaddersBoard"));
const SnakeBoard = lazy(() => import("./boards/SnakeBoard"));
const PongBoard = lazy(() => import("./boards/PongBoard"));
const BrickBreakerBoard = lazy(() => import("./boards/BrickBreakerBoard"));
const TetrisBoard = lazy(() => import("./boards/TetrisBoard"));
const SpeedMathBoard = lazy(() => import("./boards/SpeedMathBoard"));
const TypingRaceBoard = lazy(() => import("./boards/TypingRaceBoard"));
const ReactionTimeBoard = lazy(() => import("./boards/ReactionTimeBoard"));
const SkribblBoard = lazy(() => import("./boards/SkribblBoard"));

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
    </div>
);

const GameBoard = forwardRef(({ gameId, onGameStateChange, onMove, onGameOver, onScoreUpdate, whitePlayerName, blackPlayerName, onTurnChange }, ref) => {
    const renderBoard = () => {
        const props = { onTurnChange }; // Helper to pass down
        switch (gameId) {
            case "sudoku": return <SudokuBoard />;
            case "2048": return <Game2048Board />;
            case "wordle": return <WordleBoard />;
            case "crossword": return <CrosswordBoard />;
            case "logic-grid": return <LogicGridBoard />;
            case "memory-match": return <MemoryMatchBoard />;
            case "number-recall": return <NumberRecallBoard />;
            case "tic-tac-toe": return <TicTacToeBoard />;
            case "connect-4": return <Connect4Board />;
            case "chess": return <ChessBoard
                ref={ref}
                onGameStateChange={onGameStateChange}
                onMove={onMove}
                onGameOver={onGameOver}
                onScoreUpdate={onScoreUpdate}
                onTurnChange={onScoreUpdate ? props.onTurnChange : undefined} // Logic simplification, see below
                whitePlayerName={whitePlayerName}
                blackPlayerName={blackPlayerName}
                {...props}
            />;
            case "reversi": return <ReversiBoard />;
            case "ludo": return <LudoBoard />;
            case "snakes-ladders": return <SnakesLaddersBoard />;
            case "snake": return <SnakeBoard />;
            case "pong": return <PongBoard />;
            case "brick-breaker": return <BrickBreakerBoard />;
            case "tetris": return <TetrisBoard />;
            case "speed-math": return <SpeedMathBoard />;
            case "typing-race": return <TypingRaceBoard />;
            case "reaction-time": return <ReactionTimeBoard />;
            case "skribbl": return <SkribblBoard />;
            default: return <TicTacToeBoard />;
        }
    };

    return (
        <Suspense fallback={<LoadingSpinner />}>
            {renderBoard()}
        </Suspense>
    );
});

export default GameBoard;
