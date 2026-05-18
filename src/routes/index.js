const express = require('express');

// version and author from package.json
const { version, author } = require('../../package.json');

// Create a router that we can use to mount our API
const router = express.Router();

/**
 * Expose all of our API routes on /v1/*
 */
router.use('/v1', require('./api'));

/**
 * Health check route
 */
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');

  res.status(200).json({
    status: 'ok',
    description: 'fragments service running normally',
    author,
    githubUrl: 'https://github.com/goodgirl20/fragments',
    version,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
