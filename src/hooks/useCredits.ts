'use client';

import { useState, useEffect } from 'react';

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund';
  description: string;
  credits: number;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
}

export function useCredits() {
  const [balance, setBalance] = useState(150);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);

  // Mock credit packages
  const creditPackages: CreditPackage[] = [
    {
      id: '1',
      name: 'Starter Pack',
      credits: 50,
      price: 9.99,
    },
    {
      id: '2',
      name: 'Professional Pack',
      credits: 150,
      price: 24.99,
      popular: true,
    },
    {
      id: '3',
      name: 'Enterprise Pack',
      credits: 500,
      price: 79.99,
    },
  ];

  // Mock transactions
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'purchase',
      description: 'Professional Pack Purchase',
      credits: 150,
      date: new Date('2024-01-15T10:30:00'),
      status: 'completed',
    },
    {
      id: '2',
      type: 'usage',
      description: 'AI Chat Session',
      credits: -5,
      date: new Date('2024-01-14T14:20:00'),
      status: 'completed',
    },
    {
      id: '3',
      type: 'usage',
      description: 'Document Analysis',
      credits: -10,
      date: new Date('2024-01-13T09:15:00'),
      status: 'completed',
    },
    {
      id: '4',
      type: 'usage',
      description: 'Image Recognition',
      credits: -3,
      date: new Date('2024-01-12T16:45:00'),
      status: 'completed',
    },
    {
      id: '5',
      type: 'purchase',
      description: 'Starter Pack Purchase',
      credits: 50,
      date: new Date('2024-01-10T11:30:00'),
      status: 'completed',
    },
  ];

  useEffect(() => {
    setPackages(creditPackages);
    setTransactions(mockTransactions);
  }, []);

  const purchaseCredits = async (packageId: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const selectedPackage = packages.find(pkg => pkg.id === packageId);
    if (selectedPackage) {
      setBalance(prev => prev + selectedPackage.credits);
      
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'purchase',
        description: selectedPackage.name,
        credits: selectedPackage.credits,
        date: new Date(),
        status: 'completed',
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
    }
    
    setIsLoading(false);
  };

  const useCreditsForAction = (creditsUsed: number, description: string) => {
    setBalance(prev => Math.max(0, prev - creditsUsed));
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'usage',
      description,
      credits: -creditsUsed,
      date: new Date(),
      status: 'completed',
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
  };

  return {
    balance,
    isLoading,
    transactions,
    packages,
    purchaseCredits,
    useCreditsForAction,
  };
}


