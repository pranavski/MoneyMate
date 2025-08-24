import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  BarChart3,
  PiggyBank,
  CreditCard,
  Zap,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  expenseBreakdown: { [key: string]: number };
  topExpenseCategory: string;
  biggestExpense: number;
  monthlyTrend: 'increasing' | 'decreasing' | 'stable';
}

export const AIRecommendations = () => {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();

  // Load financial data on mount
  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (transactionsError) throw transactionsError;

      if (transactions && transactions.length > 0) {
        const income = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');
        
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        // Calculate expense breakdown
        const expenseBreakdown: { [key: string]: number } = {};
        expenses.forEach(expense => {
          expenseBreakdown[expense.category] = (expenseBreakdown[expense.category] || 0) + expense.amount;
        });

        // Find top expense category
        const topExpenseCategory = Object.keys(expenseBreakdown).reduce((a, b) => 
          expenseBreakdown[a] > expenseBreakdown[b] ? a : b, 'Other'
        );

        const biggestExpense = expenseBreakdown[topExpenseCategory] || 0;

        // Simple trend calculation (mock data for now)
        const monthlyTrend = balance > 0 ? 'increasing' : 'decreasing';

        setFinancialData({
          totalIncome,
          totalExpenses,
          balance,
          savingsRate,
          expenseBreakdown,
          topExpenseCategory,
          biggestExpense,
          monthlyTrend
        });

        setLastUpdated(new Date().toLocaleDateString());
      }
    } catch (error: any) {
      console.error('Error loading financial data:', error);
    }
  };

  const generateRecommendations = async () => {
    setIsLoading(true);
    
    try {
      await loadFinancialData();
      
      toast({
        title: "Financial Analysis Complete!",
        description: "Your personalized insights are ready."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze your finances",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSavingsMessage = (savingsRate: number) => {
    if (savingsRate >= 30) return "You're a savings superstar! 🌟";
    if (savingsRate >= 20) return "Great job with your savings! 💪";
    if (savingsRate >= 10) return "You're on the right track! 👍";
    if (savingsRate >= 0) return "You're breaking even - let's improve! 📈";
    return "Let's get you back on track! 🎯";
  };

  const getExpenseAdvice = (category: string, amount: number, totalExpenses: number) => {
    const percentage = (amount / totalExpenses) * 100;
    
    if (category === 'Food & Dining' && percentage > 30) {
      return "Consider meal prepping to cut dining costs! 🍳";
    }
    if (category === 'Transportation' && percentage > 25) {
      return "Look into carpooling or public transport options! 🚌";
    }
    if (category === 'Shopping' && percentage > 20) {
      return "Try the 24-hour rule before making purchases! 🛍️";
    }
    if (category === 'Entertainment' && percentage > 15) {
      return "Explore free activities in your area! 🎭";
    }
    return "This category looks well-managed! ✅";
  };

  const getPersonalizedTips = (data: FinancialData) => {
    const tips = [];
    
    if (data.savingsRate < 20) {
      tips.push({
        icon: <PiggyBank className="h-4 w-4" />,
        title: "Boost Your Savings",
        description: "Aim to save 20% of your income for financial security",
        action: "Set up automatic transfers to a savings account"
      });
    }
    
    if (data.biggestExpense > data.totalExpenses * 0.4) {
      tips.push({
        icon: <Target className="h-4 w-4" />,
        title: "Optimize Your Biggest Expense",
        description: `${data.topExpenseCategory} is taking up ${((data.biggestExpense / data.totalExpenses) * 100).toFixed(1)}% of your spending`,
        action: "Look for ways to reduce this category"
      });
    }
    
    if (data.balance < 0) {
      tips.push({
        icon: <AlertCircle className="h-4 w-4" />,
        title: "Address Overspending",
        description: "You're spending more than you earn",
        action: "Focus on reducing expenses or increasing income"
      });
    }
    
    if (tips.length === 0) {
      tips.push({
        icon: <CheckCircle className="h-4 w-4" />,
        title: "You're Doing Great!",
        description: "Your finances are well-balanced",
        action: "Consider investing your extra savings"
      });
    }
    
    return tips;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Your Financial Health Check</CardTitle>
                <p className="text-muted-foreground">Personalized insights to help you thrive financially</p>
              </div>
            </div>
            {lastUpdated && (
              <Badge variant="secondary" className="text-xs">
                Updated: {lastUpdated}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {!financialData ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ready for Your Financial Analysis?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Let me analyze your spending patterns and give you personalized recommendations to improve your financial health.
            </p>
            <Button 
              onClick={generateRecommendations} 
              disabled={isLoading}
              size="lg"
              className="min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Your Finances...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Start Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-success">Monthly Income</p>
                    <p className="text-2xl font-bold">${financialData.totalIncome.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-expense/10 to-expense/5 border-expense/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-expense rounded-lg flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-expense">Monthly Expenses</p>
                    <p className="text-2xl font-bold">${financialData.totalExpenses.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">Available</p>
                    <p className={`text-2xl font-bold ${financialData.balance >= 0 ? 'text-success' : 'text-expense'}`}>
                      ${financialData.balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Savings Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-success to-success/80 rounded-lg flex items-center justify-center">
                  <PiggyBank className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Your Savings Performance</CardTitle>
                  <p className="text-sm text-muted-foreground">{getSavingsMessage(financialData.savingsRate)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Savings Rate</span>
                <span className="text-lg font-bold text-success">{financialData.savingsRate.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(financialData.savingsRate, 100)} className="h-3" />
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">Goal</div>
                  <div className="font-bold">20%</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Current</div>
                  <div className="font-bold text-success">{financialData.savingsRate.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Status</div>
                  <div className={`font-bold ${financialData.savingsRate >= 20 ? 'text-success' : 'text-warning'}`}>
                    {financialData.savingsRate >= 20 ? 'On Track' : 'Needs Work'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-warning to-warning/80 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Where Your Money Goes</CardTitle>
                  <p className="text-sm text-muted-foreground">Understanding your spending patterns</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(financialData.expenseBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, amount]) => {
                    const percentage = (amount / financialData.totalExpenses) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category}</span>
                          <span className="text-sm text-muted-foreground">
                            ${amount.toLocaleString()} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {getExpenseAdvice(category, amount, financialData.totalExpenses)}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Personalized Recommendations */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Personalized Recommendations</CardTitle>
                  <p className="text-sm text-muted-foreground">Tailored advice based on your financial situation</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getPersonalizedTips(financialData).map((tip, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50 border">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                        {tip.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{tip.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{tip.description}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <Zap className="h-3 w-3 text-primary" />
                          <span className="font-medium text-primary">{tip.action}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-success to-success/80 rounded-lg flex items-center justify-center">
                  {financialData.monthlyTrend === 'increasing' ? (
                    <ArrowUp className="h-5 w-5 text-white" />
                  ) : financialData.monthlyTrend === 'decreasing' ? (
                    <ArrowDown className="h-5 w-5 text-white" />
                  ) : (
                    <BarChart3 className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <CardTitle>Monthly Trend</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {financialData.monthlyTrend === 'increasing' ? 
                      "Your finances are improving! 📈" :
                      financialData.monthlyTrend === 'decreasing' ? 
                      "Let's turn this around! 🎯" :
                      "Stable financial situation 📊"
                    }
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  financialData.monthlyTrend === 'increasing' ? 'text-success' :
                  financialData.monthlyTrend === 'decreasing' ? 'text-expense' : 'text-primary'
                }`}>
                  {financialData.monthlyTrend === 'increasing' ? '↗️ Improving' :
                   financialData.monthlyTrend === 'decreasing' ? '↘️ Declining' : '→ Stable'}
                </div>
                <p className="text-muted-foreground">
                  {financialData.monthlyTrend === 'increasing' ? 
                    "Keep up the great work! Your financial habits are paying off." :
                    financialData.monthlyTrend === 'decreasing' ? 
                    "Focus on the recommendations above to improve your situation." :
                    "Your finances are stable. Consider the tips above to optimize further."
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Refresh Button */}
          <div className="flex justify-center">
            <Button 
              onClick={generateRecommendations} 
              disabled={isLoading}
              variant="outline"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Analysis...
                </>
              ) : (
                                 <>
                   <RotateCcw className="mr-2 h-4 w-4" />
                   Refresh Analysis
                 </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};