
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import ExpenseCard from "@/components/ExpenseCard";
import ExpenseChart from "@/components/ExpenseChart";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { SetBudgetDialog } from "@/components/SetBudgetDialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

interface Budget {
  amount: number;
  start_date: string;
  end_date: string;
}

const Index = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchExpenses = async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq('user_id', user.id)
        .order("date", { ascending: false });

      if (!error && data) {
        setExpenses(data as Expense[]);
        const total = data.reduce((sum, expense) => sum + expense.amount, 0);
        setTotalSpent(total);
      }
    };

    const fetchBudget = async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq('user_id', user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setBudget(data as Budget);
        // Show alert if spent amount is more than 80% of budget
        if (totalSpent / data.amount > 0.8) {
          setShowBudgetAlert(true);
        }
      }
    };

    fetchExpenses();
    fetchBudget();

    // Subscribe to real-time changes
    const expensesSubscription = supabase
      .channel('expenses_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${user.id}` },
        () => {
          fetchExpenses();
          fetchBudget();
        }
      )
      .subscribe();

    return () => {
      expensesSubscription.unsubscribe();
    };
  }, [user, totalSpent]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Welcome to Expense Tracker</h1>
          <p className="text-muted-foreground">Please sign in to continue</p>
          <Button onClick={handleLogin}>Sign in with Google</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Expense Tracker</h1>
            <p className="text-muted-foreground">Keep track of your spending</p>
          </div>
          <div className="flex gap-4">
            <SetBudgetDialog />
            <AddExpenseDialog />
            <Button 
              variant="outline" 
              onClick={() => supabase.auth.signOut()}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {showBudgetAlert && budget && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warning: You have spent more than 80% of your budget (₹{budget.amount.toLocaleString('en-IN')})
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-medium mb-2">Total Spent</h3>
            <p className="text-3xl font-bold">₹{totalSpent.toLocaleString('en-IN')}</p>
            <p className="text-muted-foreground text-sm">This month</p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-medium mb-2">Average Daily</h3>
            <p className="text-3xl font-bold">
              ₹{(totalSpent / 30).toFixed(2).toLocaleString('en-IN')}
            </p>
            <p className="text-muted-foreground text-sm">Last 30 days</p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-medium mb-2">Budget Left</h3>
            <p className="text-3xl font-bold text-expense-low">
              ₹{budget ? (budget.amount - totalSpent).toLocaleString('en-IN') : '0'}
            </p>
            <p className="text-muted-foreground text-sm">
              From ₹{budget?.amount.toLocaleString('en-IN') || '0'}
            </p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="h-[400px]">
          <ExpenseChart
            data={expenses.map((expense) => ({
              name: new Date(expense.date).toLocaleDateString(),
              amount: expense.amount,
            }))}
          />
        </div>

        {/* Recent Expenses */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recent Expenses</h2>
          <div className="grid gap-4">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                title={expense.title}
                amount={expense.amount}
                category={expense.category}
                date={new Date(expense.date).toLocaleDateString()}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
