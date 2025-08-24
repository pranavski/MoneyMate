import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Transaction } from './BudgetDashboard';

interface CategoryChartProps {
  transactions: Transaction[];
}

const EXPENSE_COLORS = [
  'hsl(0, 84%, 60%)',    // Red
  'hsl(20, 84%, 60%)',   // Orange
  'hsl(40, 84%, 60%)',   // Yellow-orange
  'hsl(60, 84%, 60%)',   // Yellow
  'hsl(280, 84%, 60%)',  // Purple
  'hsl(300, 84%, 60%)',  // Magenta
  'hsl(320, 84%, 60%)',  // Pink
];

export const CategoryChart = ({ transactions }: CategoryChartProps) => {
  const expenseData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals: Record<string, number> = {};

    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: ((amount / expenses.reduce((sum, t) => sum + t.amount, 0)) * 100).toFixed(1)
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);

  if (expenseData.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <p>No expenses to display</p>
            <p className="text-sm">Add some expense transactions to see the breakdown</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total expenses: ${totalExpenses.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {expenseData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};