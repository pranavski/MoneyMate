import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import type { Transaction } from './BudgetDashboard';

interface TransactionFormProps {
  categories: {
    income: string[];
    expense: string[];
  };
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

export const TransactionForm = ({ categories, onSubmit, onClose }: TransactionFormProps) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !description) return;

    onSubmit({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date
    });

    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl">
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${type === 'income' ? 'bg-gradient-to-r from-success/10 to-success/5' : 'bg-gradient-to-r from-expense/10 to-expense/5'}`}>
          <CardTitle className={`text-lg flex items-center gap-2 ${type === 'income' ? 'text-success' : 'text-expense'}`}>
            {type === 'income' ? '💰 Add Income' : '💸 Add Expense'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-black/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">Transaction Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={type === 'income' ? 'default' : 'outline'}
                  onClick={() => setType('income')}
                  className={`${type === 'income' ? 'bg-success hover:bg-success/90 text-white' : 'hover:bg-success/10'}`}
                >
                  💰 Income
                </Button>
                <Button
                  type="button"
                  variant={type === 'expense' ? 'default' : 'outline'}
                  onClick={() => setType('expense')}
                  className={`${type === 'expense' ? 'bg-expense hover:bg-expense/90 text-white' : 'hover:bg-expense/10'}`}
                >
                  💸 Expense
                </Button>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories[type].map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="min-h-[80px]"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className={`w-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${type === 'income' 
                ? 'bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success' 
                : 'bg-gradient-to-r from-expense to-expense/90 hover:from-expense/90 hover:to-expense'
              } text-white`}
            >
              {type === 'income' ? '💰 Add Income' : '💸 Add Expense'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};