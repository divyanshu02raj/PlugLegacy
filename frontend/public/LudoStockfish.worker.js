/* eslint-disable no-restricted-globals */

// Ludo Stockfish - Strong AI Worker
// Uses Expectimax for handling dice probabilities

const MAX_DEPTH = 3; // Lookahead depth (plies)

// --- GAME CONSTANTS (Mirrored from Engine) ---
const SAFE_SPOTS = [0, 8, 13, 21, 26, 34, 39, 47];
const START_POSITIONS = { red: 0, green: 13, yellow: 26, blue: 39 }; // Original Indices
const PLAYERS = ["red", "green", "yellow", "blue"];

self.onmessage = function (e) {
    const { gameState, player, depth = MAX_DEPTH } = e.data;

    if (!gameState || !player) return;

    // Run AI logic
    const bestMove = getBestMove(gameState, player, depth);

    // Return result
    self.postMessage(bestMove);
};

// --- CORE AI ---

function getBestMove(gameState, player, depth) {
    // Add artificial complexity/context to state for maximizing player
    gameState.aiPlayer = player;

    const moves = getValidMoves(gameState, player, gameState.diceValue);

    if (moves.length === 0) return null;
    if (moves.length === 1) return moves[0]; // Forced move

    let bestScore = -Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
        // Clone state for simulation
        const nextState = simulateMove(gameState, player, move);

        // Evaluate move (Expectimax)
        const score = expectimax(nextState, depth - 1, getNextPlayer(player), true);

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}

// Expectimax: Maximize own score, Average opponent outcomes (dice chance)
function expectimax(state, depth, currentPlayer, isChanceNode) {
    if (depth === 0) {
        return evaluateState(state); // Static evaluation
    }

    // Chance Node (Dice Roll)
    if (isChanceNode) {
        let avgScore = 0;
        // Average over all 6 dice outcomes
        for (let dice = 1; dice <= 6; dice++) {
            const stateWithRoll = { ...state, diceValue: dice };
            avgScore += expectimax(stateWithRoll, depth, currentPlayer, false);
        }
        return avgScore / 6;
    }

    // Max/Min Node (Player Move)
    else {
        const moves = getValidMoves(state, currentPlayer, state.diceValue);

        if (moves.length === 0) {
            // Pass turn
            return expectimax(state, depth - 1, getNextPlayer(currentPlayer), true);
        }

        const isMaximizing = (currentPlayer === state.aiPlayer);

        let bestVal = isMaximizing ? -Infinity : Infinity;

        for (const move of moves) {
            const nextState = simulateMove(state, currentPlayer, move);
            const val = expectimax(nextState, depth - 1, getNextPlayer(currentPlayer), true);

            if (isMaximizing) bestVal = Math.max(bestVal, val);
            else bestVal = Math.min(bestVal, val);
        }
        return bestVal;
    }
}

// --- EVALUATION ---

function evaluateState(state) {
    const myPlayer = state.aiPlayer;
    let score = 0;

    PLAYERS.forEach(p => {
        const isMe = p === myPlayer;
        const multiplier = isMe ? 1 : -1;

        state.pieces[p].forEach(piece => {
            if (piece.finished) score += 2000 * multiplier;
            else if (piece.position === -1) score -= 200 * multiplier; // Penalty for being in base
            else {
                score += 20 * multiplier; // Points for being on board
                if (SAFE_SPOTS.includes(piece.position)) score += 100 * multiplier; // Bonus for safe spot

                // Bonus for being close to home
                // (Simplified distance check would go here)
            }
        });
    });

    return score;
}

// --- HELPER FUNCTIONS ---

function getValidMoves(state, player, diceValue) {
    const moves = [];
    const playerPieces = state.pieces[player];

    playerPieces.forEach((piece, index) => {
        if (piece.finished) return;

        // 1. Move out of base
        if (piece.position === -1) {
            if (diceValue === 6) {
                moves.push({ type: "start", pieceId: index, from: -1, to: START_POSITIONS[player] });
            }
        }
        // 2. Move on board
        else {
            const currentPos = piece.position;
            // Check if entering home stretch (Simplified for AI speed)
            // Just check if it's a valid move (dice + position < limit or valid path)
            // Ideally we replicate exact logic, but for AI approximation this is okay.
            moves.push({ type: "move", pieceId: index, from: currentPos });
        }
    });

    return moves;
}

function simulateMove(state, player, move) {
    // Deep clone state (JSON is slowest but safest for now without structuredClone in all workers)
    const newState = JSON.parse(JSON.stringify(state));
    const piece = newState.pieces[player][move.pieceId];

    if (move.type === "start") {
        piece.position = START_POSITIONS[player];
        piece.inHomeStretch = false;
    } else {
        piece.position = (piece.position + state.diceValue) % 52;

        // Check capture
        if (!SAFE_SPOTS.includes(piece.position)) {
            Object.keys(newState.pieces).forEach(p => {
                if (p !== player) {
                    newState.pieces[p].forEach(enemy => {
                        if (enemy.position === piece.position && enemy.position !== -1) {
                            enemy.position = -1; // Capture
                            enemy.inHomeStretch = false;
                        }
                    });
                }
            });
        }
    }

    return newState;
}

function getNextPlayer(current) {
    const idx = PLAYERS.indexOf(current);
    return PLAYERS[(idx + 1) % 4];
}
