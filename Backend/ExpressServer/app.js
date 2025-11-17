require('dotenv').config();

const express = require('express');

const cors = require('cors');

const router = require('./routes/index');

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];

console.log('✅ Allowed origins:', allowedOrigins);

const corsOptions = {
    origin: (origin, callback) => {
        console.log('🌐 Incoming origin:', origin);

        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.warn('❌ Blocked by CORS:', origin);
        return callback(new Error('CORS policy violation'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};


app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors(corsOptions));

app.use('/airtribe/capstone/chronos/app/api/v1', router);

module.exports = app;