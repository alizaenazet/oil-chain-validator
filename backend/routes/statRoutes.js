// routes/statRoutes.js
const express = require('express');
const { ethers } = require('ethers');
const router = express.Router();
const redisClient = require('../config/redis');

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const contractABI = ["function getSystemStats() external view returns (uint32 registered, uint32 validated)"];
const oilValidatorContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);

const STATS_CACHE_KEY = "cache:system:stats";
const CACHE_TTL = 60; // 1 menit

// ─── GET /stats (REKAP DATA DASHBOARD ADMIN) ─────────────────────────────────
router.get('/', async (req, res) => {
    try {
        // 1. Cek Caching short term Redis
        let cachedStats = await redisClient.get(STATS_CACHE_KEY);
        if (cachedStats) {
            console.log(`[Stats Dashboard] 🟢 Cache HIT! Membaca rekap data dari Redis.`);
            return res.status(200).json({
                success: true,
                data: JSON.parse(cachedStats).data,
                meta: { cacheSource: "redis" }
            });
        }

        console.log(`[Stats Dashboard] 🔴 Cache MISS! Mengambil data rekap langsung dari Blockchain...`);
        
        // 2. Query data statistika on-chain dari fungsi getSystemStats()
        const stats = await oilValidatorContract.getSystemStats();
        
        const responsePayload = {
            totalRegistered: Number(stats[0]),
            totalValidated: Number(stats[1])
        };

        const currentTimestamp = new Date().toISOString();

        // 3. Simpan data ke dalam Redis Cache
        await redisClient.setEx(STATS_CACHE_KEY, CACHE_TTL, JSON.stringify({ data: responsePayload, cachedAt: currentTimestamp }));

        return res.status(200).json({
            success: true,
            data: responsePayload,
            meta: { cachedAt: currentTimestamp, cacheSource: "blockchain_rpc" }
        });
    } catch (error) {
        console.error("❌ Stats Dashboard Error:", error);
        return res.status(500).json({ success: false, error: { code: "STATS_FETCH_FAILED", message: error.message } });
    }
});

module.exports = router;