import type { CalculoState } from '@calc/shared';
import { ResumenBruto } from './ResumenBruto';
import { TablaDescuentos } from './TablaDescuentos';
import { Prestaciones } from './Prestaciones';
import { NetoLiquido } from './NetoLiquido';

export interface ResultadoNetoProps {
  state: CalculoState;
}

export function ResultadoNeto({ state }: ResultadoNetoProps) {
  if (state.status === 'idle') {
    return (
      <div className="rounded border border-gray-200 bg-white p-6 text-center print:hidden">
        <p className="text-sm text-gray-500">
          Configur&aacute; tu salario y registr&aacute; horas para ver el
          c&aacute;lculo.
        </p>
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div className="rounded border border-gray-200 bg-white p-6 text-center">
        <p className="text-sm text-gray-500">Calculando...</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">{state.error}</p>
      </div>
    );
  }

  const { bruto, descuentos, prestaciones, neto } = state.data;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">
        Resultado del Periodo
      </h2>

      <ResumenBruto bruto={bruto} />
      <TablaDescuentos descuentos={descuentos} />
      <Prestaciones prestaciones={prestaciones} />
      <NetoLiquido neto={neto.salarioLiquido} />
    </section>
  );
}
