
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";

const categories = [
  "Food", "Transportation", "Entertainment", "Shopping", "Bills", "Health", "Education", "Others"
];

export function AddExpenseDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      setTitle("");
      setAmount("");
      setCategory("");
      setDate(new Date());
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to add expenses", variant: "destructive" });
      return;
    }

    if (!title || !amount || !category || !date || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({ title: "Error", description: "Please fill in all fields with valid data", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("expenses").insert({
        title,
        amount: parseFloat(amount),
        category,
        date: date.toISOString(),
        user_id: user.id
      });

      if (error) throw error;

      toast({ title: "Success", description: "Expense added successfully" });
      setOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Expense title" 
            required 
          />
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input 
            id="amount" 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="0.00" 
            step="0.01" 
            required 
            min="0.01" 
          />
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label>Date</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar 
                mode="single" 
                selected={date} 
                onSelect={(newDate) => newDate && setDate(newDate)} 
                initialFocus 
              />
            </PopoverContent>
          </Popover>
          <Button type="submit" className="w-full">Add Expense</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
