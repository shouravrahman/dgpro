'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { SupportChat } from './support-chat';

interface SupportContextType {
  isOpen: boolean;
  isMinimized: boolean;
  openSupport: () => void;
  closeSupport: () => void;
  minimizeSupport: () => void;
  maximizeSupport: () => void;
  toggleSupport: () => void;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export function useSupportContext() {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error('useSupportContext must be used within a SupportProvider');
  }
  return context;
}

interface SupportProviderProps {
  children: React.ReactNode;
  userId?: string;
  userContext?: {
    subscriptionTier?: string;
    accountAge?: number;
    previousIssues?: string[];
    preferredLanguage?: string;
    timezone?: string;
  };
}

export function SupportProvider({
  children,
  userId,
  userContext,
}: SupportProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const openSupport = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const closeSupport = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const minimizeSupport = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximizeSupport = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const toggleSupport = useCallback(() => {
    if (isOpen) {
      if (isMinimized) {
        maximizeSupport();
      } else {
        closeSupport();
      }
    } else {
      openSupport();
    }
  }, [isOpen, isMinimized, openSupport, closeSupport, maximizeSupport]);

  const contextValue: SupportContextType = {
    isOpen,
    isMinimized,
    openSupport,
    closeSupport,
    minimizeSupport,
    maximizeSupport,
    toggleSupport,
  };

  return (
    <SupportContext.Provider value={contextValue}>
      {children}
      {isOpen && (
        <SupportChat
          userId={userId}
          userContext={userContext}
          onClose={closeSupport}
          onMinimize={minimizeSupport}
          onMaximize={maximizeSupport}
          minimized={isMinimized}
        />
      )}
    </SupportContext.Provider>
  );
}
