# Poupix - Sistema de Controle de Gastos em Grupo

Sistema moderno e intuitivo para gerenciar despesas compartilhadas e transações em grupo, desenvolvido com React + TypeScript.

## 🚀 Funcionalidades

### 👥 Gestão de Usuários
- Criar novos usuários
- Visualizar grupos e transações de cada usuário
- Mock de login (selecione ou crie um usuário para "logar")

### 💰 Gestão de Grupos
- Criar e gerenciar grupos de despesas
- Adicionar/remover usuários dos grupos
- Editar informações do grupo (nome, descrição)
- Excluir grupos
- Visualizar membros e transações do grupo

### 💳 Gestão de Transações
- Criar transações (despesas ou receitas)
- Editar transações existentes
- Excluir transações
- Categorizar transações
- Visualizar histórico completo
- Calcular saldos automaticamente

### 📊 Dashboard
- Visão geral de grupos e transações
- Resumo financeiro (despesas, receitas, saldo)
- Transações recentes
- Estatísticas personalizadas

## 🛠️ Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Zustand** - Gerenciamento de estado global
- **React Router** - Navegação
- **React Query** - Gerenciamento de dados assíncronos
- **Lucide React** - Ícones

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.tsx      # Layout principal com navegação
│   └── ui/             # Componentes UI do shadcn
├── pages/              # Páginas da aplicação
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── Login.tsx       # Mock de login
│   ├── Users.tsx       # Lista de usuários
│   ├── UserDetail.tsx  # Detalhes do usuário
│   ├── Groups.tsx      # Lista de grupos
│   └── GroupDetail.tsx # Detalhes do grupo (CRUD completo)
├── services/           # Serviços e APIs
│   └── api.ts         # Cliente REST API
├── store/             # Estado global
│   └── useStore.ts    # Store Zustand
├── types/             # TypeScript types
│   └── index.ts       # DTOs e interfaces
└── index.css          # Design system e estilos globais
```

## 🎨 Design System

O projeto utiliza um design system completo com:
- **Cores temáticas**: Azul/turquesa (confiança), verde (lucros), vermelho (despesas)
- **Gradientes sutis**: Para elementos de destaque
- **Tokens semânticos**: Todas as cores são definidas como variáveis CSS HSL
- **Componentes customizados**: Variantes do shadcn/ui adaptadas ao tema financeiro
- **Responsividade**: Layout adaptável para mobile, tablet e desktop

## 🔌 API REST

O sistema está preparado para integração com backend REST:

### Usuários
- `POST /api/users` - Criar usuário
- `GET /api/users` - Listar usuários
- `GET /api/users/{id}/groups` - Grupos do usuário
- `GET /api/users/{id}/transactions` - Transações do usuário

### Grupos
- `POST /api/groups` - Criar grupo
- `GET /api/groups` - Listar grupos
- `PUT /api/groups/{id}` - Atualizar grupo
- `DELETE /api/groups/{id}` - Excluir grupo
- `POST /api/groups/{groupId}/users/{userId}` - Adicionar usuário ao grupo
- `GET /api/groups/{groupId}/users` - Usuários do grupo
- `GET /api/groups/{groupId}/transactions` - Transações do grupo

### Transações
- `POST /api/groups/{groupId}/transactions` - Criar transação
- `PUT /api/transactions/{id}` - Atualizar transação
- `DELETE /api/transactions/{id}` - Excluir transação

## 🚦 Como Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📝 Estado Global (Zustand)

O estado global gerencia:
- **currentUser**: Usuário logado (mock)
- **groups**: Lista de grupos
- **transactions**: Lista de transações

Funções disponíveis:
- `setCurrentUser(user)` - Define usuário logado
- `logout()` - Limpa usuário
- `setGroups(groups)` - Define grupos
- `addGroup(group)` - Adiciona grupo
- `updateGroup(id, data)` - Atualiza grupo
- `deleteGroup(id)` - Remove grupo
- `setTransactions(transactions)` - Define transações
- `addTransaction(transaction)` - Adiciona transação
- `updateTransaction(id, data)` - Atualiza transação
- `deleteTransaction(id)` - Remove transação

## 🔐 Autenticação Mock

O sistema utiliza autenticação mockada:
1. Acesse a página de login
2. Selecione um usuário existente OU crie um novo
3. O usuário será definido no estado global
4. Navegue pelo sistema como esse usuário
5. Use o botão "Sair" para fazer logout

## 🎯 Próximos Passos

Para conectar a um backend real:
1. Configure a URL base da API em `src/services/api.ts`
2. Implemente autenticação real (JWT, OAuth, etc)
3. Adicione tratamento de erros e loading states
4. Implemente paginação para grandes volumes de dados
5. Adicione validações adicionais nos formulários

## 📄 Licença

Este projeto foi desenvolvido com [Lovable](https://lovable.dev).

---

Desenvolvido com ❤️ usando React + TypeScript
