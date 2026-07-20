import { useState, useCallback } from 'react';
import type { DiaRegistro } from '../components/registroTypes';
import {
  getLunes,
  semanaIdDesdeLunes,
  lunesDesdeSemanaId,
  generarDiasSemana,
} from '../components/registroTypes';
import { useAppContext } from '../context/AppContext';

export function useRegistroSemanal() {
  const { registro: data, setRegistro: setData } = useAppContext();
  const [semanaId, setSemanaId] = useState<string>(() => {
    const lunes = getLunes(new Date());
    return semanaIdDesdeLunes(lunes);
  });

  const lunes = lunesDesdeSemanaId(semanaId);
  const domingo = new Date(lunes);
  domingo.setDate(domingo.getDate() + 6);

  const dias: DiaRegistro[] = data[semanaId] ?? generarDiasSemana(lunes);

  const semanaAnterior = useCallback(() => {
    const l = lunesDesdeSemanaId(semanaId);
    l.setDate(l.getDate() - 7);
    setSemanaId(semanaIdDesdeLunes(l));
  }, [semanaId]);

  const semanaSiguiente = useCallback(() => {
    const l = lunesDesdeSemanaId(semanaId);
    l.setDate(l.getDate() + 7);
    setSemanaId(semanaIdDesdeLunes(l));
  }, [semanaId]);

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

  return {
    semanaId,
    lunes,
    domingo,
    dias,
    updateDia,
    setDias,
    semanaAnterior,
    semanaSiguiente,
  };
}
