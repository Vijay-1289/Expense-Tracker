
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface ExpenseCardProps {
  title: string;
  amount: number;
  category: string;
  date: string;
  className?: string;
  style?: React.CSSProperties;
}

const ExpenseCard = ({ title, amount, category, date, className = "", style }: ExpenseCardProps) => {
  const getAmountColor = (amount: number) => {
    if (amount < 1000) return "text-expense-low";
    if (amount < 5000) return "text-expense-medium";
    return "text-expense-high";
  };

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <Card className={`expense-card hover-scale ${className}`} style={style}>
      <div className="flex items-center justify-between p-4">
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
            {formattedAmount}
          </p>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseCard;
