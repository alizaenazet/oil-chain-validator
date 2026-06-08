// routes/variantRoutes.js
const express = require('express');
const router = express.Router();
const redisClient = require('../config/redis');

// DATABASE DUMMY DI MEMORI (Pengganti Blockchain Mapping)
const dummyVariants = {
    1: { brand: "Pertamina", oilType: "SAE 10W-40" },
    2: { brand: "Shell", oilType: "Helix HX7 10W-40" },
    3: { brand: "Federal Oil", oilType: "Ultratec 20W-50" }
};

const CACHE_PREFIX = "cache:variant:";
const CACHE_TTL = 300;

// ─── GET /variants/:variantId ────────────────────────────────────────────────
router.get('/:variantId', async (req, res) => {
    try {
        const { variantId } = req.params;
        if (!variantId || isNaN(variantId) || Number(variantId) <= 0) {
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "ID harus angka." } });
        }

        const targetVariantId = Number(variantId);
        const cacheKey = `${CACHE_PREFIX}${targetVariantId}`;

        // 1. Cek Redis Cache
        let cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log(`[Variant API - DUMMY] 🟢 Cache HIT!`);
            return res.status(200).json({ success: true, data: JSON.parse(cachedData).data, meta: { cachedAt: JSON.parse(cachedData).cachedAt, cacheSource: "redis" } });
        }

        console.log(`[Variant API - DUMMY] 🔴 Cache MISS! Membaca dari data Dummy...`);
        
        // 2. Ambil dari database dummy lokal
        const variantData = dummyVariants[targetVariantId];
        if (!variantData) {
            return res.status(404).json({ success: false, error: { code: "VARIANT_NOT_FOUND", message: "Variant ID tidak ada." } });
        }

        const currentTimestamp = new Date().toISOString();
        const responseData = {
            variantId: targetVariantId,
            brand: variantData.brand,
            oilType: variantData.oilType,
            createdAt: currentTimestamp,
            totalRegistered: 150
        };

        // 3. Simpan ke Redis
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify({ data: responseData, cachedAt: currentTimestamp }));

        return res.status(200).json({ success: true, data: responseData, meta: { cachedAt: currentTimestamp, cacheSource: "dummy_blockchain" } });
    } catch (error) {
        return res.status(500).json({ success: false, error: { code: "DUMMY_ERROR", message: error.message } });
    }
});

module.exports = router;