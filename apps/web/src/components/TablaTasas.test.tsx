import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TablaTasas } from './TablaTasas';
import {
  AFP,
  AGUINALDO_DIAS,
  FECHA_ACTUALIZACION_TASAS,
  ISSS,
  QUINCENA_25,
  RENTA_TRAMOS_MENSUAL,
  VACACIONES,
} from '@calc/shared';

describe('TablaTasas', () => {
  it('muestra el encabezado y la fecha de actualizacion', () => {
    render(<TablaTasas />);
    expect(
      screen.getByText(/Tasas de Referencia/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(FECHA_ACTUALIZACION_TASAS)),
    ).toBeInTheDocument();
  });

  it('incluye enlaces a fuentes oficiales .gob.sv', () => {
    render(<TablaTasas />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    expect(links.some((l) => l.getAttribute('href')?.includes('.gob.sv'))).toBe(
      true,
    );
  });

  it('muestra ISSS, AFP, Renta y Aguinaldo', () => {
    render(<TablaTasas />);
    expect(screen.getByText(/ISSS \(Trabajador\)/)).toBeInTheDocument();
    expect(screen.getByText(/AFP \(Trabajador\)/)).toBeInTheDocument();
    expect(screen.getByText('Renta — Tramo I')).toBeInTheDocument();
    expect(screen.getByText(/Aguinaldo 1–3/)).toBeInTheDocument();
    expect(screen.getByText(/Vacaciones \(bono\)/)).toBeInTheDocument();
    expect(screen.getByText('Quincena 25')).toBeInTheDocument();
  });

  // ─── FE-09: la tabla no duplica tasas; se deriva de la fuente única ───
  it('muestra exactamente los porcentajes y topes de @calc/shared/tasas', () => {
    render(<TablaTasas />);

    expect(
      screen.getByText(`${(ISSS.PORCENTAJE_TRABAJADOR * 100).toFixed(2)}%`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${(AFP.PORCENTAJE_TRABAJADOR * 100).toFixed(2)}%`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `Tope mensual $${ISSS.TOPE_MENSUAL.toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })} — descuento máx $${(ISSS.TOPE_MENSUAL * ISSS.PORCENTAJE_TRABAJADOR).toFixed(2)}`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `Tope mensual $${AFP.TOPE_MENSUAL.toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })}`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(`${AGUINALDO_DIAS.DE_1_A_3} días`)).toBeInTheDocument();
    expect(screen.getByText(`${AGUINALDO_DIAS.DE_3_A_9} días`)).toBeInTheDocument();
    expect(screen.getByText(`${AGUINALDO_DIAS.DE_10_O_MAS} días`)).toBeInTheDocument();
    expect(
      screen.getByText(`${(VACACIONES.BONO_PORCENTAJE * 100).toFixed(2)}%`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${(QUINCENA_25.PORCENTAJE * 100).toFixed(2)}%`),
    ).toBeInTheDocument();
  });

  it('muestra los cuatro tramos de renta con cuota y porcentaje del contrato', () => {
    render(<TablaTasas />);
    const NUMERALES = ['I', 'II', 'III', 'IV'] as const;
    for (const t of RENTA_TRAMOS_MENSUAL) {
      expect(
        screen.getByText(`Renta — Tramo ${NUMERALES[t.tramo - 1]}`),
      ).toBeInTheDocument();
      if (t.porcentajeExceso > 0) {
        expect(
          screen.getByText(
            `${(t.porcentajeExceso * 100).toFixed(2)}% + $${t.cuotaFija.toFixed(2)}`,
          ),
        ).toBeInTheDocument();
      }
    }
  });
});
