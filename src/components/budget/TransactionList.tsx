import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import type { Transaction } from './BudgetDashboard';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const TransactionList = ({ transactions, onDelete }: TransactionListProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Recent Transactions
          <Badge variant="secondary">{transactions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No transactions yet. Add your first transaction!
            </div>
          ) : (
            <div className="divide-y">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'income' 
                          ? 'bg-income-light text-income' 
                          : 'bg-expense-light text-expense'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              transaction.type === 'income'
                                ? 'border-income/30 text-income'
                                : 'border-expense/30 text-expense'
                            }`}
                          >
                            {transaction.category}
                          </Badge>
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${
                        transaction.type === 'income' ? 'text-income' : 'text-expense'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(transaction.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};