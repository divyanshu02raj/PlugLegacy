import { useState } from "react";
import { motion } from "framer-motion";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

const COLORS = {
  red: { bg: "bg-red-500", border: "border-red-600", light: "bg-red-400" },
  green: { bg: "bg-green-500", border: "border-green-600", light: "bg-green-400" },
  yellow: { bg: "bg-yellow-500", border: "border-yellow-600", light: "bg-yellow-400" },
  blue: { bg: "bg-blue-500", border: "border-blue-600", light: "bg-blue-400" },
};

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

const LudoBoard = () => {
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<keyof typeof COLORS>("red");

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    
    // Animate through random values
    let count = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 10) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setIsRolling(false);
        
        // Switch player if not 6
        if (finalValue !== 6) {
          const players = Object.keys(COLORS) as (keyof typeof COLORS)[];
          const nextIdx = (players.indexOf(currentPlayer) + 1) % players.length;
          setCurrentPlayer(players[nextIdx]);
        }
      }
    }, 100);
  };

  const DiceIcon = diceValue ? DICE_ICONS[diceValue - 1] : Dice1;

  // Render a home base quadrant
  const renderHomeBase = (color: keyof typeof COLORS, position: string) => (
    <div className={`${COLORS[color].bg} ${position} p-2 rounded-lg`}>
      <div className="bg-white/20 rounded-lg p-2 h-full grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="aspect-square rounded-full bg-white/30 flex items-center justify-center"
          >
            <div className={`w-3/4 h-3/4 rounded-full ${COLORS[color].light} border-2 ${COLORS[color].border}`} />
          </div>
        ))}
      </div>
    </div>
  );

  // Render center finish area
  const renderCenter = () => (
    <div className="absolute inset-0 m-auto w-1/3 h-1/3 z-10">
      <div className="w-full h-full grid grid-cols-2 grid-rows-2">
        <div className="bg-red-500 clip-triangle-tl" />
        <div className="bg-green-500 clip-triangle-tr" />
        <div className="bg-yellow-500 clip-triangle-bl" />
        <div className="bg-blue-500 clip-triangle-br" />
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Current Player */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full ${COLORS[currentPlayer].bg}`} />
          <span className="font-bold capitalize">{currentPlayer}'s Turn</span>
        </div>
      </div>

      {/* Board */}
      <div className="relative">
        <div className="absolute inset-0 blur-3xl opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 via-transparent to-blue-500/30" />
        </div>

        <div className="relative glass-card rounded-2xl p-3 border border-glass-border aspect-square">
          <div className="w-full h-full relative bg-slate-200/10 rounded-xl overflow-hidden">
            {/* Home Bases */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0">
              {/* Top Left - Red */}
              {renderHomeBase("red", "")}
              
              {/* Top Center - Path */}
              <div className="bg-slate-800/50 grid grid-cols-3 grid-rows-6">
                {Array(18).fill(null).map((_, i) => (
                  <div
                    key={i}
                    className={`
                      border border-slate-700/50 flex items-center justify-center text-[8px]
                      ${i >= 6 && i < 12 && "bg-green-500/30"}
                      ${i === 7 && "bg-green-500"}
                    `}
                  >
                    {(i === 2 || i === 8 || i === 14) && "★"}
                  </div>
                ))}
              </div>
              
              {/* Top Right - Green */}
              {renderHomeBase("green", "")}
              
              {/* Middle Left - Path */}
              <div className="bg-slate-800/50 grid grid-cols-6 grid-rows-3">
                {Array(18).fill(null).map((_, i) => (
                  <div
                    key={i}
                    className={`
                      border border-slate-700/50 flex items-center justify-center text-[8px]
                      ${i >= 6 && i < 12 && "bg-red-500/30"}
                      ${i === 7 && "bg-red-500"}
                    `}
                  >
                    {(i === 1 || i === 7 || i === 13) && "★"}
                  </div>
                ))}
              </div>
              
              {/* Center - Finish */}
              <div className="relative">
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                  <div className="bg-red-500/80" />
                  <div className="bg-green-500/80" />
                  <div className="bg-yellow-500/80" />
                  <div className="bg-blue-500/80" />
                </div>
              </div>
              
              {/* Middle Right - Path */}
              <div className="bg-slate-800/50 grid grid-cols-6 grid-rows-3">
                {Array(18).fill(null).map((_, i) => (
                  <div
                    key={i}
                    className={`
                      border border-slate-700/50 flex items-center justify-center text-[8px]
                      ${i >= 6 && i < 12 && "bg-blue-500/30"}
                      ${i === 10 && "bg-blue-500"}
                    `}
                  >
                    {(i === 4 || i === 10 || i === 16) && "★"}
                  </div>
                ))}
              </div>
              
              {/* Bottom Left - Yellow */}
              {renderHomeBase("yellow", "")}
              
              {/* Bottom Center - Path */}
              <div className="bg-slate-800/50 grid grid-cols-3 grid-rows-6">
                {Array(18).fill(null).map((_, i) => (
                  <div
                    key={i}
                    className={`
                      border border-slate-700/50 flex items-center justify-center text-[8px]
                      ${i >= 6 && i < 12 && "bg-yellow-500/30"}
                      ${i === 10 && "bg-yellow-500"}
                    `}
                  >
                    {(i === 3 || i === 9 || i === 15) && "★"}
                  </div>
                ))}
              </div>
              
              {/* Bottom Right - Blue */}
              {renderHomeBase("blue", "")}
            </div>
          </div>
        </div>
      </div>

      {/* Dice */}
      <div className="mt-6 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={rollDice}
          disabled={isRolling}
          className={`
            w-20 h-20 rounded-2xl glass-card border-2 
            ${COLORS[currentPlayer].border} 
            flex items-center justify-center
            ${isRolling && "animate-bounce"}
          `}
        >
          <motion.div
            animate={isRolling ? { rotate: [0, 360] } : {}}
            transition={{ duration: 0.2, repeat: isRolling ? Infinity : 0 }}
          >
            <DiceIcon className="w-12 h-12" />
          </motion.div>
        </motion.button>
      </div>

      {diceValue && !isRolling && (
        <p className="text-center mt-2 text-muted-foreground">
          Rolled: <span className="font-bold text-foreground">{diceValue}</span>
          {diceValue === 6 && <span className="ml-2 text-primary">🎉 Roll again!</span>}
        </p>
      )}
    </motion.div>
  );
};

export default LudoBoard;
