
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface ExpenseCardProps {
  title: string;
  amount: number;
  category: string;
  date: string;
}

const ExpenseCard = ({ title, amount, category, date }: ExpenseCardProps) => {
  const getAmountColor = (amount: number) => {
    if (amount < 50) return "text-expense-low";
    if (amount < 200) return "text-expense-medium";
    return "text-expense-high";
  };

  return (
    <Card className="expense-card animated-entrance">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-full bg-secondary">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{category}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-semibold ${getAmountColor(amount)}`}>
            ${amount.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseCard;
