import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

const VideoOverlay = ({
    onClose,
    isMuted,
    setIsMuted,
    isCameraOff,
    setIsCameraOff,
    localStream,
    remoteStream
}) => {
    const constraintsRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (
        <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-50 flex items-start justify-end p-6">
            <motion.div
                drag
                dragConstraints={constraintsRef}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="pointer-events-auto relative w-[320px] aspect-[3/4] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
                {/* Remote Video (Main) */}
                <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                    {remoteStream ? (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-4xl animate-pulse">📡</span>
                            <p className="text-white/50 text-xs">Connecting...</p>
                        </div>
                    )}
                    {/* Mock overlay gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                </div>

                {/* Local Video (PiP) */}
                <motion.div
                    drag
                    dragConstraints={{ left: 0, right: 180, top: 0, bottom: 280 }}
                    whileHover={{ scale: 1.05 }}
                    className="absolute top-4 right-4 w-24 h-32 bg-neutral-700 rounded-xl overflow-hidden border border-white/20 shadow-lg cursor-grab active:cursor-grabbing z-10"
                >
                    <div className={`w-full h-full flex items-center justify-center ${isCameraOff ? "bg-neutral-800" : "bg-black"}`}>
                        {!isCameraOff && (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted // Local video must be muted
                                className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
                            />
                        )}
                        {isCameraOff && <VideoOff className="w-4 h-4 text-white/40" />}
                    </div>
                </motion.div>

                {/* Controls */}
                <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-4">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-3 rounded-full transition-colors ${isMuted ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"}`}
                    >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={onClose}
                        className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                    >
                        <PhoneOff className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setIsCameraOff(!isCameraOff)}
                        className={`p-3 rounded-full transition-colors ${isCameraOff ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"}`}
                    >
                        {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default VideoOverlay;
