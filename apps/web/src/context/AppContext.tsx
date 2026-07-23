import { createContext, useContext, type ReactNode } from 'react';
import type { JornadaConfig, Incentivo } from '@calc/shared';
import type { ConfigInicialData } from '../components/ConfigInicial';
import type { DiaRegistro } from '../components/registroTypes';
import { useLocalStorage } from '../hooks/useLocalStorage';

type SemanasData = Record<string, DiaRegistro[]>;

const DEFAULT_JORNADA: JornadaConfig = {
  tipo: 'tiempo_completo',
  horasSemanales: 44,
  modalidad: 'diurna',
};

interface AppContextValue {
  config: ConfigInicialData;
  setConfig: (value: ConfigInicialData | ((prev: ConfigInicialData) => ConfigInicialData)) => void;
  jornada: JornadaConfig;
  setJornada: (value: JornadaConfig | ((prev: JornadaConfig) => JornadaConfig)) => void;
  registro: SemanasData;
  setRegistro: (value: SemanasData | ((prev: SemanasData) => SemanasData)) => void;
  incentivos: Incentivo[];
  setIncentivos: (value: Incentivo[] | ((prev: Incentivo[]) => Incentivo[])) => void;
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
  const [jornada, setJornada] = useLocalStorage<JornadaConfig>(
    'jornada-config',
    DEFAULT_JORNADA,
  );
  const [registro, setRegistro] = useLocalStorage<SemanasData>(
    'registro-semanal',
    {},
  );
  const [incentivos, setIncentivos] = useLocalStorage<Incentivo[]>(
    'incentivos',
    [],
  );

  return (
    <AppContext.Provider
      value={{
        config,
        setConfig,
        jornada,
        setJornada,
        registro,
        setRegistro,
        incentivos,
        setIncentivos,
      }}
    >
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
