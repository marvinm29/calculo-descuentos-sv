import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { DescuentosResponse } from '@calc/shared';

const COLORS = ['#16a34a', '#dc2626', '#ea580c', '#7c3aed'];

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
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-text">
        Distribución del Salario Bruto
      </h3>
      <div className="flex justify-center">
        <PieChart width={280} height={250} role="img">
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
          >
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `$${value.toFixed(2)}`}
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
