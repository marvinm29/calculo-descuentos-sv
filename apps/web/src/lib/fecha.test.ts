import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { hoyLocal } from './fecha';

// Fija la zona del negocio para que la prueba no dependa del TZ del host.
const TZ_ORIGINAL = process.env.TZ;

describe('hoyLocal (FE-14)', () => {
  beforeAll(() => {
    process.env.TZ = 'America/El_Salvador';
  });

  afterAll(() => {
    if (TZ_ORIGINAL === undefined) delete process.env.TZ;
    else process.env.TZ = TZ_ORIGINAL;
    vi.useRealTimers();
  });

  it('usa componentes Y/M/D locales, no UTC', () => {
    // 2026-03-10 23:30 en UTC-6 → UTC ya es 2026-03-11 05:30.
    // toISOString() daría el día siguiente; hoyLocal debe dar el día local.
    const fakeNow = new Date('2026-03-10T23:30:00-06:00');
    vi.setSystemTime(fakeNow);
    expect(fakeNow.toISOString().slice(0, 10)).toBe('2026-03-11');
    expect(hoyLocal()).toBe('2026-03-10');
  });

  it('cerca de medianoche local mantiene el día observado', () => {
    vi.setSystemTime(new Date('2026-12-31T23:59:59-06:00'));
    expect(hoyLocal()).toBe('2026-12-31');
  });

  it('formatea mes y día con dos dígitos', () => {
    vi.setSystemTime(new Date('2026-01-05T10:00:00-06:00'));
    expect(hoyLocal()).toBe('2026-01-05');
  });
});
