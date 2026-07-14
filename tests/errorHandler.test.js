//Errorhandler.test · JS
jest.mock('../src/logger', () => ({
  error: jest.fn(),
}));

const logger = require('../src/logger');
const errorHandler = require('../src/errorHandler');

describe('errorHandler middleware', () => {
  function mockRes() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses err.status and err.message when present, and logs for 5xx', () => {
    const err = { status: 500, message: 'boom' };
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: { message: 'boom', code: 500 },
    });
    expect(logger.error).toHaveBeenCalled();
  });

  test('falls back to 500 and a generic message when err has neither', () => {
    const err = {};
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: { message: 'unable to process request', code: 500 },
    });
    expect(logger.error).toHaveBeenCalled();
  });

  test('does not log for client errors (4xx)', () => {
    const err = { status: 404, message: 'not found' };
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: { message: 'not found', code: 404 },
    });
    expect(logger.error).not.toHaveBeenCalled();
  });
});
