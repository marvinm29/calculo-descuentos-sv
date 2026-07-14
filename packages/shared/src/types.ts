// Tipos del contrato de API (ver specs/api-contract.md).
// Interfaces para APIs, type para unions/primitives (regla del AGENTS.md).

export type TipoPago = 'mensual' | 'quincenal';

export type Antiguedad = 'menos_1' | '1_a_3' | '3_a_9' | '10_o_mas';

export type TipoJornada =
  | 'regular_diurna'
  | 'regular_nocturna'
  | 'extra_diurna'
  | 'extra_nocturna'
  | 'dia_libre_diurna'
  | 'dia_libre_nocturna'
  | 'asueto';

export interface SegmentoHorario {
  fecha: string; // ISO 8601: "2026-07-01"
  tipo: TipoJornada;
  horas: number; // Entre 0 y 24
}

export interface CalcularRequest {
  salarioBase: number;
  tipoPago: TipoPago;
  fechaInicio: string; // ISO 8601
  fechaFin: string; // ISO 8601
  antiguedad: Antiguedad;
  fechaIngreso: string; // ISO 8601
  segmentos: SegmentoHorario[];
}

export interface BrutoResponse {
  salarioBase: number;
  horasExtraDiurna: number;
  horasExtraNocturna: number;
  diaLibreDiurna: number;
  diaLibreNocturna: number;
  asueto: number;
  brutoTotal: number;
}

export interface IsssResponse {
  porcentaje: number; // 3.00
  salarioAsegurable: number;
  descuento: number;
}

export interface AfpResponse {
  porcentaje: number; // 7.25
  salarioCotizable: number;
  descuento: number;
}

export interface RentaResponse {
  baseGravable: number;
  tramo: number; // 1, 2, 3, 4
  porcentajeExceso: number;
  cuotaFija: number;
  descuento: number;
}

export interface DescuentosResponse {
  isss: IsssResponse;
  afp: AfpResponse;
  renta: RentaResponse;
  totalDescuentos: number;
}

export interface AguinaldoResponse {
  dias: number;
  monto: number;
  proporcional: boolean;
}

export interface VacacionesResponse {
  porcentaje: number; // 30.00
  monto: number;
}

export interface Quincena25Response {
  porcentaje: number; // 50.00
  monto: number;
}

export interface PrestacionesResponse {
  aguinaldo: AguinaldoResponse | null;
  vacaciones: VacacionesResponse | null;
  quincena25: Quincena25Response | null;
}

export interface NetoResponse {
  salarioLiquido: number;
}

export interface CalcularResponse {
  bruto: BrutoResponse;
  descuentos: DescuentosResponse;
  prestaciones: PrestacionesResponse;
  neto: NetoResponse;
}

// Estados de fetch (discriminated union — regla del AGENTS.md).
export type CalculoState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: CalcularResponse }
  | { status: 'error'; error: string };