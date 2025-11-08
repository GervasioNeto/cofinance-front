import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/services/api';
import { toast } from 'sonner';
<<<<<<< Updated upstream
import { Plus, Users, Wallet } from 'lucide-react';
import { Copy } from "lucide-react";
=======
// NOVO: Importa o ícone Search
import { Plus, Users, Wallet, Search } from 'lucide-react';
import { GroupDTO } from '@/types';
>>>>>>> Stashed changes

const Groups = () => {
  const navigate = useNavigate();
  const { currentUser, groups, setGroups } = useStore();
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadGroups();
  }, [currentUser, navigate]);

  const loadGroups = async () => {
    try {
      //  const data = await api.groups.getAll();
      const data = await api.users.getUserGroups(String(currentUser?.id));
      setGroups(data);
    } catch (error) {
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !currentUser) {
      return;
    }

    setCreating(true);

    try {
      const newGroup = await api.groups.create({
        name: newGroupName,
        description: newGroupDescription,
        creatorId: currentUser.id,
      });

      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setNewGroupDescription('');
      setIsDialogOpen(false);
      toast.success('Grupo criado com sucesso!');
    } catch (error) {
      toast.error('Falha ao criar grupo');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-center text-muted-foreground">Carregando grupos...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Grupos</h2>
            <p className="text-muted-foreground">
              Gerencie seus grupos de despesas
            </p>
          </div>


          <div className="flex gap-2">


            <Button
              onClick={() => navigate('/groups/search')}
              className="gap-2"
              variant="outline"
            >
              <Search className="w-4 h-4" />
              Buscar Grupos
            </Button>


            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Grupo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Grupo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Grupo</Label>
                    <Input
                      id="name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Ex: Viagem à Praia"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Textarea
                      id="description"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      placeholder="Descreva o objetivo do grupo..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={creating}>
                    {creating ? 'Criando...' : 'Criar Grupo'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{group.name}</CardTitle>
                    {group.description && (
                      <CardDescription className="line-clamp-2 mt-1">
                        {group.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{group.users?.length || 0} membros</span>
                  <span className="mx-1">•</span>
                  <span>{group.transactions?.length || 0} transações</span>
                </div>
                <div className="text-xs flex items-center gap-1 text-muted-foreground mt-2">
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
              </CardContent>
            </Card>
          ))}
        </div>

        {groups.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhum grupo cadastrado ainda.
                <br />
                Crie o primeiro grupo para começar a controlar suas despesas!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Groups;