import { ErrorBoundary } from './components/ErrorBoundary';
import { ConfigInicial } from './components/ConfigInicial';
import { RegistroSemanal } from './components/RegistroSemanal';
import { ResultadoNeto } from './components/ResultadoNeto';
import { GraficoPastel } from './components/GraficoPastel';
import { TablaTasas } from './components/TablaTasas';
import { HistorialPeriodos } from './components/HistorialPeriodos';
import { ExportarPDF } from './components/ExportarPDF';
import { useCalculos } from './hooks/useCalculos';

export function App() {
  const calculosState = useCalculos();

  return (
    <ErrorBoundary>
      <div className="mx-auto min-h-screen max-w-2xl px-4 py-8 print:px-2 print:py-2">
        <header className="mb-8 text-center print:mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Calculadora de Descuentos de Ley
          </h1>
          <p className="mt-2 text-sm text-gray-500 print:hidden">
            El Salvador &mdash; ISSS, AFP, Renta, horas extra y prestaciones
          </p>
        </header>

        <main className="space-y-6 print:space-y-3">
          <div className="print:hidden">
            <ConfigInicial />
          </div>
          <div className="print:hidden">
            <RegistroSemanal />
          </div>

          <ResultadoNeto state={calculosState} />

          {calculosState.status === 'success' && (
            <>
              <div className="print:hidden">
                <ExportarPDF />
              </div>
              <GraficoPastel
                neto={calculosState.data.neto.salarioLiquido}
                descuentos={calculosState.data.descuentos}
              />
              <HistorialPeriodos calculoState={calculosState} />
            </>
          )}

          <div className="print:hidden">
            <TablaTasas />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
