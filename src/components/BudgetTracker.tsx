
import React, { useState } from 'react';
import { DollarSign, Plus, ArrowDownCircle, ArrowUpCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
}

const BudgetTracker = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      description: 'Gig payment - Rockers Cafe',
      amount: 750,
      date: '2025-04-01',
      category: 'Performance',
      type: 'income'
    },
    {
      id: '2',
      description: 'Studio rental',
      amount: 200,
      date: '2025-04-05',
      category: 'Studio',
      type: 'expense'
    },
    {
      id: '3',
      description: 'New guitar strings',
      amount: 45,
      date: '2025-04-07',
      category: 'Equipment',
      type: 'expense'
    }
  ]);
  
  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, 'id'>>({
    description: '',
    amount: 0,
    date: '',
    category: '',
    type: 'income'
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const addTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const transaction = {
      ...newTransaction,
      id: Date.now().toString()
    };
    
    setTransactions([...transactions, transaction]);
    setNewTransaction({
      description: '',
      amount: 0,
      date: '',
      category: '',
      type: 'income'
    });
    
    setDialogOpen(false);
    
    toast({
      title: "Transaction added",
      description: `${transaction.description} has been added to your budget`,
    });
  };
  
  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    toast({
      title: "Transaction removed",
      description: "The transaction has been removed from your budget",
    });
  };
  
  const calculateBalance = () => {
    return transactions.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  };
  
  const calculateTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  };
  
  const calculateTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card className="band-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-band-blue" />
          Budget Tracker
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1">
              <Plus className="h-4 w-4" /> Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant={newTransaction.type === 'income' ? "default" : "outline"}
                  className={`w-full ${newTransaction.type === 'income' ? 'bg-band-green hover:bg-band-green/90' : ''}`}
                  onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                >
                  <ArrowDownCircle className="h-4 w-4 mr-2" />
                  Income
                </Button>
                <Button 
                  variant={newTransaction.type === 'expense' ? "default" : "outline"}
                  className={`w-full ${newTransaction.type === 'expense' ? 'bg-red-500 hover:bg-red-500/90' : ''}`}
                  onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                >
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  Expense
                </Button>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <input
                  className="band-input"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="Description"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <input
                  type="number"
                  className="band-input"
                  value={newTransaction.amount || ''}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <input
                  type="date"
                  className="band-input"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <input
                  className="band-input"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  placeholder="Category (e.g. Equipment, Studio)"
                />
              </div>
              
              <Button onClick={addTransaction} className="w-full mt-4">
                Add Transaction
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-secondary/30 p-3 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className={`text-lg font-bold ${calculateBalance() >= 0 ? 'text-band-green' : 'text-red-400'}`}>
              {formatCurrency(calculateBalance())}
            </p>
          </div>
          <div className="bg-secondary/30 p-3 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Income</p>
            <p className="text-lg font-bold text-band-green">
              {formatCurrency(calculateTotalIncome())}
            </p>
          </div>
          <div className="bg-secondary/30 p-3 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Expenses</p>
            <p className="text-lg font-bold text-red-400">
              {formatCurrency(calculateTotalExpenses())}
            </p>
          </div>
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No transactions yet. Add your first income or expense!
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-band-green/20' : 'bg-red-500/20'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowDownCircle className="h-4 w-4 text-band-green" />
                    ) : (
                      <ArrowUpCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{transaction.description}</h3>
                    <div className="flex text-xs text-muted-foreground">
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                      {transaction.category && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{transaction.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`font-medium ${
                    transaction.type === 'income' ? 'text-band-green' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+ ' : '- '}
                    {formatCurrency(transaction.amount)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full"
                    onClick={() => removeTransaction(transaction.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetTracker;
