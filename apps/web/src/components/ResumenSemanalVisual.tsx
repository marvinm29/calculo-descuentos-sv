import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import type { DiaRegistro } from './registroTypes';
import { formatearFecha, totalesSemana } from './registroTypes';

const HOUR_COLORS = ['#6366f1', '#06b6d4', '#a855f7', '#f59e0b', '#ef4444'];

export interface ResumenSemanalVisualProps {
  dias: DiaRegistro[];
  lunes: Date;
  domingo: Date;
  onSemanaAnterior: () => void;
  onSemanaSiguiente: () => void;
}

const DIAS_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function diaLabel(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00');
  const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
  return DIAS_LABELS[idx] ?? fecha;
}

function diaMes(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00');
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function ResumenSemanalVisual({
  dias,
  lunes,
  domingo,
  onSemanaAnterior,
  onSemanaSiguiente,
}: ResumenSemanalVisualProps) {
  const t = totalesSemana(dias);
  const totalHoras =
    t.horasBase +
    t.horasExtraDiurna +
    t.horasExtraNocturna +
    t.horasDiaLibreDiurna +
    t.horasDiaLibreNocturna +
    t.horasAsueto;

  const barData = dias.map((d) => ({
    label: diaLabel(d.fecha),
    date: diaMes(d.fecha),
    Base: d.horasBase,
    'Extra D': d.horasExtraDiurna,
    'Extra N': d.horasExtraNocturna,
    'Libre D': d.horasDiaLibreDiurna,
    'Libre N': d.horasDiaLibreNocturna,
    Asueto: d.horasAsueto,
  }));

  const donutData = [
    { name: 'Base', value: t.horasBase },
    { name: 'Extra D', value: t.horasExtraDiurna },
    { name: 'Extra N', value: t.horasExtraNocturna },
    { name: 'Libre D', value: t.horasDiaLibreDiurna },
    { name: 'Libre N', value: t.horasDiaLibreNocturna },
    { name: 'Asueto', value: t.horasAsueto },
  ].filter((d) => d.value > 0);

  const extraTotal = t.horasExtraDiurna + t.horasExtraNocturna;
  const extraPct = totalHoras > 0 ? (extraTotal / totalHoras) * 100 : 0;

  const now = new Date();
  const semanaActual = getWeekNumber(lunes) === getWeekNumber(now);

  return (
    <div className="glass-card rounded-xl p-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onSemanaAnterior}
          type="button"
          className="glass-card rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text"
          aria-label="Semana anterior"
        >
          ←
        </button>
        <div className="text-center">
          <h3 className="text-sm font-bold text-text">
            {semanaActual ? 'Esta semana' : `Semana ${getWeekNumber(lunes)}`}
          </h3>
          <p className="text-xs text-text-muted">
            {formatearFecha(lunes)} — {formatearFecha(domingo)}
          </p>
        </div>
        <button
          onClick={onSemanaSiguiente}
          type="button"
          className="glass-card rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text"
          aria-label="Semana siguiente"
        >
          →
        </button>
      </div>

      {/* Bar chart: hours per day */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-text-secondary mb-2">
          Horas por día
        </h4>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                backdropFilter: 'blur(12px)',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [`${value}h`, name]}
              labelFormatter={(label: string, payload: unknown[]) => {
                const item = (payload as { payload: { date: string } }[])?.[0]?.payload;
                return `${label} ${item?.date ?? ''}`;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px', color: 'var(--text-secondary)' }}
            />
            <Bar dataKey="Base" stackId="a" fill="#6366f1" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Extra D" stackId="a" fill="#06b6d4" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Extra N" stackId="a" fill="#a855f7" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Libre D" stackId="a" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Libre N" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Asueto" stackId="a" fill="#10b981" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <StatCard label="Total" value={`${totalHoras}h`} />
        <StatCard label="Base" value={`${t.horasBase}h`} />
        <StatCard label="Extra" value={`${extraTotal}h`} />
        <StatCard label="% Extra" value={`${extraPct.toFixed(0)}%`} highlight={extraPct > 20} />
      </div>

      {/* Donut: hour type distribution */}
      {donutData.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-text-secondary mb-2">
            Distribución de horas
          </h4>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
              >
                {donutData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={HOUR_COLORS[index % HOUR_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}h`, 'Horas']}
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(12px)',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '10px', color: 'var(--text-secondary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="glass-card rounded-lg p-2 text-center">
      <p className="text-xs text-text-muted">{label}</p>
      <p
        className={`text-sm font-bold mt-0.5 ${
          highlight ? 'text-warning' : 'text-text'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(
    ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7,
  );
}
