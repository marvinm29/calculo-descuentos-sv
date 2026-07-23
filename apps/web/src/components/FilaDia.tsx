import type { DiaRegistro, BloqueHorario, TipoBloque } from './registroTypes';
import { crearBloque, nombreDia, horasDiurnasDeBloques, horasNocturnasDeBloques, horasPausa } from './registroTypes';

export interface FilaDiaProps {
  dia: DiaRegistro;
  onChange: (dia: DiaRegistro) => void;
}

const TIPOS: { value: TipoBloque; label: string; color: string }[] = [
  { value: 'base', label: 'Base', color: 'text-primary' },
  { value: 'extra_diurna', label: 'Extra D', color: 'text-accent' },
  { value: 'extra_nocturna', label: 'Extra N', color: 'text-warning' },
  { value: 'pausa', label: 'Pausa', color: 'text-text-muted' },
];

export function FilaDia({ dia, onChange }: FilaDiaProps) {
  const fecha = new Date(dia.fecha + 'T00:00:00');
  const nombre = nombreDia(fecha);

  const horasD = horasDiurnasDeBloques(dia.bloques);
  const horasN = horasNocturnasDeBloques(dia.bloques);
  const pausa = horasPausa(dia.bloques);

  function actualizarBloque(id: string, campo: keyof BloqueHorario, valor: string) {
    onChange({
      ...dia,
      bloques: dia.bloques.map((b) => (b.id === id ? { ...b, [campo]: valor } : b)),
    });
  }

  function eliminarBloque(id: string) {
    onChange({ ...dia, bloques: dia.bloques.filter((b) => b.id !== id) });
  }

  function agregarBloque() {
    onChange({ ...dia, bloques: [...dia.bloques, crearBloque()] });
  }

  return (
    <div className="glass-card space-y-2 rounded-xl p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text">{nombre}</span>
          <span className="text-xs text-text-muted">{dia.fecha}</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="text-primary">{horasD.toFixed(1)}h D</span>
          <span className="text-warning">{horasN.toFixed(1)}h N</span>
          {pausa > 0 && <span className="text-text-muted">{pausa.toFixed(1)}h pause</span>}
        </div>
      </div>

      {/* Block list */}
      <div className="space-y-1.5">
        {dia.bloques.map((b) => (
          <div key={b.id} className="flex items-center gap-1.5">
            <input
              type="time"
              value={b.inicio}
              onChange={(e) => { actualizarBloque(b.id, 'inicio', e.target.value); }}
              className="glass-input w-24 rounded-lg px-2 py-1 text-xs"
              aria-label={`Inicio ${nombre}`}
            />
            <span className="text-text-muted text-xs">→</span>
            <input
              type="time"
              value={b.fin}
              onChange={(e) => { actualizarBloque(b.id, 'fin', e.target.value); }}
              className="glass-input w-24 rounded-lg px-2 py-1 text-xs"
              aria-label={`Fin ${nombre}`}
            />
            <select
              value={b.tipo}
              onChange={(e) => { actualizarBloque(b.id, 'tipo', e.target.value); }}
              className="glass-input rounded-lg px-1.5 py-1 text-xs w-20"
              aria-label={`Tipo bloque ${nombre}`}
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <button
              onClick={() => { eliminarBloque(b.id); }}
              type="button"
              className="text-danger hover:text-danger/70 text-xs font-bold px-1"
              aria-label={`Eliminar bloque ${nombre}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={agregarBloque}
        type="button"
        className="w-full rounded-lg border border-dashed border-border py-1.5 text-xs font-medium text-text-muted hover:text-text hover:border-text-muted transition-colors"
      >
        + Agregar bloque
      </button>
    </div>
  );
}
