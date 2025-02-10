
import { useState } from "react";
import ExpenseCard from "@/components/ExpenseCard";
import ExpenseChart from "@/components/ExpenseChart";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { mockExpenses, mockChartData } from "@/lib/mockData";

const Index = () => {
  const [expenses] = useState(mockExpenses);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center animated-entrance">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Expense Tracker</h1>
            <p className="text-muted-foreground">Keep track of your spending</p>
          </div>
          <Button className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Add Expense
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animated-entrance">
          <div className="expense-card">
            <h3 className="text-lg font-medium mb-2">Total Spent</h3>
            <p className="text-3xl font-bold">$1,234.56</p>
            <p className="text-muted-foreground text-sm">This month</p>
          </div>
          <div className="expense-card">
            <h3 className="text-lg font-medium mb-2">Average Daily</h3>
            <p className="text-3xl font-bold">$45.67</p>
            <p className="text-muted-foreground text-sm">Last 30 days</p>
          </div>
          <div className="expense-card">
            <h3 className="text-lg font-medium mb-2">Budget Left</h3>
            <p className="text-3xl font-bold text-expense-low">$765.44</p>
            <p className="text-muted-foreground text-sm">From $2,000.00</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="h-[400px] animated-entrance">
          <ExpenseChart data={mockChartData} />
        </div>

        {/* Recent Expenses */}
        <div className="space-y-4 animated-entrance">
          <h2 className="text-2xl font-semibold">Recent Expenses</h2>
          <div className="grid gap-4">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                title={expense.title}
                amount={expense.amount}
                category={expense.category}
                date={expense.date}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
