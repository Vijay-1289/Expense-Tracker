
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
import { useToast } from "@/components/ui/use-toast";

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

// Helper function to format currency in Indian Rupees
const formatIndianCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const Index = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
        if (totalSpent / data.amount > 0.8) {
          setShowBudgetAlert(true);
        }
      }
    };

    fetchExpenses();
    fetchBudget();

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
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during sign in.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold">Welcome to Expense Tracker</h1>
          <p className="text-muted-foreground">Please sign in to continue</p>
          <Button 
            onClick={handleLogin} 
            disabled={isLoading}
            className="hover-scale"
          >
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center animate-fade-in">
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
              className="hover-scale"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {showBudgetAlert && budget && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warning: You have spent more than 80% of your budget ({formatIndianCurrency(budget.amount)})
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover-scale animate-fade-in">
            <h3 className="text-lg font-medium mb-2">Total Spent</h3>
            <p className="text-3xl font-bold">{formatIndianCurrency(totalSpent)}</p>
            <p className="text-muted-foreground text-sm">This month</p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover-scale animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-medium mb-2">Average Daily</h3>
            <p className="text-3xl font-bold">
              {formatIndianCurrency(totalSpent / 30)}
            </p>
            <p className="text-muted-foreground text-sm">Last 30 days</p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover-scale animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-medium mb-2">Budget Left</h3>
            <p className="text-3xl font-bold text-expense-low">
              {formatIndianCurrency(budget ? budget.amount - totalSpent : 0)}
            </p>
            <p className="text-muted-foreground text-sm">
              From {formatIndianCurrency(budget?.amount || 0)}
            </p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="h-[400px] animate-fade-in" style={{ animationDelay: '300ms' }}>
          <ExpenseChart
            data={expenses.map((expense) => ({
              name: new Date(expense.date).toLocaleDateString('en-IN'),
              amount: expense.amount,
            }))}
          />
        </div>

        {/* Recent Expenses */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h2 className="text-2xl font-semibold">Recent Expenses</h2>
          <div className="grid gap-4">
            {expenses.map((expense, index) => (
              <ExpenseCard
                key={expense.id}
                title={expense.title}
                amount={expense.amount}
                category={expense.category}
                date={new Date(expense.date).toLocaleDateString('en-IN')}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
