import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { api } from '@/services/api';
import { UserDTO, TransactionDTO } from '@/types';
import { toast } from 'sonner';
import { Plus, Users, Trash2, Edit, ArrowLeft, UserPlus, TrendingUp, TrendingDown, Copy } from 'lucide-react';

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const { currentUser, groups, updateGroup } = store;
  const deleteGroupFromStore = store.deleteGroup;
  const numericGroupId = Number(groupId);
  const [group, setGroup] = useState(
    groups.find(g => g.id === numericGroupId)
  );
  console.log('groups from store:', groups);
  console.log('Initial group state:', group);
  console.log('groupId from params:', groupId);
  console.log(groupId, typeof groupId);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [allUsers, setAllUsers] = useState<UserDTO[]>([]);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
  
  // Form states
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [transactionCategory, setTransactionCategory] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<TransactionDTO | null>(null);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!groupId) {
      navigate('/groups');
      return;
    }
    loadGroupData();
  }, [currentUser, groupId, navigate]);
  
  const loadGroupData = async () => {
    if (!groupId) return;
    
    try {
      const [groupUsers, groupTransactions, allUsersData] = await Promise.all([
        api.groups.getGroupUsers(groupId),
        api.groups.getGroupTransactions(groupId),
        api.users.getAll(),
      ]);
      
      setUsers(groupUsers);
      setTransactions(groupTransactions);
      console.log('groupTransactions:', groupTransactions); 
      setAllUsers(allUsersData);
      
      const currentGroup = groups.find(g => g.id === numericGroupId);
      if (currentGroup) {
        setGroup(currentGroup);
        setEditName(currentGroup.name);
        setEditDescription(currentGroup.description || '');
      }
    } catch (error) {
      toast.error('Erro ao carregar dados do grupo');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return;
    
    try {
      await api.groups.update(groupId, {
        name: editName,
        description: editDescription,
      });
      
      updateGroup(groupId, {
        name: editName,
        description: editDescription,
      });
      
      setGroup(prev => prev ? { ...prev, name: editName, description: editDescription } : prev);
      toast.success('Grupo atualizado com sucesso!');
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao atualizar grupo');
    }
  };
  
  const handleDeleteGroup = async () => {
    if (!groupId) return;
    
    try {
      await api.groups.delete(groupId);
      deleteGroupFromStore(groupId);
      toast.success('Grupo excluído com sucesso!');
      navigate('/groups');
    } catch (error) {
      toast.error('Erro ao excluir grupo');
    }
  };
  
  const handleAddUser = async () => {
    if (!groupId || !selectedUserId) return;
    
    try {
      await api.groups.addUserToGroup(groupId, selectedUserId);
      toast.success('Usuário adicionado ao grupo!');
      setIsAddUserDialogOpen(false);
      setSelectedUserId('');
      loadGroupData();
    } catch (error) {
      toast.error('Erro ao adicionar usuário');
    }
  };
  
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !currentUser) return;
    
    try {
      console.log("currentUser:", currentUser);
      console.log("userId enviado:", currentUser.id)
      await api.transactions.create(groupId, {
        description: transactionDescription,
        amount: parseFloat(transactionAmount),
        groupId,
        userId: currentUser.id,
        type: transactionType,
        category: transactionCategory,
      });
      
      toast.success('Transação criada com sucesso!');
      setIsTransactionDialogOpen(false);
      resetTransactionForm();
      loadGroupData();
    } catch (error) {
      toast.error('Erro ao criar transação');
    }
  };
  
  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    
    try {
      await api.transactions.update(editingTransaction.id, {
        description: transactionDescription,
        amount: parseFloat(transactionAmount),
        type: transactionType,
        category: transactionCategory,
      });
      
      toast.success('Transação atualizada com sucesso!');
      setIsEditTransactionDialogOpen(false);
      setEditingTransaction(null);
      resetTransactionForm();
      loadGroupData();
    } catch (error) {
      toast.error('Erro ao atualizar transação');
    }
  };
  
  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await api.transactions.delete(transactionId);
      toast.success('Transação excluída com sucesso!');
      loadGroupData();
    } catch (error) {
      toast.error('Erro ao excluir transação');
    }
  };
  
  const openEditTransaction = (transaction: TransactionDTO) => {
    setEditingTransaction(transaction);
    setTransactionDescription(transaction.description);
    setTransactionAmount(transaction.amount.toString());
    setTransactionType(transaction.type);
    setTransactionCategory(transaction.category || '');
    setIsEditTransactionDialogOpen(true);
  };
  
  const resetTransactionForm = () => {
    setTransactionDescription('');
    setTransactionAmount('');
    setTransactionType('expense');
    setTransactionCategory('');
  };
  
  const availableUsers = allUsers.filter(
    u => !users.some(gu => gu.id === u.id)
  );
  
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

  if (!numericGroupId) {
    return (
      <Layout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Grupo não encontrado</p>
            <Button className="mt-4" onClick={() => navigate('/groups')}>
              Voltar para Grupos
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/groups')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold">{group.name}</h2>
              {group.description && (
                <p className="text-muted-foreground">{group.description}</p>
              )}
              <div className="text-xs flex items-center gap-1 text-muted-foreground mt-0">
              <span>{group.uuid}</span>
                  <button 
                       onClick={(e) => {
                        e.stopPropagation(); // para o evento não subir para o card
                        navigator.clipboard.writeText(group.uuid);
                        toast.success('Identificador do grupo copiado!');
                      }}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Copiar UUID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Grupo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome do Grupo</Label>
                    <Input
                      id="edit-name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Textarea
                      id="edit-description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Salvar Alterações
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O grupo e todas as suas transações serão excluídos permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteGroup}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-accent' : 'text-destructive'}`}>
                R$ {balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Members Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Membros</CardTitle>
                <CardDescription>{users.length} membros no grupo</CardDescription>
              </div>
              
              <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Adicionar Membro
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Membro ao Grupo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Selecione um usuário</Label>
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha um usuário" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      onClick={handleAddUser} 
                      className="w-full"
                      disabled={!selectedUserId}
                    >
                      Adicionar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum membro ainda. Adicione membros ao grupo!
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Transactions Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transações</CardTitle>
                <CardDescription>{transactions.length} transações registradas</CardDescription>
              </div>
              
              <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Transação
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Transação</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTransaction} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Input
                        id="description"
                        value={transactionDescription}
                        onChange={(e) => setTransactionDescription(e.target.value)}
                        placeholder="Ex: Almoço no restaurante"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount">Valor (R$)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={transactionAmount}
                        onChange={(e) => setTransactionAmount(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select value={transactionType} onValueChange={(value: 'expense' | 'income') => setTransactionType(value)}>
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">Despesa</SelectItem>
                          <SelectItem value="income">Receita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria (opcional)</Label>
                      <Input
                        id="category"
                        value={transactionCategory}
                        onChange={(e) => setTransactionCategory(e.target.value)}
                        placeholder="Ex: Alimentação, Transporte..."
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Criar Transação
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const user = allUsers.find(u => u.id === transaction.userId);
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{transaction.description}</p>
                          {transaction.category && (
                            <span className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded">
                              {transaction.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{user?.name || 'Usuário desconhecido'}</span>
                          <span>•</span>
                          <span>{new Date(transaction.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`text-lg font-bold ${transaction.type === 'income' ? 'text-accent' : 'text-destructive'}`}>
                          {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditTransaction(transaction)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTransaction(transaction.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma transação ainda. Crie a primeira transação!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Transaction Dialog */}
      <Dialog open={isEditTransactionDialogOpen} onOpenChange={setIsEditTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTransaction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={transactionDescription}
                onChange={(e) => setTransactionDescription(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Valor (R$)</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-type">Tipo</Label>
              <Select value={transactionType} onValueChange={(value: 'expense' | 'income') => setTransactionType(value)}>
                <SelectTrigger id="edit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <Input
                id="edit-category"
                value={transactionCategory}
                onChange={(e) => setTransactionCategory(e.target.value)}
              />
            </div>
            
            <Button type="submit" className="w-full">
              Salvar Alterações
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default GroupDetail;
