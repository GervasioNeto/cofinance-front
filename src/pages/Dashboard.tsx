import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { Users, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import Footer from '@/components/Footer';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, groups, setGroups, transactions, setTransactions } = useStore();
  const userGroups = currentUser?.groups || [];
  const [loading, setLoading] = useState(true);
  console.log(useStore.getState());
  console.log('Current User:', currentUser);
  console.log('User Groups:', userGroups);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    loadData();
  }, [currentUser, navigate]);
  
  const loadData = async () => {
    try {
      const [groupsData, transactionsData] = await Promise.all([
        api.groups.getAll(),
        currentUser ? api.users.getUserTransactions(currentUser.id) : Promise.resolve([]),
      ]);
      
      setGroups(groupsData);
      setTransactions(transactionsData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpenses;
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="flex flex-col min-h-screen">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {currentUser?.name}!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Grupos
              </CardTitle>
              <Wallet className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userGroups.length}</div>
              <Button
                variant="link"
                className="p-0 h-auto text-xs"
                onClick={() => navigate('/groups')}
              >
                Ver todos os grupos
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Transações
              </CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">
                Total de transações
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Despesas
              </CardTitle>
              <TrendingDown className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                R$ {totalExpenses.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total gasto
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receitas
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                R$ {totalIncome.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total recebido
              </p>
            </CardContent>
          </Card>
        </div>
        
        {transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className={`font-bold ${transaction.type === 'income' ? 'text-accent' : 'text-destructive'}`}>
                      {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
        <Footer />
            </div>
    </Layout>
  );
};

export default Dashboard;
