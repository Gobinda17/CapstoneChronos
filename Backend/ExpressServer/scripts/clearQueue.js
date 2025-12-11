require('dotenv').config();

const { Queue } = require('bullmq');
const redisClient = require('../config/redis'); 

const QUEUE_NAME = 'jobQueue';

(async () => {
    try {
        console.log(`🔍 Connecting to queue "${QUEUE_NAME}"...`);

        const jobQueue = new Queue(QUEUE_NAME, { connection: redisClient });

        const repeatables = await jobQueue.getRepeatableJobs();
        for (const r of repeatables) {
            console.log('🗑 Removing repeatable job:', r.key);
            await jobQueue.removeRepeatableByKey(r.key);
        }

        await jobQueue.obliterate({ force: true });
        console.log('✅ Queue obliterated successfully');

        await jobQueue.close();
        await redisClient.quit();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error clearing queue:', err);
        await redisClient.quit();
        process.exit(1);
    }
})();
