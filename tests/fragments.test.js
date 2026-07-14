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

describe('Fragments API', () => {
  test('returns 401 when request is unauthenticated', async () => {
    const res = await request(app).get('/v1/fragments');

    expect(res.statusCode).toBe(401);
  });

  test('authenticated users can get fragments', async () => {
    const res = await request(app).get('/v1/fragments').set('Authorization', 'Bearer test');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('GET /fragments?expand=1 returns expanded fragment metadata', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'text/plain')
      .send('expanded fragment');

    expect(createRes.statusCode).toBe(201);

    const createdId = createRes.body.fragment.id;

    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .set('Authorization', 'Bearer test');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);

    const fragment = res.body.fragments.find((item) => item.id === createdId);

    expect(fragment).toBeDefined();
    expect(fragment.ownerId).toBe('test-user');
    expect(fragment.type).toBe('text/plain');
    expect(fragment.size).toBe(Buffer.byteLength('expanded fragment'));
    expect(fragment.created).toBeDefined();
    expect(fragment.updated).toBeDefined();
  });

  test('authenticated users can create a text fragment with a Location header', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'text/plain')
      .send('hello world');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.body.fragment.size).toBe(Buffer.byteLength('hello world'));

    expect(res.headers.location).toBeDefined();
    expect(res.headers.location).toContain(`/v1/fragments/${res.body.fragment.id}`);
  });

  test('authenticated users can create an application/json fragment', async () => {
    const data = {
      name: 'Grace',
      assignment: 2,
    };

    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'application/json')
      .send(data);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
    expect(res.body.fragment.type).toBe('application/json');
    expect(res.body.fragment.size).toBe(Buffer.byteLength(JSON.stringify(data)));

    expect(res.headers.location).toBeDefined();
    expect(res.headers.location).toContain(`/v1/fragments/${res.body.fragment.id}`);
  });

  test('authenticated users can create a Markdown fragment', async () => {
    const markdown = '# Assignment 2';

    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'text/markdown')
      .send(markdown);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.type).toBe('text/markdown');
    expect(res.body.fragment.size).toBe(Buffer.byteLength(markdown));

    expect(res.headers.location).toBeDefined();
    expect(res.headers.location).toContain(`/v1/fragments/${res.body.fragment.id}`);
  });

  test('returns 415 for an unsupported content type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'image/png')
      .send(Buffer.from('fake image'));

    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(415);
  });

  test('returns 400 when fragment data is missing', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'text/plain');

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(400);
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

  test('GET fragment returns the correct Content-Type', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'text/markdown')
      .send('# Hello');

    expect(createRes.statusCode).toBe(201);

    const id = createRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .set('Authorization', 'Bearer test');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toMatch(/^text\/markdown/);
    expect(getRes.text).toBe('# Hello');
  });

  test('GET /fragments/:id/info returns fragment metadata', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'application/json')
      .send({
        course: 'CCP555',
        assignment: 2,
      });

    expect(createRes.statusCode).toBe(201);

    const id = createRes.body.fragment.id;

    const infoRes = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .set('Authorization', 'Bearer test');

    expect(infoRes.statusCode).toBe(200);
    expect(infoRes.body.status).toBe('ok');
    expect(infoRes.body.fragment.id).toBe(id);
    expect(infoRes.body.fragment.ownerId).toBe('test-user');
    expect(infoRes.body.fragment.type).toBe('application/json');
    expect(infoRes.body.fragment.size).toBeGreaterThan(0);
    expect(infoRes.body.fragment.created).toBeDefined();
    expect(infoRes.body.fragment.updated).toBeDefined();
  });

  test('GET /fragments/:id/info returns 404 for a missing fragment', async () => {
    const res = await request(app)
      .get('/v1/fragments/does-not-exist/info')
      .set('Authorization', 'Bearer test');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
  });

  test('converts a Markdown fragment to HTML', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'text/markdown')
      .send('# Hello World');

    expect(createRes.statusCode).toBe(201);

    const id = createRes.body.fragment.id;

    const convertRes = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .set('Authorization', 'Bearer test');

    expect(convertRes.statusCode).toBe(200);
    expect(convertRes.headers['content-type']).toMatch(/^text\/html/);
    expect(convertRes.text).toContain('<h1>Hello World</h1>');
  });

  test('returns 415 for an unsupported fragment conversion', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test')
      .set('Content-Type', 'text/plain')
      .send('Hello');

    const id = createRes.body.fragment.id;

    const convertRes = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .set('Authorization', 'Bearer test');

    expect(convertRes.statusCode).toBe(415);
    expect(convertRes.body.status).toBe('error');
  });
});
