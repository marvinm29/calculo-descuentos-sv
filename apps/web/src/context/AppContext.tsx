import { createContext, useContext, type ReactNode } from 'react';
import type { JornadaConfig, SemanaRegistro, Incentivo } from '@calc/shared';
import type { ConfigInicialData } from '../components/ConfigInicial';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { migrarRegistroViejo } from '../lib/migrarRegistro';

const DEFAULT_JORNADA: JornadaConfig = {
  tipo: 'tiempo_completo',
  horasSemanales: 44,
  modalidad: 'diurna',
};

function migrarSiEsNecesario(): SemanaRegistro[] {
  try {
    const raw = localStorage.getItem('registro-periodo');
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as SemanaRegistro[];
    }
    const migrados = migrarRegistroViejo();
    if (migrados.length > 0) {
      localStorage.setItem('registro-periodo', JSON.stringify(migrados));
    }
    return migrados;
  } catch {
    return [];
  }
}

interface AppContextValue {
  config: ConfigInicialData;
  setConfig: (value: ConfigInicialData | ((prev: ConfigInicialData) => ConfigInicialData)) => void;
  jornada: JornadaConfig;
  setJornada: (value: JornadaConfig | ((prev: JornadaConfig) => JornadaConfig)) => void;
  registroPeriodo: SemanaRegistro[];
  setRegistroPeriodo: (value: SemanaRegistro[] | ((prev: SemanaRegistro[]) => SemanaRegistro[])) => void;
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
  const [registroPeriodo, setRegistroPeriodo] = useLocalStorage<SemanaRegistro[]>(
    'registro-periodo',
    migrarSiEsNecesario,
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
        registroPeriodo,
        setRegistroPeriodo,
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
