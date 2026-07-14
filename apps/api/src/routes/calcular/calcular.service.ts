import { calcular } from '@calc/shared';
import type { CalcularRequest, CalcularResponse } from '@calc/shared';

export function calcularService(request: CalcularRequest): CalcularResponse {
  return calcular(request);
}
