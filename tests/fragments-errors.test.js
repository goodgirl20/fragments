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

    req.user = {
      sub: 'test-user',
    };

    next();
  };
});

const app = require('../src/app');

describe('Fragments API error branches', () => {
  test('POST returns 415 for an unsupported content type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'application/pdf')
      .send(Buffer.from('fake pdf'));

    expect(res.statusCode).toBe(415);
    expect(res.body.error.code).toBe(415);
  });

  test('PUT returns 415 for an unsupported content type', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'text/plain')
      .send('original');

    const id = createRes.body.fragment.id;

    const res = await request(app)
      .put(`/v1/fragments/${id}`)
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'application/pdf')
      .send(Buffer.from('fake pdf'));

    expect(res.statusCode).toBe(415);
    expect(res.body.error.code).toBe(415);
  });

  test('PUT prevents changing fragment content type', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'text/plain')
      .send('original');

    const id = createRes.body.fragment.id;

    const res = await request(app)
      .put(`/v1/fragments/${id}`)
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ changed: true }));

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(400);
  });

  test('PUT returns 400 when data is missing', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'text/plain')
      .send('original');

    const id = createRes.body.fragment.id;

    const res = await request(app)
      .put(`/v1/fragments/${id}`)
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'text/plain');

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(400);
  });

  test('PUT returns 404 for a missing fragment', async () => {
    const res = await request(app)
      .put('/v1/fragments/does-not-exist')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'text/plain')
      .send('updated');

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(404);
  });

  test('conversion returns 404 for a missing fragment', async () => {
    const res = await request(app)
      .get('/v1/fragments/does-not-exist.html')
      .set('Authorization', 'Bearer test');

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(404);
  });

  test('image conversion returns 415 for an unsupported extension', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'image/png')
      .send(Buffer.from('fake png'));

    expect(createRes.statusCode).toBe(201);

    const id = createRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.bmp`)
      .set('Authorization', 'Bearer test');

    expect(res.statusCode).toBe(415);
    expect(res.body.error.code).toBe(415);
  });

  test('DELETE returns 404 for a missing fragment', async () => {
    const res = await request(app)
      .delete('/v1/fragments/does-not-exist')
      .set('Authorization', 'Bearer test');

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(404);
  });
});