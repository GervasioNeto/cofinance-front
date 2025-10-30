import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserDTO } from '@/types';
import { toast } from 'sonner';
import { Wallet } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { setCurrentUser, currentUser } = useStore();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
    loadUsers();
  }, [currentUser, navigate]);
  
  const loadUsers = async () => {
    try {
      const data = await api.users.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    }
  };
  
  const handleLogin = () => {
    const user = users.find(u => u.id === selectedUserId);
    if (user) {
      setCurrentUser(user);
      toast.success(`Bem-vindo, ${user.name}!`);
      navigate('/');
    }
  };
  
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newUser = await api.users.create({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword, // Assuming password is added in CreateUserDTO
      });
      
      setCurrentUser(newUser);
      toast.success('Usuário criado e login realizado!');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Poupix</CardTitle>
          <CardDescription>
            Sistema de controle de gastos em grupo
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isCreating ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-select">Selecione um usuário existente</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger id="user-select">
                    <SelectValue placeholder="Escolha um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleLogin}
                disabled={!selectedUserId}
              >
                Entrar
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Ou
                  </span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsCreating(true)}
              >
                Criar novo usuário
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsCreating(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={loading}
                >
                  Criar e Entrar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
