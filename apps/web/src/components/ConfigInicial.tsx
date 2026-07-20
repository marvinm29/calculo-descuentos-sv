import { useState } from 'react';
import type { FormEvent } from 'react';
import type { TipoPago, Antiguedad } from '@calc/shared';
import { useAppContext } from '../context/AppContext';

export interface ConfigInicialData {
  salarioBase: number;
  tipoPago: TipoPago;
  antiguedad: Antiguedad;
  fechaIngreso: string;
}

interface ErrorMap {
  salarioBase?: string;
  fechaIngreso?: string;
}

function validarConfig(config: ConfigInicialData): ErrorMap {
  const errors: ErrorMap = {};
  if (config.salarioBase <= 0) {
    errors.salarioBase = 'El salario base debe ser un número positivo';
  }
  if (config.salarioBase > 100000) {
    errors.salarioBase = 'El salario base debe ser menor a $100,000';
  }
  if (config.fechaIngreso && !/^\d{4}-\d{2}-\d{2}$/.test(config.fechaIngreso)) {
    errors.fechaIngreso = 'La fecha debe estar en formato ISO 8601 (YYYY-MM-DD)';
  }
  return errors;
}

export function ConfigInicial() {
  const { config, setConfig } = useAppContext();
  const [draft, setDraft] = useState<ConfigInicialData>(config);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [saved, setSaved] = useState(false);

  function handleSalarioChange(value: string) {
    const num = value === '' ? 0 : Number(value);
    setDraft((prev) => ({ ...prev, salarioBase: num }));
    setErrors((prev) => {
      const { salarioBase: _, ...rest } = prev;
      return rest;
    });
    setSaved(false);
  }

  function handleFechaIngresoChange(value: string) {
    setDraft((prev) => ({ ...prev, fechaIngreso: value }));
    setErrors((prev) => {
      const { fechaIngreso: _, ...rest } = prev;
      return rest;
    });
    setSaved(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validarConfig(draft);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setConfig(draft);
    setErrors({});
    setSaved(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="glass-card mx-auto max-w-lg space-y-5 rounded-2xl p-6"
    >
      <h2 className="text-lg font-bold text-text">
        Configuración Inicial
      </h2>

      <div>
        <label
          htmlFor="salarioBase"
          className="block text-sm font-medium text-text-secondary"
        >
          Salario base mensual (USD)
        </label>
        <input
          id="salarioBase"
          type="number"
          min={0}
          step="0.01"
          value={draft.salarioBase || ''}
          onChange={(e) => {
            handleSalarioChange(e.target.value);
          }}
          className="glass-input mt-1 block w-full rounded-xl px-3 py-2 text-sm"
          aria-describedby={errors.salarioBase ? 'salarioBase-error' : undefined}
          aria-invalid={!!errors.salarioBase}
        />
        {errors.salarioBase && (
          <p id="salarioBase-error" className="mt-1 text-xs text-danger">
            {errors.salarioBase}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="tipoPago"
          className="block text-sm font-medium text-text-secondary"
        >
          Tipo de pago
        </label>
        <select
          id="tipoPago"
          value={draft.tipoPago}
          onChange={(e) => {
            setDraft((prev) => ({
              ...prev,
              tipoPago: e.target.value as TipoPago,
            }));
            setSaved(false);
          }}
          className="glass-input mt-1 block w-full rounded-xl px-3 py-2 text-sm"
        >
          <option value="mensual">Mensual</option>
          <option value="quincenal">Quincenal</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="antiguedad"
          className="block text-sm font-medium text-text-secondary"
        >
          Antigüedad laboral
        </label>
        <select
          id="antiguedad"
          value={draft.antiguedad}
          onChange={(e) => {
            setDraft((prev) => ({
              ...prev,
              antiguedad: e.target.value as Antiguedad,
            }));
            setSaved(false);
          }}
          className="glass-input mt-1 block w-full rounded-xl px-3 py-2 text-sm"
        >
          <option value="menos_1">Menos de 1 año</option>
          <option value="1_a_3">1 a 3 años</option>
          <option value="3_a_9">3 a 9 años</option>
          <option value="10_o_mas">10 años o más</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="fechaIngreso"
          className="block text-sm font-medium text-text-secondary"
        >
          Fecha de ingreso a la empresa
        </label>
        <input
          id="fechaIngreso"
          type="date"
          value={draft.fechaIngreso}
          onChange={(e) => {
            handleFechaIngresoChange(e.target.value);
          }}
          className="glass-input mt-1 block w-full rounded-xl px-3 py-2 text-sm"
          aria-describedby={
            errors.fechaIngreso ? 'fechaIngreso-error' : undefined
          }
          aria-invalid={!!errors.fechaIngreso}
        />
        {errors.fechaIngreso && (
          <p id="fechaIngreso-error" className="mt-1 text-xs text-danger">
            {errors.fechaIngreso}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="btn-accent w-full rounded-xl px-4 py-2.5 text-sm"
      >
        Guardar configuración
      </button>

      {saved && (
        <p role="status" className="text-center text-sm text-success">
          Configuración guardada correctamente.
        </p>
      )}
    </form>
  );
}
