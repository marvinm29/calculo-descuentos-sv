export type TipoBloque = 'base' | 'extra_diurna' | 'extra_nocturna' | 'pausa';

export interface BloqueHorario {
  id: string;
  inicio: string; // "HH:mm"
  fin: string;    // "HH:mm"
  tipo: TipoBloque;
}

export interface DiaRegistro {
  fecha: string;
  jornadaBase: 'regular_diurna' | 'regular_nocturna' | 'descanso' | 'asueto';
  bloques: BloqueHorario[];
}

let bloqueCounter = 0;
export function crearBloque(
  inicio = '08:00',
  fin = '17:00',
  tipo: TipoBloque = 'base',
): BloqueHorario {
  bloqueCounter += 1;
  return { id: `b-${Date.now()}-${bloqueCounter}`, inicio, fin, tipo };
}

export function crearDiaVacio(fecha: string): DiaRegistro {
  return { fecha, jornadaBase: 'regular_diurna', bloques: [] };
}

function minutosDelBloque(b: BloqueHorario): number {
  const [hI, mI] = b.inicio.split(':').map(Number);
  const [hF, mF] = b.fin.split(':').map(Number);
  if (hI === undefined || mI === undefined || hF === undefined || mF === undefined) return 0;
  const inicio = hI * 60 + mI;
  const fin = hF * 60 + mF;
  if (fin <= inicio) return 0;
  return fin - inicio;
}

function horasDelBloque(b: BloqueHorario): number {
  return minutosDelBloque(b) / 60;
}

export function horasDiurnasDeBloques(bloques: BloqueHorario[]): number {
  return bloques
    .filter((b) => b.tipo === 'base' || b.tipo === 'extra_diurna')
    .reduce((sum, b) => sum + horasDelBloque(b), 0);
}

export function horasNocturnasDeBloques(bloques: BloqueHorario[]): number {
  return bloques
    .filter((b) => b.tipo === 'extra_nocturna')
    .reduce((sum, b) => sum + horasDelBloque(b), 0);
}

export function horasPausa(bloques: BloqueHorario[]): number {
  return bloques
    .filter((b) => b.tipo === 'pausa')
    .reduce((sum, b) => sum + horasDelBloque(b), 0);
}

export function totalHorasBloques(bloques: BloqueHorario[]): number {
  return bloques.reduce((sum, b) => sum + horasDelBloque(b), 0);
}

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function nombreDia(fecha: Date): string {
  const d = fecha.getDay();
  return DIAS_SEMANA[d === 0 ? 6 : d - 1]!;
}

export function formatearFecha(fecha: Date): string {
  return fecha.toISOString().split('T')[0]!;
}

export function getLunes(fecha: Date): Date {
  const d = new Date(fecha);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function semanaIdDesdeLunes(lunes: Date): string {
  return formatearFecha(lunes);
}

export function lunesDesdeSemanaId(semanaId: string): Date {
  return getLunes(new Date(semanaId + 'T00:00:00'));
}

export function generarDiasSemana(lunes: Date): DiaRegistro[] {
  const dias: DiaRegistro[] = [];
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(lunes);
    fecha.setDate(fecha.getDate() + i);
    dias.push(crearDiaVacio(formatearFecha(fecha)));
  }
  return dias;
}

export function totalesSemana(dias: DiaRegistro[]) {
  return dias.reduce(
    (acc, d) => ({
      horasDiurnas: acc.horasDiurnas + horasDiurnasDeBloques(d.bloques),
      horasNocturnas: acc.horasNocturnas + horasNocturnasDeBloques(d.bloques),
      horasPausa: acc.horasPausa + horasPausa(d.bloques),
    }),
    { horasDiurnas: 0, horasNocturnas: 0, horasPausa: 0 },
  );
}
