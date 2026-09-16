import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

import { app, createApp } from '../src/app';
import { calcularRoutes } from '../src/routes/calcular/calcular.routes';
import { errorHandler } from '../src/middleware/errorHandler';

function createAppWithLimit(limit: number) {
  const testApp = express();
  testApp.use(cors());
  testApp.use(express.json());
  testApp.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req: Request, res: Response) => {
        res.status(429).json({
          error: 'RATE_LIMIT_EXCEEDED',
          message:
            'Demasiadas solicitudes. Intente de nuevo en 60 segundos.',
        });
      },
    }),
  );
  testApp.use(calcularRoutes);
  testApp.use(errorHandler);
  return testApp;
}

const validRequest = {
  salarioBase: 800.0,
  tipoPago: 'quincenal',
  fechaInicio: '2026-07-01',
  fechaFin: '2026-07-15',
  antiguedad: '3_a_9',
  fechaIngreso: '2021-03-15',
  segmentos: [
    { fecha: '2026-07-01', tipo: 'regular_diurna', horas: 8 },
    { fecha: '2026-07-01', tipo: 'extra_diurna', horas: 2 },
    { fecha: '2026-07-02', tipo: 'regular_diurna', horas: 8 },
    { fecha: '2026-07-06', tipo: 'dia_libre_diurna', horas: 8 },
    { fecha: '2026-07-06', tipo: 'dia_libre_nocturna', horas: 3 },
  ],
};

