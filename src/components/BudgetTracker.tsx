import React, { useState } from 'react';
import { DollarSign, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useBand } from '@/contexts/BandContext';
import { useAuth } from '@/contexts/AuthContext';
import { BudgetItem } from '@/lib/services/BudgetService';
import { format } from 'date-fns';

// Budget categories
const CATEGORIES = [
  'Equipment',
  'Transportation',
  'Studio',
  'Merchandise',
  'Marketing',
  'Venue',
  'Licenses',
  'Food/Drink',
  'Payment',
  'Other'
];

const BudgetTracker = () => {
  const { toast } = useToast();
  const { currentBand } = useBand();
  const { user } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isIncome, setIsIncome] = useState(false);
  
  const {
    data: budgetItems,
    loading,
    error,
    add: addBudgetItem,
    remove: removeBudgetItem
  } = useSupabaseQuery<BudgetItem>({
    table: 'budget_items',
    bandId: currentBand?.id,
    orderBy: { column: 'date', ascending: false }
  });
  
  const handleAddItem = async () => {
    if (!currentBand || !user) {
      toast({
        title: "Error",
        description: "You need to select a band first",
        variant: "destructive"
      });
      return;
    }
    
    if (!description) {
      toast({
        title: "Description required",
        description: "Please enter a description",
        variant: "destructive"
      });
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Valid amount required",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    
    if (!category) {
      toast({
        title: "Category required",
        description: "Please select a category",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addBudgetItem({
        band_id: currentBand.id,
        description,
        amount: parseFloat(amount),
        date,
        category,
        is_income: isIncome,
        created_by: user.id
      });
      
      // Reset form
      setAmount('');
      setDescription('');
      setCategory('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setIsIncome(false);
      
      toast({
        title: "Budget item added",
        description: `Added ${isIncome ? 'income' : 'expense'}: ${description}`,
      });
    } catch (error) {
      console.error('Error adding budget item:', error);
      toast({
        title: "Failed to add budget item",
        description: "There was an error adding your budget item. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteItem = async (id: string, description: string) => {
    try {
      await removeBudgetItem(id);
      
      toast({
        title: "Budget item removed",
        description: `"${description}" has been removed from your budget`,
      });
    } catch (error) {
      console.error('Error removing budget item:', error);
      toast({
        title: "Failed to remove budget item",
        description: "There was an error removing your budget item. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Calculate total income, expenses, and balance
  const totals = budgetItems.reduce((acc, item) => {
    if (item.is_income) {
      acc.income += item.amount;
    } else {
      acc.expenses += item.amount;
    }
    return acc;
  }, { income: 0, expenses: 0 });
  
  const balance = totals.income - totals.expenses;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <Card className="band-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-band-green" />
          Budget
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!currentBand ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Select a band to manage budget</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                <div className="text-xs uppercase text-muted-foreground">Income</div>
                <div className="text-green-600 font-semibold">{formatCurrency(totals.income)}</div>
              </div>
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
                <div className="text-xs uppercase text-muted-foreground">Expenses</div>
                <div className="text-red-600 font-semibold">{formatCurrency(totals.expenses)}</div>
              </div>
              <div className="p-3 rounded-md bg-secondary/20 border border-border">
                <div className="text-xs uppercase text-muted-foreground">Balance</div>
                <div className={`font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance)}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isIncome}
                  onCheckedChange={setIsIncome}
                  id="income-switch"
                />
                <Label htmlFor="income-switch">
                  This is {isIncome ? 'income' : 'an expense'}
                </Label>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="band-input"
                />
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="band-input"
                />
              </div>
              
              <Input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="band-input"
              />
              
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="band-input">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={handleAddItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add {isIncome ? 'Income' : 'Expense'}
              </Button>
            </div>
            
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium">Recent Transactions</h3>
              
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading budget items...
                </div>
              ) : error ? (
                <div className="text-center py-4 text-destructive">
                  <p>Error loading budget items</p>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    Reload
                  </Button>
                </div>
              ) : budgetItems.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No budget items yet. Add your first item above!
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {budgetItems.map(item => (
                    <div 
                      key={item.id} 
                      className={`p-3 rounded-md ${item.is_income ? 'bg-green-500/10' : 'bg-red-500/10'} flex justify-between items-start`}
                    >
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">{item.description}</span>
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-secondary/50">
                            {item.category}
                          </span>
                        </div>
                        <div className="flex space-x-2 text-xs text-muted-foreground mt-1">
                          <span>{formatDate(item.date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${item.is_income ? 'text-green-600' : 'text-red-600'}`}>
                          {item.is_income ? '+' : '-'}{formatCurrency(item.amount)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-full"
                          onClick={() => handleDeleteItem(item.id, item.description)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetTracker;
