"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  strictPolicyValidation: boolean;
  setStrictPolicyValidation: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [strictPolicyValidation, setStrictPolicyValidation] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Set client flag after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load from localStorage on client
  useEffect(() => {
    if (isClient) {
      const saved = localStorage.getItem('strictPolicyValidation');
      if (saved !== null) {
        setStrictPolicyValidation(JSON.parse(saved));
      }
    }
  }, [isClient]);

  // Save to localStorage when changed
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('strictPolicyValidation', JSON.stringify(strictPolicyValidation));
    }
  }, [strictPolicyValidation, isClient]);

  return (
    <SettingsContext.Provider value={{ strictPolicyValidation, setStrictPolicyValidation }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