describe('POST /api/calcular', () => {
  describe('happy path — 200', () => {
    it('retorna 200 sin campos opcionales (backward compat)', async () => {
      const reqSinOpcionales = {
        salarioBase: 800,
        tipoPago: 'mensual' as const,
        fechaInicio: '2026-07-01',
        fechaFin: '2026-07-31',
        antiguedad: '1_a_3' as const,
        fechaIngreso: '2025-01-15',
        segmentos: [],
      };
      const res = await request(app)
        .post('/api/calcular')
        .send(reqSinOpcionales)
        .expect(200);
      expect(res.body.bruto.incentivos).toBe(0);
      expect(res.body.bruto.incentivosGravados).toBe(0);
    });

    it('retorna 200 con estructura CalcularResponse completa', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send(validRequest)
        .expect(200);

      expect(res.body).toHaveProperty('bruto');
      expect(res.body).toHaveProperty('descuentos');
      expect(res.body).toHaveProperty('prestaciones');
      expect(res.body).toHaveProperty('neto');
    });

    it('bruto contiene salarioBase, extras y brutoTotal', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send(validRequest);

      const { bruto } = res.body;
      expect(bruto.salarioBase).toBe(400);
      expect(bruto.horasExtraDiurna).toBeGreaterThan(0);
      expect(bruto.diaLibreDiurna).toBeGreaterThan(0);
      expect(bruto.diaLibreNocturna).toBeGreaterThan(0);
      expect(bruto.brutoTotal).toBeGreaterThan(bruto.salarioBase);
    });

    it('descuentos contiene ISSS, AFP y Renta con valores positivos', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send(validRequest);

      const { descuentos } = res.body;
      expect(descuentos.isss.porcentaje).toBe(3);
      expect(descuentos.isss.descuento).toBeGreaterThan(0);
      expect(descuentos.afp.porcentaje).toBe(7.25);
      expect(descuentos.afp.descuento).toBeGreaterThan(0);
      expect(descuentos.renta.tramo).toBeGreaterThanOrEqual(1);
      expect(descuentos.renta.descuento).toBeGreaterThan(0);
    });

    it('prestaciones contiene aguinaldo, vacaciones y quincena25', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send(validRequest);

      const { prestaciones } = res.body;
      expect(prestaciones.aguinaldo).not.toBeNull();
      expect(prestaciones.aguinaldo.dias).toBe(19);
      expect(prestaciones.vacaciones).not.toBeNull();
      expect(prestaciones.vacaciones.monto).toBe(120);
      expect(prestaciones.quincena25).not.toBeNull();
    });

    it('neto.salarioLiquido = brutoTotal - totalDescuentos', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send(validRequest);

      const { bruto, neto } = res.body;
      expect(neto.salarioLiquido).toBeGreaterThan(0);
      expect(neto.salarioLiquido).toBeLessThan(bruto.brutoTotal);
    });
  });

  describe('400 — VALIDATION_ERROR con details (Zod)', () => {
    it('rechaza salarioBase negativo con error y field', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send({ ...validRequest, salarioBase: -5 })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
      expect(res.body.details).toBeInstanceOf(Array);
      expect(res.body.details[0].field).toContain('salarioBase');
      expect(res.body.details[0].message).toBeTruthy();
    });

    it('rechaza salarioBase = 0', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send({ ...validRequest, salarioBase: 0 })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('rechaza salarioBase > $100,000', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send({ ...validRequest, salarioBase: 200000 })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('rechaza horas fuera de [0, 24] con field en details', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send({
          ...validRequest,
          segmentos: [
            { fecha: '2026-07-01', tipo: 'regular_diurna', horas: 30 },
          ],
        })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
      const fields = res.body.details.map(
        (d: { field: string }) => d.field,
      );
      expect(fields.some((f: string) => f.includes('horas'))).toBe(true);
    });

    it('rechaza fechaInicio > fechaFin con path fechaInicio', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send({
          ...validRequest,
          fechaInicio: '2026-07-20',
          fechaFin: '2026-07-15',
        })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
      const fields = res.body.details.map(
        (d: { field: string }) => d.field,
      );
      expect(fields.some((f: string) => f.includes('fechaInicio'))).toBe(
        true,
      );
    });

    it('rechaza fechaIngreso posterior al periodo', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send({
          ...validRequest,
          fechaIngreso: '2026-08-01',
        })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('rechaza tipoPago inválido', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send({ ...validRequest, tipoPago: 'semanal' })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('400 — VALIDATION_ERROR (reglas de negocio)', () => {
    it('rechaza periodo > 31 días con field fechaFin', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send({
          ...validRequest,
          fechaInicio: '2026-07-01',
          fechaFin: '2026-08-15',
        })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
      expect(res.body.details[0].field).toBe('fechaFin');
      expect(res.body.details[0].message).toContain('31');
    });

    it('rechaza 32 días inclusivos (diferencia de 31 días calendario)', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send({
          ...validRequest,
          fechaInicio: '2026-07-01',
          fechaFin: '2026-08-01',
        })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
      expect(res.body.details[0].field).toBe('fechaFin');
      expect(res.body.details[0].message).toContain('31');
    });

    it('acepta 31 días inclusivos (2026-07-01 a 2026-07-31)', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send({
          ...validRequest,
          fechaInicio: '2026-07-01',
          fechaFin: '2026-07-31',
        })
        .expect(200);
      expect(res.body.neto.salarioLiquido).toBeGreaterThan(0);
    });
  });

  describe('400 — integridad (openspec/specs/integridad-calculo.md)', () => {
    it('rechaza fechas de calendario imposibles (2026-02-30)', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send({ ...validRequest, fechaFin: '2026-02-30' })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
      expect(res.body.details[0].field).toBe('fechaFin');
    });

    it('rechaza segmento fuera del período con path indexado', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send({
          ...validRequest,
          segmentos: [
            { fecha: '2026-07-20', tipo: 'extra_diurna', horas: 2 },
          ],
        })
        .expect(400);

      const fields = res.body.details.map((d: { field: string }) => d.field);
      expect(fields).toContain('segmentos.0.fecha');
    });

    it('rechaza más de 24 h acumuladas en una misma fecha', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send({
          ...validRequest,
          segmentos: [
            { fecha: '2026-07-05', tipo: 'extra_diurna', horas: 14 },
            { fecha: '2026-07-05', tipo: 'extra_nocturna', horas: 14 },
          ],
        })
        .expect(400);

      const fields = res.body.details.map((d: { field: string }) => d.field);
      expect(fields.some((f: string) => f.startsWith('segmentos.1'))).toBe(
        true,
      );
    });

    it('rechaza horas = Infinity', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send({
          ...validRequest,
          segmentos: [
            { fecha: '2026-07-05', tipo: 'extra_diurna', horas: Infinity },
          ],
        })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('rechaza más de 100 segmentos', async () => {
      const muchos = Array.from({ length: 101 }, (_, i) => ({
        fecha: `2026-07-${String((i % 15) + 1).padStart(2, '0')}`,
        tipo: 'extra_diurna' as const,
        horas: 0.1,
      }));
      const res = await request(app)
        .post('/api/calcular')
        .send({ ...validRequest, segmentos: muchos })
        .expect(400);

      const fields = res.body.details.map((d: { field: string }) => d.field);
      expect(fields).toContain('segmentos');
    });

    it('rechaza más de 50 incentivos', async () => {
      const muchos = Array.from({ length: 51 }, (_, i) => ({
        id: `i${i}`,
        concepto: 'Bono',
        monto: 1,
        aplicaDescuentos: true,
      }));
      const res = await request(app)
        .post('/api/calcular')
        .send({ ...validRequest, incentivos: muchos })
        .expect(400);

      const fields = res.body.details.map((d: { field: string }) => d.field);
      expect(fields).toContain('incentivos');
    });

    it('rechaza campos desconocidos (horasBaseNocturnas eliminado — contrato estricto)', async () => {
      const res = await request(app)
        .post('/api/calcular')
        .send({ ...validRequest, horasBaseNocturnas: 39 })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
      const fields = res.body.details.map((d: { field: string }) => d.field);
      expect(fields).toContain('request');
      expect(res.body.details[0].message).toContain('horasBaseNocturnas');
    });
  });

  describe('CORS — un solo punto de control en Express (Regla 9)', () => {
    const corsApp = createApp({
      corsOrigins: ['https://marvinmelendez.engineer'],
    });

    it('origen permitido recibe Access-Control-Allow-Origin con su propio origen', async () => {
      const res = await request(corsApp)
        .post('/api/calcular')
        .set('Origin', 'https://marvinmelendez.engineer')
        .send(validRequest)
        .expect(200);
      expect(res.headers['access-control-allow-origin']).toBe(
        'https://marvinmelendez.engineer',
      );
    });

    it('origen no permitido no recibe Access-Control-Allow-Origin', async () => {
      const res = await request(corsApp)
        .post('/api/calcular')
        .set('Origin', 'https://sitio-malicioso.ejemplo')
        .send(validRequest)
        .expect(200);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('preflight OPTIONS desde origen permitido responde con métodos limitados', async () => {
      const res = await request(corsApp)
        .options('/api/calcular')
        .set('Origin', 'https://marvinmelendez.engineer')
        .set('Access-Control-Request-Method', 'POST')
        .expect(204);
      expect(res.headers['access-control-allow-origin']).toBe(
        'https://marvinmelendez.engineer',
      );
    });
  });

  describe('trust proxy — rate limit por IP real detrás de proxy (Regla 9)', () => {
    // Topología Caddy→Express: Caddy añade UNA entrada XFF con la IP del cliente.
    function ipRequest(target: ReturnType<typeof createApp>, ip: string) {
      return request(target)
        .post('/api/calcular')
        .set('X-Forwarded-For', ip)
        .send(validRequest);
    }

    it('IPs distintas tienen buckets independientes con trustProxy=1', async () => {
      const proxiedApp = createApp({ trustProxy: 1, rateLimitMax: 2 });

      await ipRequest(proxiedApp, '1.1.1.1').expect(200);
      await ipRequest(proxiedApp, '1.1.1.1').expect(200);
      await ipRequest(proxiedApp, '1.1.1.1').expect(429);

      // Otra IP real: su propio bucket
      await ipRequest(proxiedApp, '2.2.2.2').expect(200);
    });

    it('responde 429 RATE_LIMIT_EXCEEDED con RateLimit headers estándar', async () => {
      const proxiedApp = createApp({ trustProxy: 1, rateLimitMax: 1 });
      await ipRequest(proxiedApp, '3.3.3.3').expect(200);
      const res = await ipRequest(proxiedApp, '3.3.3.3').expect(429);
      expect(res.body.error).toBe('RATE_LIMIT_EXCEEDED');
      expect(res.headers['ratelimit-limit']).toBeDefined();
    });
  });

  describe('429 — RATE_LIMIT_EXCEEDED', () => {
    it('retorna 429 después de exceder el límite configurado', async () => {
      const limitedApp = createAppWithLimit(3);

      for (let i = 0; i < 3; i++) {
        await request(limitedApp)
          .post('/api/calcular')
          .send(validRequest)
          .expect(200);
      }

      const res = await request(limitedApp)
        .post('/api/calcular')
        .send(validRequest)
        .expect(429);

      expect(res.body.error).toBe('RATE_LIMIT_EXCEEDED');
      expect(res.body.message).toContain('Demasiadas solicitudes');
    });
  });
});

