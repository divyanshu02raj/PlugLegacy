const User = require('../models/User');
const onlineUsers = new Map(); // userId -> socketId

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`Socket Connected: ${socket.id}`);

        // Helper to send online friends
        const sendOnlineFriends = async (userId) => {
            if (!userId) return;
            console.log(`[DEBUG] sendOnlineFriends for userId: ${userId}`);
            try {
                const user = await User.findById(userId).populate('friends', '_id');
                if (user && user.friends) {
                    console.log(`[DEBUG] Found ${user.friends.length} friends for ${userId}`);
                    const onlineFriendIds = [];
                    user.friends.forEach(friend => {
                        const friendIdStr = friend._id.toString();
                        const friendSocketId = onlineUsers.get(friendIdStr);
                        console.log(`[DEBUG] Friend ${friendIdStr} (Socket: ${friendSocketId})`);

                        // FIX: onlineUsers keys might be string or ObjectId? 
                        // We set it as `userId` from register_user. 
                        // If register_user receives string, key is string.
                        // friend._id is ObjectId. friend._id.toString() is string.
                        // We must ensure register_user receives string or we cast it.

                        if (friendSocketId) {
                            onlineFriendIds.push(friendIdStr);
                        }
                    });
                    console.log(`[DEBUG] Sending list: ${JSON.stringify(onlineFriendIds)}`);
                    socket.emit('online_friends_list', onlineFriendIds);
                }
            } catch (error) {
                console.error("Error syncing friend status:", error);
            }
        };

        // Register User (Map userId to socketId)
        socket.on('register_user', async (userId) => {
            if (userId) {
                // Ensure userId is string for consistency
                const userIdStr = userId.toString();
                onlineUsers.set(userIdStr, socket.id);
                console.log(`User registered: ${userIdStr} -> ${socket.id}`);
                console.log(`[DEBUG] Online Users Map keys: ${Array.from(onlineUsers.keys())}`);

                try {
                    // Notify friends that I am online
                    const user = await User.findById(userIdStr).populate('friends', '_id');
                    if (user && user.friends) {
                        user.friends.forEach(friend => {
                            const friendIdStr = friend._id.toString();
                            const friendSocketId = onlineUsers.get(friendIdStr);
                            if (friendSocketId) {
                                io.to(friendSocketId).emit('friend_online', { userId: userIdStr });
                            }
                        });
                        // Send initial list
                        await sendOnlineFriends(userIdStr);
                    }
                } catch (e) {
                    console.error("Error in register_user notify:", e);
                }
            }
        });

        // Handle manual request
        socket.on('request_online_friends', () => {
            console.log(`[DEBUG] request_online_friends from ${socket.id}`);
            let currentUserId = null;
            for (const [uid, sid] of onlineUsers.entries()) {
                if (sid === socket.id) {
                    currentUserId = uid;
                    break;
                }
            }
            if (currentUserId) {
                sendOnlineFriends(currentUserId);
            } else {
                console.log(`[DEBUG] No userId found for socket ${socket.id}`);
            }
        });

        // --- INVITEM SYSTEM ---

        // Sender invites Recipient
        socket.on('send_game_invite', ({ toUserId, gameType, fromUsername }) => {
            const recipientSocketId = onlineUsers.get(toUserId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('receive_game_invite', {
                    fromUserId: Array.from(onlineUsers.entries()).find(([k, v]) => v === socket.id)?.[0], // find sender ID safely or pass it from client
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
        // Recipient Responds (Accept/Decline)
        socket.on('respond_game_invite', async ({ accepted, toSocketId, toUserId, gameType }) => {
            console.log(`[DEBUG] respond_game_invite: accepted=${accepted}, toUser=${toUserId}, socket=${toSocketId}`);
            if (accepted) {
                const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                // Resolve Sender Socket (Robust Lookup)
                let senderSocket = io.sockets.sockets.get(toSocketId);
                if (!senderSocket && toUserId) {
                    const newSocketId = onlineUsers.get(toUserId);
                    if (newSocketId) senderSocket = io.sockets.sockets.get(newSocketId);
                }

                const recipientSocket = socket;

                if (senderSocket && recipientSocket) {
                    senderSocket.join(roomId);
                    recipientSocket.join(roomId);

                    // Assign colors randomly
                    const whitePlayer = Math.random() > 0.5 ? senderSocket.id : recipientSocket.id;

                    // Fetch User Details to send to clients
                    try {
                        const getUserIdFromMap = (sid) => [...onlineUsers.entries()].find(([k, v]) => v === sid)?.[0];

                        const senderUserIdResolved = toUserId || getUserIdFromMap(senderSocket.id);
                        const recipientUserId = getUserIdFromMap(recipientSocket.id);

                        const senderUser = senderUserIdResolved ? await User.findById(senderUserIdResolved).select('username avatar elo') : null;
                        const recipientUser = recipientUserId ? await User.findById(recipientUserId).select('username avatar elo') : null;

                        const gameStartData = {
                            roomId,
                            gameType,
                            whitePlayerId: whitePlayer === senderSocket.id ? 'sender' : 'recipient',
                            players: {
                                [senderSocket.id]: {
                                    color: whitePlayer === senderSocket.id ? 'w' : 'b',
                                    username: senderUser?.username || "Opponent",
                                    avatar: senderUser?.avatar || "bot",
                                    elo: senderUser?.elo
                                },
                                [recipientSocket.id]: {
                                    color: whitePlayer === recipientSocket.id ? 'w' : 'b',
                                    username: recipientUser?.username || "You",
                                    avatar: recipientUser?.avatar || "bot",
                                    elo: recipientUser?.elo
                                }
                            }
                        };

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
        socket.on('join_game_room', (roomId) => {
            socket.join(roomId);
        });

        socket.on('game_move', ({ roomId, move, fen }) => {
            // Relay move to everyone else in the room
            socket.to(roomId).emit('opponent_move', { move, fen });
        });

        // --- GAME ACTIONS (Resign/Draw) ---
        socket.on('game_resign', ({ roomId }) => {
            // Sender resigned. Notify everyone (opponent wins)
            // But who is the sender? socket.id
            // We can determine winner color or just say "Opponent Resigned"
            // Let the clients figure out who won based on who resigned.
            // Or we can emit "game_over" with specific details.
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
            // Find userId from socketId
            let disconnectedUserId = null;
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    onlineUsers.delete(userId);
                    console.log(`User ${userId} disconnected`);
                    break;
                }
            }

            if (disconnectedUserId) {
                try {
                    const user = await User.findById(disconnectedUserId).populate('friends', '_id');
                    if (user && user.friends) {
                        user.friends.forEach(friend => {
                            const friendSocketId = onlineUsers.get(friend._id.toString());
                            if (friendSocketId) {
                                io.to(friendSocketId).emit('friend_offline', { userId: disconnectedUserId });
                            }
                        });
                    }
                } catch (error) {
                    console.error("Error notifying friends of disconnect:", error);
                }
            }
        });
    });
};
