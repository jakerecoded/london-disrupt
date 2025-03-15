import { createContext, useContext, useState, ReactNode } from 'react';

interface IncidentContextType {
  currentIncidentId: string | null;
  setCurrentIncidentId: (id: string | null) => void;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export function useIncident() {
  const context = useContext(IncidentContext);
  if (context === undefined) {
    throw new Error('useIncident must be used within an IncidentProvider');
  }
  return context;
}

interface IncidentProviderProps {
  children: ReactNode;
}

export function IncidentProvider({ children }: IncidentProviderProps) {
  const [currentIncidentId, setCurrentIncidentId] = useState<string | null>(null);

  const value = {
    currentIncidentId,
    setCurrentIncidentId,
  };

  return (
    <IncidentContext.Provider value={value}>
      {children}
    </IncidentContext.Provider>
  );
}
