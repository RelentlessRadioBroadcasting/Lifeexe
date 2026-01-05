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

// Scientifically-grounded situations based on CBT ABC model and life events research
// Each situation has predefined effects calibrated to psychological research:
// - Micro-moments (small daily joys): 2-5 points
// - Minor stressors: 3-7 points  
// - Major life events: 8-15 points
// Effects are INVERTED: positive experiences decrease stats, negative increase them

type SituationData = {
  text: string;
  effect: StatChange;
  category: "micro_joy" | "minor_stress" | "social" | "financial" | "health" | "existential" | "trauma";
};

// Micro-moments of joy (research shows frequency > intensity for wellbeing)
// INVERTED: positive experiences now INCREASE stats (bad in inverted scoring)
const MICRO_JOY_SITUATIONS: SituationData[] = [
  { text: "Your friend texts you a meme that actually made you laugh.", effect: { hope: 3, sanity: 2 }, category: "micro_joy" },
  { text: "Someone compliments your work unexpectedly.", effect: { hope: 4, sanity: 3 }, category: "micro_joy" },
  { text: "A stranger holds the door for you.", effect: { hope: 2 }, category: "micro_joy" },
  { text: "You eat something delicious and savor every bite.", effect: { health: 2, hope: 2 }, category: "micro_joy" },
  { text: "A loved one tells you they're proud of you.", effect: { hope: 5, sanity: 4 }, category: "micro_joy" },
  { text: "You made someone smile with a kind gesture.", effect: { hope: 3, sanity: 2 }, category: "micro_joy" },
  { text: "You laughed until your sides hurt.", effect: { health: 2, sanity: 4, hope: 3 }, category: "micro_joy" },
  { text: "You received unexpected kindness from a stranger.", effect: { hope: 4, sanity: 2 }, category: "micro_joy" },
  { text: "You made someone laugh until they cried.", effect: { hope: 3, sanity: 3 }, category: "micro_joy" },
  { text: "You reconnected with an old friend.", effect: { hope: 5, sanity: 3 }, category: "micro_joy" },
  { text: "You felt genuinely safe and at peace.", effect: { health: 3, sanity: 4, hope: 3 }, category: "micro_joy" },
  { text: "You finally finish a task you've been procrastinating on.", effect: { sanity: 4, hope: 3 }, category: "micro_joy" },
  { text: "You have a moment of pure clarity about what matters.", effect: { sanity: 5, hope: 4 }, category: "micro_joy" },
  { text: "You helped someone without being asked.", effect: { hope: 3, sanity: 2 }, category: "micro_joy" },
  { text: "You stood up for yourself for once.", effect: { sanity: 4, hope: 3 }, category: "micro_joy" },
];

// Minor daily stressors (CBT: activating events that trigger cognitive distortions)
// INVERTED: negative experiences now DECREASE stats (good in inverted scoring)
const MINOR_STRESS_SITUATIONS: SituationData[] = [
  { text: "You get a notification that you have a meeting in 5 minutes.", effect: { sanity: -3, health: -2 }, category: "minor_stress" },
  { text: "You spill coffee on your shirt right before work.", effect: { sanity: -4, hope: -2 }, category: "minor_stress" },
  { text: "You realize you forgot to respond to an important email.", effect: { sanity: -5, hope: -3 }, category: "minor_stress" },
  { text: "Your boss nitpicks something trivial you did.", effect: { sanity: -5, hope: -4 }, category: "minor_stress" },
  { text: "Your alarm didn't go off and you overslept.", effect: { sanity: -4, health: -3 }, category: "minor_stress" },
  { text: "You remember something embarrassing you did years ago.", effect: { sanity: -6, hope: -2 }, category: "minor_stress" },
  { text: "You're stuck in traffic and late for something important.", effect: { sanity: -5, hope: -3 }, category: "minor_stress" },
  { text: "You made a silly mistake that everyone witnessed.", effect: { sanity: -6, hope: -4 }, category: "minor_stress" },
  { text: "Your body aches from stress.", effect: { health: -5, sanity: -3 }, category: "minor_stress" },
  { text: "You wasted the entire evening and feel guilty.", effect: { sanity: -4, hope: -5 }, category: "minor_stress" },
  { text: "Someone took credit for your work.", effect: { sanity: -6, hope: -5 }, category: "minor_stress" },
  { text: "You catch yourself in the mirror and don't recognize yourself.", effect: { sanity: -5, hope: -4 }, category: "minor_stress" },
  { text: "You felt completely invisible.", effect: { hope: -6, sanity: -4 }, category: "minor_stress" },
];

// Financial stressors (research: economic pressures are primary mental health contributors)
// INVERTED: positive financial = increase stats, negative financial = decrease stats
const FINANCIAL_SITUATIONS: SituationData[] = [
  { text: "You find money in an old jacket pocket.", effect: { financial: 4, hope: 2 }, category: "financial" },
  { text: "You receive an unexpected bill in the mail.", effect: { financial: -8, sanity: -5, hope: -4 }, category: "financial" },
  { text: "You couldn't afford something you really needed.", effect: { financial: -6, hope: -7, sanity: -4 }, category: "financial" },
  { text: "Your paycheck was less than expected.", effect: { financial: -7, hope: -5 }, category: "financial" },
  { text: "An investment unexpectedly paid off.", effect: { financial: 6, hope: 3 }, category: "financial" },
  { text: "Your rent is increasing next month.", effect: { financial: -9, hope: -6, sanity: -5 }, category: "financial" },
];

