import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Eraser, Trash2, Undo } from "lucide-react";

const COLORS = [
    "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308",
    "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280"
];

const BRUSH_SIZES = [4, 8, 16, 24];

const WORDS = ["cat", "dog", "house", "tree", "car", "sun", "moon", "fish", "bird", "flower"];

const SkribblBoard = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(8);
    const [isEraser, setIsEraser] = useState(false);
    const [word] = useState(WORDS[Math.floor(Math.random() * WORDS.length)]);
    const [history, setHistory] = useState([]);
    const lastPos = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Save initial state
        setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    }, []);

    const saveState = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;

        setHistory(prev => [...prev.slice(-20), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    };

    const undo = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas || history.length <= 1) return;

        const newHistory = [...history];
        newHistory.pop();
        setHistory(newHistory);

        const lastState = newHistory[newHistory.length - 1];
        ctx.putImageData(lastState, 0, 0);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
    };

    const getCanvasPos = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if ('touches' in e) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY,
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const startDrawing = (e) => {
        const pos = getCanvasPos(e);
        lastPos.current = pos;
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !lastPos.current) return;

        const pos = getCanvasPos(e);

        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = isEraser ? "#ffffff" : color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        lastPos.current = pos;
    };

    const stopDrawing = () => {
        if (isDrawing) {
            saveState();
        }
        setIsDrawing(false);
        lastPos.current = null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl mx-auto"
        >
            {/* Word to draw */}
            <div className="glass-card rounded-xl px-6 py-3 mb-4 border border-glass-border text-center">
                <span className="text-sm text-muted-foreground">Draw: </span>
                <span className="text-2xl font-bold text-primary tracking-widest">
                    {word.split("").map((char, i) => (
                        <span key={i} className="inline-block mx-0.5">{char.toUpperCase()}</span>
                    ))}
                </span>
            </div>

            {/* Canvas */}
            <div className="relative">
                <div className="absolute inset-0 blur-3xl opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/40 via-transparent to-purple-500/40" />
                </div>

                <div className="relative glass-card rounded-2xl p-2 border border-glass-border">
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={400}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full rounded-xl cursor-crosshair touch-none"
                        style={{ backgroundColor: "#ffffff" }}
                    />
                </div>
            </div>

            {/* Toolbar */}
            <div className="mt-4 glass-card rounded-xl p-4 border border-glass-border">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Colors */}
                    <div className="flex gap-1.5">
                        {COLORS.map(c => (
                            <motion.button
                                key={c}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => { setColor(c); setIsEraser(false); }}
                                className={`
                  w-8 h-8 rounded-full border-2 transition-all
                  ${color === c && !isEraser ? "border-primary scale-110" : "border-transparent"}
                `}
                                style={{ backgroundColor: c, boxShadow: c === "#ffffff" ? "inset 0 0 0 1px rgba(0,0,0,0.1)" : undefined }}
                            />
                        ))}
                    </div>

                    {/* Brush Sizes */}
                    <div className="flex gap-2 items-center">
                        {BRUSH_SIZES.map(size => (
                            <motion.button
                                key={size}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setBrushSize(size)}
                                className={`
                  rounded-full bg-foreground transition-all
                  ${brushSize === size ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                `}
                                style={{ width: size + 8, height: size + 8 }}
                            />
                        ))}
                    </div>

                    {/* Tools */}
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsEraser(!isEraser)}
                            className={`
                p-2 rounded-lg transition-all
                ${isEraser ? "bg-primary text-primary-foreground" : "glass-card border border-glass-border hover:bg-white/10"}
              `}
                        >
                            <Eraser className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={undo}
                            className="p-2 rounded-lg glass-card border border-glass-border hover:bg-white/10"
                        >
                            <Undo className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={clearCanvas}
                            className="p-2 rounded-lg glass-card border border-glass-border hover:bg-red-500/20 hover:border-red-500/50"
                        >
                            <Trash2 className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Guess input (for multiplayer) */}
            <div className="mt-4 glass-card rounded-xl p-4 border border-glass-border">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Type your guess..."
                        className="flex-1 bg-white/5 border border-glass-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-glow px-6 py-2 rounded-lg"
                    >
                        Guess
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default SkribblBoard;
