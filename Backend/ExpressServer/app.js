const express = require('express');

const app = express();

const router = require('./routes/index');

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/airtribe/capstone/chronos/app/api/v1', router);

module.exports = app;