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
        Totales:{' '}
      </span>
      <span className="text-xs text-text-secondary">
        Diurna: {t.horasDiurna}h | Nocturna: {t.horasNocturna}h
      </span>
    </div>
  );
}
