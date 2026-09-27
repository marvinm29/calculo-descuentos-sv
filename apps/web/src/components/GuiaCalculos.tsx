import type { ReactNode } from 'react';
import {
  AFP,
  AGUINALDO_DIAS,
  DIVISORES_SALARIO,
  FECHA_ACTUALIZACION_TASAS,
  HORAS_EXTRA,
  ISSS,
  QUINCENA_25,
  RENTA_TRAMOS_MENSUAL,
  VACACIONES,
  calcularDescuentos,
  round2,
} from '@calc/shared';

// FE-19: fórmulas, factores y ejemplos se derivan de la fuente única
// (packages/shared/src/tasas.ts). Este componente no hardcodea tasas ni
// reimplementa aritmética: los ejemplos numéricos provienen de invocar el
// motor real (`calcularDescuentos`), garantizando guía y cálculo sincronizados.

const usd = (n: number): string =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pct = (n: number): string => `${(n * 100).toFixed(2).replace(/\.?0+$/, '')}%`;

// Ejemplo base de la guía: salario mensual de $800. Los montos salen del motor.
const EJEMPLO_SALARIO = 800;
const salarioDiario = round2(EJEMPLO_SALARIO / DIVISORES_SALARIO.DIAS_MES);
const salarioHora = round2(salarioDiario / DIVISORES_SALARIO.HORAS_JORNADA_DIURNA);
const descuentosEjemplo = calcularDescuentos(EJEMPLO_SALARIO, 'mensual');
const ejemploIsss = descuentosEjemplo.isss.descuento;
const ejemploAfp = descuentosEjemplo.afp.descuento;
const baseGravableEjemplo = descuentosEjemplo.renta.baseGravable;
const tramoEjemplo = descuentosEjemplo.renta.tramo;
const rentaEjemplo = descuentosEjemplo.renta.descuento;
const vacacionesMonto = round2(salarioDiario * VACACIONES.DIAS_POR_ANO);
const vacacionesBono = round2(vacacionesMonto * VACACIONES.BONO_PORCENTAJE);

const FACTORES_EXTRA = [
  { tipo: 'Extra diurna', factor: `${HORAS_EXTRA.EXTRA_DIURNA.toFixed(2)}x` },
  { tipo: 'Extra nocturna', factor: `${HORAS_EXTRA.EXTRA_NOCTURNA.toFixed(2)}x` },
  { tipo: 'Día libre diurna', factor: `${HORAS_EXTRA.DIA_LIBRE_DIURNA.toFixed(2)}x` },
  { tipo: 'Día libre nocturna', factor: `${HORAS_EXTRA.DIA_LIBRE_NOCTURNA.toFixed(2)}x` },
  { tipo: 'Asueto', factor: `${HORAS_EXTRA.ASUETO.toFixed(2)}x` },
] as const;

interface Seccion {
  id: string;
  title: string;
  formula?: string;
  formula2?: string;
  desc?: string;
  table?: readonly Record<string, string>[];
  formulaRenta?: string;
  example?: Record<string, string>;
}

