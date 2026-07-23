import type { SemanaRegistro, JornadaConfig } from '@calc/shared';
import { JORNADA } from '@calc/shared';

export interface TotalesPeriodoProps {
  jornada: JornadaConfig;
  semanas: SemanaRegistro[];
}

export function TotalesPeriodo({ jornada, semanas }: TotalesPeriodoProps) {
  const totales = semanas.reduce(
    (acc, s) => ({
      horasBaseNocturnas: acc.horasBaseNocturnas + s.horasBaseNocturnas,
      extraDiurna: acc.extraDiurna + s.extraDiurna,
      extraNocturna: acc.extraNocturna + s.extraNocturna,
      diaLibreDiurna: acc.diaLibreDiurna + s.diaLibreDiurna,
      diaLibreNocturna: acc.diaLibreNocturna + s.diaLibreNocturna,
      asueto: acc.asueto + s.asueto,
    }),
    {
      horasBaseNocturnas: 0,
      extraDiurna: 0,
      extraNocturna: 0,
      diaLibreDiurna: 0,
      diaLibreNocturna: 0,
      asueto: 0,
    },
  );

  const horasSemanales =
    jornada.tipo === 'tiempo_completo'
      ? jornada.modalidad === 'nocturna'
        ? JORNADA.NOCTURNA_SEMANAL
        : JORNADA.DIURNA_SEMANAL
      : jornada.horasSemanales;

  const excesoSemanal = semanas.length > 0 ? Math.max(0, horasSemanales - (jornada.modalidad === 'nocturna' ? JORNADA.NOCTURNA_SEMANAL : JORNADA.DIURNA_SEMANAL)) : 0;

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-bold text-text mb-2">Totales del Periodo</h3>
      <dl className="space-y-1 text-xs text-text-secondary">
        <div className="flex justify-between">
          <dt>Semanas registradas</dt>
          <dd className="font-mono">{semanas.length}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Horas/sem configuradas</dt>
          <dd className="font-mono">{horasSemanales}h</dd>
        </div>
        {excesoSemanal > 0 && (
          <div className="flex justify-between text-warning">
            <dt>Exceso semanal (auto-convertido a extra)</dt>
            <dd className="font-mono">{excesoSemanal}h</dd>
          </div>
        )}
        <div className="border-t border-border pt-1 mt-1">
          {totales.horasBaseNocturnas > 0 && (
            <div className="flex justify-between">
              <dt>Horas base nocturnas (recargo 25%)</dt>
              <dd className="font-mono">{totales.horasBaseNocturnas.toFixed(1)}h</dd>
            </div>
          )}
          {totales.extraDiurna > 0 && (
            <div className="flex justify-between">
              <dt>Extra diurna</dt>
              <dd className="font-mono">{totales.extraDiurna.toFixed(1)}h</dd>
            </div>
          )}
          {totales.extraNocturna > 0 && (
            <div className="flex justify-between">
              <dt>Extra nocturna</dt>
              <dd className="font-mono">{totales.extraNocturna.toFixed(1)}h</dd>
            </div>
          )}
          {totales.diaLibreDiurna > 0 && (
            <div className="flex justify-between">
              <dt>Día libre diurna</dt>
              <dd className="font-mono">{totales.diaLibreDiurna.toFixed(1)}h</dd>
            </div>
          )}
          {totales.diaLibreNocturna > 0 && (
            <div className="flex justify-between">
              <dt>Día libre nocturna</dt>
              <dd className="font-mono">{totales.diaLibreNocturna.toFixed(1)}h</dd>
            </div>
          )}
          {totales.asueto > 0 && (
            <div className="flex justify-between">
              <dt>Asueto</dt>
              <dd className="font-mono">{totales.asueto.toFixed(1)}h</dd>
            </div>
          )}
        </div>
      </dl>
    </div>
  );
}
