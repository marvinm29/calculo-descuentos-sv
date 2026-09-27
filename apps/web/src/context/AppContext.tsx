import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Incentivo, EntradaPeriodo } from '@calc/shared';
import {
  configInicialPersistenciaSchema,
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

interface AppContextValue {
  config: ConfigInicialData;
  setConfig: (value: ConfigInicialData | ((prev: ConfigInicialData) => ConfigInicialData)) => void;
  entradas: EntradaPeriodo[];
  setEntradas: (value: EntradaPeriodo[] | ((prev: EntradaPeriodo[]) => EntradaPeriodo[])) => void;
  incentivos: Incentivo[];
  setIncentivos: (value: Incentivo[] | ((prev: Incentivo[]) => Incentivo[])) => void;
  /** Claves de localStorage descartadas por corrupción (Regla 8, integridad). */
  clavesDescartadas: string[];
  /** FE-15: true si alguna clave de dominio falló al escribir (cuota/privado). */
  errorPersistencia: boolean;
}

const DEFAULT_CONFIG: ConfigInicialData = {
  salarioBase: 0,
  tipoPago: 'mensual',
  antiguedad: '1_a_3',
  fechaIngreso: '',
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [config, setConfig, persistenciaConfig] = useLocalStorage<ConfigInicialData>(
    'config-inicial',
    DEFAULT_CONFIG,
    parseador(configInicialPersistenciaSchema, DEFAULT_CONFIG, 'config-inicial'),
  );
  const [entradas, setEntradas, persistenciaEntradas] = useLocalStorage<EntradaPeriodo[]>(
    'entradas-periodo',
    [],
    parseador(entradasPeriodoSchema, [], 'entradas-periodo'),
  );
  const [incentivos, setIncentivos, persistenciaIncentivos] = useLocalStorage<Incentivo[]>(
    'incentivos',
    [],
    parseador(incentivosGuardadosSchema, [], 'incentivos'),
  );

  // FE-15: si cualquier clave de dominio falla al escribir, la UI avisa.
  const errorPersistencia = !(
    persistenciaConfig.ok &&
    persistenciaEntradas.ok &&
    persistenciaIncentivos.ok
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
        entradas,
        setEntradas,
        incentivos,
        setIncentivos,
        clavesDescartadas,
        errorPersistencia,
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
