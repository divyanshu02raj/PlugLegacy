import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "../context/SocketContext";

const ICE_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" }
    ]
};

export const useWebRTC = (roomId) => {
    const { socket } = useSocket();
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isCallIncoming, setIsCallIncoming] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [incomingCallData, setIncomingCallData] = useState(null);

    const peerConnection = useRef(null);
    const pendingCandidates = useRef([]); // Ice candidates before remote desc set
    const isInitiator = useRef(false);

    // Initialize PeerConnection
    const createPeerConnection = useCallback(() => {
        if (peerConnection.current) return;

        console.log("Creating RTCPeerConnection");
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnection.current = pc;

        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit("ice_candidate", { roomId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            console.log("Receiving Remote Stream", event.streams[0]);
            setRemoteStream(event.streams[0]);
        };

        // Note: Pending candidates are now handled after setRemoteDescription
        // to avoid "Remote description not set" errors.

        return pc;
    }, [roomId, socket]);

    // Start Call
    const startCall = async (type = 'video') => {
        try {
            console.log(`Starting ${type} call...`);
            isInitiator.current = true;
            createPeerConnection();

            const constraints = {
                audio: true,
                video: type === 'video'
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);

            stream.getTracks().forEach(track => {
                peerConnection.current.addTrack(track, stream);
            });

            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);

            socket.emit("call_user", { roomId, offer, type });
            setIsCallActive(true);
        } catch (error) {
            console.error("Error starting call:", error);
            throw error; // Re-throw for UI to handle
        }
    };

    // Answer Call
    const answerCall = async () => {
        if (!incomingCallData) return;

        try {
            console.log("Answering call...");
            // If PC doesn't exist (it shouldn't for receiver yet), create it
            createPeerConnection();

            const { offer, type } = incomingCallData;

            const constraints = {
                audio: true,
                video: type === 'video'
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);

            stream.getTracks().forEach(track => {
                peerConnection.current.addTrack(track, stream);
            });

            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

            // Add pending candidates NOW that remote desc is set
            if (pendingCandidates.current.length > 0) {
                console.log("Adding pending candidates (Receiver)");
                pendingCandidates.current.forEach(candidate => {
                    peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
                        .catch(e => console.error("Error adding pending ice", e));
                });
                pendingCandidates.current = [];
            }

            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);

            socket.emit("answer_call", { roomId, answer });

            setIsCallActive(true);
            setIsCallIncoming(false);
            setIncomingCallData(null);

        } catch (error) {
            console.error("Error answering call:", error);
            throw error; // Re-throw for UI to handle
        }
    };

    // Decline Call
    const declineCall = () => {
        socket.emit("end_call", { roomId });
        setIsCallIncoming(false);
        setIncomingCallData(null);
    };

    // End Call (Hangup)
    const endCall = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        setRemoteStream(null);
        setIsCallActive(false);
        socket.emit("end_call", { roomId });
    }, [localStream, roomId, socket]);

    // Handle specific cleanup on call end event
    const handleRemoteHangup = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        setRemoteStream(null);
        setIsCallActive(false);
        setIsCallIncoming(false);
        setIncomingCallData(null);
    }, [localStream]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (peerConnection.current) {
                peerConnection.current.close();
            }
        };
    }, []);

    // Socket Listeners
    useEffect(() => {
        if (!socket) return;

        const handleIncomingCall = ({ offer, from, type }) => {
            console.log("Incoming call received");
            // If already in call, maybe auto-reject? For now just overwrite state (simple 1v1)
            setIncomingCallData({ offer, from, type });
            setIsCallIncoming(true);
        };

        const handleCallAnswered = async ({ answer }) => {
            console.log("Call answered");
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
                // Add any candidates that arrived before answer
                if (pendingCandidates.current.length > 0) {
                    pendingCandidates.current.forEach(candidate => {
                        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
                            .catch(e => console.error("Error adding ice:", e));
                    });
                    pendingCandidates.current = [];
                }
            }
        };

        const handleIceCandidate = async ({ candidate }) => {
            if (peerConnection.current && peerConnection.current.remoteDescription) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error("Error adding ice candidate", e);
                }
            } else {
                console.log("Caching ICE candidate");
                pendingCandidates.current.push(candidate);
            }
        };

        const handleCallEnded = () => {
            console.log("Call ended by remote");
            handleRemoteHangup();
        };

        socket.on("incoming_call", handleIncomingCall);
        socket.on("call_answered", handleCallAnswered);
        socket.on("ice_candidate", handleIceCandidate);
        socket.on("call_ended", handleCallEnded);

        return () => {
            socket.off("incoming_call", handleIncomingCall);
            socket.off("call_answered", handleCallAnswered);
            socket.off("ice_candidate", handleIceCandidate);
            socket.off("call_ended", handleCallEnded);
        };
    }, [socket, roomId, handleRemoteHangup]);

    return {
        localStream,
        remoteStream,
        isCallIncoming,
        isCallActive,
        startCall,
        answerCall,
        declineCall,
        endCall,
        incomingCallData
    };
};
