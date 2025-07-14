"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useIsMobile } from '@/hooks/use-mobile';
import type { InventoryList } from '@/types';

interface SidebarContextType {
  lists: InventoryList[];
  setLists: (lists: InventoryList[]) => void;
  activeListId: string | null;
  setActiveListId: (id: string | null) => void;
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const defaultLists: InventoryList[] = [
  { id: 'default-1', name: 'My First List', items: [] },
];

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useLocalStorage<InventoryList[]>('shelf-scanner-lists', defaultLists);
  const [activeListId, setActiveListId] = useLocalStorage<string | null>('shelf-scanner-active-list', defaultLists[0]?.id || null);
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    if (lists.length > 0 && !lists.find(l => l.id === activeListId)) {
        setActiveListId(lists[0].id);
    } else if (lists.length === 0) {
        setActiveListId(null);
    }
  }, [lists, activeListId, setActiveListId]);

  const value = {
    lists,
    setLists,
    activeListId,
    setActiveListId,
    isMobile,
    openMobile,
    setOpenMobile,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
