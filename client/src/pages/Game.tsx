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

type StatChange = {
  health?: number;
  sanity?: number;
  hope?: number;
  humanity?: number;
};

type Situation = {
  text: string;
  effect: StatChange;
};

type EventScene = {
  text: string;
  effect: StatChange;
};

const INITIAL_STATS: Stats = {
  health: 50,
  sanity: 50,
  hope: 50,
  humanity: 50,
};

const SITUATIONS: Situation[] = [
  {
    text: "You get a notification that you have a meeting in 5 minutes.",
    effect: { sanity: -5, hope: -2 }
  },
  {
    text: "Your friend texts you a meme that actually made you laugh.",
    effect: { sanity: 8, humanity: 5 }
  },
  {
    text: "You spill coffee on your shirt right before work.",
    effect: { sanity: -8, hope: -3 }
  },
  {
    text: "Someone compliments your work unexpectedly.",
    effect: { hope: 10, humanity: 3 }
  },
  {
    text: "You realize you forgot to respond to an important email.",
    effect: { sanity: -10, hope: -5 }
  },
  {
    text: "You have a genuinely nice conversation with a coworker.",
    effect: { humanity: 8, sanity: 5 }
  },
  {
    text: "Your boss nitpicks something trivial you did.",
    effect: { sanity: -12, hope: -7 }
  },
  {
    text: "You find $20 in an old jacket pocket.",
    effect: { hope: 8, sanity: 6 }
  },
  {
    text: "You're stuck in traffic and late for something important.",
    effect: { sanity: -15, health: -5 }
  },
  {
    text: "You make someone smile with a kind gesture.",
    effect: { humanity: 10, hope: 7 }
  },
  {
    text: "Your alarm didn't go off and you overslept.",
    effect: { health: -8, hope: -10 }
  },
  {
    text: "You remember something embarrassing you did years ago.",
    effect: { sanity: -7, hope: -4 }
  },
  {
    text: "A loved one tells you they're proud of you.",
    effect: { hope: 12, sanity: 10, humanity: 8 }
  },
  {
    text: "You receive an unexpected bill in the mail.",
    effect: { hope: -10, health: -6 }
  },
  {
    text: "You finally finish a task you've been procrastinating on.",
    effect: { hope: 9, sanity: 7 }
  },
  {
    text: "You catch yourself in the mirror and don't recognize yourself.",
    effect: { sanity: -12, humanity: -8 }
  },
  {
    text: "A stranger holds the door for you.",
    effect: { humanity: 5, hope: 3 }
  },
  {
    text: "You eat something delicious and savor every bite.",
    effect: { health: 7, sanity: 6 }
  },
  {
    text: "Your anxiety spirals about something you can't control.",
    effect: { sanity: -15, hope: -8 }
  },
  {
    text: "You have a moment of pure clarity about what matters.",
    effect: { hope: 10, humanity: 10 }
  }
];

const EVENTS: EventScene[] = [
  {
    text: "You made it through another day.",
    effect: { health: 5, sanity: 3 }
  },
  {
    text: "The weight of existence feels heavier than usual.",
    effect: { sanity: -10, hope: -8 }
  },
  {
    text: "You feel more human today than yesterday.",
    effect: { humanity: 12, sanity: 8 }
  },
  {
    text: "Everything feels pointless.",
    effect: { hope: -15, sanity: -10 }
  },
  {
    text: "You had moments of genuine connection.",
    effect: { humanity: 10, hope: 8 }
  },
  {
    text: "Fatigue is setting in.",
    effect: { health: -10, sanity: -5 }
  }
];

