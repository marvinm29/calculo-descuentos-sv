import type { PrestacionesResponse } from '@calc/shared';

export interface PrestacionesProps {
  prestaciones: PrestacionesResponse;
}

export function Prestaciones({ prestaciones }: PrestacionesProps) {
  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-bold text-text">Prestaciones</h3>
      <dl className="mt-2 space-y-1 text-xs text-text-secondary">
        {prestaciones.aguinaldo && (
          <div className="flex justify-between">
            <dt>
              Aguinaldo ({prestaciones.aguinaldo.dias} días
              {prestaciones.aguinaldo.proporcional ? ' proporcional' : ''})
            </dt>
            <dd className="font-mono text-success">
              +${prestaciones.aguinaldo.monto.toFixed(2)}
            </dd>
          </div>
        )}
        {prestaciones.vacaciones && (
          <div className="flex justify-between">
            <dt>
              Vacaciones ({prestaciones.vacaciones.porcentaje}% de 15
              días)
            </dt>
            <dd className="font-mono text-success">
              +${prestaciones.vacaciones.monto.toFixed(2)}
            </dd>
          </div>
        )}
        {prestaciones.quincena25 && (
          <div className="flex justify-between">
            <dt>
              Quincena 25 ({prestaciones.quincena25.porcentaje}% del
              salario mensual)
            </dt>
            <dd className="font-mono text-success">
              +${prestaciones.quincena25.monto.toFixed(2)}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
