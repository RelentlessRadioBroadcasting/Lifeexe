import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Heart, Brain, DollarSign, Sparkles, Skull } from "lucide-react";
import { cn } from "@/lib/utils";
import reaperImg from "@assets/generated_images/8-bit_grim_reaper_pixel_art.png";

type GameState = "START" | "PLAYING" | "GAME_OVER" | "VICTORY";

type Stats = {
  hope: number;
  sanity: number;
  health: number;
  funds: number;
};

const INITIAL_STATS: Stats = {
  hope: 50,
  sanity: 50,
  health: 50,
  funds: 50,
};

const EVENTS = [
  {
    text: "You found a dollar on the street.",
    effect: { funds: 5, hope: 2 }
  },
  {
    text: "Your boss yelled at you.",
    effect: { sanity: -10, funds: 10 } // Got paid but sad
  },
  {
    text: "You ate a stale sandwich.",
    effect: { health: -5, funds: 5 } // Saved money
  },
  {
    text: "Existential dread sets in.",
    effect: { sanity: -15, hope: -5 }
  },
  {
    text: "You saw a cute dog.",
    effect: { sanity: 10, hope: 5 }
  },
  {
    text: "Unexpected medical bill.",
    effect: { funds: -20, sanity: -10 }
  },
  {
    text: "A stranger smiled at you.",
    effect: { hope: 10 }
  },
  {
    text: "You worked overtime.",
    effect: { funds: 20, health: -10, sanity: -10 }
  }
];

