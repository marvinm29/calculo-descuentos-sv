import type { SemanaRegistro } from '@calc/shared';

const STORAGE_KEY_OLD = 'registro-semanal';

function minutosDelBloque(bloque: { inicio: string; fin: string }): number {
  const [hI, mI] = bloque.inicio.split(':').map(Number);
  const [hF, mF] = bloque.fin.split(':').map(Number);
  if (hI == null || mI == null || hF == null || mF == null) return 0;
  const inicio = hI * 60 + mI;
  const fin = hF * 60 + mF;
  if (fin <= inicio) return 0;
  return fin - inicio;
}

function horasDelBloque(bloque: { inicio: string; fin: string }): number {
  return minutosDelBloque(bloque) / 60;
}

interface BloqueHorarioViejo {
  id: string;
  inicio: string;
  fin: string;
  tipo: string;
}

interface DiaRegistroViejo {
  fecha: string;
  jornadaBase: string;
  bloques: BloqueHorarioViejo[];
}

function semanaRegistroDesdeDias(dias: DiaRegistroViejo[]): SemanaRegistro {
  let extraDiurna = 0;
  let extraNocturna = 0;
  let horasBaseNocturnas = 0;

  for (const d of dias) {
    if (!Array.isArray(d.bloques)) continue;
    const esJornadaNocturna = d.jornadaBase === 'regular_nocturna';
    for (const b of d.bloques) {
      const h = horasDelBloque(b);
      if (b.tipo === 'extra_diurna') extraDiurna += h;
      if (b.tipo === 'extra_nocturna') extraNocturna += h;
      if (b.tipo === 'base' && esJornadaNocturna) {
        horasBaseNocturnas += h;
      }
    }
  }

  return {
    horasBaseNocturnas: Math.round(horasBaseNocturnas * 100) / 100,
    extraDiurna: Math.round(extraDiurna * 100) / 100,
    extraNocturna: Math.round(extraNocturna * 100) / 100,
    diaLibreDiurna: 0,
    diaLibreNocturna: 0,
    asueto: 0,
  };
}

export function migrarRegistroViejo(): SemanaRegistro[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OLD);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const resultado: SemanaRegistro[] = [];

    for (const value of Object.values(parsed)) {
      if (!Array.isArray(value)) continue;
      const dias = value as DiaRegistroViejo[];
      resultado.push(semanaRegistroDesdeDias(dias));
    }

    localStorage.removeItem(STORAGE_KEY_OLD);
    return resultado.length > 0 ? resultado : [];
  } catch {
    localStorage.removeItem(STORAGE_KEY_OLD);
    return [];
  }
}
