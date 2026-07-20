import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { historyRoutes } from '../src/routes/history/history.routes';
import { errorHandler } from '../src/middleware/errorHandler';
import { getAuth } from '@clerk/express';

vi.mock('@clerk/express', () => {
  function mockMw(_req: Request, _res: Response, next: NextFunction) {
    next();
  }
  return {
    getAuth: vi.fn(() => ({ userId: undefined })),
    clerkMiddleware: vi.fn(() => mockMw),
  };
});

function createApp(userId?: string) {
  const testApp = express();
  testApp.use(express.json());

  const mockGetAuth = getAuth as ReturnType<typeof vi.fn>;

  testApp.use((req, _res, next) => {
    mockGetAuth.mockReturnValue(
      userId ? { userId, sessionId: 'sess_test', orgId: null, orgRole: null, orgSlug: null, actor: null }
        : { userId: null, sessionId: null, orgId: null, orgRole: null, orgSlug: null, actor: null },
    );
    next();
  });

  testApp.use(historyRoutes);
  testApp.use(errorHandler);
  return testApp;
}

const validBody = {
  request: {
    salarioBase: 800,
    tipoPago: 'mensual',
    fechaInicio: '2026-07-01',
    fechaFin: '2026-07-31',
    antiguedad: '1_a_3',
    fechaIngreso: '2025-01-15',
    segmentos: [],
  },
  response: {
    bruto: { salarioBase: 800, horasExtraDiurna: 0, horasExtraNocturna: 0, diaLibreDiurna: 0, diaLibreNocturna: 0, asueto: 0, brutoTotal: 800 },
    descuentos: { isss: { porcentaje: 3, salarioAsegurable: 800, descuento: 24 }, afp: { porcentaje: 7.25, salarioCotizable: 800, descuento: 58 }, renta: { baseGravable: 718, tramo: 2, porcentajeExceso: 10, cuotaFija: 17.67, descuento: 34.47 }, totalDescuentos: 116.47 },
    prestaciones: { aguinaldo: { dias: 15, monto: 400, proporcional: false }, vacaciones: { porcentaje: 30, monto: 120 }, quincena25: { porcentaje: 50, monto: 400 } },
    neto: { salarioLiquido: 683.53 },
  },
};

describe('POST /api/history', () => {
  it('401 sin autenticación', async () => {
    const app = createApp(undefined);
    const res = await request(app)
      .post('/api/history')
      .send(validBody)
      .expect(401);

    expect(res.body.error).toBe('UNAUTHORIZED');
  });

  it('400 sin campos request/response', async () => {
    const app = createApp('test_user');
    const res = await request(app)
      .post('/api/history')
      .send({})
      .expect(400);

    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('201 crea historial con autenticación', async () => {
    const app = createApp('test_user');
    const res = await request(app)
      .post('/api/history')
      .send(validBody)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.user_id).toBe('test_user');
  });
});

describe('GET /api/history', () => {
  it('401 sin autenticación', async () => {
    const app = createApp(undefined);
    const res = await request(app)
      .get('/api/history')
      .expect(401);

    expect(res.body.error).toBe('UNAUTHORIZED');
  });

  it('200 retorna array vacío sin historial', async () => {
    const app = createApp('new_user');
    const res = await request(app)
      .get('/api/history')
      .expect(200);

    expect(res.body).toBeInstanceOf(Array);
    expect(res.body).toHaveLength(0);
  });

  it('200 retorna historial del usuario', async () => {
    const app = createApp('test_user_2');

    await request(app)
      .post('/api/history')
      .send(validBody)
      .expect(201);

    const res = await request(app)
      .get('/api/history')
      .expect(200);

    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(1);

    for (const row of res.body) {
      expect(row.user_id).toBe('test_user_2');
      expect(row).toHaveProperty('request_data');
      expect(row).toHaveProperty('response_data');
      expect(row).toHaveProperty('created_at');
    }
  });
});

describe('DELETE /api/history/:id', () => {
  it('401 sin autenticación', async () => {
    const app = createApp(undefined);
    const res = await request(app)
      .delete('/api/history/some-id')
      .expect(401);

    expect(res.body.error).toBe('UNAUTHORIZED');
  });

  it('404 para id inexistente', async () => {
    const app = createApp('test_user');
    const res = await request(app)
      .delete('/api/history/non-existent-id')
      .expect(404);

    expect(res.body.error).toBe('NOT_FOUND');
  });

  it('204 elimina historial existente', async () => {
    const app = createApp('test_user_3');

    const createRes = await request(app)
      .post('/api/history')
      .send(validBody)
      .expect(201);

    const id = createRes.body.id as string;

    await request(app)
      .delete(`/api/history/${id}`)
      .expect(204);

    const getRes = await request(app)
      .get('/api/history')
      .expect(200);

    const ids = (getRes.body as Array<{ id: string }>).map(
      (r: { id: string }) => r.id,
    );
    expect(ids).not.toContain(id);
  });

  it('no elimina historial de otro usuario', async () => {
    const appUserA = createApp('user_a');
    const appUserB = createApp('user_b');

    const createRes = await request(appUserA)
      .post('/api/history')
      .send(validBody)
      .expect(201);

    const id = createRes.body.id as string;

    await request(appUserB)
      .delete(`/api/history/${id}`)
      .expect(404);
  });
});
