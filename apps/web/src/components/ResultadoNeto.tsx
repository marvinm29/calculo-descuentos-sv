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
      <div className="glass-card rounded-2xl p-8 text-center print:hidden">
        <p className="text-sm text-text-muted">
          Configurá tu salario y registrá horas para ver el cálculo.
        </p>
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-sm text-text-muted">Calculando...</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="glass-card rounded-2xl border-danger/30 p-8 text-center">
        <p className="text-sm text-danger">{state.error}</p>
      </div>
    );
  }

  const { bruto, descuentos, prestaciones, neto } = state.data;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-text">
        Resultado del Periodo
      </h2>

      <ResumenBruto bruto={bruto} />
      <TablaDescuentos descuentos={descuentos} />
      <Prestaciones prestaciones={prestaciones} />
      <NetoLiquido neto={neto.salarioLiquido} />
    </section>
  );
}
