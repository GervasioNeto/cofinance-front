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

type LoginState = 'login' | 'create' | 'select';


const MOCK_DEV_USER: UserDTO = {
  id: "999",
  name: "Ildo Gostoso",
  email: "dev.user@splitmoney.com",

};

const Login = () => {
  const navigate = useNavigate();
  const { setCurrentUser, currentUser, groups } = useStore();

  const [users, setUsers] = useState<UserDTO[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');


  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);


  const [isCreating, setIsCreating] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);

  const [currentState, setCurrentState] = useState<LoginState>('login');

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
    if (currentState === 'select') {
      loadUsers();
    }
  }, [currentUser, navigate, currentState]);

  const loadUsers = async () => {
    try {
      const data = await api.users.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    }
  };

  const handleTraditionalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLogin(true);

    if (!loginEmail || !loginPassword) {
      toast.error('Preencha email e senha.');
      setLoadingLogin(false);
      return;
    }

    setTimeout(() => {

      if (loginEmail === MOCK_DEV_USER.email && loginPassword === "123456") {
        setCurrentUser(MOCK_DEV_USER);
        toast.success(`Bem-vindo, ${MOCK_DEV_USER.name}! (Bypass Ativo)`);
        navigate('/');
      } else {
        toast.error('Credenciais inválidas. Use o seletor de usuário ou crie uma conta.');
      }
      setLoadingLogin(false);
    }, 1000);
  };


  const handleDevBypass = () => {

    setCurrentUser(MOCK_DEV_USER);


    toast.success(`Bypass Ativo! Logado como ${MOCK_DEV_USER.name}`);
    navigate('/dashboard');
  };

  const handleSelectLogin = () => {
    const user = users.find(u => u.id === selectedUserId);
    if (user) {
      setCurrentUser(user);
      toast.success(`Bem-vindo, ${user.name}!`);
      navigate('/');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCreate(true);
    try {
      const newUser = await api.users.create({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
      });

      setCurrentUser(newUser);
      toast.success('Usuário criado e login realizado!');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao criar usuário');
    } finally {
      setLoadingCreate(false);
    }
  };

  const renderLoginForm = () => {
    switch (currentState) {
      case 'create':
        return (
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
                onClick={() => setCurrentState('login')}
              >
                Voltar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loadingCreate}
              >
                {loadingCreate ? 'Criando...' : 'Criar e Entrar'}
              </Button>
            </div>
          </form>
        );

      case 'select':
        return (
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
              onClick={handleSelectLogin}
              disabled={!selectedUserId}
            >
              Entrar (Seleção Manual)
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setCurrentState('login')}
            >
              Voltar para Login
            </Button>
          </div>
        );

      case 'login':
      default:
        return (
          <form onSubmit={handleTraditionalLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-senha">Senha</Label>
              <Input
                id="login-senha"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loadingLogin}>
              {loadingLogin ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="flex justify-between items-center text-sm pt-2">
              <Button
                variant="link"
                type="button"
                onClick={() => setCurrentState('create')}
                className="p-0 h-auto"
              >
                Criar Novo Usuário
              </Button>


              <Button
                variant="link"
                type="button"
                onClick={handleDevBypass}
                className="p-0 h-auto text-muted-foreground hover:text-primary"
              >
                (Auto-Login)
              </Button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">SplitMoney</CardTitle>
          <CardDescription>
            Sistema de controle de gastos em grupo
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderLoginForm()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;