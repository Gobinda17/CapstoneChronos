require('dotenv').config();

const express = require('express');

const cors = require('cors');

const cookieParser = require('cookie-parser');

const router = require('./routes/index');

const app = express();

const { ExpressAdapter } = require('@bull-board/express');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { jobQueue } = require('./services/jobQueue.service');

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];

const corsOptions = {
    origin: (origin, callback) => {

        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.warn('❌ Blocked by CORS:', origin);
        return callback(new Error('CORS policy violation'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};


app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use(cors(corsOptions));

app.use('/airtribe/capstone/chronos/app/api/v1', router);

// Bull Board setup
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
    queues: [new BullMQAdapter(jobQueue)],
    serverAdapter
});

app.use("/admin/queues", serverAdapter.getRouter());

module.exports = app;