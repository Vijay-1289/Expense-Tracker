
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateInputProps {
  label: string;
  date: Date | undefined;
  dateInput: string;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  onDateChange: (date: Date | undefined) => void;
  onDateInputChange: (input: string) => void;
  fromDate?: Date;
  toDate?: Date;
  colorScheme?: "purple" | "pink";
}

export function DateInput({
  label,
  date,
  dateInput,
  calendarOpen,
  setCalendarOpen,
  onDateChange,
  onDateInputChange,
  fromDate,
  toDate,
  colorScheme = "purple"
}: DateInputProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <CalendarIcon className={`w-4 h-4 text-${colorScheme}-500`} /> {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={dateInput}
          onChange={(e) => onDateInputChange(e.target.value)}
          placeholder="DD/MM/YYYY"
          className={`flex-grow border-${colorScheme}-200 focus:ring-${colorScheme}-300`}
        />
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              type="button"
              className="hover:scale-110 transition-transform"
              onPointerDown={(e) => {
                e.preventDefault();
                setCalendarOpen(!calendarOpen);
              }}
            >
              <CalendarIcon className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              initialFocus
              fromDate={fromDate || new Date(2023, 0, 1)}
              toDate={toDate || new Date(2025, 11, 31)}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
