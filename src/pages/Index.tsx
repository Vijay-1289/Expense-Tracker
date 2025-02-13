import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import ExpenseCard from "@/components/ExpenseCard";
import ExpenseChart from "@/components/ExpenseChart";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { SetBudgetDialog } from "@/components/SetBudgetDialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Sparkles, PiggyBank, TrendingUp, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

interface Budget {
  id: string;
  amount: number;
  start_date: string;
  end_date: string;
}

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
  const isMobile = useIsMobile();

  const fetchExpenses = async () => {
    if (!user) return;

    try {
      console.log('Fetching expenses for user:', user.id);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq('user_id', user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load expenses. Please try again.",
        });
        return;
      }

      if (data) {
        console.log('Fetched expenses:', data);
        setExpenses(data as Expense[]);
        const total = data.reduce((sum, expense) => sum + expense.amount, 0);
        setTotalSpent(total);
      }
    } catch (error) {
      console.error('Unexpected error fetching expenses:', error);
    }
  };

  const fetchBudget = async () => {
    if (!user) return;

    try {
      console.log('Fetching budget for user:', user.id);
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq('user_id', user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error
        console.error('Error fetching budget:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load budget. Please try again.",
        });
        return;
      }

      if (data) {
        console.log('Fetched budget:', data);
        setBudget(data as Budget);
        if (totalSpent / data.amount > 0.8) {
          setShowBudgetAlert(true);
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching budget:', error);
    }
  };

  const handleDeleteBudget = async () => {
    if (!user || !budget) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot delete budget. No active budget found.",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq('id', budget.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting budget:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete budget. Please try again.",
        });
        return;
      }

      toast({
        title: "Budget Deleted",
        description: "Your budget has been successfully deleted.",
      });

      // Reset budget state
      setBudget(null);
      setTotalSpent(0);
      setShowBudgetAlert(false);
    } catch (error) {
      console.error('Unexpected error deleting budget:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchExpenses();
    fetchBudget();

    const expensesSubscription = supabase
      .channel('expenses_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Expense change received:', payload);
          fetchExpenses();
          fetchBudget();
        }
      )
      .subscribe();

    return () => {
      expensesSubscription.unsubscribe();
    };
  }, [user, totalSpent, toast]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Google authentication...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      console.log('Auth response:', { data, error });

      if (error) {
        console.error('Auth error:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message,
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md w-full bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl animate-fade-in">
          <div className="flex justify-center">
            <Sparkles className="h-12 w-12 text-purple-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ✨ Expense Tracker ✨
          </h1>
          <p className="text-muted-foreground">Track your spending with style 💖</p>
          <Button 
            onClick={handleLogin} 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform transition-all duration-200 hover:scale-105"
          >
            {isLoading ? "Signing in..." : "Sign in with Google ✨"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Expense Tracker ✨
            </h1>
            <p className="text-muted-foreground">Keep track of your spending 💰</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-4">
            <SetBudgetDialog />
            <AddExpenseDialog />
            <Button 
              variant="outline" 
              onClick={() => supabase.auth.signOut()}
              className="hover:scale-105 transition-transform duration-200"
            >
              Sign Out 👋
            </Button>
          </div>
        </div>

        {showBudgetAlert && budget && (
          <Alert variant="destructive" className="animate-fade-in bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warning: You have spent more than 80% of your budget ({formatIndianCurrency(budget.amount)}) 😱
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="rounded-2xl border bg-white/80 backdrop-blur-lg shadow-lg p-6 transform transition-all duration-200 hover:scale-105 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="h-6 w-6 text-purple-500" />
              <h3 className="text-lg font-medium">Total Spent</h3>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {formatIndianCurrency(totalSpent)}
            </p>
            <p className="text-muted-foreground text-sm">This month 📅</p>
          </div>
          <div className="rounded-2xl border bg-white/80 backdrop-blur-lg shadow-lg p-6 transform transition-all duration-200 hover:scale-105 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-6 w-6 text-pink-500" />
              <h3 className="text-lg font-medium">Average Daily</h3>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              {formatIndianCurrency(totalSpent / 30)}
            </p>
            <p className="text-muted-foreground text-sm">Last 30 days 📊</p>
          </div>
          <div className="rounded-2xl border bg-white/80 backdrop-blur-lg shadow-lg p-6 transform transition-all duration-200 hover:scale-105 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-rose-500" />
                <h3 className="text-lg font-medium">Budget Left</h3>
              </div>
              {budget && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDeleteBudget}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              )}
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
              {formatIndianCurrency(budget ? budget.amount - totalSpent : 0)}
            </p>
            <p className="text-muted-foreground text-sm">
              From {formatIndianCurrency(budget?.amount || 0)} 💫
            </p>
          </div>
        </div>

        <div className={`h-[${isMobile ? '300px' : '400px'}] bg-white/80 backdrop-blur-lg rounded-2xl p-4 shadow-lg animate-fade-in`} style={{ animationDelay: '300ms' }}>
          <ExpenseChart
            data={expenses.map((expense) => ({
              name: new Date(expense.date).toLocaleDateString('en-IN'),
              amount: expense.amount,
            }))}
          />
        </div>

        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Recent Expenses 📝
          </h2>
          <div className="grid gap-4">
            {expenses.map((expense, index) => (
              <ExpenseCard
                key={expense.id}
                title={expense.title}
                amount={expense.amount}
                category={expense.category}
                date={new Date(expense.date).toLocaleDateString('en-IN')}
                className="animate-fade-in bg-white/80 backdrop-blur-lg transform transition-all duration-200 hover:scale-[1.02]"
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
