const User = require('../models/User');
const redisClient = require('../config/redis');

// Constants for Redis Keys
const KEY_ONLINE_USERS = 'online_users';
const KEY_USER_SOCKETS = 'user_sockets';

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`Socket Connected: ${socket.id}`);

        // Helper to get socket ID for a user from Redis
        const getUserSocketId = async (userId) => {
            return await redisClient.hget(KEY_USER_SOCKETS, userId);
        };

        // Helper to send online friends
        const sendOnlineFriends = async (userId) => {
            if (!userId) return;
            console.log(`[DEBUG] sendOnlineFriends for userId: ${userId}`);
            try {
                const user = await User.findById(userId).populate('friends', '_id');
                if (user && user.friends) {
                    const friendIds = user.friends.map(f => f._id.toString());

                    // Check which friends are in the online_users set
                    const onlineFriendIds = [];
                    for (const friendId of friendIds) {
                        const isOnline = await redisClient.sismember(KEY_ONLINE_USERS, friendId);
                        if (isOnline) {
                            onlineFriendIds.push(friendId);
                        }
                    }

                    console.log(`[DEBUG] Sending list: ${JSON.stringify(onlineFriendIds)}`);
                    socket.emit('online_friends_list', onlineFriendIds);
                }
            } catch (error) {
                console.error("Error syncing friend status:", error);
            }
        };

        // Register User
        socket.on('register_user', async (userId) => {
            if (userId) {
                const userIdStr = userId.toString();

                // Store in Redis
                await redisClient.hset(KEY_USER_SOCKETS, userIdStr, socket.id);
                await redisClient.sadd(KEY_ONLINE_USERS, userIdStr);

                // Reverse mapping for disconnect (socket -> userId)
                // We can attach it to the socket object directly for this session
                socket.userId = userIdStr;

                console.log(`User registered: ${userIdStr} -> ${socket.id}`);

                try {
                    // Notify friends that I am online
                    const user = await User.findById(userIdStr).populate('friends', '_id');
                    if (user && user.friends) {
                        for (const friend of user.friends) {
                            const friendIdStr = friend._id.toString();
                            const friendSocketId = await getUserSocketId(friendIdStr);
                            if (friendSocketId) {
                                io.to(friendSocketId).emit('friend_online', { userId: userIdStr });
                            }
                        }
                        // Send initial list
                        await sendOnlineFriends(userIdStr);
                    }
                } catch (e) {
                    console.error("Error in register_user notify:", e);
                }
            }
        });

        // Handle manual request
        socket.on('request_online_friends', async () => {
            console.log(`[DEBUG] request_online_friends from ${socket.id}`);
            if (socket.userId) {
                await sendOnlineFriends(socket.userId);
            } else {
                console.log(`[DEBUG] No userId found on socket ${socket.id}`);
            }
        });

        // --- INVITEM SYSTEM ---

        // Sender invites Recipient
        socket.on('send_game_invite', async ({ toUserId, gameType, fromUsername }) => {
            const recipientSocketId = await getUserSocketId(toUserId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('receive_game_invite', {
                    fromUserId: socket.userId,
                    fromUsername, // Pass username for display
                    gameType,
                    socketId: socket.id // Sender's socket ID for quick response
                });
                console.log(`Invite sent from ${fromUsername} to ${toUserId}`);
            } else {
                // User offline
                socket.emit('invite_error', { message: "User is offline" });
            }
        });

        // Recipient Responds (Accept/Decline)
        socket.on('respond_game_invite', async ({ accepted, toSocketId, toUserId, gameType }) => {
            console.log(`[DEBUG] respond_game_invite: accepted=${accepted}, toUser=${toUserId}, socket=${toSocketId}`);
            if (accepted) {
                const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                // Resolve Sender Socket (Robust Lookup)
                let senderSocket = io.sockets.sockets.get(toSocketId);
                if (!senderSocket && toUserId) {
                    const newSocketId = await getUserSocketId(toUserId);
                    if (newSocketId) senderSocket = io.sockets.sockets.get(newSocketId);
                }

                const recipientSocket = socket;

                if (senderSocket && recipientSocket) {
                    senderSocket.join(roomId);
                    recipientSocket.join(roomId);

                    // Assign colors
                    let whitePlayer;
                    if (gameType === 'tic-tac-toe') {
                        // For Tic-Tac-Toe, Inviter (Sender) is X (White)
                        whitePlayer = senderSocket.id;
                    } else {
                        // Random for others
                        whitePlayer = Math.random() > 0.5 ? senderSocket.id : recipientSocket.id;
                    }

                    // Fetch User Details to send to clients
                    try {
                        const senderUserIdResolved = toUserId || senderSocket.userId;
                        const recipientUserId = recipientSocket.userId;

                        const senderUser = senderUserIdResolved ? await User.findById(senderUserIdResolved).select('username avatar elo') : null;
                        const recipientUser = recipientUserId ? await User.findById(recipientUserId).select('username avatar elo') : null;


                        // Define game key
                        const gameKey = `game:${roomId}`;

                        const gameStartData = {
                            roomId,
                            gameType,
                            whitePlayerId: whitePlayer === senderSocket.id ? 'sender' : 'recipient',
                            players: {
                                [senderSocket.id]: {
                                    userId: senderUserIdResolved,
                                    color: whitePlayer === senderSocket.id ? 'w' : 'b',
                                    username: senderUser?.username || "Opponent",
                                    avatar: senderUser?.avatar || "bot",
                                    elo: senderUser?.elo
                                },
                                [recipientSocket.id]: {
                                    userId: recipientUserId,
                                    color: whitePlayer === recipientSocket.id ? 'w' : 'b',
                                    username: recipientUser?.username || "You",
                                    avatar: recipientUser?.avatar || "bot",
                                    elo: recipientUser?.elo
                                }
                            },
                            fen: 'start', // Initial state
                            moves: []
                        };

                        // Persist Initial Game State to Redis
                        // We store it as a JSON string for simplicity in this MVP
                        await redisClient.setex(gameKey, 86400, JSON.stringify(gameStartData)); // Expires in 24h

                        console.log(`[DEBUG] Emitting game_start to room ${roomId}:`, JSON.stringify(gameStartData));
                        io.to(roomId).emit('game_start', gameStartData);
                        console.log(`Game started in room ${roomId}`);

                    } catch (err) {
                        console.error("Error fetching users for game start:", err);
                    }
                } else {
                    console.error("[DEBUG] Failed to start game: Sender or Recipient socket missing.");
                }
            } else {
                console.log(`[DEBUG] Invite declined.`);
            }
        });

        // --- GAMEPLAY ---
        socket.on('join_game_room', async (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);

            // Recover Game State if available
            const gameKey = `game:${roomId}`;
            const gameStateStr = await redisClient.get(gameKey);

            if (gameStateStr) {
                const gameState = JSON.parse(gameStateStr);
                console.log(`[DEBUG] Recovering game state for ${roomId}`);

                // Send current state to the joining user
                socket.emit('game_state_recovery', {
                    fen: gameState.fen,
                    moves: gameState.moves,
                    players: gameState.players,
                    gameType: gameState.gameType,
                    roomId: gameState.roomId
                });
            }
        });

        socket.on('game_move', async ({ roomId, move, fen }) => {
            // Broadcast to EVERYONE (including sender) so state stays in sync
            io.to(roomId).emit('game_move', { move, fen });

            // Update Game State in Redis
            const gameKey = `game:${roomId}`;
            const gameStateStr = await redisClient.get(gameKey);

            if (gameStateStr) {
                const gameState = JSON.parse(gameStateStr);
                gameState.fen = fen;
                if (move) gameState.moves.push(move);
                gameState.lastMoveTime = Date.now();

                await redisClient.setex(gameKey, 86400, JSON.stringify(gameState)); // Refresh TTL
            }
        });

        // --- GAME ACTIONS (Resign/Draw) ---
        socket.on('game_resign', ({ roomId }) => {
            socket.to(roomId).emit('opponent_resigned', { resignedSocketId: socket.id });
        });

        socket.on('game_offer_draw', ({ roomId }) => {
            socket.to(roomId).emit('receive_draw_offer', { fromSocketId: socket.id });
        });

        socket.on('respond_draw_offer', ({ roomId, accepted }) => {
            if (accepted) {
                // Draw accepted. End game.
                io.to(roomId).emit('game_draw', { reason: 'Agreement' });
            } else {
                // Draw rejected. Notify sender.
                socket.to(roomId).emit('draw_offer_rejected');
            }
        });

        // --- REMATCH SYSTEM ---
        socket.on('offer_rematch', ({ roomId }) => {
            socket.to(roomId).emit('receive_rematch_offer', { fromSocketId: socket.id });
        });

        socket.on('respond_rematch', ({ roomId, accepted }) => {
            if (accepted) {
                // Rematch Accepted - Restart Game
                // Get all sockets in room to determine players
                const room = io.sockets.adapter.rooms.get(roomId);
                if (room && room.size === 2) {
                    const players = Array.from(room); // [socketId1, socketId2]

                    const p1 = players[0];
                    const p2 = players[1];
                    const whitePlayer = Math.random() > 0.5 ? p1 : p2;

                    const newPlayers = {
                        [p1]: { color: p1 === whitePlayer ? 'w' : 'b' },
                        [p2]: { color: p2 === whitePlayer ? 'w' : 'b' }
                    };

                    io.to(roomId).emit('game_restarted', {
                        newPlayers,
                        roomId
                    });
                }
            } else {
                socket.to(roomId).emit('rematch_rejected');
            }
        });

        // --- WEBRTC SIGNALING ---
        socket.on("call_user", ({ roomId, offer, type }) => {
            socket.to(roomId).emit("incoming_call", { offer, from: socket.id, type });
        });

        socket.on("answer_call", ({ roomId, answer }) => {
            socket.to(roomId).emit("call_answered", { answer });
        });

        socket.on("ice_candidate", ({ roomId, candidate }) => {
            socket.to(roomId).emit("ice_candidate", { candidate });
        });

        socket.on("end_call", ({ roomId }) => {
            socket.to(roomId).emit("call_ended");
        });

        // --- CHAT ---
        socket.on('game_chat_message', ({ roomId, message, username, avatar }) => {
            io.to(roomId).emit('game_chat_message', {
                id: Date.now().toString(),
                senderId: socket.id,
                username,
                avatar,
                message,
                timestamp: new Date()
            });
        });

        // --- CLEANUP ---
        socket.on('disconnect', async () => {
            const userId = socket.userId;
            if (userId) {
                console.log(`User ${userId} disconnected`);

                // Cleanup Redis
                await redisClient.hdel(KEY_USER_SOCKETS, userId);
                await redisClient.srem(KEY_ONLINE_USERS, userId);

                try {
                    const user = await User.findById(userId).populate('friends', '_id');
                    if (user && user.friends) {
                        for (const friend of user.friends) {
                            const friendSocketId = await getUserSocketId(friend._id.toString());
                            if (friendSocketId) {
                                io.to(friendSocketId).emit('friend_offline', { userId });
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error notifying friends of disconnect:", error);
                }
            }
        });
    });
};
