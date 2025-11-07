import { UserDTO, GroupDTO, TransactionDTO, CreateUserDTO, CreateGroupDTO, CreateTransactionDTO } from '@/types';

const API_BASE_URL = 'http://localhost:3002/api';

// Users
export const api = {
  users: {
    create: async (data: CreateUserDTO): Promise<UserDTO> => {
      console.log('Creating user with data:', data);
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },

      getUserById: async (userId: string): Promise<UserDTO> => {
      console.log('Fetching user by ID:', userId);
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      return response.json();
    },
    
    getAll: async (): Promise<UserDTO[]> => {
      console.log('Fetching all users');
      const response = await fetch(`${API_BASE_URL}/users`);
      return response.json();
    },
    
    getUserGroups: async (userId: string): Promise<GroupDTO[]> => {
      console.log('Fetching groups for user:', userId);
      const response = await fetch(`${API_BASE_URL}/users/${userId}/groups`);
      return response.json();
    },
    
  getUserTransactions: async (userId: string): Promise<TransactionDTO[]> => {
    console.log('Fetching transactions for user:', userId, 'in group:');
    const response = await fetch(`${API_BASE_URL}/users/${userId}/transactions`);
    if (!response.ok) throw new Error('Erro ao buscar transações do usuário');
    return response.json();
    },

  update: async (userId: string, data: Partial<CreateUserDTO>): Promise<UserDTO> => {
    console.log('Updating group:', userId, 'with data:', data);
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
    },
  },
  
  groups: {
    create: async (data: CreateGroupDTO, userId: string): Promise<GroupDTO> => {
      console.log('Creating group with data:', data, 'for user:', userId);
      const response = await fetch(`${API_BASE_URL}/groups/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    
    getAll: async (): Promise<GroupDTO[]> => {
      console.log('Fetching all groups');
      const response = await fetch(`${API_BASE_URL}/groups`);
      return response.json();
    },
    
    addUserToGroup: async (groupId: string, userId: string): Promise<void> => {
      console.log('Adding user:', userId, 'to group:', groupId);
      await fetch(`${API_BASE_URL}/groups/${groupId}/users/${userId}`, {
        method: 'POST',
      });
    },
    
    getGroupUsers: async (groupId: string): Promise<UserDTO[]> => {
      console.log('Fetching users for group:', groupId);
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/users`);
      return response.json();
    },
    
    getGroupTransactions: async (groupId: string): Promise<TransactionDTO[]> => {
      console.log('Fetching transactions for group:', groupId);
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/transactions`);
      return response.json();
    },

    getGroupById: async (groupId: string): Promise<GroupDTO> => {
      console.log('Fetching group by ID:', groupId);
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}`);
      if (!response.ok) throw new Error('Erro ao buscar grupo');
      return response.json();
    },
    
    update: async (groupId: string, data: Partial<CreateGroupDTO>): Promise<GroupDTO> => {
      console.log('Updating group:', groupId, 'with data:', data);
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    removeUserFromGroup: async (groupId: string, userId: string): Promise<void> => {
      console.log('Removing user:', userId, 'from group:', groupId);
      await fetch(`${API_BASE_URL}/groups/${groupId}/users/${userId}`, {
        method: 'DELETE',
      });
    },
    
    delete: async (groupId: string): Promise<void> => {
      console.log('Deleting group:', groupId);
      await fetch(`${API_BASE_URL}/groups/${groupId}`, {
        method: 'DELETE',
      });
    },
  },
  
  transactions: {
    create: async (groupId: string, data: CreateTransactionDTO): Promise<TransactionDTO> => {
      console.log('Creating transaction in group:', groupId, 'with data:', data);
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
       if (!response.ok) {
        throw new Error(`Erro ao criar transação: ${response.status}`);
      }
      return response.json();
    },
    
    update: async (transactionId: string, data: Partial<CreateTransactionDTO>): Promise<TransactionDTO> => {
      console.log('Updating transaction:', transactionId, 'with data:', data);
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    
    delete: async (transactionId: string): Promise<void> => {
      console.log('Deleting transaction:', transactionId);
      await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'DELETE',
      });
    },
  },
};
