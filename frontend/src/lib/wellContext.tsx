import React, { createContext, useContext, useState, useEffect } from 'react';
import type { WellContextState } from '../types';
import { fetchWellsApi } from './api';

interface WellContextType {
  currentWell: WellContextState | null;
  availableWells: WellContextState[];
  isLoadingWells: boolean;
  selectWell: (wellId: string | null) => void;
}

const WellContext = createContext<WellContextType | undefined>(undefined);

export const CurrentWellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableWells, setAvailableWells] = useState<WellContextState[]>([]);
  const [currentWell, setCurrentWell] = useState<WellContextState | null>(null);
  const [isLoadingWells, setIsLoadingWells] = useState<boolean>(true);

  useEffect(() => {
    const loadWells = async () => {
      const wells = await fetchWellsApi();
      setAvailableWells(wells);

      const savedWellId = localStorage.getItem('nwis_active_well_id');
      const matched = savedWellId ? wells.find(w => w.wellId === savedWellId) : null;

      if (matched) {
        setCurrentWell(matched);
      } else if (wells.length > 0) {
        setCurrentWell(wells[0]);
        localStorage.setItem('nwis_active_well_id', wells[0].wellId);
      }
      setIsLoadingWells(false);
    };
    loadWells();
  }, []);

  const selectWell = (wellId: string | null) => {
    if (!wellId) {
      setCurrentWell(null);
      localStorage.removeItem('nwis_active_well_id');
      return;
    }
    const matched = availableWells.find(w => w.wellId === wellId);
    if (matched) {
      setCurrentWell(matched);
      localStorage.setItem('nwis_active_well_id', wellId);
    }
  };

  return (
    <WellContext.Provider value={{ currentWell, availableWells, isLoadingWells, selectWell }}>
      {children}
    </WellContext.Provider>
  );
};

export const useCurrentWell = (): WellContextType => {
  const context = useContext(WellContext);
  if (!context) {
    throw new Error('useCurrentWell must be used within a CurrentWellProvider');
  }
  return context;
};
