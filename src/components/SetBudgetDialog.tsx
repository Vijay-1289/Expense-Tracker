
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";

export function SetBudgetDialog() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({ title: "Error", description: "Enter a valid budget amount.", variant: "destructive" });
      return;
    }

    if (startDate > endDate) {
      toast({ title: "Error", description: "Start date cannot be after end date.", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("budgets").insert({
        amount: parseFloat(amount),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        user_id: user.id,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Budget set successfully." });
      setOpen(false);
      setAmount("");
      setStartDate(new Date());
      setEndDate(new Date());
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Wallet className="w-4 h-4" /> Set Budget
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
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" type="button">
                  <CalendarIcon className="mr-2 h-4 w-4" /> {format(startDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar 
                  mode="single" 
                  selected={startDate} 
                  onSelect={(date) => date && setStartDate(date)}
                  fromDate={new Date(2023, 0, 1)} 
                  toDate={new Date(2025, 11, 31)} 
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" type="button">
                  <CalendarIcon className="mr-2 h-4 w-4" /> {format(endDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar 
                  mode="single" 
                  selected={endDate} 
                  onSelect={(date) => date && setEndDate(date)}
                  fromDate={startDate} 
                  toDate={new Date(2025, 11, 31)} 
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button type="submit" className="w-full">Set Budget</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
