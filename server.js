const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(bodyParser.json());
app.use(errorHandler.json());
app.use(cors.json());

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});

module.exports = app;