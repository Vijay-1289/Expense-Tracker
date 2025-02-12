
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";

export function SetBudgetDialog() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to set a budget",
        variant: "destructive",
      });
      return;
    }

    if (!amount || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Error",
        description: "Start date cannot be after end date",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Setting budget:', {
        amount,
        start_date: startDate,
        end_date: endDate,
        user_id: user.id
      });

      const { error } = await supabase.from("budgets").insert({
        amount: parseFloat(amount),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        user_id: user.id
      });

      if (error) {
        console.error('Error setting budget:', error);
        toast({
          title: "Error",
          description: "Failed to set budget: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Budget set successfully",
      });

      setOpen(false);
      setAmount("");
      setStartDate(new Date());
      setEndDate(new Date());
    } catch (error) {
      console.error('Unexpected error setting budget:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Set Budget
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Monthly Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(newDate) => {
                    setStartDate(newDate || new Date());
                    setStartCalendarOpen(false);
                  }}
                  initialFocus
                  fromDate={new Date(2023, 0, 1)}
                  toDate={new Date(2025, 11, 31)}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(newDate) => {
                    setEndDate(newDate || new Date());
                    setEndCalendarOpen(false);
                  }}
                  initialFocus
                  fromDate={startDate || new Date()}
                  toDate={new Date(2025, 11, 31)}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button type="submit" className="w-full">
            Set Budget
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
