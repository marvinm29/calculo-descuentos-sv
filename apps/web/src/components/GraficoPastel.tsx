import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { DescuentosResponse } from '@calc/shared';

// FE-07: los colores provienen de tokens CSS (ningún hex hardcodeado).
const COLORS = [
  'var(--color-success)',
  'var(--color-danger)',
  'var(--color-warning)',
  'var(--color-primary)',
] as const;

export interface GraficoPastelProps {
  neto: number;
  descuentos: DescuentosResponse;
}

export function GraficoPastel({ neto, descuentos }: GraficoPastelProps) {
  const data = [
    { name: 'Salario neto', value: neto },
    { name: 'ISSS', value: descuentos.isss.descuento },
    { name: 'AFP', value: descuentos.afp.descuento },
    { name: 'Renta', value: descuentos.renta.descuento },
  ].filter((d) => d.value > 0);

  return (
    <div className="panel p-4">
      <h3 className="text-sm font-bold text-text">
        Distribución del Salario Bruto
      </h3>
      {/* FE-07: alternativa textual equivalente (lector, impresión,
          reduced-transparency). El gráfico nunca es la única representación y
          se marca `aria-hidden` para no exponer sectores sin nombre (axe
          svg-img-alt): la tabla es la representación accesible. */}
      <table className="mt-2 w-full text-xs text-text-secondary">
        <caption className="sr-only">
          Distribución del salario bruto por concepto
        </caption>
        <thead>
          <tr className="border-b border-border text-left">
            <th scope="col" className="py-1 pr-2 font-bold">Concepto</th>
            <th scope="col" className="py-1 font-bold">Monto</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.name} className="border-b border-border-soft">
              <td className="py-1 pr-2">{d.name}</td>
              <td className="amount py-1 font-semibold">${d.value.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-center" aria-hidden="true">
        <PieChart width={280} height={250} accessibilityLayer={false}>
          <text
            x={140}
            y={117}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-text-muted"
          >
            Distribución
          </text>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            rootTabIndex={-1}
          >
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          {/* FE-07: tooltip opaco (sin backdrop-filter/blur). */}
          <Tooltip
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--text)',
            }}
          />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-text-secondary">{value}</span>
            )}
          />
        </PieChart>
      </div>
    </div>
  );
}
