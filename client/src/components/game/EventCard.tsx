import { GameEvent, Choice, Player } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface EventCardProps {
  event: GameEvent | null;
  onChoice: (choice: Choice) => void;
  currentPlayer: Player;
}

export function EventCard({ event, onChoice, currentPlayer }: EventCardProps) {
  if (!event) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <Card className="w-full max-w-2xl border-4 border-primary bg-black shadow-retro">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-3xl font-press text-primary animate-pulse uppercase tracking-widest">
              {event.title}
            </CardTitle>
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <CardDescription className="font-vt text-2xl text-foreground">
              {event.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            {event.choices.map((choice, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="h-auto py-6 flex flex-col items-start gap-2 border-2 hover:bg-primary hover:text-black group transition-all"
                onClick={() => onChoice(choice)}
              >
                <span className="font-press text-lg uppercase text-left w-full group-hover:translate-x-2 transition-transform">
                  {">"} {choice.text}
                </span>
                <span className="font-vt text-xl opacity-70 group-hover:opacity-100">
                  {choice.description}
                </span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
