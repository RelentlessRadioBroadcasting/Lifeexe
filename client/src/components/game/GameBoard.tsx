import { motion } from "framer-motion";
import { Player } from "@/lib/gameData";
import reaperImg from "@assets/generated_images/8-bit_grim_reaper_pixel_art.png";

interface GameBoardProps {
  players: Player[];
  activePlayerId: number;
}

export function GameBoard({ players, activePlayerId }: GameBoardProps) {
  // Create a circular path of nodes
  const totalNodes = 16;
  const radius = 180;
  const nodes = Array.from({ length: totalNodes });

  return (
    <div className="relative w-[500px] h-[500px] flex items-center justify-center">
      {/* Centerpiece */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative w-48 h-48 border-4 border-primary bg-black/80 rounded-full flex items-center justify-center overflow-hidden">
          <img 
            src={reaperImg} 
            alt="The Grim Reaper" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>
      </div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
        <circle cx="250" cy="250" r={radius} fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" strokeDasharray="10 5" />
      </svg>

      {/* Nodes */}
      {nodes.map((_, index) => {
        const angle = (index / totalNodes) * 2 * Math.PI;
        const x = 250 + radius * Math.cos(angle);
        const y = 250 + radius * Math.sin(angle);
        
        return (
          <div
            key={index}
            className="absolute w-6 h-6 border-2 border-muted bg-black transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
          />
        );
      })}

      {/* Players */}
      {players.map((player) => {
        if (player.isDead) return null;
        
        // Offset players slightly so they don't overlap perfectly
        const offsetAngle = (player.id - 1) * 0.15; 
        const angle = ((player.position % totalNodes) / totalNodes) * 2 * Math.PI + offsetAngle;
        const x = 250 + radius * Math.cos(angle);
        const y = 250 + radius * Math.sin(angle);

        return (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              left: x, 
              top: y, 
              opacity: 1, 
              scale: player.id === activePlayerId ? 1.5 : 1,
              zIndex: player.id === activePlayerId ? 20 : 15
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`absolute w-8 h-8 ${player.color.replace('text-', 'bg-')} border-2 border-black shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center font-press text-[10px] text-black`}
          >
            {player.name}
          </motion.div>
        );
      })}
    </div>
  );
}
