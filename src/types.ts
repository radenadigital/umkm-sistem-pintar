export type Role = 'owner' | 'admin' | 'staff';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  businessId: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  logo?: string;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    voice: string;
    identity: string;
  };
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  description: string;
  sku: string;
  supplierId?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchase: string;
  tags: string[];
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'paid' | 'unpaid' | 'overdue';
  dueDate: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  referenceId?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assigneeId?: string;
}

export interface AIResponse {
  id: string;
  type: string;
  prompt: string;
  output: string;
  createdAt: string;
}

export interface KPI {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly';
}
