import type { DiaRegistro } from './registroTypes';
import { totalesSemana } from './registroTypes';

export interface TotalesSemanaProps {
  dias: DiaRegistro[];
}

export function TotalesSemana({ dias }: TotalesSemanaProps) {
  const t = totalesSemana(dias);

  return (
    <div className="glass-card rounded-xl px-4 py-3">
      <span className="text-sm font-semibold text-text">
        Totales semanales:{' '}
      </span>
      <span className="text-xs text-text-secondary">
        Base: {t.horasBase}h | Extra D: {t.horasExtraDiurna}h | Extra N:{' '}
        {t.horasExtraNocturna}h
        {t.horasDiaLibreDiurna > 0 && (
          <> | Libre D: {t.horasDiaLibreDiurna}h</>
        )}
        {t.horasDiaLibreNocturna > 0 && (
          <> | Libre N: {t.horasDiaLibreNocturna}h</>
        )}
        {t.horasAsueto > 0 && <> | Asueto: {t.horasAsueto}h</>}
      </span>
    </div>
  );
}
