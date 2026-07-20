import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { DescuentosResponse } from '@calc/shared';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1'];

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
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-bold text-text">
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
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              backdropFilter: 'blur(12px)',
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
