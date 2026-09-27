import {
  AFP,
  AGUINALDO_DIAS,
  FECHA_ACTUALIZACION_TASAS,
  ISSS,
  QUINCENA_25,
  RENTA_TRAMOS_MENSUAL,
  VACACIONES,
  round2,
} from '@calc/shared';

// FE-09: los valores provienen de la fuente única (packages/shared/src/tasas.ts).
// Este archivo NO duplica tasas: solo las formatea para la tabla de referencia.
// Las fuentes legales (artículos/URLs) son metadatos de la tabla, no tasas.

const usd = (n: number): string =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pct = (n: number): string => `${(n * 100).toFixed(2)}%`;

const topeIsss = usd(ISSS.TOPE_MENSUAL);
const descuentoMaxIsss = usd(round2(ISSS.TOPE_MENSUAL * ISSS.PORCENTAJE_TRABAJADOR));
const topeAfp = usd(AFP.TOPE_MENSUAL);

interface FilaTasa {
  concepto: string;
  valor: string;
  detalle: string;
  fuente: string;
  url: string;
}

const NUMERALES = ['I', 'II', 'III', 'IV'] as const;

const tramosRenta: FilaTasa[] = RENTA_TRAMOS_MENSUAL.map((t) => {
  const hasta = Number.isFinite(t.hasta) ? usd(t.hasta) : null;
  const exento = t.porcentajeExceso === 0;
  return {
    concepto: `Renta — Tramo ${NUMERALES[t.tramo - 1] ?? t.tramo}`,
    valor: exento ? 'Exento' : `${pct(t.porcentajeExceso)} + $${usd(t.cuotaFija)}`,
    detalle: hasta
      ? `Base gravable de $${usd(t.desde)} a $${hasta}`
      : `Base gravable desde $${usd(t.desde)}`,
    fuente: 'Art. 37 LISR (D.L. 293, D.O. Tomo 447, 30/04/2025)',
    url: 'https://www.mh.gob.sv',
  };
});

const FILAS: FilaTasa[] = [
  {
    concepto: 'ISSS (Trabajador)',
    valor: pct(ISSS.PORCENTAJE_TRABAJADOR),
    detalle: `Tope mensual $${topeIsss} — descuento máx $${descuentoMaxIsss}`,
    fuente: 'Ley del Seguro Social',
    url: 'https://www.isss.gob.sv',
  },
  {
    concepto: 'AFP (Trabajador)',
    valor: pct(AFP.PORCENTAJE_TRABAJADOR),
    detalle: `Tope mensual $${topeAfp}`,
    fuente: 'Art. 16 LISP',
    url: 'https://ssf.gob.sv',
  },
  ...tramosRenta,
  {
    concepto: 'Aguinaldo 1–3 años',
    valor: `${AGUINALDO_DIAS.DE_1_A_3} días`,
    detalle: 'Proporcional si antigüedad < 1 año',
    fuente: 'Art. 198 CT',
    url: 'https://www.mtps.gob.sv',
  },
  {
    concepto: 'Aguinaldo 3–9 años',
    valor: `${AGUINALDO_DIAS.DE_3_A_9} días`,
    detalle: '',
    fuente: 'Art. 198 CT',
    url: 'https://www.mtps.gob.sv',
  },
  {
    concepto: 'Aguinaldo 10+ años',
    valor: `${AGUINALDO_DIAS.DE_10_O_MAS} días`,
    detalle: '',
    fuente: 'Art. 198 CT',
    url: 'https://www.mtps.gob.sv',
  },
  {
    concepto: 'Vacaciones (bono)',
    valor: pct(VACACIONES.BONO_PORCENTAJE),
    detalle: `30% del salario de ${VACACIONES.DIAS_POR_ANO} días`,
    fuente: 'Art. 177 CT',
    url: 'https://www.mtps.gob.sv',
  },
  {
    concepto: 'Quincena 25',
    valor: pct(QUINCENA_25.PORCENTAJE),
    detalle: `Salario ≤ $${usd(QUINCENA_25.SALARIO_MAXIMO)}. Obligatorio sector público.`,
    fuente: 'Ley Quincena 25',
    url: 'https://www.mtps.gob.sv',
  },
];

export function TablaTasas() {
  return (
    <div className="tool-card p-4">
      <h3 className="text-sm font-bold text-text">
        Tasas de Referencia Vigentes
      </h3>
      <p className="mt-1 text-xs text-text-muted">
        Última actualización: {FECHA_ACTUALIZACION_TASAS}. Verificar vigencia en
        fuentes oficiales.
      </p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs text-text-secondary">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-1.5 pr-2 font-bold">Concepto</th>
              <th className="py-1.5 pr-2 font-bold">Valor</th>
              <th className="py-1.5 pr-2 font-bold">Detalle</th>
              <th className="py-1.5 font-bold">Fuente</th>
            </tr>
          </thead>
          <tbody>
            {FILAS.map((t) => (
              <tr key={t.concepto} className="border-b border-border-soft">
                <td className="py-1.5 pr-2">{t.concepto}</td>
                <td className="amount py-1.5 pr-2 font-semibold">{t.valor}</td>
                <td className="py-1.5 pr-2">{t.detalle}</td>
                <td className="py-1.5">
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-hover underline underline-offset-2"
                  >
                    {t.fuente}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
