// Ludo Game Engine
// Handles all game logic, rules, and bot AI

const PLAYERS = ["red", "green", "yellow", "blue"];
const PIECES_PER_PLAYER = 4;
const BOARD_SIZE = 52; // Total path cells in the circuit
const HOME_STRETCH_SIZE = 5;

// Safe spots on the board (0-indexed positions on the 52-cell circuit)
const SAFE_SPOTS = [0, 8, 13, 21, 26, 34, 39, 47];

// Starting positions for each player on the main circuit
const START_POSITIONS = {
    red: 0,
    green: 13,
    yellow: 39, // Bottom-Left
    blue: 26,   // Bottom-Right
};

class LudoEngine {
    constructor() {
        this.reset();
    }

    reset(activePlayers = null) {
        this.currentPlayer = 0; // Index in PLAYERS array
        this.diceValue = 0;
        this.consecutiveSixes = 0;
        this.gameOver = false;
        this.winner = null;
        this.activePlayers = activePlayers || PLAYERS; // Default to all players

        // Ensure currentPlayer starts on an active player
        if (!this.activePlayers.includes(PLAYERS[this.currentPlayer])) {
            // Find first active player
            const firstActive = PLAYERS.find(p => this.activePlayers.includes(p));
            this.currentPlayer = PLAYERS.indexOf(firstActive);
        }

        // Initialize pieces for all players
        this.pieces = {};
        PLAYERS.forEach(player => {
            this.pieces[player] = Array(PIECES_PER_PLAYER).fill(null).map((_, i) => ({
                id: i,
                position: -1, // -1 = in home base
                inHomeStretch: false,
                homeStretchPosition: -1,
                finished: false,
            }));
        });

        // Bot players (all except first player)
        this.bots = ["green", "yellow", "blue"];
    }

    getCurrentPlayer() {
        return PLAYERS[this.currentPlayer];
    }

    getGameState() {
        return {
            currentPlayer: PLAYERS[this.currentPlayer],
            diceValue: this.diceValue,
            pieces: this.pieces,
            gameOver: this.gameOver,
            winner: this.winner,
        };
    }

    rollDice() {
        if (this.gameOver) return null;

        this.diceValue = Math.floor(Math.random() * 6) + 1;

        if (this.diceValue === 6) {
            this.consecutiveSixes++;
        } else {
            this.consecutiveSixes = 0;
        }

        // Three consecutive sixes = lose turn
        if (this.consecutiveSixes >= 3) {
            this.consecutiveSixes = 0;
            this.nextTurn();
            return { value: this.diceValue, skipTurn: true };
        }

        return { value: this.diceValue, skipTurn: false };
    }

    canMovePiece(player, pieceId) {
        const piece = this.pieces[player][pieceId];

        // Piece already finished
        if (piece.finished) return false;

        // Piece in home base - needs 6 to start
        if (piece.position === -1) {
            return this.diceValue === 6;
        }

        // Piece in home stretch
        if (piece.inHomeStretch) {
            const newPos = piece.homeStretchPosition + this.diceValue;
            return newPos <= HOME_STRETCH_SIZE;
        }

        return true;
    }

    getValidMoves(player) {
        return this.pieces[player]
            .map((piece, id) => ({ id, piece }))
            .filter(({ piece, id }) => this.canMovePiece(player, id));
    }

