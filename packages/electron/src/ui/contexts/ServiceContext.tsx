import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ServiceContextType {
  selectedService: string | null;
  setSelectedService: (service: string | null) => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

interface ServiceProviderProps {
  children: ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const contextValue: ServiceContextType = {
    selectedService,
    setSelectedService,
  };

  return (
    <ServiceContext.Provider value={contextValue}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};
