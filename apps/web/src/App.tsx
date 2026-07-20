import { Show, SignInButton, UserButton } from '@clerk/react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConfigInicial } from './components/ConfigInicial';
import { RegistroSemanal } from './components/RegistroSemanal';
import { ResultadoNeto } from './components/ResultadoNeto';
import { GraficoPastel } from './components/GraficoPastel';
import { TablaTasas } from './components/TablaTasas';
import { HistorialPeriodos } from './components/HistorialPeriodos';
import { ExportarPDF } from './components/ExportarPDF';
import { AppProvider } from './context/AppContext';
import { useCalculos } from './hooks/useCalculos';

function AppContent() {
  const calculosState = useCalculos();

  return (
    <ErrorBoundary>
      <div className="mx-auto min-h-screen max-w-2xl px-4 py-8 print:px-2 print:py-2">
        <header className="mb-8 text-center print:mb-2">
          <div className="flex items-center justify-between">
            <div />
            <Show when="signed-out">
              <SignInButton>
                <button
                  type="button"
                  className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                >
                  Iniciar sesi&oacute;n
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
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

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
