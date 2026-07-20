import { useCallback, useMemo } from 'react';
import type { DiaRegistro } from '../components/registroTypes';
import {
  getLunes,
  semanaIdDesdeLunes,
  generarDiasSemana,
} from '../components/registroTypes';
import { useAppContext } from '../context/AppContext';

function getSemanaInicial(): { semanaId: string; dias: DiaRegistro[] } {
  const lunes = getLunes(new Date());
  const semanaId = semanaIdDesdeLunes(lunes);
  return { semanaId, dias: generarDiasSemana(lunes) };
}

export function useRegistroSemanal() {
  const { registro: data, setRegistro: setData } = useAppContext();

  const inicial = useMemo(getSemanaInicial, []);
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