export default function Game() {
  const [gameState, setGameState] = useState<GameState>("START");
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [turn, setTurn] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [message, setMessage] = useState("Initializing LIFE.EXE...");
  const { toast } = useToast();

  const CLICKS_PER_TURN = 5;
  const MAX_TURNS = 10;

  const startGame = () => {
    setGameState("PLAYING");
    setStats(INITIAL_STATS);
    setTurn(0);
    setClicks(0);
    setMessage("SURVIVE 10 TURNS");
  };

  const handleSurviveClick = () => {
    if (gameState !== "PLAYING") return;

    const newClicks = clicks + 1;
    setClicks(newClicks);

    // Random small stat fluctuation on clicks
    if (Math.random() > 0.7) {
      const statKeys: (keyof Stats)[] = ["hope", "sanity", "health", "funds"];
      const randomStat = statKeys[Math.floor(Math.random() * statKeys.length)];
      const change = Math.random() > 0.5 ? 1 : -1;
      
      setStats(prev => ({
        ...prev,
        [randomStat]: Math.max(0, Math.min(100, prev[randomStat] + change))
      }));
    }

    if (newClicks >= CLICKS_PER_TURN) {
      advanceTurn();
    }
  };

  const advanceTurn = () => {
    const newTurn = turn + 1;
    setTurn(newTurn);
    setClicks(0);

    // Trigger Event
    const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    
    // Apply event effects
    setStats(prev => {
      const newStats = { ...prev };
      let died = false;
      let deathReason = "";

      // Apply changes
      if (event.effect.hope) newStats.hope += event.effect.hope;
      if (event.effect.sanity) newStats.sanity += event.effect.sanity;
      if (event.effect.health) newStats.health += event.effect.health;
      if (event.effect.funds) newStats.funds += event.effect.funds;

      // Clamp values
      (Object.keys(newStats) as (keyof Stats)[]).forEach(key => {
        newStats[key] = Math.max(0, Math.min(100, newStats[key]));
      });

      // Check death conditions
      if (newStats.health <= 0) { died = true; deathReason = "CRITICAL ORGAN FAILURE"; }
      else if (newStats.sanity <= 0) { died = true; deathReason = "PSYCHOTIC BREAK"; }
      else if (newStats.funds <= 0) { died = true; deathReason = "STARVATION (NO FUNDS)"; }
      else if (newStats.hope <= 0) { died = true; deathReason = "GAVE UP"; }

      if (died) {
        setGameState("GAME_OVER");
        setMessage(deathReason);
      } else {
        setMessage(event.text);
      }

      return newStats;
    });

    if (newTurn >= MAX_TURNS) {
      setGameState("VICTORY");
      setMessage("YOU SURVIVED LIFE.EXE");
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* CRT Effects */}
      <div className="crt-overlay absolute inset-0 z-50 pointer-events-none opacity-20" />
      <div className="scanline absolute inset-0 z-50 pointer-events-none opacity-10" />

      <div className="max-w-md w-full z-10 space-y-8 border-4 border-green-900/50 p-6 bg-black/80 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter animate-pulse">LIFE.EXE</h1>
          {gameState === "PLAYING" && (
            <div className="text-sm text-green-700">
              SURVIVAL PROGRESS: {turn}/{MAX_TURNS}
            </div>
          )}
        </div>

        {/* Status Display */}
        <div className="grid grid-cols-2 gap-4">
          <StatDisplay icon={Sparkles} label="HOPE" value={stats.hope} />
          <StatDisplay icon={Brain} label="SANITY" value={stats.sanity} />
          <StatDisplay icon={Heart} label="HEALTH" value={stats.health} />
          <StatDisplay icon={DollarSign} label="FUNDS" value={stats.funds} />
        </div>

        {/* Main Interaction Area */}
        <div className="min-h-[160px] flex flex-col items-center justify-center space-y-4 text-center border-t-2 border-b-2 border-green-900/30 py-6">
          {gameState === "START" && (
            <>
               <div className="w-32 h-32 mb-4 relative grayscale hover:grayscale-0 transition-all duration-500">
                <img src={reaperImg} alt="Reaper" className="w-full h-full object-contain pixelated" />
              </div>
              <p className="text-xl">INITIALIZE SIMULATION?</p>
              <Button 
                onClick={startGame}
                className="bg-green-700 text-black hover:bg-green-600 font-bold px-8 py-6 text-xl rounded-none animate-bounce"
              >
                START LIFE.EXE
              </Button>
            </>
          )}

          {gameState === "PLAYING" && (
            <>
              <p className="text-lg min-h-[3rem]">{message}</p>
              <div className="w-full max-w-[200px] space-y-2">
                <div className="flex justify-between text-xs text-green-700">
                  <span>CLICKS TO EVENT</span>
                  <span>{clicks}/{CLICKS_PER_TURN}</span>
                </div>
                <Progress value={(clicks / CLICKS_PER_TURN) * 100} className="h-2 bg-green-900/30" indicatorClassName="bg-green-500" />
              </div>
              
              <Button 
                onClick={handleSurviveClick}
                className="w-full py-8 text-xl bg-transparent border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black rounded-none transition-all active:scale-95"
              >
                CLICK TO SURVIVE
              </Button>
            </>
          )}

          {gameState === "GAME_OVER" && (
            <div className="space-y-4">
              <Skull className="w-16 h-16 mx-auto text-red-500 animate-pulse" />
              <div className="text-red-500 font-bold text-2xl">SIMULATION FAILED</div>
              <p className="text-green-700">{message}</p>
              <Button 
                onClick={startGame}
                variant="destructive"
                className="rounded-none px-8"
              >
                REBOOT SYSTEM
              </Button>
            </div>
          )}

          {gameState === "VICTORY" && (
            <div className="space-y-4">
              <Sparkles className="w-16 h-16 mx-auto text-yellow-500 animate-spin-slow" />
              <div className="text-yellow-500 font-bold text-2xl">SURVIVAL COMPLETE</div>
              <p className="text-green-700">You have delayed the inevitable.</p>
              <Button 
                onClick={startGame}
                className="bg-yellow-500 text-black hover:bg-yellow-400 rounded-none px-8"
              >
                PLAY AGAIN
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-green-900/60">
          © 2025 LIFE SIMULATION CORP
        </div>
      </div>
    </div>
  );
}

function StatDisplay({ icon: Icon, label, value }: { icon: any, label: string, value: number }) {
  return (
    <div className="flex items-center gap-2 p-2 border border-green-900/30 bg-green-900/5">
      <Icon className="w-4 h-4" />
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-xs">
          <span>{label}</span>
          <span>{value}</span>
        </div>
        <Progress value={value} className="h-1.5 bg-green-900/50" indicatorClassName={value < 20 ? "bg-red-500" : "bg-green-500"} />
      </div>
    </div>
  );
}
