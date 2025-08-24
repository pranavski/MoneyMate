import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, TrendingUp, TrendingDown, DollarSign, User, Brain, LogIn, BarChart3, CreditCard, LogOut, Settings, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { CategoryChart } from './CategoryChart';
import { ProfileForm } from './ProfileForm';
import { ProfileChat } from './ProfileChat';
import { AIRecommendations } from './AIRecommendations';
import { OnboardingForm } from './OnboardingForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserProfile } from '@/components/auth/UserProfile';

import { supabase } from '@/integrations/supabase/client';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Debt {
  id: string;
  amount: number;
  interestRate: number;
  minimumPayment: number;
  description: string;
  date: string;
}

const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Bonus', 'Commission', 'Rental Income', 'Dividends', 'Interest', 'Business', 'Other'],
  expense: ['Food & Dining', 'Transportation', 'Entertainment', 'Bills & Utilities', 'Shopping', 'Healthcare', 'Housing', 'Education', 'Travel', 'Insurance', 'Taxes', 'Other']
};

export const BudgetDashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  // Get user's display name (first name from email or full email)
  const getUserDisplayName = () => {
    if (!user?.email) return 'User';
    const email = user.email;
    const name = email.split('@')[0];
    // Capitalize first letter and replace dots/underscores with spaces
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/[._]/g, ' ');
  };

  // Load user data from Supabase
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Load transactions and debts from Supabase
  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Load debts (handle case where table doesn't exist yet)
      let debtsData = null;
      try {
        const { data, error } = await supabase
          .from('debts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Debts table may not exist yet:', error);
          debtsData = [];
        } else {
          debtsData = data;
        }
      } catch (error) {
        console.warn('Could not load debts:', error);
        debtsData = [];
      }

      // Transform data to match local interface
      const transformedTransactions: Transaction[] = (transactionsData || []).map(t => ({
        id: t.id,
        type: t.type as 'income' | 'expense',
        amount: t.amount,
        category: t.category,
        description: t.description || '',
        date: t.date
      }));

      const transformedDebts: Debt[] = (debtsData || []).map(d => ({
        id: d.id,
        amount: d.amount,
        interestRate: d.interest_rate,
        minimumPayment: d.minimum_payment,
        description: d.description,
        date: d.date
      }));

      setTransactions(transformedTransactions);
      setDebts(transformedDebts);
    } catch (error: any) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load your financial data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has a profile
  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setHasProfile(!!data);
    } catch (error: any) {
      console.error('Error checking profile:', error);
    }
  };

  const handleProfileComplete = () => {
    setHasProfile(true);
    toast({
      title: "Profile completed!",
      description: "You can now get AI-powered budget recommendations."
    });
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Refresh the page to update authentication state
    window.location.reload();
  };

  const handleOnboardingComplete = async (data: { income: number; expenses: number; debt: number }) => {
    if (!user) return;

    try {
      const initialTransactions: Omit<Transaction, 'id'>[] = [];
      
      if (data.income > 0) {
        initialTransactions.push({
          type: 'income',
          amount: data.income,
          category: 'Salary',
          description: 'Monthly income',
          date: new Date().toISOString().split('T')[0]
        });
      }
      
      if (data.expenses > 0) {
        initialTransactions.push({
          type: 'expense',
          amount: data.expenses,
          category: 'Bills',
          description: 'Monthly expenses',
          date: new Date().toISOString().split('T')[0]
        });
      }

      // Save initial transactions to Supabase
      if (initialTransactions.length > 0) {
        const { error: transactionsError } = await supabase
          .from('transactions')
          .insert(
            initialTransactions.map(t => ({
              type: t.type,
              amount: t.amount,
              category: t.category,
              description: t.description,
              date: t.date,
              user_id: user.id
            }))
          );

        if (transactionsError) throw transactionsError;
      }

      // Save initial debt to Supabase if provided
      if (data.debt > 0) {
        const { error: debtError } = await supabase
          .from('debts')
          .insert({
            amount: data.debt,
            interest_rate: 18.99, // Default credit card rate
            minimum_payment: data.debt * 0.02, // 2% minimum payment
            description: 'Initial debt',
            date: new Date().toISOString().split('T')[0],
            user_id: user.id
          });

        if (debtError) throw debtError;
      }

      // Reload data from Supabase
      await loadUserData();
      setShowOnboarding(false);
      
      toast({
        title: "Welcome to MoneyMate!",
        description: "Your financial data has been saved and you're ready to start tracking."
      });
    } catch (error: any) {
      console.error('Error saving onboarding data:', error);
      toast({
        title: "Error saving data",
        description: "Failed to save your initial data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const { totalIncome, totalExpenses, balance, totalDebt, monthlyDebtPayment, availableForDebt } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
    const monthlyDebtPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const availableForDebt = income - expenses;

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      totalDebt,
      monthlyDebtPayment,
      availableForDebt
    };
  }, [transactions, debts]);

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your transactions.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          date: transaction.date,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newTransaction: Transaction = {
        id: data.id,
        type: data.type as 'income' | 'expense',
        amount: data.amount,
        category: data.category,
        description: data.description || '',
        date: data.date
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setShowForm(false);
      
      toast({
        title: "Transaction saved!",
        description: "Your transaction has been saved to your account."
      });
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Error saving transaction",
        description: "Failed to save your transaction. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddDebt = async (debt: Omit<Debt, 'id'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your debts.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('debts')
        .insert({
          amount: debt.amount,
          interest_rate: debt.interestRate,
          minimum_payment: debt.minimumPayment,
          description: debt.description,
          date: debt.date,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        if (error.message.includes('relation "debts" does not exist')) {
          toast({
            title: "Database setup required",
            description: "The debts table needs to be created. Please contact support or run the database migration.",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      const newDebt: Debt = {
        id: data.id,
        amount: data.amount,
        interestRate: data.interest_rate,
        minimumPayment: data.minimum_payment,
        description: data.description,
        date: data.date
      };

      setDebts(prev => [newDebt, ...prev]);
      
      toast({
        title: "Debt saved!",
        description: "Your debt has been saved and AI insights updated."
      });
    } catch (error: any) {
      console.error('Error saving debt:', error);
      toast({
        title: "Error saving debt",
        description: "Failed to save your debt. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDebt = async (index: number) => {
    const debtToDelete = debts[index];
    if (!user || !debtToDelete) return;

    try {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', debtToDelete.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setDebts(prev => prev.filter((_, i) => i !== index));
      
      toast({
        title: "Debt removed!",
        description: "Your debt has been removed from your account."
      });
    } catch (error: any) {
      console.error('Error deleting debt:', error);
      toast({
        title: "Error removing debt",
        description: "Failed to remove your debt. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: "Transaction removed!",
        description: "Your transaction has been removed from your account."
      });
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error removing transaction",
        description: "Failed to remove your transaction. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-success to-primary rounded-full animate-pulse"></div>
            </div>
                         <div>
               <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                 Income & Expense Tracker
               </h1>
               <p className="text-muted-foreground text-lg">Track every dollar in and out with precision</p>
             </div>
            <Button variant="ghost" asChild className="hover:bg-primary/10">
              <Link to="/" className="text-sm font-medium">
                ← Back to Home
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{getUserDisplayName().charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">Welcome, {getUserDisplayName()}</span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-success text-white font-semibold">
                          {getUserDisplayName().charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={async () => {
                        await signOut();
                        window.location.href = '/';
                      }}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button 
                  variant="outline"
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 hover:bg-primary/10"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>

                 {/* Main Content */}
         {isLoading ? (
           <div className="flex items-center justify-center min-h-[400px]">
             <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
               <p className="text-muted-foreground">Loading your financial data...</p>
             </div>
           </div>
         ) : (
           <Tabs defaultValue="income" className="w-full">
           <TabsList className="grid w-full grid-cols-4 p-1 bg-muted/50 rounded-2xl">
             <TabsTrigger value="income" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-success data-[state=active]:to-success/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300">
               <TrendingUp className="h-4 w-4" />
               Income
             </TabsTrigger>
             <TabsTrigger value="expense" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-expense data-[state=active]:to-expense/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300">
               <TrendingDown className="h-4 w-4" />
               Expense
             </TabsTrigger>
             <TabsTrigger value="debt" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-warning data-[state=active]:to-warning/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300">
               <CreditCard className="h-4 w-4" />
               Debt
             </TabsTrigger>
             <TabsTrigger value="ai-insights" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300">
               <Brain className="h-4 w-4" />
               AI Insights
             </TabsTrigger>
           </TabsList>

                                <TabsContent value="income" className="mt-6 space-y-6">
             {showOnboarding ? (
               <OnboardingForm onComplete={handleOnboardingComplete} />
             ) : (
               <>
                 {/* Income Overview */}
                 <Card className="bg-gradient-to-br from-income-light to-success-muted border-income/20 shadow-xl rounded-2xl overflow-hidden">
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-2xl font-bold text-income">Income Overview</CardTitle>
                     <div className="w-16 h-16 bg-gradient-to-br from-success to-success/80 rounded-xl flex items-center justify-center shadow-lg">
                       <TrendingUp className="h-8 w-8 text-white" />
                     </div>
                   </CardHeader>
                   <CardContent>
                     <div className="text-5xl font-bold text-income mb-4">${totalIncome.toLocaleString()}</div>
                     <p className="text-lg text-income/70">
                       {transactions.filter(t => t.type === 'income').length} income entries this month
                     </p>
                   </CardContent>
                 </Card>

                 {/* Add Income Form */}
                 <Card className="shadow-xl rounded-2xl overflow-hidden">
                   <CardHeader className="bg-gradient-to-r from-success/5 to-success/10 border-b">
                     <CardTitle className="flex items-center gap-2 text-success">
                       <Plus className="h-5 w-5" />
                       Add Income
                     </CardTitle>
                     <p className="text-sm text-muted-foreground">
                       Record your income and get AI insights
                     </p>
                   </CardHeader>
                   <CardContent className="p-6">
                     <form onSubmit={(e) => {
                       e.preventDefault();
                       const formData = new FormData(e.currentTarget);
                       const amount = parseFloat(formData.get('amount') as string);
                       const category = formData.get('category') as string;
                       const description = formData.get('description') as string;
                       
                       if (amount && category && description) {
                         handleAddTransaction({
                           type: 'income',
                           amount,
                           category,
                           description,
                           date: new Date().toISOString().split('T')[0]
                         });
                         e.currentTarget.reset();
                       }
                     }} className="space-y-4">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                           <Label htmlFor="amount">Amount</Label>
                           <Input
                             id="amount"
                             name="amount"
                             type="number"
                             step="0.01"
                             placeholder="0.00"
                             required
                             className="mt-1"
                           />
                         </div>
                         <div>
                           <Label htmlFor="category">Category</Label>
                           <Select name="category" required>
                             <SelectTrigger className="mt-1">
                               <SelectValue placeholder="Select category" />
                             </SelectTrigger>
                             <SelectContent>
                               {categories.income.map((cat) => (
                                 <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         </div>
                         <div>
                           <Label htmlFor="description">Description</Label>
                           <Input
                             id="description"
                             name="description"
                             placeholder="e.g., Monthly salary"
                             required
                             className="mt-1"
                           />
                         </div>
                       </div>
                       <Button type="submit" className="w-full bg-success hover:bg-success/90">
                         <Plus className="w-4 h-4 mr-2" />
                         Add Income
                       </Button>
                     </form>
                   </CardContent>
                 </Card>

                 {/* AI Income Insights */}
                 {transactions.filter(t => t.type === 'income').length > 0 && (
                   <Card className="shadow-xl rounded-2xl overflow-hidden">
                     <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                       <CardTitle className="flex items-center gap-2 text-primary">
                         <Brain className="h-5 w-5" />
                         AI Financial Summary
                       </CardTitle>
                     </CardHeader>
                     <CardContent className="p-6">
                       {/* Financial Health Overview */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                         <div className="space-y-4">
                           <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                             <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center">
                               <TrendingUp className="h-6 w-6 text-white" />
                             </div>
                             <div>
                               <div className="text-sm font-medium text-success">Monthly Income</div>
                               <div className="text-2xl font-bold">${totalIncome.toLocaleString()}</div>
                             </div>
                           </div>
                           
                           <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-expense/10 to-expense/5 border border-expense/20">
                             <div className="w-12 h-12 bg-expense rounded-lg flex items-center justify-center">
                               <TrendingDown className="h-6 w-6 text-white" />
                             </div>
                             <div>
                               <div className="text-sm font-medium text-expense">Monthly Expenses</div>
                               <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
                             </div>
                           </div>
                         </div>
                         
                         <div className="space-y-4">
                           <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                             <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                               <DollarSign className="h-6 w-6 text-white" />
                             </div>
                             <div>
                               <div className="text-sm font-medium text-primary">Available Funds</div>
                               <div className={`text-2xl font-bold ${balance >= 0 ? 'text-success' : 'text-expense'}`}>
                                 ${balance.toLocaleString()}
                               </div>
                             </div>
                           </div>
                           
                           <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20">
                             <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center">
                               <BarChart3 className="h-6 w-6 text-white" />
                             </div>
                             <div>
                               <div className="text-sm font-medium text-warning">Savings Rate</div>
                               <div className={`text-2xl font-bold ${(balance / totalIncome * 100) >= 20 ? 'text-success' : 'text-warning'}`}>
                                 {((balance / totalIncome) * 100).toFixed(1)}%
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* AI Assessment */}
                       <div className="mb-6">
                         <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                             <Brain className="h-5 w-5 text-white" />
                           </div>
                           <h3 className="text-lg font-semibold">AI Assessment</h3>
                         </div>
                         
                         <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                           <div className="flex items-start gap-4">
                             <div className={`w-4 h-4 rounded-full mt-2 ${balance >= 0 ? (balance / totalIncome * 100) >= 20 ? 'bg-success' : 'bg-warning' : 'bg-expense'}`}></div>
                             <div className="flex-1">
                               <h4 className="font-semibold mb-2">
                                 {balance >= 0 ? 
                                   (balance / totalIncome * 100) >= 20 ? 
                                     "Excellent Financial Health" :
                                     "Good Financial Standing" :
                                   "Needs Attention"
                                 }
                               </h4>
                               <p className="text-muted-foreground mb-3">
                                 {balance >= 0 ? 
                                   (balance / totalIncome * 100) >= 20 ? 
                                     "You're saving more than 20% of your income, which is excellent! Consider investing your savings for long-term growth." :
                                     "You're living within your means, but could improve your savings rate. Aim for 20% to build financial security." :
                                   "You're currently spending more than you earn. Focus on reducing expenses or increasing income immediately."
                                 }
                               </p>
                               <div className="flex items-center gap-2 text-sm">
                                 <span className="font-medium">Recommendation:</span>
                                 <span className="text-muted-foreground">
                                   {balance >= 0 ? 
                                     (balance / totalIncome * 100) >= 20 ? 
                                       "Keep up the great work and consider investment opportunities" :
                                       "Focus on increasing your savings rate to 20%" :
                                     "Prioritize reducing expenses and increasing income"
                                   }
                                 </span>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* Action Items */}
                       <div>
                         <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 bg-gradient-to-br from-success to-success/80 rounded-lg flex items-center justify-center">
                             <TrendingUp className="h-5 w-5 text-white" />
                           </div>
                           <h3 className="text-lg font-semibold">Quick Actions to Save More</h3>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                             <div className="flex items-center gap-2 mb-2">
                               <div className="w-2 h-2 bg-success rounded-full"></div>
                               <span className="font-medium text-success">Food & Dining</span>
                             </div>
                             <p className="text-sm text-muted-foreground">Cook at home 4+ times per week</p>
                             <div className="text-xs text-success font-medium mt-1">Save ~$300/month</div>
                           </div>
                           
                           <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                             <div className="flex items-center gap-2 mb-2">
                               <div className="w-2 h-2 bg-warning rounded-full"></div>
                               <span className="font-medium text-warning">Subscriptions</span>
                             </div>
                             <p className="text-sm text-muted-foreground">Cancel unused subscriptions</p>
                             <div className="text-xs text-warning font-medium mt-1">Save ~$50/month</div>
                           </div>
                           
                           <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                             <div className="flex items-center gap-2 mb-2">
                               <div className="w-2 h-2 bg-primary rounded-full"></div>
                               <span className="font-medium text-primary">Transportation</span>
                             </div>
                             <p className="text-sm text-muted-foreground">Use public transport 2x per week</p>
                             <div className="text-xs text-primary font-medium mt-1">Save ~$100/month</div>
                           </div>
                           
                           <div className="p-4 rounded-lg bg-expense/10 border border-expense/20">
                             <div className="flex items-center gap-2 mb-2">
                               <div className="w-2 h-2 bg-expense rounded-full"></div>
                               <span className="font-medium text-expense">Shopping</span>
                             </div>
                             <p className="text-sm text-muted-foreground">Shop with a list and stick to it</p>
                             <div className="text-xs text-expense font-medium mt-1">Save ~$200/month</div>
                           </div>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 )}

                 {/* Income Transactions */}
                 <Card className="shadow-xl rounded-2xl overflow-hidden">
                   <CardHeader className="bg-gradient-to-r from-success/5 to-success/10 border-b">
                     <CardTitle className="flex items-center gap-2 text-success">
                       <TrendingUp className="h-5 w-5" />
                       Recent Income
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="p-0">
                     <TransactionList 
                       transactions={transactions.filter(t => t.type === 'income')}
                       onDelete={handleDeleteTransaction}
                     />
                   </CardContent>
                 </Card>
               </>
             )}
           </TabsContent>

                     <TabsContent value="expense" className="mt-6 space-y-6">
             {showOnboarding ? (
               <OnboardingForm onComplete={handleOnboardingComplete} />
             ) : (
               <>
                 {/* Expense Overview */}
                 <Card className="bg-gradient-to-br from-expense-light to-destructive/5 border-expense/20 shadow-xl rounded-2xl overflow-hidden">
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-2xl font-bold text-expense">Expense Overview</CardTitle>
                     <div className="w-16 h-16 bg-gradient-to-br from-expense to-expense/80 rounded-xl flex items-center justify-center shadow-lg">
                       <TrendingDown className="h-8 w-8 text-white" />
                     </div>
                   </CardHeader>
                   <CardContent>
                     <div className="text-5xl font-bold text-expense mb-4">${totalExpenses.toLocaleString()}</div>
                     <p className="text-lg text-expense/70">
                       {transactions.filter(t => t.type === 'expense').length} expense entries this month
                     </p>
                   </CardContent>
                 </Card>

                 {/* Add Expense Form */}
                 <Card className="shadow-xl rounded-2xl overflow-hidden">
                   <CardHeader className="bg-gradient-to-r from-expense/5 to-expense/10 border-b">
                     <CardTitle className="flex items-center gap-2 text-expense">
                       <Plus className="h-5 w-5" />
                       Add Expense
                     </CardTitle>
                     <p className="text-sm text-muted-foreground">
                       Record your expenses and get AI insights
                     </p>
                   </CardHeader>
                   <CardContent className="p-6">
                     <form onSubmit={(e) => {
                       e.preventDefault();
                       const formData = new FormData(e.currentTarget);
                       const amount = parseFloat(formData.get('amount') as string);
                       const category = formData.get('category') as string;
                       const description = formData.get('description') as string;
                       
                       if (amount && category && description) {
                         handleAddTransaction({
                           type: 'expense',
                           amount,
                           category,
                           description,
                           date: new Date().toISOString().split('T')[0]
                         });
                         e.currentTarget.reset();
                       }
                     }} className="space-y-4">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                           <Label htmlFor="expense-amount">Amount</Label>
                           <Input
                             id="expense-amount"
                             name="amount"
                             type="number"
                             step="0.01"
                             placeholder="0.00"
                             required
                             className="mt-1"
                           />
                         </div>
                         <div>
                           <Label htmlFor="expense-category">Category</Label>
                           <Select name="category" required>
                             <SelectTrigger className="mt-1">
                               <SelectValue placeholder="Select category" />
                             </SelectTrigger>
                             <SelectContent>
                               {categories.expense.map((cat) => (
                                 <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         </div>
                         <div>
                           <Label htmlFor="expense-description">Description</Label>
                           <Input
                             id="expense-description"
                             name="description"
                             placeholder="e.g., Grocery shopping"
                             required
                             className="mt-1"
                           />
                         </div>
                       </div>
                       <Button type="submit" className="w-full bg-expense hover:bg-expense/90">
                         <Plus className="w-4 h-4 mr-2" />
                         Add Expense
                       </Button>
                     </form>
                   </CardContent>
                 </Card>

                 {/* AI Expense Insights */}
                 {transactions.filter(t => t.type === 'expense').length > 0 && (
                   <Card className="shadow-xl rounded-2xl overflow-hidden">
                     <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                       <CardTitle className="flex items-center gap-2 text-primary">
                         <Brain className="h-5 w-5" />
                         AI Spending Analysis
                       </CardTitle>
                     </CardHeader>
                     <CardContent className="p-6">
                       {/* Spending Overview */}
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                         <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-expense/10 to-expense/5 border border-expense/20">
                           <div className="w-12 h-12 bg-expense rounded-lg flex items-center justify-center">
                             <TrendingDown className="h-6 w-6 text-white" />
                           </div>
                           <div>
                             <div className="text-sm font-medium text-expense">Total Spending</div>
                             <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
                           </div>
                         </div>
                         
                         <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                           <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                             <BarChart3 className="h-6 w-6 text-white" />
                           </div>
                           <div>
                             <div className="text-sm font-medium text-primary">% of Income</div>
                             <div className={`text-2xl font-bold ${(totalExpenses / totalIncome * 100) <= 80 ? 'text-success' : 'text-warning'}`}>
                               {(totalExpenses / totalIncome * 100).toFixed(1)}%
                             </div>
                           </div>
                         </div>
                         
                         <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                           <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center">
                             <TrendingUp className="h-6 w-6 text-white" />
                           </div>
                           <div>
                             <div className="text-sm font-medium text-success">Status</div>
                             <div className={`text-lg font-bold ${totalExpenses <= totalIncome * 0.8 ? 'text-success' : totalExpenses <= totalIncome ? 'text-warning' : 'text-expense'}`}>
                               {totalExpenses <= totalIncome * 0.8 ? 'Excellent' : totalExpenses <= totalIncome ? 'Good' : 'Over Budget'}
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* AI Assessment */}
                       <div className="mb-6">
                         <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                             <Brain className="h-5 w-5 text-white" />
                           </div>
                           <h3 className="text-lg font-semibold">Spending Analysis</h3>
                         </div>
                         
                         <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                           <div className="flex items-start gap-4">
                             <div className={`w-4 h-4 rounded-full mt-2 ${totalExpenses <= totalIncome * 0.8 ? 'bg-success' : totalExpenses <= totalIncome ? 'bg-warning' : 'bg-expense'}`}></div>
                             <div className="flex-1">
                               <h4 className="font-semibold mb-2">
                                 {totalExpenses <= totalIncome * 0.8 ? 
                                   "Excellent Spending Control" :
                                   totalExpenses <= totalIncome ? 
                                     "Good Spending Habits" :
                                   "Spending Needs Attention"
                                 }
                               </h4>
                               <p className="text-muted-foreground mb-3">
                                 {totalExpenses <= totalIncome * 0.8 ? 
                                   "You're spending less than 80% of your income, which is excellent! You have room to save or invest more." :
                                   totalExpenses <= totalIncome ? 
                                     "You're spending within your means, but could optimize further to increase savings." :
                                   "You're currently spending more than you earn. Focus on reducing expenses immediately."
                                 }
                               </p>
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* Quick Wins */}
                       <div className="mb-6">
                         <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 bg-gradient-to-br from-success to-success/80 rounded-lg flex items-center justify-center">
                             <TrendingUp className="h-5 w-5 text-white" />
                           </div>
                           <h3 className="text-lg font-semibold">Quick Wins to Save Money</h3>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                             <div className="flex items-center gap-2 mb-2">
                               <div className="w-2 h-2 bg-success rounded-full"></div>
                               <span className="font-medium text-success">Food & Dining</span>
                             </div>
                             <p className="text-sm text-muted-foreground">Meal prep Sundays</p>
                             <div className="text-xs text-success font-medium mt-1">Save ~$400/month</div>
                           </div>
                           
                           <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                             <div className="flex items-center gap-2 mb-2">
                               <div className="w-2 h-2 bg-warning rounded-full"></div>
                               <span className="font-medium text-warning">Transportation</span>
                             </div>
                             <p className="text-sm text-muted-foreground">Carpool or bike 2x/week</p>
                             <div className="text-xs text-warning font-medium mt-1">Save ~$150/month</div>
                           </div>
                           
                           <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                             <div className="flex items-center gap-2 mb-2">
                               <div className="w-2 h-2 bg-primary rounded-full"></div>
                               <span className="font-medium text-primary">Entertainment</span>
                             </div>
                             <p className="text-sm text-muted-foreground">Use free activities</p>
                             <div className="text-xs text-primary font-medium mt-1">Save ~$200/month</div>
                           </div>
                           
                           <div className="p-4 rounded-lg bg-expense/10 border border-expense/20">
                             <div className="flex items-center gap-2 mb-2">
                               <div className="w-2 h-2 bg-expense rounded-full"></div>
                               <span className="font-medium text-expense">Shopping</span>
                             </div>
                             <p className="text-sm text-muted-foreground">Wait 24 hours before buying</p>
                             <div className="text-xs text-expense font-medium mt-1">Save ~$300/month</div>
                           </div>
                         </div>
                       </div>

                       {/* Smart Habits */}
                       <div>
                         <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 bg-gradient-to-br from-warning to-warning/80 rounded-lg flex items-center justify-center">
                             <BarChart3 className="h-5 w-5 text-white" />
                           </div>
                           <h3 className="text-lg font-semibold">Smart Spending Habits</h3>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                             <div className="flex items-center gap-2">
                               <div className="w-2 h-2 bg-warning rounded-full"></div>
                               <span className="text-sm font-medium">Use cash for discretionary spending</span>
                             </div>
                           </div>
                           
                           <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                             <div className="flex items-center gap-2">
                               <div className="w-2 h-2 bg-success rounded-full"></div>
                               <span className="text-sm font-medium">Set up automatic savings transfers</span>
                             </div>
                           </div>
                           
                           <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                             <div className="flex items-center gap-2">
                               <div className="w-2 h-2 bg-primary rounded-full"></div>
                               <span className="text-sm font-medium">Review expenses weekly</span>
                             </div>
                           </div>
                           
                           <div className="p-3 rounded-lg bg-expense/10 border border-expense/20">
                             <div className="flex items-center gap-2">
                               <div className="w-2 h-2 bg-expense rounded-full"></div>
                               <span className="text-sm font-medium">Use price comparison apps</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 )}

                 {/* Expense Transactions */}
                 <Card className="shadow-xl rounded-2xl overflow-hidden">
                   <CardHeader className="bg-gradient-to-r from-expense/5 to-expense/10 border-b">
                     <CardTitle className="flex items-center gap-2 text-expense">
                       <TrendingDown className="h-5 w-5" />
                       Recent Expenses
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="p-0">
                     <TransactionList 
                       transactions={transactions.filter(t => t.type === 'expense')}
                       onDelete={handleDeleteTransaction}
                     />
                   </CardContent>
                 </Card>
               </>
             )}
           </TabsContent>

           <TabsContent value="debt" className="mt-6 space-y-6">
             {showOnboarding ? (
               <OnboardingForm onComplete={handleOnboardingComplete} />
             ) : (
               <>
                 {/* Debt Overview */}
                 <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 shadow-xl rounded-2xl overflow-hidden">
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-2xl font-bold text-warning">Debt Overview</CardTitle>
                     <div className="w-16 h-16 bg-gradient-to-br from-warning to-warning/80 rounded-xl flex items-center justify-center shadow-lg">
                       <CreditCard className="h-8 w-8 text-white" />
                     </div>
                   </CardHeader>
                   <CardContent>
                     <div className="text-5xl font-bold text-warning mb-4">${totalDebt.toLocaleString()}</div>
                     <p className="text-lg text-warning/70 mb-4">
                       Total outstanding debt
                     </p>
                     <div className="grid grid-cols-2 gap-4 text-sm">
                       <div className="p-3 rounded-lg bg-warning/10">
                         <div className="font-medium text-warning">Monthly Payment</div>
                         <div className="text-2xl font-bold">${monthlyDebtPayment.toLocaleString()}</div>
                       </div>
                       <div className="p-3 rounded-lg bg-warning/10">
                         <div className="font-medium text-warning">Available for Debt</div>
                         <div className="text-2xl font-bold">${availableForDebt.toLocaleString()}</div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 {/* Add Debt Form */}
                 <Card className="shadow-xl rounded-2xl overflow-hidden">
                   <CardHeader className="bg-gradient-to-r from-warning/5 to-warning/10 border-b">
                     <CardTitle className="flex items-center gap-2 text-warning">
                       <Plus className="h-5 w-5" />
                       Add Debt
                     </CardTitle>
                     <p className="text-sm text-muted-foreground">
                       Record your debt and get repayment strategies
                     </p>
                   </CardHeader>
                   <CardContent className="p-6">
                     <form onSubmit={(e) => {
                       e.preventDefault();
                       const formData = new FormData(e.currentTarget);
                       const amount = parseFloat(formData.get('amount') as string);
                       const interestRate = parseFloat(formData.get('interestRate') as string);
                       const minimumPayment = parseFloat(formData.get('minimumPayment') as string);
                       const description = formData.get('description') as string;
                       
                       if (amount && interestRate && minimumPayment && description) {
                         handleAddDebt({
                           amount,
                           interestRate,
                           minimumPayment,
                           description,
                           date: new Date().toISOString().split('T')[0]
                         });
                         e.currentTarget.reset();
                       }
                     }} className="space-y-4">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                           <Label htmlFor="debt-amount">Debt Amount</Label>
                           <Input
                             id="debt-amount"
                             name="amount"
                             type="number"
                             step="0.01"
                             placeholder="0.00"
                             required
                             className="mt-1"
                           />
                         </div>
                         <div>
                           <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                           <Input
                             id="interest-rate"
                             name="interestRate"
                             type="number"
                             step="0.1"
                             placeholder="18.99"
                             required
                             className="mt-1"
                           />
                         </div>
                         <div>
                           <Label htmlFor="minimum-payment">Minimum Payment</Label>
                           <Input
                             id="minimum-payment"
                             name="minimumPayment"
                             type="number"
                             step="0.01"
                             placeholder="25.00"
                             required
                             className="mt-1"
                           />
                         </div>
                         <div>
                           <Label htmlFor="debt-description">Description</Label>
                           <Input
                             id="debt-description"
                             name="description"
                             placeholder="e.g., Credit Card"
                             required
                             className="mt-1"
                           />
                         </div>
                       </div>
                       <Button type="submit" className="w-full bg-warning hover:bg-warning/90">
                         <Plus className="w-4 h-4 mr-2" />
                         Add Debt
                       </Button>
                     </form>
                   </CardContent>
                 </Card>

                 {/* AI Debt Insights */}
                 {totalDebt > 0 && (
                   <Card className="shadow-xl rounded-2xl overflow-hidden">
                     <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                       <CardTitle className="flex items-center gap-2 text-primary">
                         <Brain className="h-5 w-5" />
                         AI Debt Strategy
                       </CardTitle>
                     </CardHeader>
                     <CardContent className="p-6">
                       {/* Debt Overview */}
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                         <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20">
                           <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center">
                             <CreditCard className="h-6 w-6 text-white" />
                           </div>
                           <div>
                             <div className="text-sm font-medium text-warning">Total Debt</div>
                             <div className="text-2xl font-bold">${totalDebt.toLocaleString()}</div>
                           </div>
                         </div>
                         
                         <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-expense/10 to-expense/5 border border-expense/20">
                           <div className="w-12 h-12 bg-expense rounded-lg flex items-center justify-center">
                             <TrendingDown className="h-6 w-6 text-white" />
                           </div>
                           <div>
                             <div className="text-sm font-medium text-expense">Monthly Payments</div>
                             <div className="text-2xl font-bold">${monthlyDebtPayment.toLocaleString()}</div>
                           </div>
                         </div>
                         
                         <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                           <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center">
                             <TrendingUp className="h-6 w-6 text-white" />
                           </div>
                           <div>
                             <div className="text-sm font-medium text-success">Available for Debt</div>
                             <div className={`text-2xl font-bold ${availableForDebt >= monthlyDebtPayment ? 'text-success' : 'text-expense'}`}>
                               ${availableForDebt.toLocaleString()}
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* AI Assessment */}
                       <div className="mb-6">
                         <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                             <Brain className="h-5 w-5 text-white" />
                           </div>
                           <h3 className="text-lg font-semibold">Debt Analysis</h3>
                         </div>
                         
                         <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                           <div className="flex items-start gap-4">
                             <div className={`w-4 h-4 rounded-full mt-2 ${availableForDebt >= monthlyDebtPayment ? 'bg-success' : 'bg-expense'}`}></div>
                             <div className="flex-1">
                               <h4 className="font-semibold mb-2">
                                 {availableForDebt >= monthlyDebtPayment ? 
                                   "Manageable Debt Situation" :
                                   "Debt Needs Attention"
                                 }
                               </h4>
                               <p className="text-muted-foreground mb-3">
                                 {availableForDebt >= monthlyDebtPayment ? 
                                   "You have enough funds to cover your debt payments. Focus on paying extra to become debt-free faster." :
                                   "Your available funds are insufficient for debt payments. Prioritize increasing income or reducing expenses."
                                 }
                               </p>
                               <div className="flex items-center gap-2 text-sm">
                                 <span className="font-medium">Status:</span>
                                 <span className={`font-medium ${availableForDebt >= monthlyDebtPayment ? 'text-success' : 'text-expense'}`}>
                                   {availableForDebt >= monthlyDebtPayment ? 'Can Afford Payments' : 'Need More Income'}
                                 </span>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* Debt Timeline */}
                       <div className="mb-6">
                         <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 bg-gradient-to-br from-success to-success/80 rounded-lg flex items-center justify-center">
                             <BarChart3 className="h-5 w-5 text-white" />
                           </div>
                           <h3 className="text-lg font-semibold">Debt-Free Timeline</h3>
                         </div>
                         
                         <div className="p-6 rounded-xl bg-gradient-to-r from-success/5 to-success/10 border border-success/20">
                           <div className="text-center">
                             <div className="text-3xl font-bold text-success mb-2">
                               {availableForDebt > monthlyDebtPayment ? 
                                 `${Math.ceil(totalDebt / (availableForDebt - monthlyDebtPayment))} months` :
                                 'Focus on income first'
                               }
                             </div>
                             <p className="text-muted-foreground mb-3">
                               {availableForDebt > monthlyDebtPayment ? 
                                 'Estimated time to become debt-free' :
                                 'Increase available funds to start debt payoff'
                               }
                             </p>
                             <div className="text-sm font-medium">
                               {availableForDebt > monthlyDebtPayment ? 
                                 `Extra payment: $${(availableForDebt - monthlyDebtPayment).toLocaleString()}/month` :
                                 `Need additional: $${(monthlyDebtPayment - availableForDebt).toLocaleString()}/month`
                               }
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* Action Items */}
                       <div>
                         <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 bg-gradient-to-br from-warning to-warning/80 rounded-lg flex items-center justify-center">
                             <TrendingUp className="h-5 w-5 text-white" />
                           </div>
                           <h3 className="text-lg font-semibold">Actions to Pay Debt Faster</h3>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                             <div className="flex items-center gap-2 mb-2">
                               <div className="w-2 h-2 bg-success rounded-full"></div>
                               <span className="font-medium text-success">Side Hustle</span>
                             </div>
                             <p className="text-sm text-muted-foreground">Freelance 10 hours/week</p>
                             <div className="text-xs text-success font-medium mt-1">Earn ~$500/month</div>
                           </div>
                           
                           <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                             <div className="flex items-center gap-2 mb-2">
                               <div className="w-2 h-2 bg-warning rounded-full"></div>
                               <span className="font-medium text-warning">Cut Expenses</span>
                             </div>
                             <p className="text-sm text-muted-foreground">Reduce dining out by 50%</p>
                             <div className="text-xs text-warning font-medium mt-1">Save ~$200/month</div>
                           </div>
                           
                           <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                             <div className="flex items-center gap-2 mb-2">
                               <div className="w-2 h-2 bg-primary rounded-full"></div>
                               <span className="font-medium text-primary">Negotiate Bills</span>
                             </div>
                             <p className="text-sm text-muted-foreground">Lower bills and subscriptions</p>
                             <div className="text-xs text-primary font-medium mt-1">Save ~$100/month</div>
                           </div>
                           
                           <div className="p-4 rounded-lg bg-expense/10 border border-expense/20">
                             <div className="flex items-center gap-2 mb-2">
                               <div className="w-2 h-2 bg-expense rounded-full"></div>
                               <span className="font-medium text-expense">Sell Items</span>
                             </div>
                             <p className="text-sm text-muted-foreground">Sell unused items</p>
                             <div className="text-xs text-expense font-medium mt-1">Earn ~$300 one-time</div>
                           </div>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 )}

                 {/* Debt List */}
                 <Card className="shadow-xl rounded-2xl overflow-hidden">
                   <CardHeader className="bg-gradient-to-r from-warning/5 to-warning/10 border-b">
                     <CardTitle className="flex items-center gap-2 text-warning">
                       <CreditCard className="h-5 w-5" />
                       Your Debts
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="p-0">
                     {debts.length > 0 ? (
                       <div className="divide-y">
                         {debts.map((debt, index) => (
                           <div key={index} className="p-4 hover:bg-muted/30 transition-colors">
                             <div className="flex items-center justify-between">
                               <div>
                                 <div className="font-medium">{debt.description}</div>
                                 <div className="text-sm text-muted-foreground">
                                   {debt.interestRate}% APR • Min: ${debt.minimumPayment}
                                 </div>
                               </div>
                               <div className="text-right">
                                 <div className="font-semibold text-warning">${debt.amount.toLocaleString()}</div>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => handleDeleteDebt(index)}
                                   className="text-destructive hover:text-destructive"
                                 >
                                   Remove
                                 </Button>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="p-8 text-center text-muted-foreground">
                         No debts recorded yet
                       </div>
                     )}
                   </CardContent>
                 </Card>
               </>
             )}
           </TabsContent>

                      <TabsContent value="profile" className="mt-6">
             {user ? (
               <ProfileChat onComplete={handleProfileComplete} />
             ) : (
               <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                 <div className="text-center">
                   <h3 className="text-lg font-semibold">Authentication Required</h3>
                   <p className="text-muted-foreground">
                     Please sign in to access your profile and save your financial information.
                   </p>
                 </div>
                 <Button 
                   onClick={() => setShowAuthModal(true)}
                   className="flex items-center gap-2"
                 >
                   <LogIn className="w-4 h-4" />
                   Sign In
                 </Button>
               </div>
             )}
           </TabsContent>

                     <TabsContent value="ai-insights" className="mt-6 space-y-6">
             {hasProfile ? (
               <AIRecommendations />
             ) : (
               <Card className="p-8 text-center">
                 <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                 <h3 className="text-lg font-semibold mb-2">Profile Required</h3>
                 <p className="text-muted-foreground mb-4">
                   Please complete your financial profile first to get AI-powered budget recommendations.
                 </p>
                 <Button onClick={() => window.location.hash = '#profile'}>
                   Complete Profile
                 </Button>
               </Card>
             )}
           </TabsContent>
        </Tabs>
        )}

        {/* Transaction Form Modal */}
        {showForm && (
          <TransactionForm
            categories={categories}
            onSubmit={handleAddTransaction}
            onClose={() => setShowForm(false)}
          />
        )}

        {/* Authentication Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode="signin"
          onSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  );
};