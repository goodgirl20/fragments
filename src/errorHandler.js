const logger = require('./logger');

// Generic error-handling middleware. We may already have an error
// response we can use, but if not, use a generic `500` server error
// and message.
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  // If this is a server error, log something so we can see what's going on.
  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }

  res.status(status).json({
    status: 'error',
    error: {
      message,
      code: status,
    },
  });
};
