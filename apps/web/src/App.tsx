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
      className="glass-card rounded-lg p-2 text-text-secondary hover:text-text"
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
      {/* Animated background */}
      <div className="bg-orbs" aria-hidden="true" />
      <div className="bg-map" aria-hidden="true">
        <svg viewBox="0 0 400 600" fill="var(--sv-blue)" xmlns="http://www.w3.org/2000/svg">
          <path d="M280 40c30 10 60 30 80 55 20 25 35 55 38 85 3 30-5 60-18 88-13 28-30 54-50 76-20 22-42 40-60 62-18 22-30 48-38 76-8 28-10 58-6 88 4 30 14 58 28 85 14 27 32 52 50 76 8 10 12 24 8 36-4 12-14 22-26 28-12 6-26 8-40 6-14-2-26-10-36-20-10-10-18-22-24-36-6-14-10-28-14-42-4-14-6-28-6-42 0-14 2-28 6-42 4-14 10-28 18-40 8-12 18-22 28-32 10-10 18-22 24-36 12-28 20-58 22-88 2-30-2-60-12-88-10-28-26-52-46-72-20-20-44-36-70-46-26-10-54-16-82-16-28 0-56 6-82 16 14-30 34-56 58-78 24-22 52-40 82-52 30-12 62-18 94-18 32 0 64 6 92 18z" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto min-h-screen max-w-2xl px-4 py-6 print:px-2 print:py-2">
        <header className="mb-8 text-center print:mb-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <Show when="signed-out">
                <SignInButton>
                  <button
                    type="button"
                    className="glass-card rounded-lg px-3 py-1 text-xs font-medium text-text-secondary hover:text-text"
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
          <h1 className="mt-6 text-3xl font-bold text-text">
            Calculadora de Descuentos de Ley
          </h1>
          <p className="mt-2 text-sm text-text-muted print:hidden">
            El Salvador — ISSS, AFP, Renta, horas extra y prestaciones
          </p>
        </header>

        <main className="space-y-5 print:space-y-3">
          <div className="print:hidden animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <ConfigInicial />
          </div>
          <div className="print:hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <RegistroSemanal />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <ResultadoNeto state={calculosState} />
          </div>

          {calculosState.status === 'success' && (
            <>
              <div className="print:hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <ExportarPDF />
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                <GraficoPastel
                  neto={calculosState.data.neto.salarioLiquido}
                  descuentos={calculosState.data.descuentos}
                />
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <HistorialPeriodos calculoState={calculosState} />
              </div>
            </>
          )}

          <div className="print:hidden animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
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
