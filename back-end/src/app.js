const express = require('express');
require('express-async-errors');
const cors = require('cors');

const router = require('./router');
const errorHandlingMiddleware = require('./middlewares/errorHandlingMiddleware');

const app = express();
app.use(express.json());
app.use(cors());

app.use(router);
app.use(errorHandlingMiddleware);

module.exports = app;
