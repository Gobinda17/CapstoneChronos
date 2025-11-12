// I'm importing the Express framework to create my web application
const express = require('express');
// I'm creating my Express application instance
const app = express();

// I'm importing all my route handlers for different features
// const userRouter = require('./routes/userRoutes');
// const taskRouter = require('./routes/taskRoutes');

// I'm setting up middleware to parse JSON requests automatically
app.use(express.json());
// I'm setting up middleware to parse URL-encoded form data with extended features
app.use(express.urlencoded({ extended: true }));

// I'm mounting all my routers under a common API prefix for version control
// This creates endpoints like /airtribe/capstone/chronos/app/api/v1/users, /tasks
// app.use('/airtribe/capstone/chronos/app/api/v1', [userRouter, taskRouter, projectRouter]);

// I'm exporting my configured app so server.js can use it
module.exports = app;