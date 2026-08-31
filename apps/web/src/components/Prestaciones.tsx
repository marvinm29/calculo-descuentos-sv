import type { PrestacionesResponse } from '@calc/shared';

export interface PrestacionesProps {
  prestaciones: PrestacionesResponse;
}

export function Prestaciones({ prestaciones }: PrestacionesProps) {
  const hasAny =
    prestaciones.aguinaldo || prestaciones.vacaciones || prestaciones.quincena25;

  if (!hasAny) return null;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-text">Prestaciones</h3>
        <span className="text-xs text-text-muted font-medium">
          Informativas (paga el empleador)
        </span>
      </div>
      <p className="text-xs text-text-muted mb-2">
        Estas prestaciones no forman parte del salario neto líquido; son
        beneficios que el empleador debe pagar por separado.
      </p>
      <dl className="space-y-1 text-xs text-text-secondary">
        {prestaciones.aguinaldo && (
          <div className="flex justify-between">
            <dt>
              Aguinaldo ({prestaciones.aguinaldo.dias} días
              {prestaciones.aguinaldo.proporcional ? ' proporcional' : ''})
            </dt>
            <dd className="amount text-text">
              ${prestaciones.aguinaldo.monto.toFixed(2)}
            </dd>
          </div>
        )}
        {prestaciones.vacaciones && (
          <div className="flex justify-between">
            <dt>
              Vacaciones ({prestaciones.vacaciones.porcentaje}% de 15
              días)
            </dt>
            <dd className="amount text-text">
              ${prestaciones.vacaciones.monto.toFixed(2)}
            </dd>
          </div>
        )}
        {prestaciones.quincena25 && (
          <div className="flex justify-between">
            <dt>
              Quincena 25 ({prestaciones.quincena25.porcentaje}% del
              salario mensual)
            </dt>
            <dd className="amount text-text">
              ${prestaciones.quincena25.monto.toFixed(2)}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
