const express = require('express');
const apiRouter = express.Router();
const artistRouter = require('./artists.js');

apiRouter.use('/artists', artistRouter);

module.exports = apiRouter;