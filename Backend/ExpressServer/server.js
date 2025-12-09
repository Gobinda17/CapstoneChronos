require('dotenv').config();

const app = require('./app');

const jobWorker = require('./workers/job.worker');

const PORT = process.env.PORT || 3001;

const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGODB_URI;

(async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
})();