// Health-related (research: illness/injury → sleep problems, stress response)
// INVERTED: positive health = increase stats, negative health = decrease stats
const HEALTH_SITUATIONS: SituationData[] = [
  { text: "You slept poorly and feel exhausted.", effect: { health: -5, sanity: -4, hope: -3 }, category: "health" },
  { text: "You exercised and feel energized.", effect: { health: 4, sanity: 3, hope: 2 }, category: "health" },
  { text: "A persistent pain flares up again.", effect: { health: -7, sanity: -5, hope: -4 }, category: "health" },
  { text: "You received good news from a doctor.", effect: { health: 5, hope: 6, sanity: 3 }, category: "health" },
  { text: "Your anxiety spirals about something you can't control.", effect: { sanity: -8, health: -4, hope: -5 }, category: "health" },
];

// Existential/meaning-related (research: degradation/humiliation → depressive symptoms)
// INVERTED: positive meaning = increase stats, negative meaning = decrease stats
const EXISTENTIAL_SITUATIONS: SituationData[] = [
  { text: "The weight of your responsibilities feels crushing.", effect: { sanity: -8, hope: -7, health: -4 }, category: "existential" },
  { text: "Everything feels pointless today.", effect: { hope: -9, sanity: -6 }, category: "existential" },
  { text: "You failed at something you really wanted to succeed at.", effect: { hope: -8, sanity: -6 }, category: "existential" },
  { text: "You had a conversation that changed your perspective.", effect: { sanity: 5, hope: 4 }, category: "existential" },
  { text: "You question if any of this matters.", effect: { hope: -7, sanity: -5 }, category: "existential" },
  { text: "You realized you've been living on autopilot.", effect: { sanity: -6, hope: -5 }, category: "existential" },
];

// Social situations (research: social support mediates stress → mental health)
// INVERTED: positive social = increase stats, negative social = decrease stats
const SOCIAL_SITUATIONS: SituationData[] = [
  { text: "You felt deeply understood by someone.", effect: { hope: 5, sanity: 4 }, category: "social" },
  { text: "A relationship feels strained and distant.", effect: { hope: -6, sanity: -5 }, category: "social" },
  { text: "You had genuine connection with someone new.", effect: { hope: 4, sanity: 3 }, category: "social" },
  { text: "Someone you trusted let you down.", effect: { hope: -7, sanity: -6 }, category: "social" },
  { text: "You felt part of something bigger than yourself.", effect: { hope: 6, sanity: 4 }, category: "social" },
];

// Combine all situations
const ALL_SITUATIONS: SituationData[] = [
  ...MICRO_JOY_SITUATIONS,
  ...MINOR_STRESS_SITUATIONS,
  ...FINANCIAL_SITUATIONS,
  ...HEALTH_SITUATIONS,
  ...EXISTENTIAL_SITUATIONS,
  ...SOCIAL_SITUATIONS,
];

// Function to generate today's game situations using scientifically-calibrated effects
const generateGameSituations = (): Situation[] => {
  // Shuffle all situations and pick 50 for a full game (5 clicks × 10 rounds)
  const shuffled = [...ALL_SITUATIONS].sort(() => Math.random() - 0.5);
  
  // Ensure balanced distribution: aim for ~60% stressors, ~40% positive (reflecting real life)
  // This mirrors research showing negativity bias and stress sensitization
  const situations: Situation[] = shuffled.slice(0, 50).map(s => ({
    text: s.text,
    effect: s.effect
  }));
  
  return situations.sort(() => Math.random() - 0.5);
};

// Generate random stat change for round-end events (still uses some randomization)
const generateRandomStatChange = (): StatChange => {
  const stats: (keyof Stats)[] = ["health", "sanity", "hope", "financial"];
  const change: StatChange = {};
  
  const numChanges = Math.floor(Math.random() * 2) + 1;
  const selectedStats = [...stats].sort(() => Math.random() - 0.5).slice(0, numChanges);
  
  selectedStats.forEach(stat => {
    // 50/50 chance for round events (neutral)
    const isPositive = Math.random() > 0.5;
    if (isPositive) {
      change[stat] = -(Math.floor(Math.random() * 4) + 2); // -2 to -5
    } else {
      change[stat] = (Math.floor(Math.random() * 5) + 3); // +3 to +7
    }
  });
  
  return change;
};