const SECTIONS: Seccion[] = [
  {
    id: 'salario-hora',
    title: 'Salario por Hora',
    formula: `salarioDiario = salarioMensual / ${DIVISORES_SALARIO.DIAS_MES}`,
    formula2: `salarioHora = salarioDiario / ${DIVISORES_SALARIO.HORAS_JORNADA_DIURNA}`,
    example: {
      texto: `Salario $${EJEMPLO_SALARIO}/mes → salario diario = $${usd(salarioDiario)} → salario/hora = $${usd(salarioHora)}`,
    },
    desc: `Se divide el salario mensual entre ${DIVISORES_SALARIO.DIAS_MES} días para obtener el salario diario, luego entre ${DIVISORES_SALARIO.HORAS_JORNADA_DIURNA} horas para obtener el salario por hora (Art. 168 CT).`,
  },
  {
    id: 'incentivos',
    title: 'Incentivos (Bonos, Comisiones)',
    desc: 'Los bonos y comisiones habituales forman parte del salario y están sujetos a cotización de ISSS/AFP e ISR (LISR Art. 3). Por defecto, los incentivos se marcan como sujetos a descuentos de ley. Si se marca "No aplica descuentos", se suman al bruto total sin cotizar.',
  },
  {
    id: 'horas-extra',
    title: 'Horas Extra',
    desc: 'Las horas extras se pagan con factores adicionales sobre el salario por hora, según el Art. 168-173 del Código de Trabajo.',
    table: FACTORES_EXTRA.map((f) => ({
      tipo: f.tipo,
      factor: f.factor,
      formula: `salarioHora × ${f.factor}`,
    })),
  },
  {
    id: 'isss',
    title: 'ISSS (Seguro Social)',
    formula: `descuento = min(salarioBruto, $${usd(ISSS.TOPE_MENSUAL)}) × ${pct(ISSS.PORCENTAJE_TRABAJADOR)}`,
    example: {
      texto: `Salario $${EJEMPLO_SALARIO} → asegurable $${EJEMPLO_SALARIO} × ${pct(ISSS.PORCENTAJE_TRABAJADOR)} = $${usd(ejemploIsss)}`,
    },
    desc: `El ISSS es el ${pct(ISSS.PORCENTAJE_TRABAJADOR)} del salario, con un tope máximo de descuento de $${usd(round2(ISSS.TOPE_MENSUAL * ISSS.PORCENTAJE_TRABAJADOR))} mensuales (salario asegurable máximo $${usd(ISSS.TOPE_MENSUAL)}). Ley del Seguro Social.`,
  },
  {
    id: 'afp',
    title: 'AFP (Fondo de Pensiones)',
    formula: `descuento = min(salarioBruto, $${usd(AFP.TOPE_MENSUAL)}) × ${pct(AFP.PORCENTAJE_TRABAJADOR)}`,
    example: {
      texto: `Salario $${EJEMPLO_SALARIO} → cotizable $${EJEMPLO_SALARIO} × ${pct(AFP.PORCENTAJE_TRABAJADOR)} = $${usd(ejemploAfp)}`,
    },
    desc: `La AFP es el ${pct(AFP.PORCENTAJE_TRABAJADOR)} del salario, con un tope de cotización de $${usd(AFP.TOPE_MENSUAL)} mensuales. Art. 16 LISP.`,
  },
  {
    id: 'renta',
    title: 'Renta (ISR)',
    desc: 'Se calcula sobre la base gravable (salario bruto - ISSS - AFP). Tabla progresiva por tramos según Art. 37 LISR (D.L. 293, 2025).',
    table: RENTA_TRAMOS_MENSUAL.map((t) => ({
      tipo: `Tramo ${t.tramo}`,
      desde: `$${usd(t.desde)}`,
      hasta: Number.isFinite(t.hasta) ? `$${usd(t.hasta)}` : '—',
      cuota: `$${usd(t.cuotaFija)}`,
      exceso: pct(t.porcentajeExceso),
    })),
    formulaRenta:
      'baseGravable = salarioBruto - ISSS - AFP\n' +
      RENTA_TRAMOS_MENSUAL.filter((t) => t.porcentajeExceso > 0)
        .map(
          (t) =>
            `Tramo ${t.tramo}: (base - $${usd(t.excesoDesde)}) × ${pct(t.porcentajeExceso)} + $${usd(t.cuotaFija)}`,
        )
        .join('\n'),
    example: {
      texto: `Salario $${EJEMPLO_SALARIO} − ISSS $${usd(ejemploIsss)} − AFP $${usd(ejemploAfp)} = base $${usd(baseGravableEjemplo)} (Tramo ${tramoEjemplo}) → Renta = $${usd(rentaEjemplo)}`,
    },
  },
  {
    id: 'aguinaldo',
    title: 'Aguinaldo',
    desc: 'Según Art. 198-200 CT. Se calcula con días de salario según antigüedad, sobre el salario base (sin extras).',
    table: [
      {
        tipo: 'Menos de 1 año',
        factor: 'Proporcional',
        formula: '(días / 365) × 15 × salarioDiario',
      },
      {
        tipo: '1 a 3 años',
        factor: `${AGUINALDO_DIAS.DE_1_A_3} días`,
        formula: `${AGUINALDO_DIAS.DE_1_A_3} × salarioDiario`,
      },
      {
        tipo: '3 a 9 años',
        factor: `${AGUINALDO_DIAS.DE_3_A_9} días`,
        formula: `${AGUINALDO_DIAS.DE_3_A_9} × salarioDiario`,
      },
      {
        tipo: '10+ años',
        factor: `${AGUINALDO_DIAS.DE_10_O_MAS} días`,
        formula: `${AGUINALDO_DIAS.DE_10_O_MAS} × salarioDiario`,
      },
    ],
  },
  {
    id: 'vacaciones',
    title: 'Vacaciones',
    formula: `${VACACIONES.DIAS_POR_ANO} días × salarioDiario + ${pct(VACACIONES.BONO_PORCENTAJE)} bono vacacional`,
    desc: `El trabajador tiene derecho a ${VACACIONES.DIAS_POR_ANO} días de vacaciones pagadas, más un bono del ${pct(VACACIONES.BONO_PORCENTAJE)} del monto vacacional. No sujeto a ISSS/AFP/Renta (Art. 177 CT).`,
    example: {
      texto: `Salario $${EJEMPLO_SALARIO} → ${VACACIONES.DIAS_POR_ANO} días = $${usd(vacacionesMonto)} + bono ${pct(VACACIONES.BONO_PORCENTAJE)} = $${usd(vacacionesBono)} → Total = $${usd(round2(vacacionesMonto + vacacionesBono))}`,
    },
  },
  {
    id: 'quincena25',
    title: 'Quincena 25',
    formula: `monto = salarioMensual × ${pct(QUINCENA_25.PORCENTAJE)} (si salario ≤ $${usd(QUINCENA_25.SALARIO_MAXIMO)})`,
    desc: `Aplica solo para salarios mensuales de hasta $${usd(QUINCENA_25.SALARIO_MAXIMO)}. Es el ${pct(QUINCENA_25.PORCENTAJE)} del salario mensual. No sujeto a descuentos. Obligatorio en el sector público.`,
  },
];

