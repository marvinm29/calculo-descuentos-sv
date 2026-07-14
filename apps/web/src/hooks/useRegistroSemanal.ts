import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { DiaRegistro } from '../components/registroTypes';
import {
  getLunes,
  semanaIdDesdeLunes,
  generarDiasSemana,
} from '../components/registroTypes';

type SemanasData = Record<string, DiaRegistro[]>;

const STORAGE_KEY = 'registro-semanal';

function getSemanaInicial(): { semanaId: string; dias: DiaRegistro[] } {
  const lunes = getLunes(new Date());
  const semanaId = semanaIdDesdeLunes(lunes);
  return { semanaId, dias: generarDiasSemana(lunes) };
}

export function useRegistroSemanal() {
  const [data, setData] = useLocalStorage<SemanasData>(STORAGE_KEY, {});

  const inicial = getSemanaInicial();
  const semanaId = inicial.semanaId;

  const dias: DiaRegistro[] =
    data[semanaId] ?? inicial.dias;

  const setDias = useCallback(
    (nuevosDias: DiaRegistro[]) => {
      setData((prev) => ({
        ...prev,
        [semanaId]: nuevosDias,
      }));
    },
    [semanaId, setData],
  );

  function updateDia(index: number, dia: DiaRegistro) {
    const nuevos = [...dias];
    nuevos[index] = dia;
    setDias(nuevos);
  }

  return { semanaId, dias, updateDia };
}
