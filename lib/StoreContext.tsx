"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Store } from "@/types";

type StoreContextType = {
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <StoreContext.Provider
      value={{ selectedStore, setSelectedStore, selectedDate, setSelectedDate }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
