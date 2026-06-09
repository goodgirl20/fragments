const express = require('express');
const Fragment = require('../../model/fragment');
const { listFragments } = require('../../model/data');

const router = express.Router();

// Store fragment
router.post('/', express.text(), async (req, res) => {
  try {
    const fragment = new Fragment({
      ownerId: 'user1',
      type: 'text/plain',
    });

    await fragment.setData(req.body);

    res.status(201).json({
      status: 'ok',
      fragment,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error: {
        message: err.message,
      },
    });
  }
});

router.get('/', async (req, res) => {
  const fragments = await listFragments('user1');

  res.status(200).json({
    status: 'ok',
    fragments,
  });
});

router.get('/:id', async (req, res) => {
  try {
    const fragment = await Fragment.byId('user1', req.params.id);

    const data = await fragment.getData();

    res.status(200).send(data);
  } catch (err) {
    res.status(404).json({
      status: 'error',
      error: {
        message: err.message,
      },
    });
  }
});

module.exports = router;