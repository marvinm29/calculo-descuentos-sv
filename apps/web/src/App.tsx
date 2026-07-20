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
import { useTheme } from './hooks/useTheme';

function ThemeToggle() {
  const { toggle, resolved } = useTheme();

  return (
    <button
      onClick={toggle}
      type="button"
      className="rounded-lg border border-border bg-surface p-2 text-text-secondary hover:text-text focus:ring-2 focus:ring-primary focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      aria-label={
        resolved === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
      }
    >
      {resolved === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
          <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM4.34 4.34a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06L4.34 5.4a.75.75 0 010-1.06zM13.54 13.54a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zM15 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 0115 10zM5.4 13.54a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM13.54 5.4a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
          <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}

function AppContent() {
  const calculosState = useCalculos();

  return (
    <ErrorBoundary>
      <div className="mx-auto min-h-screen max-w-2xl px-4 py-8 print:px-2 print:py-2">
        <header className="mb-8 text-center print:mb-2">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <Show when="signed-out">
                <SignInButton>
                  <button
                    type="button"
                    className="rounded-lg border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary hover:text-text focus:ring-2 focus:ring-primary focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Iniciar sesión
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-text dark:text-slate-100">
            Calculadora de Descuentos de Ley
          </h1>
          <p className="mt-2 text-sm text-text-muted print:hidden">
            El Salvador — ISSS, AFP, Renta, horas extra y prestaciones
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
