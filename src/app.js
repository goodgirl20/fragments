const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const logger = require('./logger');
const pino = require('pino-http')({
  logger,
});

const app = express();

app.use(pino);
app.use(helmet());
app.use(cors());

app.use('/', require('./routes'));

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      message: 'not found',
      code: 404,
    },
  });
});

app.use(require('./errorHandler'));

module.exports = app;