export default function Game() {
  const [gameState, setGameState] = useState<GameState>("START");
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [turn, setTurn] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [message, setMessage] = useState("Initializing LIFE.EXE...");
  const [statChanges, setStatChanges] = useState<StatChange | null>(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const { toast } = useToast();

  const lastClickTimeRef = useRef<number>(0);
  const CLICKS_PER_TURN = 5;
  const MAX_TURNS = 10;
  const NORMAL_CLICK_INTERVAL = 400;

  const startGame = () => {
    setGameState("PLAYING");
    setStats(INITIAL_STATS);
    setTurn(0);
    setClicks(0);
    setMessage("Click to navigate through life.");
    setStatChanges(null);
    lastClickTimeRef.current = Date.now();
  };

  const handleSurviveClick = () => {
    if (gameState !== "PLAYING") return;

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    // Check if clicking too fast
    if (timeSinceLastClick < NORMAL_CLICK_INTERVAL) {
      setGameState("RUSHED");
      setButtonDisabled(true);
      setMessage("You rushed through life without thinking.");
      return;
    }

    const newClicks = clicks + 1;
    setClicks(newClicks);

    // Show a random situation
    const situation = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
    setMessage(situation.text);
    setStatChanges(situation.effect);

    // Apply the effects immediately
    setStats(prev => {
      const newStats = { ...prev };
      
      if (situation.effect.hope) newStats.hope += situation.effect.hope;
      if (situation.effect.sanity) newStats.sanity += situation.effect.sanity;
      if (situation.effect.health) newStats.health += situation.effect.health;
      if (situation.effect.humanity) newStats.humanity += situation.effect.humanity;

      // Clamp values
      (Object.keys(newStats) as (keyof Stats)[]).forEach(key => {
        newStats[key] = Math.max(0, Math.min(100, newStats[key]));
      });

      // Check death conditions immediately
      let died = false;
      let deathReason = "";

      if (newStats.health <= 0) { died = true; deathReason = "HEART STOPPED"; }
      else if (newStats.sanity <= 0) { died = true; deathReason = "MIND FRACTURED"; }
      else if (newStats.hope <= 0) { died = true; deathReason = "LOST ALL HOPE"; }
      else if (newStats.humanity <= 0) { died = true; deathReason = "LOST YOURSELF"; }

      if (died) {
        setGameState("GAME_OVER");
        setMessage(deathReason);
        setStatChanges(null);
      }

      return newStats;
    });

    // If 5 clicks reached, advance turn
    if (newClicks >= CLICKS_PER_TURN && gameState === "PLAYING") {
      setTimeout(() => {
        advanceTurn();
      }, 1500);
    }
  };

  const advanceTurn = () => {
    const newTurn = turn + 1;
    setTurn(newTurn);
    setClicks(0);
    setStatChanges(null);

    if (newTurn >= MAX_TURNS) {
      setGameState("VICTORY");
      setMessage("You survived all 10 rounds of life.");
    } else {
      // Show end-of-round event
      const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      setMessage(event.text);
      setStatChanges(event.effect);

      // Apply event effects
      setStats(prev => {
        const newStats = { ...prev };

        if (event.effect.hope) newStats.hope += event.effect.hope;
        if (event.effect.sanity) newStats.sanity += event.effect.sanity;
        if (event.effect.health) newStats.health += event.effect.health;
        if (event.effect.humanity) newStats.humanity += event.effect.humanity;

        // Clamp values
        (Object.keys(newStats) as (keyof Stats)[]).forEach(key => {
          newStats[key] = Math.max(0, Math.min(100, newStats[key]));
        });

        // Check death conditions
        let died = false;
        let deathReason = "";

        if (newStats.health <= 0) { died = true; deathReason = "HEART STOPPED"; }
        else if (newStats.sanity <= 0) { died = true; deathReason = "MIND FRACTURED"; }
        else if (newStats.hope <= 0) { died = true; deathReason = "LOST ALL HOPE"; }
        else if (newStats.humanity <= 0) { died = true; deathReason = "LOST YOURSELF"; }

        if (died) {
          setGameState("GAME_OVER");
          setMessage(deathReason);
          setStatChanges(null);
        }

        return newStats;
      });
    }
  };

  const handleRestart = () => {
    setButtonDisabled(false);
    startGame();
  };

  const formatStatChange = () => {
    if (!statChanges) return "";
    
    const parts: string[] = [];
    if (statChanges.health) parts.push(`${statChanges.health > 0 ? "+" : ""}${statChanges.health} Health`);
    if (statChanges.sanity) parts.push(`${statChanges.sanity > 0 ? "+" : ""}${statChanges.sanity} Sanity`);
    if (statChanges.hope) parts.push(`${statChanges.hope > 0 ? "+" : ""}${statChanges.hope} Hope`);
    if (statChanges.humanity) parts.push(`${statChanges.humanity > 0 ? "+" : ""}${statChanges.humanity} Humanity`);
    
    return parts.join(" | ");
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
        <div className="min-h-[280px] flex flex-col items-center justify-center space-y-4 text-center border-t-2 border-b-2 border-green-900/30 py-6">
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
              <p className="text-lg min-h-[4rem]">{message}</p>
              
              {statChanges && (
                <div className="w-full p-2 bg-green-900/20 border border-green-700/50 text-xs">
                  {formatStatChange()}
                </div>
              )}

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
