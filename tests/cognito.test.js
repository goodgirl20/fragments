jest.mock('aws-jwt-verify', () => ({
  CognitoJwtVerifier: {
    create: () => ({
      verify: jest.fn().mockResolvedValue({ email: 'user1@email.com' }),
    }),
  },
}));

const authorize = require('../src/auth/cognito');

describe('Cognito auth middleware', () => {
  test('returns 401 when authorization token is missing', async () => {
    const req = {
      headers: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await authorize(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next when token is valid', async () => {
    const req = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };

    const res = {};
    const next = jest.fn();

    await authorize(req, res, next);

    expect(req.user).toEqual({ email: 'user1@email.com' });
    expect(next).toHaveBeenCalled();
  });
});