    movePiece(player, pieceId) {
        if (!this.canMovePiece(player, pieceId)) {
            return { success: false, reason: "Invalid move" };
        }

        const piece = this.pieces[player][pieceId];
        const startPos = START_POSITIONS[player];

        // Moving from home base
        if (piece.position === -1) {
            piece.position = startPos;
            return {
                success: true,
                action: "start",
                newPosition: startPos,
                extraTurn: true // Rolling 6 gives extra turn
            };
        }

        // Moving in home stretch
        if (piece.inHomeStretch) {
            piece.homeStretchPosition += this.diceValue;

            if (piece.homeStretchPosition === HOME_STRETCH_SIZE) {
                piece.finished = true;

                // Check if player won
                const allFinished = this.pieces[player].every(p => p.finished);
                if (allFinished) {
                    this.gameOver = true;
                    this.winner = player;
                    return { success: true, action: "win", player };
                }

                return { success: true, action: "finish", extraTurn: true };
            }

            return {
                success: true,
                action: "homeStretch",
                newPosition: piece.homeStretchPosition,
                extraTurn: this.diceValue === 6
            };
        }

        // Normal movement on circuit
        let newPosition = (piece.position + this.diceValue) % BOARD_SIZE;

        // Check if entering home stretch
        const distanceFromStart = (piece.position - startPos + BOARD_SIZE) % BOARD_SIZE;
        const newDistanceFromStart = distanceFromStart + this.diceValue;

        if (newDistanceFromStart >= BOARD_SIZE - 1) {
            // Enter home stretch
            piece.inHomeStretch = true;
            piece.homeStretchPosition = newDistanceFromStart - (BOARD_SIZE - 1);

            if (piece.homeStretchPosition === HOME_STRETCH_SIZE) {
                piece.finished = true;
                const allFinished = this.pieces[player].every(p => p.finished);
                if (allFinished) {
                    this.gameOver = true;
                    this.winner = player;
                    return { success: true, action: "win", player };
                }
                return { success: true, action: "finish", extraTurn: true };
            }

            return {
                success: true,
                action: "enterHomeStretch",
                extraTurn: this.diceValue === 6
            };
        }

        piece.position = newPosition;

        // Check for capture
        const captured = this.checkCapture(player, newPosition);

        return {
            success: true,
            action: captured ? "capture" : "move",
            newPosition,
            capturedPiece: captured,
            extraTurn: this.diceValue === 6 || captured !== null
        };
    }

    checkCapture(player, position) {
        // Can't capture on safe spots
        if (SAFE_SPOTS.includes(position)) return null;

        // Check all other players' pieces
        for (const otherPlayer of PLAYERS) {
            if (otherPlayer === player) continue;

            for (let i = 0; i < PIECES_PER_PLAYER; i++) {
                const piece = this.pieces[otherPlayer][i];
                if (piece.position === position && !piece.inHomeStretch && !piece.finished) {
                    // Capture! Send piece back to home
                    piece.position = -1;
                    return { player: otherPlayer, pieceId: i };
                }
            }
        }

        return null;
    }

    nextTurn() {
        // Only advance turn if didn't roll a 6
        if (this.diceValue !== 6) {
            let loopSafety = 0;
            do {
                this.currentPlayer = (this.currentPlayer + 1) % PLAYERS.length;
                loopSafety++;
                if (loopSafety > 10) {
                    console.error("Infinite loop detected in nextTurn!", {
                        currentPlayer: this.currentPlayer,
                        activePlayers: this.activePlayers
                    });
                    // Fallback to first active player
                    const firstActive = PLAYERS.find(p => this.activePlayers.includes(p));
                    this.currentPlayer = PLAYERS.indexOf(firstActive);
                    break;
                }
            } while (!this.activePlayers.includes(PLAYERS[this.currentPlayer]));
        }
        this.diceValue = 0;
    }

    // Bot AI
    getBotMove(player) {
        const validMoves = this.getValidMoves(player);

        if (validMoves.length === 0) return null;
        if (validMoves.length === 1) return validMoves[0].id;

        // Strategy: Prioritize moves
        let bestMove = null;
        let bestScore = -Infinity;

        for (const { id, piece } of validMoves) {
            let score = 0;

            // Priority 1: Finish a piece
            if (piece.inHomeStretch && piece.homeStretchPosition + this.diceValue === HOME_STRETCH_SIZE) {
                score += 1000;
            }

            // Priority 2: Capture opponent
            if (piece.position !== -1 && !piece.inHomeStretch) {
                const newPos = (piece.position + this.diceValue) % BOARD_SIZE;
                const wouldCapture = this.checkCapture(player, newPos);
                if (wouldCapture) score += 500;
            }

            // Priority 3: Move piece out of home
            if (piece.position === -1 && this.diceValue === 6) {
                score += 300;
            }

            // Priority 4: Enter home stretch
            if (piece.position !== -1 && !piece.inHomeStretch) {
                const startPos = START_POSITIONS[player];
                const distanceFromStart = (piece.position - startPos + BOARD_SIZE) % BOARD_SIZE;
                if (distanceFromStart > 40) score += 100; // Closer to home is better
            }

            // Priority 5: Safe spot
            if (piece.position !== -1 && !piece.inHomeStretch) {
                const newPos = (piece.position + this.diceValue) % BOARD_SIZE;
                if (SAFE_SPOTS.includes(newPos)) score += 50;
            }

            // Random variation to make it less predictable
            score += Math.random() * 10;

            if (score > bestScore) {
                bestScore = score;
                bestMove = id;
            }
        }

        return bestMove;
    }
}

export default LudoEngine;
