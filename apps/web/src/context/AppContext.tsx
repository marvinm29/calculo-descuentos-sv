import { createContext, useContext, type ReactNode } from 'react';
import type { DiaRegistro } from '../components/registroTypes';
import type { ConfigInicialData } from '../components/ConfigInicial';
import { useLocalStorage } from '../hooks/useLocalStorage';

type SemanasData = Record<string, DiaRegistro[]>;

interface AppContextValue {
  config: ConfigInicialData;
  setConfig: (value: ConfigInicialData | ((prev: ConfigInicialData) => ConfigInicialData)) => void;
  registro: SemanasData;
  setRegistro: (value: SemanasData | ((prev: SemanasData) => SemanasData)) => void;
}

const DEFAULT_CONFIG: ConfigInicialData = {
  salarioBase: 0,
  tipoPago: 'mensual',
  antiguedad: '1_a_3',
  fechaIngreso: '',
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useLocalStorage<ConfigInicialData>(
    'config-inicial',
    DEFAULT_CONFIG,
  );
  const [registro, setRegistro] = useLocalStorage<SemanasData>(
    'registro-semanal',
    {},
  );

  return (
    <AppContext.Provider value={{ config, setConfig, registro, setRegistro }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return ctx;
}
