import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PaymentModal({ open, onOpenChange, onSuccess }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      
      // Close after showing success for a moment
      setTimeout(() => {
        onSuccess();
        setIsSuccess(false);
        onOpenChange(false);
      }, 1500);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-black border-foreground text-foreground font-mono">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="w-6 h-6" />
            ADD FINANCIAL ASSETS
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-mono">
            Inject capital into your life simulation.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <p className="text-xl font-bold text-green-500">TRANSACTION COMPLETE</p>
            <p className="text-sm text-muted-foreground">Assets transferred successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                <Input 
                  id="amount" 
                  value="50.00" 
                  disabled 
                  className="pl-7 bg-muted/20 border-muted font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card">Card Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="card" 
                  placeholder="0000 0000 0000 0000" 
                  className="pl-9 bg-muted/20 border-muted font-mono"
                  required
                  pattern="[0-9\s]{13,19}"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input 
                  id="expiry" 
                  placeholder="MM/YY" 
                  className="bg-muted/20 border-muted font-mono"
                  required
                  pattern="\d\d/\d\d"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="cvc" 
                    placeholder="123" 
                    className="pl-9 bg-muted/20 border-muted font-mono"
                    required
                    pattern="\d{3,4}"
                    type="password"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button 
                type="submit" 
                className="w-full bg-foreground text-black hover:bg-foreground/90 font-bold rounded-none"
                disabled={isLoading}
              >
                {isLoading ? "PROCESSING..." : "CONFIRM PAYMENT"}
              </Button>
            </DialogFooter>
            
            <div className="text-center">
               <p className="text-[10px] text-muted-foreground/60 mt-2">
                 SECURE MOCK PAYMENT • NO REAL MONEY CHARGED
               </p>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
