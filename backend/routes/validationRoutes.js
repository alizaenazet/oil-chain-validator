// routes/validationRoutes.js
const express = require('express');
const router = express.Router();
const redisClient = require('../config/redis');
const { ethers } = require('ethers'); // <── FIX 1: WAJIB IMPORT ETHERS BIAR GAK CRASH!

const REDIS_VALIDATE_PREFIX = "cache:validate:";

// SIMULASI DATABASE AUDIT LOG SCAN LOKAL (Pengganti tabel ScanLogs SQLite di memori)
global.dummyScanLogs = global.dummyScanLogs || [];

// DATA REKAYASA PRODUK UNTUK TESTING SCENARIO BASELINE
const dummyProducts = {
    "OIL-PERT-NEW": { variantId: 1, brand: "Pertamina", oilType: "SAE 10W-40", status: "NEW" },
    "OIL-SHELL-REVOKED": { variantId: 2, brand: "Shell", oilType: "Helix HX7 10W-40", status: "REVOKED" },
    "OIL-FAKE-404": null 
};

// ─── 1. POST /validate/:serialNumber (VALIDASI QR KONSUMEN) ───────────────────
router.post('/:serialNumber', async (req, res) => {
    try {
        const { serialNumber } = req.params;
        const { scanLocation } = req.body;

        if (!scanLocation || String(scanLocation).trim() === "") {
            return res.status(400).json({ 
                success: false, 
                error: { code: "VALIDATION_ERROR", message: "Scan location wajib diisi." } 
            });
        }

        const cleanSerialNumber = String(serialNumber).trim();
        const cleanLocation = String(scanLocation).trim();
        const cacheKey = `${REDIS_VALIDATE_PREFIX}${cleanSerialNumber}`;

        // 1. CEK INTERCEPT REDIS CACHE
        let cachedValidation = null;
        try {
            cachedValidation = await redisClient.get(cacheKey);
        } catch (err) {
            console.warn("[Redis] Gagal membaca cache:", err.message);
        }

        if (cachedValidation) {
            console.log(`[Validation - DUMMY] 🟢 Cache HIT! Terdeteksi Pemalsuan (Sudah Pernah Di-scan).`);
            const parsedCache = JSON.parse(cachedValidation);
            return res.status(400).json({ 
                success: false, 
                error: { 
                    code: "ALREADY_VALIDATED", 
                    message: "Produk sudah pernah divalidasi!", 
                    data: parsedCache.data 
                } 
            });
        }

        console.log(`[Validation - DUMMY] 🔴 Cache MISS! Memeriksa Mocking Data...`);

        // Generate Hash Keccak256 secara konsisten
        const mockProductId = ethers.solidityPackedKeccak256(["string"], [cleanSerialNumber]);

        let product = null;
        
        // A. Cek apakah produk ini ada di memori pendaftaran dinamis global (/admin/batches)
        if (global.dummyRegisteredProducts && global.dummyRegisteredProducts[mockProductId]) {
            const dynamicProd = global.dummyRegisteredProducts[mockProductId];
            
            const vId = dynamicProd.variantId;
            const variantInfo = global.dummyVariants && global.dummyVariants[vId]
                ? global.dummyVariants[vId]
                : { brand: "Pertamina", oilType: "SAE 10W-40" };

            product = {
                variantId: vId,
                brand: variantInfo.brand,
                oilType: variantInfo.oilType,
                status: dynamicProd.status
            };
        } 
        // B. Fallback ke data dummy bawaan statis
        else if (dummyProducts[cleanSerialNumber] !== undefined) {
            product = dummyProducts[cleanSerialNumber];
        }

        // Skenario A: Tidak terdaftar (404)
        if (product === undefined || product === null) {
            return res.status(404).json({ 
                success: false, 
                error: { code: "PRODUCT_NOT_FOUND", message: "Nomor seri tidak dikenali pabrik." } 
            });
        }

        // Skenario B: Sudah dicabut Admin (REVOKED)
        if (product.status === "REVOKED") {
            return res.status(400).json({ 
                success: false, 
                error: { code: "PRODUCT_REVOKED", message: "Identitas produk ini telah diblokir oleh admin." } 
            });
        }

        // Skenario C: Barang Asli & Pertama Kali Scan (NEW)
        if (product.status === "NEW") {
            const currentTimestamp = new Date().toISOString();
            const mockTxHash = "0x" + require('crypto').randomBytes(32).toString('hex');

            const successPayload = {
                status: "VALID",
                productId: mockProductId,
                serialNumber: cleanSerialNumber,
                scanLocation: cleanLocation,
                validatedAt: currentTimestamp,
                txHash: mockTxHash,
                variant: { variantId: product.variantId, brand: product.brand, oilType: product.oilType }
            };

            // Simpan log audit ke array global (Simulasi SQLite)
            global.dummyScanLogs.push({
                productId: mockProductId,
                serialNumber: cleanSerialNumber,
                scanLocation: cleanLocation,
                txHash: mockTxHash,
                scannedAt: currentTimestamp
            });
            console.log("[ScanLog - DUMMY MEMORI] 💾 Sukses mencatat riwayat scan ke memori runtime.");

            // Kunci di Redis Cache
            const payloadForCache = {
                status: "USED",
                productId: mockProductId,
                serialNumber: cleanSerialNumber,
                firstValidatedAt: currentTimestamp,
                firstScanLocation: cleanLocation,
                variant: { variantId: product.variantId, brand: product.brand, oilType: product.oilType }
            };
            
            try {
                await redisClient.set(cacheKey, JSON.stringify({ data: payloadForCache }));
                console.log("[Redis - DUMMY] 💾 Status produk sukses dikunci di Redis Cache.");
            } catch (redisStoreErr) {
                console.error("[Redis] Gagal mengunci cache:", redisStoreErr.message);
            }

            // Update status di memori pendaftaran dinamis
            if (global.dummyRegisteredProducts && global.dummyRegisteredProducts[mockProductId]) {
                global.dummyRegisteredProducts[mockProductId].status = "USED";
            }

            return res.status(200).json({ success: true, data: successPayload });
        }

    } catch (error) {
        console.error("❌ Validation Error:", error);
        return res.status(500).json({ 
            success: false, 
            error: { code: "DUMMY_SERVER_ERROR", message: error.message } 
        });
    }
});