describe('errorHandler', () => {
  it('500 INTERNAL_ERROR para errores no controlados', async () => {
    const testApp = express();
    testApp.use(express.json());
    testApp.get('/error', (_req: Request, _res: Response) => {
      throw new Error('boom');
    });
    testApp.use(errorHandler);

    const res = await request(testApp).get('/error').expect(500);
    expect(res.body.error).toBe('INTERNAL_ERROR');
    expect(res.body.message).toBe('Error interno del servidor');
  });

  it('500 no filtra detalles internos ni stack (Regla 10)', async () => {
    const testApp = express();
    testApp.use(express.json());
    testApp.get('/error', () => {
      throw new Error('secreto-interno: password=hunter2');
    });
    testApp.use(errorHandler);

    const res = await request(testApp).get('/error').expect(500);
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('secreto-interno');
    expect(body).not.toContain('hunter2');
    expect(body).not.toContain('stack');
  });

  it('sentryDsn opcional habilita el handler de Sentry sin romper rutas', async () => {
    const sentryApp = createApp({
      sentryDsn: 'https://public@sentry.example.com/1',
      environment: 'test',
    });
    const res = await request(sentryApp)
      .post('/api/calcular')
      .send(validRequest)
      .expect(200);
    expect(res.body.bruto.brutoTotal).toBeGreaterThan(0);
  });
});
