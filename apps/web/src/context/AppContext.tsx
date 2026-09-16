import { createContext, useContext, useState, type ReactNode } from 'react';
import type { JornadaConfig, Incentivo, EntradaPeriodo } from '@calc/shared';
import {
  configInicialPersistenciaSchema,
  jornadaConfigSchema,
  entradasPeriodoSchema,
  incentivosGuardadosSchema,
} from '@calc/shared';
import type { ConfigInicialData } from '../components/ConfigInicial';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  limpiarClavesMuertas,
  parseador,
  tomarClavesDescartadas,
} from '../lib/storage';

const DEFAULT_JORNADA: JornadaConfig = {
  modalidad: 'diurna',
};

interface AppContextValue {
  config: ConfigInicialData;
  setConfig: (value: ConfigInicialData | ((prev: ConfigInicialData) => ConfigInicialData)) => void;
  jornada: JornadaConfig;
  setJornada: (value: JornadaConfig | ((prev: JornadaConfig) => JornadaConfig)) => void;
  entradas: EntradaPeriodo[];
  setEntradas: (value: EntradaPeriodo[] | ((prev: EntradaPeriodo[]) => EntradaPeriodo[])) => void;
  incentivos: Incentivo[];
  setIncentivos: (value: Incentivo[] | ((prev: Incentivo[]) => Incentivo[])) => void;
  /** Claves de localStorage descartadas por corrupción (Regla 8, integridad). */
  clavesDescartadas: string[];
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
    parseador(configInicialPersistenciaSchema, DEFAULT_CONFIG, 'config-inicial'),
  );
  const [jornada, setJornada] = useLocalStorage<JornadaConfig>(
    'jornada-config',
    DEFAULT_JORNADA,
    parseador(jornadaConfigSchema, DEFAULT_JORNADA, 'jornada-config'),
  );
  const [entradas, setEntradas] = useLocalStorage<EntradaPeriodo[]>(
    'entradas-periodo',
    [],
    parseador(entradasPeriodoSchema, [], 'entradas-periodo'),
  );
  const [incentivos, setIncentivos] = useLocalStorage<Incentivo[]>(
    'incentivos',
    [],
    parseador(incentivosGuardadosSchema, [], 'incentivos'),
  );

  // Drena los descartes registrados por los parsers durante la inicialización
  // (después de los hooks de storage, misma pasada de render).
  const [clavesDescartadas] = useState(() => {
    limpiarClavesMuertas();
    return tomarClavesDescartadas();
  });

  return (
    <AppContext.Provider
      value={{
        config,
        setConfig,
        jornada,
        setJornada,
        entradas,
        setEntradas,
        incentivos,
        setIncentivos,
        clavesDescartadas,
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