// ─── 2. GET /products/:serialNumber (AMBIL DETAIL PRODUK) ─────────────────────
// Mengatasi masalah "Cannot GET /products/:serialNumber" sebelumnya
router.get('/:serialNumber', async (req, res) => {
    try {
        const { serialNumber } = req.params;

        if (!serialNumber || String(serialNumber).trim() === "") {
            return res.status(400).json({
                success: false,
                error: { code: "VALIDATION_ERROR", message: "Nomor seri (serialNumber) wajib diisi." }
            });
        }

        const cleanSerialNumber = String(serialNumber).trim();
        const mockProductId = ethers.solidityPackedKeccak256(["string"], [cleanSerialNumber]);

        let product = null;

        // 1. Cek di memori dinamis global (/admin/batches)
        if (global.dummyRegisteredProducts && global.dummyRegisteredProducts[mockProductId]) {
            const dynamicProd = global.dummyRegisteredProducts[mockProductId];
            
            const vId = dynamicProd.variantId;
            const variantInfo = global.dummyVariants && global.dummyVariants[vId] 
                ? global.dummyVariants[vId] 
                : { brand: "Pertamina", oilType: "SAE 10W-40" };

            product = {
                productId: mockProductId,
                serialNumber: cleanSerialNumber,
                variantId: vId,
                brand: variantInfo.brand,
                oilType: variantInfo.oilType,
                status: dynamicProd.status,
                registeredAt: dynamicProd.registeredAt
            };
        } 
        // 2. Fallback baseline static dummy
        else if (cleanSerialNumber === "OIL-PERT-NEW") {
            product = {
                productId: mockProductId,
                serialNumber: "OIL-PERT-NEW",
                variantId: 1,
                brand: "Pertamina",
                oilType: "SAE 10W-40",
                status: "NEW",
                registeredAt: new Date().toISOString()
            };
        } else if (cleanSerialNumber === "OIL-SHELL-REVOKED") {
            product = {
                productId: mockProductId,
                serialNumber: "OIL-SHELL-REVOKED",
                variantId: 2,
                brand: "Shell",
                oilType: "Helix HX7 10W-40",
                status: "REVOKED",
                registeredAt: new Date().toISOString()
            };
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "PRODUCT_NOT_FOUND",
                    message: `Product dengan nomor seri ${cleanSerialNumber} tidak terdaftar di sistem.`
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                productId: product.productId,
                serialNumber: product.serialNumber,
                status: product.status,
                registeredAt: product.registeredAt,
                variant: {
                    variantId: product.variantId,
                    brand: product.brand,
                    oilType: product.oilType
                }
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "DUMMY_PRODUCT_DETAIL_ERROR", message: error.message }
        });
    }
});

module.exports = router;