import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { UserDTO, GroupDTO, TransactionDTO } from '@/types';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Wallet, TrendingUp, TrendingDown, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';

const UserProfile = () => {
  const navigate = useNavigate();
  const { currentUser } = useStore();

  const [userProfile, setUserProfile] = useState<UserDTO | null>(null);
  const [userGroups, setUserGroups] = useState<GroupDTO[]>([]);
  const [userTransactions, setUserTransactions] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado do diálogo de edição
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

// Campos do formulário de edição
const [editName, setEditName] = useState('');
const [editEmail, setEditEmail] = useState('');
const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadUserData();
  }, [currentUser, navigate]);

  const loadUserData = async () => {
    if (!currentUser) return;

    try {
      const [profileData, groups, transactions] = await Promise.all([
        api.users.getUserById(String(currentUser.id)),
        api.users.getUserGroups(String(currentUser.id)),
        api.users.getUserTransactions(String(currentUser.id)),
      ]);

      setUserProfile(profileData);
      setEditName(profileData.name);
setEditEmail(profileData.email);
      setUserGroups(groups);
      setUserTransactions(transactions);
    } catch (error) {
      toast.error('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!currentUser) return;

  try {
    const updateData: Record<string, string> = {
      name: editName,
      email: editEmail,
    };

    // Adiciona a senha apenas se for preenchida (não vazia e não nula)
    if (editPassword && editPassword.trim() !== '') {
      updateData.password = editPassword;
    }

    await api.users.update(String(currentUser.id), updateData);

    console.log('dados', editEmail, editName, editPassword);
    toast.success('Perfil atualizado com sucesso!');
    setIsEditDialogOpen(false);
    loadUserData(); // recarrega os dados atualizados
  } catch (error) {
    toast.error('Erro ao atualizar perfil');
  }
};

  const totalExpenses = userTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = userTransactions
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

  if (!userProfile) {
    return (
      <Layout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Usuário não encontrado</p>
            <Button className="mt-4" onClick={() => navigate('/')}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col mr-5">
            <h2 className="text-3xl font-bold">{userProfile.name}</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <p>{userProfile.email}</p>
            </div>
          </div>
            {/* Botão e Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="w-4 h-4" />
            Editar Perfil
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">E-mail</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">Nova Senha (opcional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Deixe em branco para manter a atual"
              />
            </div>

            <Button type="submit" className="w-full">
              Salvar Alterações
            </Button>
          </form>
        </DialogContent>
      </Dialog>
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

        {/* Groups Section */}
        <Card>
          <CardHeader>
            <CardTitle>Grupos</CardTitle>
            <CardDescription>{userGroups.length} {userGroups.length === 1 ? 'grupo' : 'grupos'} participando</CardDescription>
          </CardHeader>
          <CardContent>
            {userGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{group.name}</p>
                      {group.description && (
                        <p className="text-sm text-muted-foreground truncate">{group.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Este usuário ainda não participa de nenhum grupo.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Transactions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Transações</CardTitle>
            <CardDescription>{userTransactions.length} {userTransactions.length === 1 ? 'transação' : 'transações'} realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            {userTransactions.length > 0 ? (
              <div className="space-y-3">
                {userTransactions.map((transaction) => {
                  const group = userGroups.find(g => g.id === transaction.groupId);
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/groups/${transaction.groupId}`)}
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
                          <span>{group?.name || 'Grupo desconhecido'}</span>
                          <span>•</span>
                          <span>{new Date(transaction.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      <div className={`text-lg font-bold ${transaction.type === 'income' ? 'text-accent' : 'text-destructive'}`}>
                        {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Este usuário ainda não realizou nenhuma transação.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UserProfile;
