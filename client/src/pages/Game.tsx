import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Heart, Brain, Sparkles, Skull, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

type GameState = "INTRO" | "START" | "PLAYING" | "GAME_OVER" | "VICTORY" | "RUSHED";

type Stats = {
  health: number;
  sanity: number;
  hope: number;
  financial: number;
};

type StatChange = {
  health?: number;
  sanity?: number;
  hope?: number;
  financial?: number;
};

type Situation = {
  text: string;
  effect: StatChange;
};

const INITIAL_STATS: Stats = {
  health: 50,
  sanity: 50,
  hope: 50,
  financial: 50,
};

// Core 5 repeatable situations (can appear multiple times in a game)
const CORE_SITUATIONS = [
  "You get a notification that you have a meeting in 5 minutes.",
  "Your friend texts you a meme that actually made you laugh.",
  "You spill coffee on your shirt right before work.",
  "Someone compliments your work unexpectedly.",
  "You realize you forgot to respond to an important email."
];

// Situation templates for random generation
const SITUATION_TEMPLATES = [
  "Your boss nitpicks something trivial you did.",
  "You find money in an old jacket pocket.",
  "You're stuck in traffic and late for something important.",
  "You make someone smile with a kind gesture.",
  "Your alarm didn't go off and you overslept.",
  "You remember something embarrassing you did years ago.",
  "A loved one tells you they're proud of you.",
  "You receive an unexpected bill in the mail.",
  "You finally finish a task you've been procrastinating on.",
  "You catch yourself in the mirror and don't recognize yourself.",
  "A stranger holds the door for you.",
  "You eat something delicious and savor every bite.",
  "Your anxiety spirals about something you can't control.",
  "You have a moment of pure clarity about what matters.",
  "Someone took credit for your work.",
  "You laughed until your sides hurt.",
  "The weight of your responsibilities feels crushing.",
  "You helped someone without being asked.",
  "You made a silly mistake that everyone witnessed.",
  "You felt genuinely safe and at peace.",
  "Your body aches from stress.",
  "You had a conversation that changed your perspective.",
  "You failed at something you really wanted to succeed at.",
  "You received unexpected kindness from a stranger.",
  "You wasted the entire evening and feel guilty.",
  "You stood up for yourself for once.",
  "You felt completely invisible.",
  "You made someone laugh until they cried.",
  "You couldn't afford something you really needed.",
  "You reconnected with an old friend."
];

// Function to generate random stat changes
const generateRandomStatChange = (): StatChange => {
  const stats: (keyof Stats)[] = ["health", "sanity", "hope", "financial"];
  const change: StatChange = {};
  
  // Generate 1-3 stat changes
  const numChanges = Math.floor(Math.random() * 3) + 1;
  const selectedStats = stats.sort(() => Math.random() - 0.5).slice(0, numChanges);
  
  selectedStats.forEach(stat => {
    const isPositive = Math.random() > 0.4; // 60% chance positive
    if (isPositive) {
      // Positive: 2-7 points
      change[stat] = Math.floor(Math.random() * 6) + 2;
    } else {
      // Negative: -4 to -10 points
      change[stat] = -(Math.floor(Math.random() * 7) + 4);
    }
  });
  
  return change;
};

// Function to generate today's game situations
const generateGameSituations = (): Situation[] => {
  const situations: Situation[] = [];
  
  // Add 5 core situations with random stat changes
  const coreIndexes = CORE_SITUATIONS.map((text, idx) => idx)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
  
  coreIndexes.forEach(idx => {
    situations.push({
      text: CORE_SITUATIONS[idx],
      effect: generateRandomStatChange()
    });
  });
  
  // Add 15 random generated situations
  const templateIndexes = SITUATION_TEMPLATES.map((_, idx) => idx)
    .sort(() => Math.random() - 0.5)
    .slice(0, 15);
  
  templateIndexes.forEach(idx => {
    situations.push({
      text: SITUATION_TEMPLATES[idx],
      effect: generateRandomStatChange()
    });
  });
  
  // Shuffle all 20 together
  return situations.sort(() => Math.random() - 0.5);
};

const ROUND_EVENTS = [
  "You made it through another day.",
  "The weight of existence feels heavier than usual.",
  "You feel more human today than yesterday.",
  "Everything feels pointless.",
  "You had moments of genuine connection.",
  "Fatigue is setting in."
];

