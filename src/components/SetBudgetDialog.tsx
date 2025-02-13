
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, parse, isValid } from "date-fns";
import { Wallet, PiggyBank, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function SetBudgetDialog() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Function to parse manual input dates safely
  const parseManualDate = (dateString: string): Date | undefined => {
    const parsedDate = parse(dateString, "dd/MM/yyyy", new Date());
    return isValid(parsedDate) ? parsedDate : undefined;
  };

  // Function to handle start date selection
  const handleStartDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setStartDate(newDate);
      setStartCalendarOpen(false);
    }
  };

  // Function to handle end date selection
  const handleEndDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setEndDate(newDate);
      setEndCalendarOpen(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "💸 Error",
        description: "You must be logged in to set a budget",
        variant: "destructive",
      });
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "🚨 Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "📅 Missing Dates",
        description: "Please select valid start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "⏰ Date Error",
        description: "Start date cannot be after end date",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Inserting budget with data:", {
        amount: parseFloat(amount),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        user_id: user.id,
      });

      const { data, error } = await supabase.from("budgets").insert([
        {
          amount: parseFloat(amount),
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          user_id: user.id,
        }
      ]).select();

      if (error) {
        console.error("Error inserting budget:", error);
        toast({
          title: "💥 Submission Error",
          description: `Failed to set budget: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log("Budget inserted successfully:", data);
      toast({
        title: "🎉 Budget Set Successfully!",
        description: `Budget of ₹${amount} from ${format(startDate, "dd/MM/yyyy")} to ${format(endDate, "dd/MM/yyyy")}`,
      });

      setOpen(false);
      setAmount("");
      setStartDate(new Date());
      setEndDate(new Date());
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "🚨 Unexpected Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100">
          <Wallet className="w-4 h-4 animate-pulse text-purple-500" />
          Set Budget 💰
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-purple-50 to-pink-50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            <PiggyBank className="w-6 h-6 animate-bounce" /> Set Monthly Budget
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="amount">Budget Amount (₹)</label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" />
          </div>
          
          <div className="space-y-2">
            <label>Start Date</label>
            <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal" type="button">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} initialFocus fromDate={new Date(2023, 0, 1)} toDate={new Date(2025, 11, 31)} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label>End Date</label>
            <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal" type="button">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={endDate} onSelect={handleEndDateChange} initialFocus fromDate={startDate || new Date()} toDate={new Date(2025, 11, 31)} />
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
