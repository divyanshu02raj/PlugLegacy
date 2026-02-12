const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    // password: process.env.REDIS_PASSWORD || '', // Uncomment if needed
    retryStrategy: (times) => {
        // Retry connection logic
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redis.on('connect', () => {
    console.log('Redis connected successfully');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

module.exports = redis;
