import { ErrorBoundary } from './components/ErrorBoundary';
import { ConfigInicial } from './components/ConfigInicial';
import { JornadaSelector } from './components/JornadaSelector';
import { EntradasPeriodo } from './components/EntradasPeriodo';
import { IncentivosForm } from './components/IncentivosForm';
import { ResultadoNeto } from './components/ResultadoNeto';
import { GraficoPastel } from './components/GraficoPastel';
import { TablaTasas } from './components/TablaTasas';
import { HistorialPeriodos } from './components/HistorialPeriodos';
import { ExportarPDF } from './components/ExportarPDF';
import { GuiaCalculos } from './components/GuiaCalculos';
import { Torogoz } from './components/Torogoz';
import { MonumentoSalvador } from './components/MonumentoSalvador';
import { AppProvider, useAppContext } from './context/AppContext';
import { useCalculos } from './hooks/useCalculos';
import { useTheme } from './hooks/useTheme';

function ThemeToggle() {
  const { toggle, resolved } = useTheme();

  return (
    <button
      onClick={toggle}
      type="button"
      className="glass-card p-2 text-text-secondary transition-colors hover:text-text"
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

function SectionHeading({
  n,
  title,
  description,
}: {
  n: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="amount text-xs font-semibold text-accent">{n}</span>
      <div>
        <h2 className="display text-base font-semibold text-text">{title}</h2>
        {description ? (
          <p className="text-[13px] text-text-muted">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

function AppContent() {
  const { jornada, setJornada, entradas, setEntradas, incentivos, setIncentivos, clavesDescartadas } = useAppContext();
  const calculosState = useCalculos();

  return (
    <ErrorBoundary>
      <div className="relative z-10 mx-auto min-h-screen max-w-6xl px-4 pb-12 pt-4 print:px-2 print:py-2">
        {clavesDescartadas.length > 0 && (
          <div
            role="alert"
            className="glass-card mb-4 border border-danger/40 p-3 text-xs text-text"
          >
            Se descartaron datos guardados corruptos (
            {clavesDescartadas.join(', ')}) y se restablecieron los valores por
            defecto.
          </div>
        )}
        <header className="glass-nav sticky top-0 z-20 -mx-4 mb-8 px-4 py-3 print:static print:mb-4 print:border-0 print:bg-none">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <Torogoz className="size-6 shrink-0" />
              <h1 className="display truncate text-lg font-semibold tracking-tight text-text">
                Descuentos de Ley SV
              </h1>
              <span className="hidden rounded-full border border-gold/40 px-2 py-0.5 font-mono text-[10px] text-gold sm:inline">
                15·IX
              </span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <hr className="gold-rule mb-8 print:hidden" />

        <main className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] print:block">
          <div className="space-y-5 print:hidden">
            <section className="space-y-3">
              <SectionHeading n="01" title="Configuración" description="Salario base y jornada" />
              <ConfigInicial />
            </section>
            <section className="space-y-3">
              <SectionHeading n="02" title="Jornada" description="Modalidad diurna o nocturna" />
              <JornadaSelector value={jornada} onChange={setJornada} />
            </section>
            <section className="space-y-3">
              <SectionHeading n="03" title="Horas del periodo" description="Extras, días libres y asuetos" />
              <EntradasPeriodo entradas={entradas} onChange={setEntradas} />
            </section>
            <section className="space-y-3">
              <SectionHeading n="04" title="Incentivos" description="Bonos y comisiones" />
              <IncentivosForm incentivos={incentivos} onChange={setIncentivos} />
            </section>
          </div>

          <div className="space-y-4 lg:sticky lg:top-24">
            <ResultadoNeto state={calculosState} />
            {calculosState.status === 'success' && (
              <div className="print:hidden">
                <ExportarPDF />
              </div>
            )}
          </div>
        </main>

        {calculosState.status === 'success' && (
          <section className="mt-6 grid gap-4 md:grid-cols-2 print:hidden">
            <GraficoPastel
              neto={calculosState.data.neto.salarioLiquido}
              descuentos={calculosState.data.descuentos}
            />
            <HistorialPeriodos calculoState={calculosState} />
          </section>
        )}

        <section className="mt-6 space-y-4 print:hidden">
          <SectionHeading n="05" title="Tasas de ley" description="ISSS, AFP y tramos de renta" />
          <TablaTasas />
        </section>

        <details className="mt-4 group print:hidden">
          <summary className="tool-card cursor-pointer px-4 py-3 text-sm font-semibold text-text hover:text-primary flex list-none items-center justify-between">
            <span>Guía de Cálculos</span>
            <svg className="size-4 text-text-muted transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </summary>
          <div className="mt-3">
            <GuiaCalculos />
          </div>
        </details>

        <hr className="gold-rule mt-10 print:hidden" />
        <footer className="flex flex-col items-center gap-2 pt-6 text-center print:hidden">
          <MonumentoSalvador className="size-12 opacity-60" />
          <p className="text-[11px] text-text-muted">
            Calculadora de descuentos de ley · El Salvador
          </p>
          <p className="text-[10px] text-text-muted">
            Mes de la Independencia · 15 de septiembre
          </p>
        </footer>
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
