
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, parse, isValid } from "date-fns";
import { Wallet, PiggyBank } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { BudgetForm } from "./budget/BudgetForm";

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

  const parseManualDate = (dateString: string): Date | undefined => {
    const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
    return isValid(parsedDate) ? parsedDate : undefined;
  };

  const handleStartDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setStartDate(newDate);
      setStartDateInput(format(newDate, 'dd/MM/yyyy'));
      setStartCalendarOpen(false);
    }
  };

  const handleEndDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setEndDate(newDate);
      setEndDateInput(format(newDate, 'dd/MM/yyyy'));
      setEndCalendarOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    console.log('Current user:', user.id);

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
      console.log('Inserting budget with data:', {
        amount: parseFloat(amount),
        start_date: startDateParsed.toISOString(),
        end_date: endDateParsed.toISOString(),
        user_id: user.id
      });

      const { data, error } = await supabase.from("budgets").insert({
        amount: parseFloat(amount),
        start_date: startDateParsed.toISOString(),
        end_date: endDateParsed.toISOString(),
        user_id: user.id
      }).select();

      if (error) {
        console.error('Error inserting budget:', error);
        toast({
          title: "💥 Submission Error",
          description: `Failed to set budget: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Budget inserted successfully:', data);
      toast({
        title: "🎉 Budget Set Successfully!",
        description: `Budget of ₹${amount} from ${startDateInput} to ${endDateInput}`,
      });

      setOpen(false);
      setAmount("");
      setStartDate(new Date());
      setEndDate(new Date());
    } catch (error) {
      console.error('Unexpected error:', error);
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
        <BudgetForm
          amount={amount}
          setAmount={setAmount}
          startDate={startDate}
          endDate={endDate}
          startDateInput={startDateInput}
          endDateInput={endDateInput}
          startCalendarOpen={startCalendarOpen}
          endCalendarOpen={endCalendarOpen}
          setStartCalendarOpen={setStartCalendarOpen}
          setEndCalendarOpen={setEndCalendarOpen}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onStartDateInputChange={setStartDateInput}
          onEndDateInputChange={setEndDateInput}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
