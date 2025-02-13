
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { DateInput } from "./DateInput";

interface BudgetFormProps {
  amount: string;
  setAmount: (amount: string) => void;
  startDate: Date | undefined;
  endDate: Date | undefined;
  startDateInput: string;
  endDateInput: string;
  startCalendarOpen: boolean;
  endCalendarOpen: boolean;
  setStartCalendarOpen: (open: boolean) => void;
  setEndCalendarOpen: (open: boolean) => void;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onStartDateInputChange: (input: string) => void;
  onEndDateInputChange: (input: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function BudgetForm({
  amount,
  setAmount,
  startDate,
  endDate,
  startDateInput,
  endDateInput,
  startCalendarOpen,
  endCalendarOpen,
  setStartCalendarOpen,
  setEndCalendarOpen,
  onStartDateChange,
  onEndDateChange,
  onStartDateInputChange,
  onEndDateInputChange,
  onSubmit,
}: BudgetFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 animate-fade-in">
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

      <DateInput
        label="Start Date"
        date={startDate}
        dateInput={startDateInput}
        calendarOpen={startCalendarOpen}
        setCalendarOpen={setStartCalendarOpen}
        onDateChange={onStartDateChange}
        onDateInputChange={onStartDateInputChange}
        colorScheme="purple"
      />

      <DateInput
        label="End Date"
        date={endDate}
        dateInput={endDateInput}
        calendarOpen={endCalendarOpen}
        setCalendarOpen={setEndCalendarOpen}
        onDateChange={onEndDateChange}
        onDateInputChange={onEndDateInputChange}
        fromDate={startDate}
        colorScheme="pink"
      />

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
      >
        Set Budget 🚀
      </Button>
    </form>
  );
}
