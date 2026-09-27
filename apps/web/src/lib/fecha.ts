// Fechas de negocio en formato YYYY-MM-DD, SIEMPRE en la zona local del
// dispositivo (FE-14). `toISOString()` devuelve UTC y está prohibido para
// fechas de negocio: cerca de medianoche en El Salvador cambia el día
// observado (openspec/specs/captura-horas.md § Fechas).
export function hoyLocal(): string {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}