function FlowNode({ label, top }: { label: string; top?: boolean }) {
  return (
    <div className={`flex flex-col items-center ${top ? 'mt-0' : 'mt-8'}`}>
      <div className="border border-border bg-surface-alt text-text text-[10px] font-bold px-2.5 py-1.5 rounded-md whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}

function FlowNodeSub({ label }: { label: string }) {
  return (
    <div className="border border-border bg-surface-alt text-text text-[9px] font-medium px-2 py-1 rounded-md whitespace-nowrap">
      {label}
    </div>
  );
}

function FlowNodeGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-semibold text-text-secondary">{label}</span>
      <div className="flex gap-1">
        {items.map((item) => (
          <div
            key={item}
            className="border border-border bg-surface-alt text-text text-[10px] font-bold px-2.5 py-1.5 rounded-md whitespace-nowrap"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowNodeGroupExt({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-semibold text-text-secondary">{label}</span>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <div
            key={item}
            className="border border-border bg-surface-alt text-text text-[9px] font-bold px-2 py-1 rounded-md whitespace-nowrap"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex items-center mt-2.5 px-1">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="text-text-muted shrink-0"
      >
        <path
          d="M3 10h12M11 6l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function FlowSplit({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 mt-2">
      <div className="flex gap-1">
        {left}
        {right}
      </div>
    </div>
  );
}

function FlowDiagram() {
  return (
    <div className="tool-card p-4 mb-6 overflow-x-auto">
      <h3 className="text-sm font-bold text-text mb-4">Diagrama del Cálculo</h3>
      <div className="flex items-start gap-0 min-w-[600px]">
        <FlowNode label="Salario Base" top />
        <FlowArrow />
        <FlowNodeGroup
          label="Extras"
          items={['HE Diurna', 'HE Nocturna', 'Incentivos']}
        />
        <FlowArrow />
        <FlowNode label="Salario Bruto" top />
        <FlowArrow />
        <FlowSplit
          left={<FlowNodeSub label={`ISSS ${pct(ISSS.PORCENTAJE_TRABAJADOR)}`} />}
          right={<FlowNodeSub label={`AFP ${pct(AFP.PORCENTAJE_TRABAJADOR)}`} />}
        />
        <FlowArrow />
        <FlowNode label="Base Gravable" top />
        <FlowArrow />
        <FlowNode label="Renta" top />
        <FlowArrow />
        <FlowNodeGroupExt label="Neto Líquido" items={['Bruto − ISSS − AFP − Renta']} />
        <FlowArrow />
        <FlowNodeGroupExt
          label="Prestaciones"
          items={['Aguinaldo', 'Vacaciones', 'Quincena 25']}
        />
      </div>
    </div>
  );
}

export function GuiaCalculos() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-text">Guía de Cálculos</h2>

      <p className="text-xs text-text-secondary leading-relaxed">
        Esta calculadora aplica las tasas vigentes de ISSS, AFP y Renta según la
        legislación salvadoreña actualizada a {FECHA_ACTUALIZACION_TASAS}. A continuación
        se explica cada cálculo con fórmulas y ejemplos.
      </p>

      <FlowDiagram />

      <div className="space-y-3">
        {SECTIONS.map((s) => (
          <div key={s.id} id={s.id} className="tool-card p-4 scroll-mt-4">
            <h3 className="text-sm font-bold text-text mb-2">{s.title}</h3>

            {s.desc && (
              <p className="text-xs text-text-secondary mb-3 leading-relaxed">{s.desc}</p>
            )}

            {s.formula && (
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">
                  Fórmula
                </span>
                <pre className="mt-1 tool-card rounded-md px-3 py-2 text-xs font-mono text-primary leading-relaxed">
                  {s.formula}
                </pre>
              </div>
            )}

            {s.formula2 && (
              <div className="mb-2">
                <pre className="tool-card rounded-md px-3 py-2 text-xs font-mono text-primary leading-relaxed">
                  {s.formula2}
                </pre>
              </div>
            )}

            {s.formulaRenta && (
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">
                  Fórmula
                </span>
                <pre className="mt-1 tool-card rounded-md px-3 py-2 text-xs font-mono text-primary leading-relaxed whitespace-pre-line">
                  {s.formulaRenta}
                </pre>
              </div>
            )}

            {s.example && (
              <div className="mb-3">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">
                  Ejemplo
                </span>
                <div className="mt-1 tool-card rounded-md px-3 py-2 text-xs text-text-secondary leading-relaxed">
                  {s.example.texto}
                </div>
              </div>
            )}

            {s.table && (
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-text-secondary">
                  <thead>
                    <tr className="border-b border-border text-left">
                      {Object.keys(s.table[0]!).map((key) => (
                        <th
                          key={key}
                          className="py-1 pr-2 font-bold text-text-muted uppercase tracking-wide text-[10px]"
                        >
                          {key === 'tipo'
                            ? 'Tipo'
                            : key === 'desde'
                              ? 'Desde'
                              : key === 'hasta'
                                ? 'Hasta'
                                : key === 'cuota'
                                  ? 'Cuota Fija'
                                  : key === 'exceso'
                                    ? '% Exceso'
                                    : key === 'factor'
                                      ? 'Factor'
                                      : key === 'formula'
                                        ? 'Fórmula'
                                        : key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.table.map((row, i) => (
                      <tr key={i} className="border-b border-border-soft">
                        {Object.values(row).map((val, j) => (
                          <td
                            key={j}
                            className={`py-1 pr-2 ${j === 0 ? 'font-semibold text-text' : ''}`}
                          >
                            {j === Object.keys(row).indexOf('formula') ? (
                              <code className="text-primary text-[10px]">{val}</code>
                            ) : (
                              val
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-[10px] text-text-muted text-center pt-2">
        Tasas actualizadas a {FECHA_ACTUALIZACION_TASAS}. Verificar vigencia en fuentes
        oficiales.
      </p>
    </section>
  );
}
