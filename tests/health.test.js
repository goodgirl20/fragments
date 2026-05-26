const request = require('supertest');
const app = require('../src/app');

describe('GET /', () => {
  test('should return success', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
  });
});
