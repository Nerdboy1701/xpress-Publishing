const express = require('express');
const artistRouter = require('./artists');

const apiRouter = express.Router();
apiRouter.use('/artist, artistRouter');

module.exports = apiRouter;