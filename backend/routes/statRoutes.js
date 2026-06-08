// routes/statRoutes.js
const express = require('express');
const router = express.Router();
const redisClient = require('../config/redis');

const CACHE_KEY = "cache:system:stats";
const CACHE_TTL = 60;

// ─── GET /stats (VERSION DUMMY CLEAN - NO SQLITE MODELS NO BLOCKCHAIN) ───
router.get('/', async (req, res) => {
    try {
        let cachedData = null;
        try {
            cachedData = await redisClient.get(CACHE_KEY);
        } catch (redisErr) {
            console.warn("[Redis] Cache read failed:", redisErr.message);
        }

        // 1. JIKA CACHE HIT (Data diambil dari Redis)
        if (cachedData) {
            console.log("[Stats API - DUMMY] 🟢 Cache HIT! Data dari Redis.");
            const parsedCache = JSON.parse(cachedData);
            return res.status(200).json({
                success: true,
                data: parsedCache.data,
                meta: { cachedAt: parsedCache.cachedAt, cacheTtlSeconds: CACHE_TTL, cacheSource: "redis" }
            });
        }

        // 2. JIKA CACHE MISS (Data dihitung secara dinamis dari memori dummy)
        console.log("[Stats API - DUMMY] 🔴 Cache MISS! Menghitung dari memori dummy runtime...");

        // Hitung jumlah baris log scan secara dinamis dari array global dummy kita
        const dynamicValidatedCount = global.dummyScanLogs ? global.dummyScanLogs.length : 0;

        // Hitung jumlah produk terdaftar dinamis dari global memory
        let dynamicRegisteredCount = 0;
        let dynamicRevokedCount = 0;

        if (global.dummyRegisteredProducts) {
            const productsArray = Object.values(global.dummyRegisteredProducts);
            dynamicRegisteredCount = productsArray.length;
            // Hitung berapa yang statusnya REVOKED
            dynamicRevokedCount = productsArray.filter(p => p.status === "REVOKED").length;
        }

        // Gabungkan data dummy static baseline + data dinamis hasil nembak Bruno kamu
        const statsData = {
            totalRegistered: 120 + dynamicRegisteredCount, // baseline 120 + inputan baru dari /batches
            totalValidated: dynamicValidatedCount,        // real-time bertambah tiap kali /validate sukses
            totalVariants: 3,                             // Jumlah varian dummy (Pertamina, Shell, Federal Oil)
            totalRevoked: 1 + dynamicRevokedCount          // baseline 1 + hasil emergency-revoke di Bruno
        };

        const currentTimestamp = new Date().toISOString();
        const cachePayload = { data: statsData, cachedAt: currentTimestamp };

        // Simpan hasil ke cache Redis selama 60 detik
        try {
            await redisClient.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(cachePayload));
            console.log("[Stats API - DUMMY] 💾 Sukses memperbarui cache stats di Redis.");
        } catch (redisStoreErr) {
            console.error("[Redis] Cache write failed:", redisStoreErr.message);
        }

        return res.status(200).json({
            success: true,
            data: statsData,
            meta: { cachedAt: currentTimestamp, cacheTtlSeconds: CACHE_TTL, cacheSource: "dummy_blockchain" }
        });

    } catch (error) {
        console.error("❌ Stats API Dummy Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            error: { code: "DUMMY_STATS_ERROR", message: error.message } 
        });
    }
});

module.exports = router;