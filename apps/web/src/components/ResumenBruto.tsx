import type { BrutoResponse } from '@calc/shared';

export interface ResumenBrutoProps {
  bruto: BrutoResponse;
}

export function ResumenBruto({ bruto }: ResumenBrutoProps) {
  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-bold text-text">Salario Bruto</h3>
      <dl className="mt-2 space-y-1 text-xs text-text-secondary">
        <div className="flex justify-between">
          <dt>Salario base del periodo</dt>
          <dd className="amount">${bruto.salarioBase.toFixed(2)}</dd>
        </div>
        {bruto.horasExtraDiurna > 0 && (
          <div className="flex justify-between">
            <dt>Horas extra diurna</dt>
            <dd className="amount">
              ${bruto.horasExtraDiurna.toFixed(2)}
            </dd>
          </div>
        )}
        {bruto.horasExtraNocturna > 0 && (
          <div className="flex justify-between">
            <dt>Horas extra nocturna</dt>
            <dd className="amount">
              ${bruto.horasExtraNocturna.toFixed(2)}
            </dd>
          </div>
        )}
        {bruto.diaLibreDiurna > 0 && (
          <div className="flex justify-between">
            <dt>Día libre diurna</dt>
            <dd className="amount">
              ${bruto.diaLibreDiurna.toFixed(2)}
            </dd>
          </div>
        )}
        {bruto.diaLibreNocturna > 0 && (
          <div className="flex justify-between">
            <dt>Día libre nocturna</dt>
            <dd className="amount">
              ${bruto.diaLibreNocturna.toFixed(2)}
            </dd>
          </div>
        )}
        {bruto.asueto > 0 && (
          <div className="flex justify-between">
            <dt>Asueto</dt>
            <dd className="amount">${bruto.asueto.toFixed(2)}</dd>
          </div>
        )}
        {bruto.recargoNocturnidad > 0 && (
          <div className="flex justify-between">
            <dt>Recargo nocturnidad (Art. 168)</dt>
            <dd className="amount">
              ${bruto.recargoNocturnidad.toFixed(2)}
            </dd>
          </div>
        )}
        {bruto.incentivos > 0 && (
          <div className="flex justify-between">
            <dt>Incentivos</dt>
            <dd className="amount">${bruto.incentivos.toFixed(2)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-1 font-semibold text-text">
          <dt>Total bruto</dt>
          <dd className="amount">${bruto.brutoTotal.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  );
}
