const express = require('express');
const MarkdownIt = require('markdown-it');

const Fragment = require('../../model/fragment');
const { listFragments } = require('../../model/data');

const router = express.Router();
const markdown = new MarkdownIt();

/**
 * Create a fragment
 */
router.post(
  '/',
  express.raw({
    type: () => true,
    limit: '5mb',
  }),
  async (req, res) => {
    try {
      const contentTypeHeader = req.get('Content-Type');

      if (!contentTypeHeader) {
        return res.status(415).json({
          status: 'error',
          error: {
            message: 'Content-Type header is required',
            code: 415,
          },
        });
      }

      const type = contentTypeHeader.split(';')[0].trim().toLowerCase();

      if (!Fragment.isSupportedType(type)) {
        return res.status(415).json({
          status: 'error',
          error: {
            message: `Unsupported content type: ${type}`,
            code: 415,
          },
        });
      }

      if (!req.body || req.body.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: {
            message: 'Fragment data is required',
            code: 400,
          },
        });
      }

      const fragment = new Fragment({
        ownerId: req.user.sub,
        type,
      });

      await fragment.setData(req.body);

      const location = `${req.protocol}://${req.get('host')}/v1/fragments/${fragment.id}`;

      return res.status(201).location(location).json({
        status: 'ok',
        fragment,
      });
    } catch (err) {
      return res.status(500).json({
        status: 'error',
        error: {
          message: err.message,
          code: 500,
        },
      });
    }
  }
);

/**
 * List fragments
 * GET /v1/fragments
 * GET /v1/fragments?expand=1
 */
router.get('/', async (req, res) => {
  try {
    const expand = req.query.expand === '1';

    const fragments = await listFragments(req.user.sub, expand);

    return res.status(200).json({
      status: 'ok',
      fragments,
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: {
        message: err.message,
        code: 500,
      },
    });
  }
});

/**
 * Get fragment metadata
 */
router.get('/:id/info', async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user.sub, req.params.id);

    return res.status(200).json({
      status: 'ok',
      fragment,
    });
  } catch (err) {
    return res.status(404).json({
      status: 'error',
      error: {
        message: err.message,
        code: 404,
      },
    });
  }
});

/**
 * Convert a Markdown fragment to HTML
 * GET /v1/fragments/:id.html
 */
router.get('/:id.:ext', async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user.sub, req.params.id);

    if (req.params.ext !== 'html' || fragment.type !== 'text/markdown') {
      return res.status(415).json({
        status: 'error',
        error: {
          message: 'Unsupported fragment conversion',
          code: 415,
        },
      });
    }

    const data = await fragment.getData();
    const html = markdown.render(data.toString());

    return res.status(200).type('html').send(html);
  } catch (err) {
    return res.status(404).json({
      status: 'error',
      error: {
        message: err.message,
        code: 404,
      },
    });
  }
});

/**
 * Get fragment data
 */
router.get('/:id', async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user.sub, req.params.id);

    const data = await fragment.getData();

    return res.status(200).set('Content-Type', fragment.type).send(data);
  } catch (err) {
    return res.status(404).json({
      status: 'error',
      error: {
        message: err.message,
        code: 404,
      },
    });
  }
});

module.exports = router;
