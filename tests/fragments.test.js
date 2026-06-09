const request = require('supertest');

jest.mock('../src/auth/cognito', () => {
  return (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({
        status: 'error',
        error: {
          message: 'Unauthorized',
          code: 401,
        },
      });
    }

    next();
  };
});

const app = require('../src/app');

describe('Fragments API', () => {
  test('returns 401 when request is unauthenticated', async () => {
    const res = await request(app).get('/v1/fragments');

    expect(res.statusCode).toBe(401);
  });

  test('authenticated users can get fragments', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .set('Authorization', 'Bearer test');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('authenticated users can create a text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'text/plain')
      .send('hello world');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
    expect(res.body.fragment.type).toBe('text/plain');
  });

  test('returns 404 for a fragment that does not exist', async () => {
    const res = await request(app)
      .get('/v1/fragments/does-not-exist')
      .set('Authorization', 'Bearer test');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('created fragment can be retrieved', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'text/plain')
      .send('test fragment');

    expect(createRes.statusCode).toBe(201);

    const id = createRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .set('Authorization', 'Bearer test');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toBe('test fragment');
  });
});