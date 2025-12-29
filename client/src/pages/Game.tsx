import { useState, useEffect } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import { PlayerStatus } from "@/components/game/PlayerStatus";
import { EventCard } from "@/components/game/EventCard";
import { INITIAL_PLAYERS, EVENTS, Player, GameEvent, Choice } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dice5, RotateCcw } from "lucide-react";

export default function Game() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [currentTurn, setCurrentTurn] = useState(0); // Player ID index
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const { toast } = useToast();

  const activePlayer = players[currentTurn];

  const handleStartGame = () => {
    setGameStarted(true);
    toast({
      title: "SYSTEM INITIALIZED",
      description: "Welcome to existence. It only gets worse from here.",
      className: "font-vt border-primary text-primary bg-black",
    });
  };

  const nextTurn = () => {
    let nextIndex = (currentTurn + 1) % players.length;
    // Skip dead players
    let attempts = 0;
    while (players[nextIndex].isDead && attempts < players.length) {
      nextIndex = (nextIndex + 1) % players.length;
      attempts++;
    }
    
    if (attempts >= players.length) {
      // Game Over everyone is dead
      toast({
        title: "EXTINCTION EVENT",
        description: "Humanity has failed. Refresh to try again.",
        variant: "destructive"
      });
      return;
    }

    setCurrentTurn(nextIndex);
  };

  const handleSpin = () => {
    // 1. Move player
    const moves = Math.floor(Math.random() * 6) + 1;
    
    // Animate movement (simplified by just updating state for now)
    const newPos = activePlayer.position + moves;
    
    setPlayers(prev => prev.map(p => 
      p.id === activePlayer.id 
        ? { ...p, position: newPos, stats: { ...p.stats, age: p.stats.age + 2 } } 
        : p
    ));

    // 2. Trigger Event
    // Random event for now
    const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    setTimeout(() => {
      setActiveEvent(randomEvent);
    }, 1000);
  };

  const handleChoice = (choice: Choice) => {
    const changes = choice.effect(activePlayer);
    
    setPlayers(prev => prev.map(p => {
      if (p.id !== activePlayer.id) return p;
      
      const newStats = {
        ...p.stats,
        money: p.stats.money + (changes.money || 0),
        health: p.stats.health + (changes.health || 0),
        sanity: p.stats.sanity + (changes.sanity || 0),
      };

      // Check death conditions
      const isDead = newStats.health <= 0 || newStats.sanity <= 0;

      return {
        ...p,
        stats: newStats,
        isDead
      };
    }));

    toast({
      title: "CONSEQUENCE",
      description: choice.description,
      className: "font-vt border-muted text-foreground bg-black"
    });

    setActiveEvent(null);
    nextTurn();
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="crt-overlay absolute inset-0 z-50 pointer-events-none" />
        <div className="scanline" />
        
        <div className="max-w-2xl text-center space-y-8 z-10">
          <h1 className="text-4xl md:text-6xl text-primary font-press animate-pulse mb-8 leading-relaxed">
            THE GRIM TURNSTILE
          </h1>
          <p className="text-xl md:text-2xl font-vt text-muted-foreground max-w-lg mx-auto">
            A 4-player journey through the crushing weight of modern existence. 
            Survival is optional. Debt is mandatory.
          </p>
          
          <Button 
            onClick={handleStartGame}
            className="text-2xl px-12 py-8 bg-transparent border-4 border-primary text-primary hover:bg-primary hover:text-black transition-all font-press"
          >
            INSERT COIN
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-foreground font-vt p-4 md:p-8 relative overflow-hidden flex flex-col">
      <div className="crt-overlay absolute inset-0 z-50 pointer-events-none" />
      <div className="scanline" />

      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b-2 border-muted pb-4 z-10">
        <h1 className="text-2xl font-press text-primary">GRIM TURNSTILE</h1>
        <div className="text-xl">TURN: <span className={activePlayer.color}>{activePlayer.name}</span></div>
      </header>

      {/* Main Game Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
        
        {/* Left Players */}
        <div className="lg:col-span-3 space-y-4">
          <PlayerStatus player={players[0]} isActive={players[0].id === activePlayer.id} />
          <PlayerStatus player={players[1]} isActive={players[1].id === activePlayer.id} />
        </div>

        {/* Center Board */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[500px]">
          <GameBoard players={players} activePlayerId={activePlayer.id} />
          
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-12">
            <Button 
              onClick={handleSpin} 
              disabled={!!activeEvent}
              className="w-32 h-32 rounded-full border-4 border-primary bg-black hover:bg-primary/20 hover:scale-105 transition-all shadow-retro flex flex-col items-center justify-center gap-2"
            >
              <Dice5 className="w-12 h-12" />
              <span className="font-press text-sm">SPIN</span>
            </Button>
          </div>
        </div>

        {/* Right Players */}
        <div className="lg:col-span-3 space-y-4">
          <PlayerStatus player={players[2]} isActive={players[2].id === activePlayer.id} />
          <PlayerStatus player={players[3]} isActive={players[3].id === activePlayer.id} />
        </div>
      </div>

      <EventCard 
        event={activeEvent} 
        currentPlayer={activePlayer} 
        onChoice={handleChoice} 
      />
    </div>
  );
}
