export interface UserDTO {
  id: string;
  name: string;
  email: string;
  groups?: GroupDTO[];
  transactions?: TransactionDTO[];
}

export interface GroupDTO {
  id: string;
  name: string;
  uuid: string;
  description?: string;
  createdAt: string;
  users?: UserDTO[];
  transactions?: TransactionDTO[];
}

export interface TransactionDTO {
  id: string;
  description: string;
  amount: number;
  groupId: string;
  userId: string;
  createdAt: string;
  type: 'expense' | 'income';
  category?: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface CreateGroupDTO {
  name: string;
  description?: string;
}

export interface CreateTransactionDTO {
  description: string;
  amount: number;
  groupId: string;
  userId: string;
  type: 'expense' | 'income';
  category?: string;
}
