import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Heart, Brain, Sparkles, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

type GameState = "START" | "PLAYING" | "GAME_OVER" | "VICTORY" | "RUSHED";

type Stats = {
  health: number;
  sanity: number;
  hope: number;
  humanity: number;
};

const INITIAL_STATS: Stats = {
  health: 50,
  sanity: 50,
  hope: 50,
  humanity: 50,
};

const EVENTS = [
  {
    text: "You found a quiet moment to yourself.",
    effect: { sanity: 8, hope: 5 }
  },
  {
    text: "Your boss criticized your work publicly.",
    effect: { sanity: -12, humanity: -5 }
  },
  {
    text: "You helped a stranger carry groceries.",
    effect: { humanity: 10, hope: 5 }
  },
  {
    text: "Sleep deprivation catches up with you.",
    effect: { health: -15, sanity: -10 }
  },
  {
    text: "You laughed at something genuinely funny.",
    effect: { sanity: 10, hope: 8 }
  },
  {
    text: "Your responsibilities feel overwhelming.",
    effect: { hope: -15, health: -8 }
  },
  {
    text: "A friend checked in on you.",
    effect: { humanity: 8, sanity: 10 }
  },
  {
    text: "You made a small mistake at work.",
    effect: { sanity: -8, hope: -5 }
  },
  {
    text: "You took a walk in fresh air.",
    effect: { health: 10, sanity: 8 }
  },
  {
    text: "You failed to meet your own expectations.",
    effect: { hope: -10, humanity: -8 }
  },
  {
    text: "You connected deeply with someone.",
    effect: { humanity: 12, sanity: 8 }
  },
  {
    text: "Financial stress weighs on you.",
    effect: { health: -10, hope: -10 }
  }
];

export default function Game() {
  const [gameState, setGameState] = useState<GameState>("START");
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [turn, setTurn] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [message, setMessage] = useState("Initializing LIFE.EXE...");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const { toast } = useToast();

  const lastClickTimeRef = useRef<number>(0);
  const CLICKS_PER_TURN = 5;
  const MAX_TURNS = 10;
  const NORMAL_CLICK_INTERVAL = 400; // milliseconds - normal pace

  const startGame = () => {
    setGameState("PLAYING");
    setStats(INITIAL_STATS);
    setTurn(0);
    setClicks(0);
    setMessage("Click to proceed through life.");
    lastClickTimeRef.current = Date.now();
  };

  const handleSurviveClick = () => {
    if (gameState !== "PLAYING") return;

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    // Check if clicking too fast (rushing through life)
    if (timeSinceLastClick < NORMAL_CLICK_INTERVAL) {
      setGameState("RUSHED");
      setButtonDisabled(true);
      setMessage("You rushed through life without thinking.");
      return;
    }

    const newClicks = clicks + 1;
    setClicks(newClicks);

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
      if (event.effect.humanity) newStats.humanity += event.effect.humanity;

      // Clamp values
      (Object.keys(newStats) as (keyof Stats)[]).forEach(key => {
        newStats[key] = Math.max(0, Math.min(100, newStats[key]));
      });

      // Check death conditions
      if (newStats.health <= 0) { died = true; deathReason = "HEART STOPPED"; }
      else if (newStats.sanity <= 0) { died = true; deathReason = "MIND FRACTURED"; }
      else if (newStats.hope <= 0) { died = true; deathReason = "LOST ALL HOPE"; }
      else if (newStats.humanity <= 0) { died = true; deathReason = "LOST YOURSELF"; }

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
      setMessage("You survived all 10 rounds of life.");
    }
  };

  const handleRestart = () => {
    setButtonDisabled(false);
    startGame();
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
              ROUND {turn}/{MAX_TURNS}
            </div>
          )}
        </div>

        {/* Status Display */}
        <div className="grid grid-cols-2 gap-4">
          <StatDisplay icon={Sparkles} label="HOPE" value={stats.hope} />
          <StatDisplay icon={Brain} label="SANITY" value={stats.sanity} />
          <StatDisplay icon={Heart} label="HEALTH" value={stats.health} />
          <StatDisplay icon={Sparkles} label="HUMANITY" value={stats.humanity} />
        </div>

        {/* Main Interaction Area */}
        <div className="min-h-[200px] flex flex-col items-center justify-center space-y-4 text-center border-t-2 border-b-2 border-green-900/30 py-6">
          {gameState === "START" && (
            <>
              <p className="text-xl">BEGIN SIMULATION?</p>
              <p className="text-sm text-green-700">Survive 10 rounds with 5 clicks per round.</p>
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
                  <span>CLICKS THIS ROUND</span>
                  <span>{clicks}/{CLICKS_PER_TURN}</span>
                </div>
                <Progress value={(clicks / CLICKS_PER_TURN) * 100} className="h-2 bg-green-900/30" indicatorClassName="bg-green-500" />
              </div>
              
              <Button 
                onClick={handleSurviveClick}
                disabled={buttonDisabled}
                className="w-full py-8 text-xl bg-transparent border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black rounded-none transition-all active:scale-95 disabled:opacity-50"
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
                onClick={handleRestart}
                variant="destructive"
                className="rounded-none px-8"
              >
                REBOOT SYSTEM
              </Button>
            </div>
          )}

          {gameState === "RUSHED" && (
            <div className="space-y-4">
              <Skull className="w-16 h-16 mx-auto text-yellow-500 animate-pulse" />
              <div className="text-yellow-500 font-bold text-2xl">LIFE SKIPPED</div>
              <p className="text-green-700">{message}</p>
              <Button 
                onClick={handleRestart}
                className="bg-red-600 text-black hover:bg-red-500 rounded-none px-8 font-bold"
              >
                Don't Rush Through Life
              </Button>
            </div>
          )}

          {gameState === "VICTORY" && (
            <div className="space-y-4">
              <Sparkles className="w-16 h-16 mx-auto text-yellow-500 animate-spin" />
              <div className="text-yellow-500 font-bold text-2xl">SURVIVAL COMPLETE</div>
              <p className="text-green-700">{message}</p>
              <Button 
                onClick={handleRestart}
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
