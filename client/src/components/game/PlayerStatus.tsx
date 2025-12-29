import { Player } from "@/lib/gameData";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Heart, DollarSign, Brain, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerStatusProps {
  player: Player;
  isActive: boolean;
}

const colorMap: Record<string, { border: string, ring: string, bg: string, text: string }> = {
  "text-primary": { border: "border-primary", ring: "ring-primary", bg: "bg-primary", text: "text-primary" },
  "text-secondary": { border: "border-secondary", ring: "ring-secondary", bg: "bg-secondary", text: "text-secondary" },
  "text-accent": { border: "border-accent", ring: "ring-accent", bg: "bg-accent", text: "text-accent" },
  "text-destructive": { border: "border-destructive", ring: "ring-destructive", bg: "bg-destructive", text: "text-destructive" },
};

export function PlayerStatus({ player, isActive }: PlayerStatusProps) {
  const colors = colorMap[player.color] || colorMap["text-primary"];

  return (
    <Card 
      className={cn(
        "p-4 border-2 transition-all duration-300 relative overflow-hidden bg-black",
        isActive 
          ? cn(colors.border, "ring-2 ring-offset-2 ring-offset-black", colors.ring) 
          : "border-muted opacity-80"
      )}
    >
      {isActive && (
        <div className={cn("absolute inset-0 opacity-10 pointer-events-none animate-pulse", colors.bg)} />
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h3 className={cn("text-xl font-press", player.color)}>{player.name}</h3>
        {player.isDead && <span className="text-destructive font-press text-xs">DECEASED</span>}
      </div>

      <div className="space-y-3 font-vt text-lg">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-destructive" />
          <Progress 
            value={player.stats.health} 
            className="h-3 bg-muted" 
            indicatorClassName={player.stats.health < 30 ? "bg-destructive" : "bg-primary"} 
          />
          <span className="w-8 text-right">{player.stats.health}</span>
        </div>

        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-secondary" />
          <Progress 
            value={player.stats.sanity} 
            className="h-3 bg-muted" 
            indicatorClassName="bg-secondary" 
          />
          <span className="w-8 text-right">{player.stats.sanity}</span>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-accent" />
          <div className="flex-1 text-accent tracking-widest text-right">
             ${player.stats.money}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-muted pt-2 mt-2">
          <Hourglass className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Age: {player.stats.age}</span>
        </div>
      </div>
    </Card>
  );
}
