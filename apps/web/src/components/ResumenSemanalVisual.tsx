import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DiaRegistro } from './registroTypes';
import { formatearFecha, totalesSemana } from './registroTypes';

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
  const totalHoras = t.horasDiurnas + t.horasNocturnas;
  const pctNocturna = totalHoras > 0 ? (t.horasNocturnas / totalHoras) * 100 : 0;

  const barData = dias.map((d) => ({
    label: diaLabel(d.fecha),
    date: diaMes(d.fecha),
    Diurna: d.horasDiurnas,
    Nocturna: d.horasNocturnas,
  }));

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
            <Bar dataKey="Diurna" stackId="a" fill="#6366f1" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Nocturna" stackId="a" fill="#a855f7" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard label="Total" value={`${totalHoras}h`} />
        <StatCard label="Diurnas" value={`${t.horasDiurnas}h`} />
        <StatCard label="Nocturnas" value={`${t.horasNocturnas}h`} />
        <StatCard
          label="% Nocturna"
          value={`${pctNocturna.toFixed(0)}%`}
          highlight={pctNocturna > 30}
        />
      </div>
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
