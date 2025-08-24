import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';

interface OnboardingFormProps {
  onComplete: (data: { income: number; expenses: number; debt: number }) => void;
}

export const OnboardingForm = ({ onComplete }: OnboardingFormProps) => {
  const [formData, setFormData] = useState({
    income: '',
    expenses: '',
    debt: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const income = parseFloat(formData.income) || 0;
      const expenses = parseFloat(formData.expenses) || 0;
      const debt = parseFloat(formData.debt) || 0;

      if (income === 0 && expenses === 0 && debt === 0) {
        toast({
          title: "Please enter your financial information",
          description: "At least one field should have a value to get started.",
          variant: "destructive"
        });
        return;
      }

      onComplete({ income, expenses, debt });
      
      toast({
        title: "Welcome to MoneyMate!",
        description: "Your financial dashboard is now set up. Start tracking your finances!"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Welcome to MoneyMate! Let's Get Started
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <p className="text-muted-foreground">
            To provide you with the best financial insights, please share your current financial situation.
            Don't worry - this information is private and secure.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="income" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Monthly Income
              </Label>
                             <Input
                 id="income"
                 type="number"
                 value={formData.income}
                 onChange={(e) => setFormData(prev => ({ ...prev, income: e.target.value }))}
                 placeholder="0"
                 min="0"
                 step="1"
                 className="mt-2"
               />
              <p className="text-xs text-muted-foreground mt-1">
                Your total monthly income
              </p>
            </div>

            <div>
              <Label htmlFor="expenses" className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                Monthly Expenses
              </Label>
                             <Input
                 id="expenses"
                 type="number"
                 value={formData.expenses}
                 onChange={(e) => setFormData(prev => ({ ...prev, expenses: e.target.value }))}
                 placeholder="0"
                 min="0"
                 step="1"
                 className="mt-2"
               />
              <p className="text-xs text-muted-foreground mt-1">
                Your total monthly expenses
              </p>
            </div>

            <div>
              <Label htmlFor="debt" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-orange-600" />
                Total Debt
              </Label>
                             <Input
                 id="debt"
                 type="number"
                 value={formData.debt}
                 onChange={(e) => setFormData(prev => ({ ...prev, debt: e.target.value }))}
                 placeholder="0"
                 min="0"
                 step="1"
                 className="mt-2"
               />
              <p className="text-xs text-muted-foreground mt-1">
                Your total outstanding debt
              </p>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Why we ask for this information:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Provide personalized budget recommendations</li>
              <li>• Calculate your debt-to-income ratio</li>
              <li>• Suggest optimal savings strategies</li>
              <li>• Track your financial progress over time</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Setting up your dashboard...' : 'Get Started with MoneyMate'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
