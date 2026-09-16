import { describe, it, expect, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';

import { createApp } from '../src/app';
import { errorHandler } from '../src/middleware/errorHandler';

const validRequest = {
  salarioBase: 800,
  tipoPago: 'mensual',
  fechaInicio: '2026-07-01',
  fechaFin: '2026-07-15',
  antiguedad: '1_a_3',
  fechaIngreso: '2025-01-15',
  segmentos: [],
};

describe('createApp — configuración (Regla 9)', () => {
  const ENV_BACKUP = { ...process.env };

  afterEach(() => {
    process.env = { ...ENV_BACKUP };
  });

  it('TRUST_PROXY=true activa trust proxy booleano', async () => {
    process.env['TRUST_PROXY'] = 'true';
    const testApp = createApp({ rateLimitMax: 1000 });
    const res = await request(testApp)
      .post('/api/calcular')
      .set('X-Forwarded-For', '9.9.9.9')
      .send(validRequest)
      .expect(200);
    expect(res.body.bruto.brutoTotal).toBe(800);
  });

  it('TRUST_PROXY con valor numérico activa N saltos', async () => {
    process.env['TRUST_PROXY'] = '2';
    const testApp = createApp({ rateLimitMax: 1000 });
    await request(testApp)
      .post('/api/calcular')
      .set('X-Forwarded-For', '8.8.8.8, 10.0.0.1')
      .send(validRequest)
      .expect(200);
  });

  it('TRUST_PROXY no numérico y no "true" cae a booleano', async () => {
    process.env['TRUST_PROXY'] = 'loopback';
    const testApp = createApp({ rateLimitMax: 1000 });
    await request(testApp).post('/api/calcular').send(validRequest).expect(200);
  });

  it('TRUST_PROXY vacío no confía en proxy', async () => {
    process.env['TRUST_PROXY'] = '';
    const testApp = createApp({ rateLimitMax: 1000 });
    await request(testApp).post('/api/calcular').send(validRequest).expect(200);
  });

  it('CORS_ORIGIN con varias origenes configura allowlist', async () => {
    process.env['CORS_ORIGIN'] =
      'http://localhost:5173, https://marvinmelendez.engineer';
    const testApp = createApp({ rateLimitMax: 1000 });
    const res = await request(testApp)
      .post('/api/calcular')
      .set('Origin', 'https://marvinmelendez.engineer')
      .send(validRequest)
      .expect(200);
    expect(res.headers['access-control-allow-origin']).toBe(
      'https://marvinmelendez.engineer',
    );
  });
});

describe('errorHandler — ramas de rate limit y no-Error', () => {
  function appQueFalla(err: unknown) {
    const testApp = express();
    testApp.use((_req: Request, _res: Response, next: NextFunction) =>
      next(err),
    );
    testApp.use(errorHandler);
    return testApp;
  }

  it('RateLimitError se mapea a 429 RATE_LIMIT_EXCEEDED', async () => {
    const err = new Error('ERL');
    err.name = 'RateLimitError';
    const res = await request(appQueFalla(err)).get('/').expect(429);
    expect(res.body.error).toBe('RATE_LIMIT_EXCEEDED');
    expect(res.body.message).toContain('Demasiadas solicitudes');
  });

  it('valores no-Error (string) también responden 500 sin filtrar', async () => {
    const res = await request(appQueFalla('fallo-primitivo'))
      .get('/')
      .expect(500);
    expect(res.body.error).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(res.body)).not.toContain('fallo-primitivo');
  });
});
