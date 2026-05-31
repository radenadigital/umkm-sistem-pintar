import React, { createContext, useContext, ReactNode } from 'react';
import { useDatabase } from '../services/useDatabase';
import { Database, UserData, User, Transaction, Product, Supplier, Customer, BusinessProfile, ReceiptData, InvoiceData, Course } from '../services/database';

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

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
  const value = useDatabase();

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDb = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDb must be used within a DatabaseProvider');
  }
  return context;
};
