import { useState, useEffect, useMemo } from 'react';
import { 
  loadUsersDatabase, 
  saveUsersDatabase,
  loadUserData,
  saveUserData,
  Database,
  UserData,
  Transaction,
  Product,
  Supplier,
  Customer,
  BusinessProfile,
  ReceiptData,
  InvoiceData,
  Course,
  User
} from './database';

interface DatabaseContextType {
  db: Database & Partial<UserData>;
  userData: UserData | null;
  setDb: React.Dispatch<React.SetStateAction<Database>>;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  updateTransactions: (transactions: Transaction[]) => void;
  updateProducts: (products: Product[]) => void;
  updateSuppliers: (suppliers: Supplier[]) => void;
  updateCustomers: (customers: Customer[]) => void;
  updateReceipts: (receipts: ReceiptData[]) => void;
  updateInvoices: (invoices: InvoiceData[]) => void;
  updateCourses: (courses: Course[]) => void;
  updateCategories: (categories: string[]) => void;
  addUser: (user: User) => void;
  updateUsers: (users: User[]) => void;
  updateProfile: (profile: BusinessProfile) => void;
  resetDb: () => void;
  setCurrentUserId: (userId: string | null) => void;
}

// Hook for database management
export const useDatabase = (): DatabaseContextType => {
  const [db, setDb] = useState<Database>(() => loadUsersDatabase());
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Combined DB for backward compatibility
  const combinedDb = useMemo(() => {
    if (currentUserId && userData) {
      return {
        ...db,
        ...userData
      };
    }
    // Default fallback for backward compatibility
    return {
      ...db,
      transactions: [],
      products: [],
      suppliers: [],
      customers: [],
      receipts: [],
      invoices: [],
      courses: [],
      categories: ['Marketing', 'Finansial', 'Operasional', 'SDM', 'Teknologi'],
      profile: {
        userId: '',
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
    };
  }, [db, userData, currentUserId]);

  // Load user data when currentUserId changes
  useEffect(() => {
    if (currentUserId) {
      setUserData(loadUserData(currentUserId));
    } else {
      setUserData(null);
    }
  }, [currentUserId]);

  // Persist users database to localStorage
  useEffect(() => {
    saveUsersDatabase(db);
  }, [db]);

  // Persist user data to localStorage
  useEffect(() => {
    if (currentUserId && userData) {
      saveUserData(currentUserId, userData);
    }
  }, [userData, currentUserId]);

  // Helper to check if we have current user
  const hasUser = () => currentUserId !== null && userData !== null;

  // CRUD Methods
  const updateTransactions = (transactions: Transaction[]) => {
    if (hasUser()) {
      setUserData(prev => prev ? { ...prev, transactions } : prev);
    }
  };

  const updateProducts = (products: Product[]) => {
    if (hasUser()) {
      setUserData(prev => prev ? { ...prev, products } : prev);
    }
  };

  const updateSuppliers = (suppliers: Supplier[]) => {
    if (hasUser()) {
      setUserData(prev => prev ? { ...prev, suppliers } : prev);
    }
  };

  const updateCustomers = (customers: Customer[]) => {
    if (hasUser()) {
      setUserData(prev => prev ? { ...prev, customers } : prev);
    }
  };

  const updateReceipts = (receipts: ReceiptData[]) => {
    if (hasUser()) {
      setUserData(prev => prev ? { ...prev, receipts } : prev);
    }
  };

  const updateInvoices = (invoices: InvoiceData[]) => {
    if (hasUser()) {
      setUserData(prev => prev ? { ...prev, invoices } : prev);
    }
  };

  const updateCourses = (courses: Course[]) => {
    if (hasUser()) {
      setUserData(prev => prev ? { ...prev, courses } : prev);
    }
  };

  const updateCategories = (categories: string[]) => {
    if (hasUser()) {
      setUserData(prev => prev ? { ...prev, categories } : prev);
    }
  };

  const addUser = (user: User) => {
    setDb(prev => ({ ...prev, users: [...prev.users, user] }));
  };

  const updateUsers = (users: User[]) => {
    setDb(prev => ({ ...prev, users }));
  };

  const updateProfile = (profile: BusinessProfile) => {
    if (hasUser()) {
      setUserData(prev => prev ? { ...prev, profile, setup: true } : prev);
    }
  };

  const resetDb = () => {
    const newDb = loadUsersDatabase();
    setDb(newDb);
    if (currentUserId) {
      setUserData(loadUserData(currentUserId));
    }
  };

  return {
    db: combinedDb,
    userData,
    setDb,
    setUserData,
    updateTransactions,
    updateProducts,
    updateSuppliers,
    updateCustomers,
    updateReceipts,
    updateInvoices,
    updateCourses,
    updateCategories,
    addUser,
    updateUsers,
    updateProfile,
    resetDb,
    setCurrentUserId
  };
};
