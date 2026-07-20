export interface DiaRegistro {
  fecha: string;
  jornadaBase: 'regular_diurna' | 'regular_nocturna' | 'descanso' | 'asueto';
  horasDiurnas: number;
  horasNocturnas: number;
}

export function crearDiaVacio(fecha: string): DiaRegistro {
  return {
    fecha,
    jornadaBase: 'regular_diurna',
    horasDiurnas: 0,
    horasNocturnas: 0,
  };
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
      horasDiurnas: acc.horasDiurnas + d.horasDiurnas,
      horasNocturnas: acc.horasNocturnas + d.horasNocturnas,
    }),
    { horasDiurnas: 0, horasNocturnas: 0 },
  );
}
