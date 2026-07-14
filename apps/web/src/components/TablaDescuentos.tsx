import type { DescuentosResponse } from '@calc/shared';

export interface TablaDescuentosProps {
  descuentos: DescuentosResponse;
}

export function TablaDescuentos({ descuentos }: TablaDescuentosProps) {
  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-800">Descuentos de Ley</h3>
      <dl className="mt-2 space-y-1 text-xs text-gray-600">
        <div className="flex justify-between">
          <dt>
            ISSS ({descuentos.isss.porcentaje}% sobre{' '}
            ${descuentos.isss.salarioAsegurable.toFixed(2)})
          </dt>
          <dd className="font-mono text-red-600">
            -${descuentos.isss.descuento.toFixed(2)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>
            AFP ({descuentos.afp.porcentaje}% sobre{' '}
            ${descuentos.afp.salarioCotizable.toFixed(2)})
          </dt>
          <dd className="font-mono text-red-600">
            -${descuentos.afp.descuento.toFixed(2)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>
            Renta (tramo {descuentos.renta.tramo},{' '}
            {descuentos.renta.porcentajeExceso}% sobre exceso de{' '}
            ${descuentos.renta.cuotaFija.toFixed(2)})
          </dt>
          <dd className="font-mono text-red-600">
            -${descuentos.renta.descuento.toFixed(2)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold text-red-700">
          <dt>Total descuentos</dt>
          <dd className="font-mono">
            -${descuentos.totalDescuentos.toFixed(2)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
