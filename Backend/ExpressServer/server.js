// I'm loading environment variables from .env file for secure configuration
require('dotenv').config();

// I'm importing my configured Express app from app.js
const app = require('./app');

// I'm setting the port from environment variable or defaulting to 3001
const PORT = process.env.PORT || 3001;

// I'm importing Mongoose for MongoDB database operations
const mongoose = require('mongoose');
// I'm getting my MongoDB connection string from environment variables
const MONGO_URI = process.env.MONGODB_URI;

// I'm using an async IIFE (Immediately Invoked Function Expression) to handle my server startup
(async () => {
    try {
        // I'm connecting to my MongoDB database first before starting the server
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // I'm starting my server to listen on the specified port
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        // I'm catching and logging any errors during server startup
        console.error('Error connecting to MongoDB:', error);
    }
})();