export default function Game() {
  const [gameState, setGameState] = useState<GameState>("INTRO");
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [turn, setTurn] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [message, setMessage] = useState("Initializing LIFE.EXE...");
  const [statChanges, setStatChanges] = useState<StatChange | null>(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [gameSituations, setGameSituations] = useState<Situation[]>([]);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  // Auto-transition from intro to start after animation
  useEffect(() => {
    if (gameState === "INTRO") {
      const timer = setTimeout(() => {
        setGameState("START");
      }, 7000); // 7 seconds for the scrolling animation
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const clickTimestampsRef = useRef<number[]>([]);
  const CLICKS_PER_TURN = 5;
  const MAX_TURNS = 10;
  const SPAM_WINDOW = 1000; // 1 second
  const SPAM_THRESHOLD = 5; // 5 clicks in 1 second = spam

  const startGame = () => {
    const situations = generateGameSituations();
    setGameSituations(situations);
    setUsedIndices(new Set());
    setGameState("PLAYING");
    setStats(INITIAL_STATS);
    setTurn(0);
    setClicks(0);
    setMessage("Click to navigate through life.");
    setStatChanges(null);
    clickTimestampsRef.current = [];
  };

  const getNextSituation = (): Situation => {
    // Find a situation that hasn't been used yet
    let idx = Math.floor(Math.random() * gameSituations.length);
    let attempts = 0;
    
    while (usedIndices.has(idx) && attempts < gameSituations.length) {
      idx = Math.floor(Math.random() * gameSituations.length);
      attempts++;
    }
    
    // Mark as used
    setUsedIndices(prev => new Set([...Array.from(prev), idx]));
    
    return gameSituations[idx];
  };

  const handleSurviveClick = () => {
    if (gameState !== "PLAYING") return;

    const now = Date.now();
    
    // Add current click to timestamps
    clickTimestampsRef.current.push(now);
    
    // Remove clicks older than 1 second
    clickTimestampsRef.current = clickTimestampsRef.current.filter(
      timestamp => now - timestamp < SPAM_WINDOW
    );
    
    // Check if spamming (5 clicks in 1 second)
    if (clickTimestampsRef.current.length >= SPAM_THRESHOLD) {
      setGameState("RUSHED");
      setButtonDisabled(true);
      setMessage("You rushed through life without thinking.");
      return;
    }

    const newClicks = clicks + 1;
    setClicks(newClicks);

    // Get next unused situation
    const situation = getNextSituation();
    setMessage(situation.text);
    setStatChanges(situation.effect);

    // Apply the effects immediately
    setStats(prev => {
      const newStats = { ...prev };
      
      if (situation.effect.hope) newStats.hope += situation.effect.hope;
      if (situation.effect.sanity) newStats.sanity += situation.effect.sanity;
      if (situation.effect.health) newStats.health += situation.effect.health;
      if (situation.effect.financial) newStats.financial += situation.effect.financial;

      // Clamp values with 100 point ceiling
      (Object.keys(newStats) as (keyof Stats)[]).forEach(key => {
        newStats[key] = Math.max(0, Math.min(100, newStats[key]));
      });

      // Check death conditions immediately
      let died = false;
      let deathReason = "";

      if (newStats.health <= 0) { died = true; deathReason = "HEART STOPPED"; }
      else if (newStats.sanity <= 0) { died = true; deathReason = "MIND FRACTURED"; }
      else if (newStats.hope <= 0) { died = true; deathReason = "LOST ALL HOPE"; }
      else if (newStats.financial <= 0) { died = true; deathReason = "BANKRUPT"; }

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
      const eventText = ROUND_EVENTS[Math.floor(Math.random() * ROUND_EVENTS.length)];
      const eventEffect = generateRandomStatChange();
      
      setMessage(eventText);
      setStatChanges(eventEffect);

      // Apply event effects
      setStats(prev => {
        const newStats = { ...prev };

        if (eventEffect.hope) newStats.hope += eventEffect.hope;
        if (eventEffect.sanity) newStats.sanity += eventEffect.sanity;
        if (eventEffect.health) newStats.health += eventEffect.health;
        if (eventEffect.financial) newStats.financial += eventEffect.financial;

        // Clamp values with 100 point ceiling
        (Object.keys(newStats) as (keyof Stats)[]).forEach(key => {
          newStats[key] = Math.max(0, Math.min(100, newStats[key]));
        });

        // Check death conditions
        let died = false;
        let deathReason = "";

        if (newStats.health <= 0) { died = true; deathReason = "HEART STOPPED"; }
        else if (newStats.sanity <= 0) { died = true; deathReason = "MIND FRACTURED"; }
        else if (newStats.hope <= 0) { died = true; deathReason = "LOST ALL HOPE"; }
        else if (newStats.financial <= 0) { died = true; deathReason = "BANKRUPT"; }

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
    if (statChanges.financial) parts.push(`${statChanges.financial > 0 ? "+" : ""}${statChanges.financial} Financial`);
    
    return parts.join(" | ");
  };

  return (
    <div className="min-h-screen bg-black text-foreground font-mono p-4 flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* CRT Effects */}
      <div className="crt-overlay absolute inset-0 z-50 pointer-events-none opacity-20" />
      <div className="scanline absolute inset-0 z-50 pointer-events-none opacity-10" />

      <div className="max-w-md w-full z-10 space-y-8 border-4 border-muted p-6 bg-black/80 shadow-[0_0_50px_rgba(102,102,102,0.1)]">
        
        {/* INTRO SCREEN */}
        {gameState === "INTRO" && (
          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
            <div className="w-full border-4 border-foreground bg-black p-4 relative overflow-hidden min-h-[150px] flex items-center justify-center">
              <div className="scrolling-text text-foreground font-vt text-sm leading-relaxed text-center whitespace-normal">
                WARNING
                <br /><br />
                THIS PROGRAM MAY CAUSE
                <br />
                EXISTENTIAL
                <br />
                EXPERIENCES
                <br /><br />
                PROCEED AT YOUR OWN RISK
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        {gameState !== "INTRO" && (
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter animate-pulse">LIFE.EXE</h1>
            {gameState === "PLAYING" && (
              <div className="text-sm text-green-700">
                ROUND {turn}/{MAX_TURNS}
              </div>
            )}
          </div>
        )}

        {/* Status Display */}
        <div className="grid grid-cols-2 gap-4">
          <StatDisplay icon={Sparkles} label="HOPE" value={stats.hope} />
          <StatDisplay icon={Brain} label="SANITY" value={stats.sanity} />
          <StatDisplay icon={Heart} label="HEALTH" value={stats.health} />
          <StatDisplay icon={DollarSign} label="FINANCIAL" value={stats.financial} />
        </div>

        {/* Main Interaction Area */}
        <div className="min-h-[280px] flex flex-col items-center justify-center space-y-4 text-center border-t-2 border-b-2 border-muted py-6">
          {gameState === "START" && (
            <>
              <p className="text-xl">BEGIN SIMULATION?</p>
              <p className="text-sm text-muted-foreground">Survive 10 rounds with 5 clicks per round.</p>
              <Button 
                onClick={startGame}
                className="bg-primary text-black hover:bg-primary/90 font-bold px-8 py-6 text-xl rounded-none animate-bounce"
              >
                START LIFE.EXE
              </Button>
            </>
          )}

          {gameState === "PLAYING" && (
            <>
              <p className="text-lg min-h-[4rem]">{message}</p>
              
              {statChanges && (
                <div className="w-full p-2 bg-muted border border-muted text-xs">
                  {formatStatChange()}
                </div>
              )}

              <div className="w-full max-w-[200px] space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>CLICKS THIS ROUND</span>
                  <span>{clicks}/{CLICKS_PER_TURN}</span>
                </div>
                <Progress value={(clicks / CLICKS_PER_TURN) * 100} className="h-2 bg-muted" indicatorClassName="bg-foreground" />
              </div>
              
              <Button 
                onClick={handleSurviveClick}
                disabled={buttonDisabled}
                className="w-full py-8 text-xl bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-black rounded-none transition-all active:scale-95 disabled:opacity-50"
              >
                CLICK TO SURVIVE
              </Button>
            </>
          )}

          {gameState === "GAME_OVER" && (
            <div className="space-y-4">
              <Skull className="w-16 h-16 mx-auto text-red-500 animate-pulse" />
              <div className="text-red-500 font-bold text-2xl">SIMULATION FAILED</div>
              <p className="text-muted-foreground">{message}</p>
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
              <p className="text-muted-foreground">{message}</p>
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
              <p className="text-muted-foreground">{message}</p>
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
        <div className="text-center text-xs text-muted-foreground/60">
          © 2025 LIFE SIMULATION CORP
        </div>
      </div>
    </div>
  );
}

function StatDisplay({ icon: Icon, label, value }: { icon: any, label: string, value: number }) {
  return (
    <div className="flex items-center gap-2 p-2 border border-muted bg-muted/20">
      <Icon className="w-4 h-4" />
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-xs">
          <span>{label}</span>
          <span>{value}</span>
        </div>
        <Progress value={value} className="h-1.5 bg-muted" indicatorClassName={value < 20 ? "bg-red-500" : "bg-foreground"} />
      </div>
    </div>
  );
}