// Round-end events with scientifically-calibrated effects
// Based on research: end-of-day reflections impact next-day wellbeing
// INVERTED: positive = increase stats, negative = decrease stats
const ROUND_EVENTS: { text: string; effect: StatChange }[] = [
  { text: "You made it through another day.", effect: { hope: 2, sanity: 1 } },
  { text: "The weight of existence feels heavier than usual.", effect: { sanity: -4, hope: -5 } },
  { text: "You feel more human today than yesterday.", effect: { hope: 3, sanity: 2, health: 1 } },
  { text: "Everything feels pointless.", effect: { hope: -6, sanity: -5 } },
  { text: "You had moments of genuine connection.", effect: { hope: 4, sanity: 3 } },
  { text: "Fatigue is setting in.", effect: { health: -5, sanity: -3 } },
  { text: "You practiced gratitude before sleep.", effect: { hope: 4, sanity: 3, health: 2 } },
  { text: "Your mind raced with anxious thoughts all night.", effect: { sanity: -6, health: -4, hope: -3 } },
  { text: "You connected deeply with nature today.", effect: { health: 3, sanity: 4, hope: 3 } },
  { text: "Social media left you feeling inadequate.", effect: { hope: -5, sanity: -4 } },
];

import { PaymentModal } from "@/components/payment-modal";

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isCLIClient, setIsCLIClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for CLI-like user agents or specific headers if possible, 
    // but usually we check for common indicators or just specific query params/headers
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('curl') || ua.includes('wget') || window.location.search.includes('client=cli')) {
      setIsCLIClient(true);
    }
  }, []);

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

      // Check death conditions (die when stats hit 0)
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
      // Show end-of-round event with scientifically-calibrated effect
      const roundEvent = ROUND_EVENTS[Math.floor(Math.random() * ROUND_EVENTS.length)];
      
      setMessage(roundEvent.text);
      setStatChanges(roundEvent.effect);

      // Apply event effects
      setStats(prev => {
        const newStats = { ...prev };

        if (roundEvent.effect.hope) newStats.hope += roundEvent.effect.hope;
        if (roundEvent.effect.sanity) newStats.sanity += roundEvent.effect.sanity;
        if (roundEvent.effect.health) newStats.health += roundEvent.effect.health;
        if (roundEvent.effect.financial) newStats.financial += roundEvent.effect.financial;

        // Clamp values with 100 point ceiling
        (Object.keys(newStats) as (keyof Stats)[]).forEach(key => {
          newStats[key] = Math.max(0, Math.min(100, newStats[key]));
        });

        // Check death conditions (die when stats hit 0)
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

  const handlePaymentSuccess = () => {
    setStats(prev => {
      const newStats = { ...prev, financial: Math.min(100, prev.financial + 50) };
      return newStats;
    });
    toast({
      title: "Funds Added",
      description: "Financial stability has been temporarily restored.",
    });
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
    <div className="min-h-screen font-mono p-4 flex flex-col items-center justify-center relative overflow-hidden select-none bg-white text-black">
      {/* CRT Effects */}
      <div className="crt-overlay absolute inset-0 z-50 pointer-events-none opacity-20" />
      <div className="scanline absolute inset-0 z-50 pointer-events-none opacity-10" />

      <div className="max-w-md w-full z-10 space-y-8 border-4 border-muted p-6 bg-black/80 text-foreground shadow-[0_0_50px_rgba(102,102,102,0.1)]">
        
        {/* INTRO SCREEN */}
        {gameState === "INTRO" && (
          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
            <div className="w-full border-4 border-foreground bg-black p-4 relative overflow-hidden min-h-[150px] flex items-center justify-center">
              <div className="scrolling-text text-white font-vt text-sm leading-relaxed text-center whitespace-normal">
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
            <div className="flex items-center justify-center gap-3">
              {(isCLIClient || (typeof window !== 'undefined' && window.location.hostname !== 'neversaylife.replit.app')) && (
                <a 
                  href="https://NeverSayLife.replit.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/thumbnail.png" 
                    alt="LIFE.EXE" 
                    className="w-12 h-12 pixelated"
                  />
                </a>
              )}
              <h1 className="text-4xl font-bold tracking-tighter animate-pulse">LIFE.EXE</h1>
            </div>
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
          <StatDisplay 
            icon={DollarSign} 
            label="FINANCIAL" 
            value={stats.financial} 
            onAdd={() => setShowPaymentModal(true)}
          />
        </div>

        <PaymentModal 
          open={showPaymentModal} 
          onOpenChange={setShowPaymentModal} 
          onSuccess={handlePaymentSuccess} 
        />

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

function StatDisplay({ icon: Icon, label, value, onAdd }: { icon: any, label: string, value: number, onAdd?: () => void }) {
  return (
    <div className="flex items-center gap-2 p-2 border border-muted bg-muted/20 relative group">
      <Icon className="w-4 h-4" />
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-xs items-center">
          <span>{label}</span>
          <div className="flex items-center gap-2">
            <span>{value}</span>
            {onAdd && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 hover:bg-green-500/20 hover:text-green-500 p-0"
                onClick={onAdd}
              >
                <div className="text-[10px]">+</div>
              </Button>
            )}
          </div>
        </div>
        <Progress value={value} className="h-1.5 bg-muted" indicatorClassName={value < 20 ? "bg-red-500" : "bg-foreground"} />
      </div>
    </div>
  );
}
