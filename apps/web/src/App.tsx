import { lazy, Suspense, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConfigInicial } from './components/ConfigInicial';
import { EntradasPeriodo } from './components/EntradasPeriodo';
import { IncentivosForm } from './components/IncentivosForm';
import { ResultadoNeto } from './components/ResultadoNeto';
import { TablaTasas } from './components/TablaTasas';
import { ExportarPDF } from './components/ExportarPDF';
import { AppProvider, useAppContext } from './context/AppContext';
import { useCalculos } from './hooks/useCalculos';
import { useTheme } from './hooks/useTheme';

// FE-12: vistas secundarias en carga diferida. Recharts es el paquete pesado;
// el historial se difiere y la guía se monta recién al abrir su `<details>`,
// para no cargar ni evaluar nada de eso en el primer render.
const GraficoPastel = lazy(() =>
  import('./components/GraficoPastel').then((m) => ({ default: m.GraficoPastel })),
);
const HistorialPeriodos = lazy(() =>
  import('./components/HistorialPeriodos').then((m) => ({
    default: m.HistorialPeriodos,
  })),
);
const GuiaCalculos = lazy(() =>
  import('./components/GuiaCalculos').then((m) => ({ default: m.GuiaCalculos })),
);
function CargandoSeccion() {
  return (
    <div className="panel p-4 text-sm text-text-muted" role="status">
      Cargando sección…
    </div>
  );
}

function ThemeToggle() {
  const { toggle, resolved } = useTheme();

  return (
    <button
      onClick={toggle}
      type="button"
      className="panel p-2 text-text-secondary transition-colors hover:text-text print:hidden"
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
      <span className="amount text-xs font-semibold text-primary">{n}</span>
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
  const { entradas, setEntradas, incentivos, setIncentivos, clavesDescartadas, errorPersistencia } = useAppContext();
  const calculosState = useCalculos();
  // FE-12: la guía vive en un `<details>` cerrado; se monta recién al abrirlo
  // para no descargarla ni evaluarla en el primer render (y evitar suspender en
  // paralelo con el gráfico y el historial).
  const [guiaAbierta, setGuiaAbierta] = useState(false);

  return (
    <ErrorBoundary>
      <div className="relative z-10 mx-auto min-h-screen max-w-6xl px-4 pb-12 pt-4 print:px-2 print:py-2">
        {clavesDescartadas.length > 0 && (
          <div
            role="alert"
            className="panel mb-4 border border-danger/40 p-3 text-xs text-text"
          >
            Se descartaron datos guardados corruptos (
            {clavesDescartadas.join(', ')}) y se restablecieron los valores por
            defecto.
          </div>
        )}
        {errorPersistencia && (
          <div
            role="alert"
            className="panel mb-4 border border-warning/40 p-3 text-xs text-text"
          >
            No se pudieron guardar los cambios en este navegador (almacenamiento
            lleno o modo privado). Tus datos se perderán al cerrar la página.
          </div>
        )}
        <header className="site-header sticky top-0 z-20 -mx-4 mb-8 px-4 py-3 print:static print:mb-4 print:border-0 print:bg-none">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <h1 className="display truncate text-lg font-semibold tracking-tight text-text">
                Descuentos de Ley SV
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <hr className="mb-8 print:hidden" />

        <main className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] print:block">
          {/* FE-08 (2026-09-20): el resultado precede a la captura EN EL DOM,
              no solo visualmente — el orden de teclado y lector sigue el DOM.
              Prohibido `order-*` para invertir columnas (engaña al ojo). En
              escritorio la inversión visual usa colocación explícita de grid
              (col-start/row-start): formulario a la izquierda (col 1),
              resultado a la derecha (col 2). El orden de foco es constante:
              resultado → captura → detalles. */}
          <div className="space-y-4 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-24">
            <ResultadoNeto state={calculosState} />
            {calculosState.status === 'success' && (
              <div className="print:hidden">
                <ExportarPDF />
              </div>
            )}
          </div>

          <div className="space-y-5 lg:col-start-1 lg:row-start-1 print:hidden">
            <section className="space-y-3">
              <SectionHeading n="01" title="Configuración" description="Salario base y frecuencia de pago" />
              <ConfigInicial />
            </section>
            <section className="space-y-3">
              <SectionHeading n="02" title="Horas del periodo" description="Extras, días libres y asuetos" />
              <EntradasPeriodo entradas={entradas} onChange={setEntradas} />
            </section>
            <section className="space-y-3">
              <SectionHeading n="03" title="Incentivos" description="Bonos y comisiones" />
              <IncentivosForm incentivos={incentivos} onChange={setIncentivos} />
            </section>
          </div>
        </main>

        {calculosState.status === 'success' && (
          <section className="mt-6 grid gap-4 md:grid-cols-2 print:hidden">
            <Suspense fallback={<CargandoSeccion />}>
              <GraficoPastel
                neto={calculosState.data.neto.salarioLiquido}
                descuentos={calculosState.data.descuentos}
              />
            </Suspense>
            <Suspense fallback={<CargandoSeccion />}>
              <HistorialPeriodos calculoState={calculosState} />
            </Suspense>
          </section>
        )}

        <section className="mt-6 space-y-4 print:hidden">
          <SectionHeading n="04" title="Tasas de ley" description="ISSS, AFP y tramos de renta" />
          <TablaTasas />
        </section>

        <details
          className="mt-4 group print:hidden"
          onToggle={(e) => setGuiaAbierta(e.currentTarget.open)}
        >
          <summary className="tool-card cursor-pointer px-4 py-3 text-sm font-semibold text-text hover:text-primary flex list-none items-center justify-between">
            <span>Guía de Cálculos</span>
            <svg className="size-4 text-text-muted transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </summary>
          <div className="mt-3">
            {guiaAbierta && (
              <Suspense fallback={<CargandoSeccion />}>
                <GuiaCalculos />
              </Suspense>
            )}
          </div>
        </details>

        <hr className="mt-10 print:hidden" />
        <footer className="flex flex-col items-center gap-2 pt-6 text-center print:hidden">
          <p className="text-[11px] text-text-muted">
            Calculadora de descuentos de ley · El Salvador
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
