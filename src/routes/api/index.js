const express = require('express');
const router = express.Router();

const authorize = require('../../auth/cognito');

router.use('/fragments', authorize, require('./fragments'));

module.exports = router;
