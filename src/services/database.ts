export interface Transaction {
  id: string;
  userId: string;
  description: string;
  type: 'Income' | 'Expense';
  amount: number;
  date: string;
  category: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  status: string;
  image?: string;
}

export interface Supplier {
  id: string;
  userId: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  notes?: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: 'Retail' | 'Grosir';
  notes: string;
  totalOrders: number;
  lastOrder: string;
  tier: 'Gold' | 'Silver' | 'Bronze';
  points: number;
}

export interface ReceiptData {
  id: string;
  userId: string;
  receiptNumber: string;
  date: string;
  customerName: string;
  amount: number;
  description: string;
  receivedFrom: string;
  paymentMethod: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface InvoiceData {
  id: string;
  userId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  notes?: string;
}

export interface Course {
  id: string;
  userId: string;
  title: string;
  description: string;
  youtubeUrl: string;
  videoId: string;
  category: string;
  createdAt: number;
}

interface ProductService {
  id: string;
  name: string;
  description: string;
  usp: string;
}

export interface BusinessProfile {
  userId: string;
  general: {
    name: string;
    description: string;
    category: string;
    foundedYear: string;
    address: string;
    email: string;
    phone: string;
    website: string;
  };
  branding: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    tagline: string;
    coreValues: string[];
  };
  products: ProductService[];
  targetMarket: {
    segments: string;
    characteristics: string;
    painPoints: string;
  };
  usp: {
    competitiveEdge: string;
    differentiation: string;
  };
}

export interface User {
  id: string;
  email: string;
  password: string; // In real app we should hash this!
  name: string;
  role: 'Admin' | 'User'; // Role property!
  createdAt: number;
}

export interface UserData {
  transactions: Transaction[];
  products: Product[];
  suppliers: Supplier[];
  customers: Customer[];
  receipts: ReceiptData[];
  invoices: InvoiceData[];
  courses: Course[];
  categories: string[];
  profile: BusinessProfile;
  setup: boolean;
}

export interface Database {
  users: User[];
}

const USERS_STORAGE_KEY = 'umkm-pintar-users';
const getUserStorageKey = (userId: string) => `umkm-pintar-userdata-${userId}`;

const DEFAULT_USERS: Database = {
  users: [
    {
      id: '1',
      email: 'radena.digital@gmail.com',
      password: 'Radena@1979',
      name: 'Admin Radena',
      role: 'Admin', // Admin role
      createdAt: Date.now()
    }
  ]
};

const getDefaultUserData = (userId: string): UserData => ({
  transactions: [],
  products: [],
  suppliers: [],
  customers: [],
  receipts: [],
  invoices: [],
  courses: [],
  categories: ['Marketing', 'Finansial', 'Operasional', 'SDM', 'Teknologi'],
  profile: {
    userId,
    general: {
      name: 'UMKM Anda',
      description: '',
      category: '',
      foundedYear: '',
      address: '',
      email: '',
      phone: '',
      website: ''
    },
    branding: {
      logo: '',
      primaryColor: '#1b43ea',
      secondaryColor: '#f43f5e',
      tagline: '',
      coreValues: []
    },
    products: [],
    targetMarket: {
      segments: '',
      characteristics: '',
      painPoints: ''
    },
    usp: {
      competitiveEdge: '',
      differentiation: ''
    }
  },
  setup: false
});

export const loadUsersDatabase = (): Database => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    if (data) {
      const parsedData = JSON.parse(data);
      const db = {
        ...DEFAULT_USERS,
        ...parsedData,
        users: parsedData.users || DEFAULT_USERS.users
      };
      
      // Ensure admin user exists
      const adminEmail = 'radena.digital@gmail.com';
      const adminIndex = db.users.findIndex(u => u.email === adminEmail);
      if (adminIndex === -1) {
        db.users.push({
          id: '1',
          email: adminEmail,
          password: 'Radena@1979',
          name: 'Admin Radena',
          role: 'Admin',
          createdAt: Date.now()
        });
        saveUsersDatabase(db);
      }
      return db;
    }
    return { ...DEFAULT_USERS };
  } catch (error) {
    console.error('Error loading users database:', error);
    return { ...DEFAULT_USERS };
  }
};

export const saveUsersDatabase = (database: Database) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(database));
  } catch (error) {
    console.error('Error saving users database:', error);
  }
};

export const loadUserData = (userId: string): UserData => {
  try {
    const data = localStorage.getItem(getUserStorageKey(userId));
    if (data) {
      const parsedData = JSON.parse(data);
      const defaultData = getDefaultUserData(userId);
      return {
        ...defaultData,
        ...parsedData,
        transactions: parsedData.transactions || defaultData.transactions,
        products: parsedData.products || defaultData.products,
        suppliers: parsedData.suppliers || defaultData.suppliers,
        customers: parsedData.customers || defaultData.customers,
        receipts: parsedData.receipts || defaultData.receipts,
        invoices: parsedData.invoices || defaultData.invoices,
        courses: parsedData.courses || defaultData.courses,
        categories: parsedData.categories || defaultData.categories,
        profile: parsedData.profile || defaultData.profile,
      };
    }
    return getDefaultUserData(userId);
  } catch (error) {
    console.error('Error loading user data:', error);
    return getDefaultUserData(userId);
  }
};

export const saveUserData = (userId: string, userData: UserData) => {
  try {
    localStorage.setItem(getUserStorageKey(userId), JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const resetUserData = (userId: string) => {
  localStorage.removeItem(getUserStorageKey(userId));
  return getDefaultUserData(userId);
};

// Helper functions with userId
export const saveTransactions = (userId: string, transactions: Transaction[]) => {
  const userData = loadUserData(userId);
  saveUserData(userId, { ...userData, transactions });
};

export const saveProducts = (userId: string, products: Product[]) => {
  const userData = loadUserData(userId);
  saveUserData(userId, { ...userData, products });
};

export const saveSuppliers = (userId: string, suppliers: Supplier[]) => {
  const userData = loadUserData(userId);
  saveUserData(userId, { ...userData, suppliers });
};

export const saveCustomers = (userId: string, customers: Customer[]) => {
  const userData = loadUserData(userId);
  saveUserData(userId, { ...userData, customers });
};

export const saveBusinessProfile = (userId: string, profile: BusinessProfile) => {
  const userData = loadUserData(userId);
  saveUserData(userId, { ...userData, profile, setup: true });
};

// For backward compatibility - deprecated
export const loadDatabase = (): Database => {
  return loadUsersDatabase();
};

export const saveDatabase = (database: Database) => {
  saveUsersDatabase(database);
};

export const resetDatabase = () => {
  localStorage.removeItem(USERS_STORAGE_KEY);
  return { ...DEFAULT_USERS };
};
