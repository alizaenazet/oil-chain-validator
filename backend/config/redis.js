// config/redis.js
const { createClient } = require('redis');
require('dotenv').config();

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;

const redisClient = createClient({
    url: `redis://${redisHost}:${redisPort}`
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));

(async () => {
    try {
        await redisClient.connect();
        console.log(`Redis Cache terhubung di port ${redisPort}...`);
    } catch (err) {
        console.error('Gagal koneksi ke Redis:', err);
    }
})();

module.exports = redisClient;