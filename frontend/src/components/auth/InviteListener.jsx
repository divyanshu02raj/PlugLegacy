import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const InviteListener = () => {
    const { socket } = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        if (!socket) return;

        // --- INVITE RECEIVED ---
        const handleInvite = (data) => {
            const { fromUsername, gameType, socketId, fromUserId } = data;

            toast(`${fromUsername} invited you to play ${gameType}!`, {
                action: {
                    label: "Accept",
                    onClick: () => {
                        socket.emit('respond_game_invite', {
                            accepted: true,
                            toSocketId: socketId, // Fallback
                            toUserId: fromUserId, // Specific User Target (Robust)
                            gameType
                        });
                        toast.dismiss();
                    }
                },
                cancel: {
                    label: "Decline",
                    onClick: () => {
                        // socket.emit('respond_game_invite', { accepted: false, toSocketId: socketId });
                        toast.dismiss();
                    }
                },
                duration: 10000,
            });
        };

        // --- GAME START ---
        const handleGameStart = (data) => {
            const { roomId, gameType, players, whitePlayerId } = data;

            // Navigate to game arena with room state
            navigate(`/play/${gameType}`, {
                state: {
                    roomId,
                    multiplayer: true,
                    players,
                    whitePlayerId
                }
            });
            toast.success("Game started!");
        };

        socket.on('receive_game_invite', handleInvite);
        socket.on('game_start', handleGameStart);

        return () => {
            socket.off('receive_game_invite', handleInvite);
            socket.off('game_start', handleGameStart);
        };
    }, [socket, navigate]);

    return null;
};

export default InviteListener;
