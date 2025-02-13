
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { parse, format, isValid } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Wallet, TrendingUp, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";

export function SetBudgetDialog() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [startDateInput, setStartDateInput] = useState(format(new Date(), 'dd/MM/yyyy'));
  const [endDateInput, setEndDateInput] = useState(format(new Date(), 'dd/MM/yyyy'));
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Validate and parse manual date input
  const parseManualDate = (dateString: string): Date | undefined => {
    const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
    return isValid(parsedDate) ? parsedDate : undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate manual date inputs
    const startDateParsed = parseManualDate(startDateInput);
    const endDateParsed = parseManualDate(endDateInput);

    if (!user) {
      toast({
        title: "💸 Error",
        description: "You must be logged in to set a budget",
        variant: "destructive",
      });
      return;
    }

    if (!amount || !startDateParsed || !endDateParsed) {
      toast({
        title: "💡 Incomplete Information",
        description: "Please fill in all fields correctly",
        variant: "destructive",
      });
      return;
    }

    if (startDateParsed > endDateParsed) {
      toast({
        title: "⏰ Date Error",
        description: "Start date cannot be after end date",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("budgets").insert({
        amount: parseFloat(amount),
        start_date: startDateParsed.toISOString(),
        end_date: endDateParsed.toISOString(),
        user_id: user.id
      });

      if (error) {
        toast({
          title: "💥 Submission Error",
          description: `Failed to set budget: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "🎉 Budget Set Successfully!",
        description: `Budget of ₹${amount} from ${startDateInput} to ${endDateInput}`,
      });

      setOpen(false);
      setAmount("");
      setStartDate(startDateParsed);
      setEndDate(endDateParsed);
    } catch (error) {
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
        <Button 
          variant="outline" 
          className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100"
        >
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
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" /> Budget Amount (₹)
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="border-purple-200 focus:ring-purple-300 transition-all duration-300 hover:shadow-md"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-purple-500" /> Start Date
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="flex-grow border-purple-200 focus:ring-purple-300"
              />
              <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className="hover:scale-110 transition-transform"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setStartCalendarOpen((prev) => !prev);
                    }}
                  >
                    <CalendarIcon className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(newDate) => {
                      if (newDate) {
                        setStartDate(newDate);
                        setStartDateInput(format(newDate, 'dd/MM/yyyy'));
                        setStartCalendarOpen(false);
                      }
                    }}
                    initialFocus
                    fromDate={new Date(2023, 0, 1)}
                    toDate={new Date(2025, 11, 31)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-pink-500" /> End Date
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="flex-grow border-pink-200 focus:ring-pink-300"
              />
              <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className="hover:scale-110 transition-transform"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setEndCalendarOpen((prev) => !prev);
                    }}
                  >
                    <CalendarIcon className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(newDate) => {
                      if (newDate) {
                        setEndDate(newDate);
                        setEndDateInput(format(newDate, 'dd/MM/yyyy'));
                        setEndCalendarOpen(false);
                      }
                    }}
                    initialFocus
                    fromDate={startDate || new Date()}
                    toDate={new Date(2025, 11, 31)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
          >
            Set Budget 🚀
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
