import type { DescuentosResponse } from '@calc/shared';

export interface TablaDescuentosProps {
  descuentos: DescuentosResponse;
}

export function TablaDescuentos({ descuentos }: TablaDescuentosProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-text">Descuentos de Ley</h3>
      <dl className="mt-2 space-y-1 text-xs text-text-secondary">
        <div className="flex justify-between">
          <dt>
            ISSS ({descuentos.isss.porcentaje}% sobre{' '}
            ${descuentos.isss.salarioAsegurable.toFixed(2)})
          </dt>
          <dd className="font-mono text-danger">
            -${descuentos.isss.descuento.toFixed(2)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>
            AFP ({descuentos.afp.porcentaje}% sobre{' '}
            ${descuentos.afp.salarioCotizable.toFixed(2)})
          </dt>
          <dd className="font-mono text-danger">
            -${descuentos.afp.descuento.toFixed(2)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>
            Renta (tramo {descuentos.renta.tramo},{' '}
            {descuentos.renta.porcentajeExceso}% sobre exceso de{' '}
            ${descuentos.renta.cuotaFija.toFixed(2)})
          </dt>
          <dd className="font-mono text-danger">
            -${descuentos.renta.descuento.toFixed(2)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-border pt-1 font-semibold text-danger">
          <dt>Total descuentos</dt>
          <dd className="font-mono">
            -${descuentos.totalDescuentos.toFixed(2)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
