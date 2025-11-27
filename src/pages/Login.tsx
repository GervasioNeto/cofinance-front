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

/**
 * 🔧 Mantive o mock, mas deixei isolado (boa prática)
 */
const MOCK_DEV_USER: UserDTO = {
  id: "999",
  name: "Ildo Gostoso",
  email: "dev.user@splitmoney.com",
};

const Login = () => {
  const navigate = useNavigate();
  const { setCurrentUser, currentUser } = useStore();

  /**
   * 🎯 Estados agrupados de forma lógica
   * antes estavam espalhados em 11 useStates diferentes
   */
  const [form, setForm] = useState({
    loginEmail: '',
    loginPassword: '',
    newUserName: '',
    newUserEmail: '',
    newUserPassword: '',
    selectedUserId: '',
  });

  const [users, setUsers] = useState<UserDTO[]>([]);
  const [currentState, setCurrentState] = useState<LoginState>('login');

  const [loading, setLoading] = useState({
    login: false,
    create: false,
  });

  /**
   * 🧼 Função auxiliar para atualizar os inputs
   * reduz MUITO boilerplate
   */
  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));


  /**
   * 🔧 Reduzi o useEffect original
   * agora cada responsabilidade está clara
   */
  useEffect(() => {
    if (currentUser) navigate('/');
  }, [currentUser]);

  useEffect(() => {
    if (currentState === 'select') loadUsers();
  }, [currentState]);


  /**
   * 🔥 Carrega usuários para seleção manual
   */
  const loadUsers = async () => {
    try {
      const data = await api.users.getAll();
      setUsers(data);
    } catch {
      toast.error('Erro ao carregar usuários');
    }
  };

  /**
   * 🔥 Login tradicional
   */
  // const handleTraditionalLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   const { loginEmail, loginPassword } = form;
  //   if (!loginEmail || !loginPassword) {
  //     toast.error('Preencha email e senha.');
  //     return;
  //   }

  //   setLoading((prev) => ({ ...prev, login: true }));

  //   // Simulação
  //   setTimeout(() => {
  //     if (loginEmail === MOCK_DEV_USER.email && loginPassword === "123456") {
  //       setCurrentUser(MOCK_DEV_USER);
  //       toast.success(`Bem-vindo, ${MOCK_DEV_USER.name}! (Bypass Ativo)`);
  //       navigate('/');
  //     } else {
  //       toast.error('Credenciais inválidas.');
  //     }
  //     setLoading((prev) => ({ ...prev, login: false }));
  //   }, 900);
  // };

  const handleTraditionalLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  const { loginEmail, loginPassword } = form;

  if (!loginEmail || !loginPassword) {
    toast.error('Preencha email e senha.');
    return;
  }

  setLoading(prev => ({ ...prev, login: true }));

  try {
    const user = await api.users.login({
      email: loginEmail,
      password: loginPassword,
    });
    console.log('Logged in user:', user);

    setCurrentUser(user);
    toast.success(`Bem-vindo, ${user.name}!`);
    navigate('/');
  } catch {
    toast.error('Credenciais inválidas.');
  } finally {
    setLoading(prev => ({ ...prev, login: false }));
  }
};


  /**
   * ⚡ Bypass rápido — deixei igual mas mais limpo
   */
  const handleDevBypass = () => {
    setCurrentUser(MOCK_DEV_USER);
    toast.success(`Bypass Ativo! Logado como ${MOCK_DEV_USER.name}`);
    navigate('/');
  };


  /**
   * 👤 Login via seleção manual de usuários
   */
  const handleSelectLogin = () => {
    const user = users.find((u) => u.id === form.selectedUserId);
    if (!user) return;
    setCurrentUser(user);
    toast.success(`Bem-vindo, ${user.name}!`);
    navigate('/');
  };


  /**
   * ✨ Criação de usuário
   */
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const { newUserName, newUserEmail, newUserPassword } = form;

    setLoading((prev) => ({ ...prev, create: true }));
    try {
      const newUser = await api.users.create({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
      });

      setCurrentUser(newUser);
      toast.success('Usuário criado com sucesso!');
      navigate('/');
    } catch {
      toast.error('Erro ao criar usuário');
    } finally {
      setLoading((prev) => ({ ...prev, create: false }));
    }
  };


  /**
   * 🎨 Renderização dinâmica dos formulários
   * Agora muito mais organizado e com menos duplicação
   */
  const renderLoginForm = () => {
    switch (currentState) {
      case 'create':
        return (
          <form onSubmit={handleCreateUser} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={form.newUserName}
                onChange={(e) => updateField('newUserName', e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.newUserEmail}
                onChange={(e) => updateField('newUserEmail', e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                value={form.newUserPassword}
                onChange={(e) => updateField('newUserPassword', e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setCurrentState('login')}>
                Voltar
              </Button>
              <Button className="flex-1" type="submit" disabled={loading.create}>
                {loading.create ? 'Criando...' : 'Criar e Entrar'}
              </Button>
            </div>
          </form>
        );

      case 'select':
        return (
          <div className="space-y-4">
            <Label>Selecione um usuário existente</Label>
            <Select
              value={form.selectedUserId}
              onValueChange={(v) => updateField('selectedUserId', v)}
            >
              <SelectTrigger>
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

            <Button className="w-full" onClick={handleSelectLogin} disabled={!form.selectedUserId}>
              Entrar
            </Button>

            <Button variant="outline" className="w-full" onClick={() => setCurrentState('login')}>
              Voltar
            </Button>
          </div>
        );

      default:
        return (
          <form onSubmit={handleTraditionalLogin} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.loginEmail}
                onChange={(e) => updateField('loginEmail', e.target.value)}
                required
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                value={form.loginPassword}
                onChange={(e) => updateField('loginPassword', e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading.login}>
              {loading.login ? 'Entrando...' : 'Entrar'}
            </Button>

            {/* Links inferiores */}
            <div className="flex justify-between text-sm pt-2">
              <Button variant="link" type="button" onClick={() => setCurrentState('create')}>
                Criar Usuário
              </Button>

              <Button variant="link" type="button" onClick={handleDevBypass}>
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
          <CardDescription>Sistema de controle de gastos em grupo</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderLoginForm()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
