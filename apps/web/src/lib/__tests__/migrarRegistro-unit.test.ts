import { describe, it, expect } from 'vitest';
import { minutosDelBloque } from '../migrarRegistro';

describe('minutosDelBloque', () => {
  it('19:00→02:00 cruza medianoche → 7h (420 min)', () => {
    const mins = minutosDelBloque({ inicio: '19:00', fin: '02:00' });
    expect(mins).toBe(420); // 7*60
  });

  it('22:00→06:00 cruza medianoche → 8h (480 min)', () => {
    const mins = minutosDelBloque({ inicio: '22:00', fin: '06:00' });
    expect(mins).toBe(480);
  });

  it('08:00→17:00 no cruza medianoche → 9h (540 min)', () => {
    const mins = minutosDelBloque({ inicio: '08:00', fin: '17:00' });
    expect(mins).toBe(540);
  });

  it('00:00→00:00 inicio igual a fin → 0', () => {
    const mins = minutosDelBloque({ inicio: '00:00', fin: '00:00' });
    expect(mins).toBe(0);
  });

  it('10:00→10:00 mismo horario → 0', () => {
    const mins = minutosDelBloque({ inicio: '10:00', fin: '10:00' });
    expect(mins).toBe(0);
  });

  it('invalido: hora NaN → 0', () => {
    const mins = minutosDelBloque({ inicio: 'abc', fin: '10:00' });
    expect(mins).toBe(0);
  });

  it('08:00→08:30 bloque diurno corto → 30 min', () => {
    const mins = minutosDelBloque({ inicio: '08:00', fin: '08:30' });
    expect(mins).toBe(30);
  });

  it('23:00→00:30 cruza medianoche corto → 90 min', () => {
    const mins = minutosDelBloque({ inicio: '23:00', fin: '00:30' });
    expect(mins).toBe(90);
  });
});
