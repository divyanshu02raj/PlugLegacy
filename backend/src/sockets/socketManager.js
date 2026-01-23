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
        socket.on('respond_game_invite', ({ accepted, toSocketId, gameType }) => {
            if (accepted) {
                const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const senderSocket = io.sockets.sockets.get(toSocketId);
                const recipientSocket = socket;

                if (senderSocket && recipientSocket) {
                    senderSocket.join(roomId);
                    recipientSocket.join(roomId);

                    // Assign colors randomly
                    const whitePlayer = Math.random() > 0.5 ? senderSocket.id : recipientSocket.id;
                    const blackPlayer = whitePlayer === senderSocket.id ? recipientSocket.id : senderSocket.id;

                    io.to(roomId).emit('game_start', {
                        roomId,
                        gameType,
                        whitePlayerId: whitePlayer === senderSocket.id ? 'sender' : 'recipient', // Generic ID for now, client handles logic
                        players: {
                            [senderSocket.id]: { color: whitePlayer === senderSocket.id ? 'w' : 'b' },
                            [recipientSocket.id]: { color: whitePlayer === recipientSocket.id ? 'w' : 'b' }
                        }
                    });
                    console.log(`Game started in room ${roomId}`);
                }
            } else {
                // Decline logic can be added here
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
