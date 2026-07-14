import type { PrestacionesResponse } from '@calc/shared';

export interface PrestacionesProps {
  prestaciones: PrestacionesResponse;
}

export function Prestaciones({ prestaciones }: PrestacionesProps) {
  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-800">Prestaciones</h3>
      <dl className="mt-2 space-y-1 text-xs text-gray-600">
        {prestaciones.aguinaldo && (
          <div className="flex justify-between">
            <dt>
              Aguinaldo ({prestaciones.aguinaldo.dias} d&iacute;as
              {prestaciones.aguinaldo.proporcional ? ' proporcional' : ''})
            </dt>
            <dd className="font-mono text-green-600">
              +${prestaciones.aguinaldo.monto.toFixed(2)}
            </dd>
          </div>
        )}
        {prestaciones.vacaciones && (
          <div className="flex justify-between">
            <dt>
              Vacaciones ({prestaciones.vacaciones.porcentaje}% de 15
              d&iacute;as)
            </dt>
            <dd className="font-mono text-green-600">
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
            <dd className="font-mono text-green-600">
              +${prestaciones.quincena25.monto.toFixed(2)}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
