// routes/validationRoutes.js
const express = require('express');
const { ethers } = require('ethers');
const router = express.Router();
const redisClient = require('../config/redis');
const { ScanLog } = require('../models'); // Import Model SQLite Sequelize

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const relayerWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

const contractABI = [
    "function getProductDetails(bytes32 productId) external view returns (uint32 variantId, uint64 registeredAt, uint64 validatedAt, uint8 status, string memory scanLocation, string memory brand, string memory oilType)",
    "function validateProduct(bytes32 productId, string calldata scanLocation) external"
];

const oilValidatorContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, relayerWallet);

// Map Enum dari ProductStatus di file .sol kamu
const STATUS_MAP = ["UNREGISTERED", "NEW", "USED", "REVOKED"];
const REDIS_VALIDATE_PREFIX = "cache:validate:";

// ─── 1. POST /validate/:serialNumber (KONSUMEN SCAN QR - FULL HYBRID) ───────────
router.post('/:serialNumber', async (req, res) => {
    try {
        const { serialNumber } = req.params;
        const { scanLocation } = req.body;

        if (!scanLocation || String(scanLocation).trim() === "") {
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Scan location wajib diisi." } });
        }

        const cleanSerialNumber = String(serialNumber).trim();
        const cleanLocation = String(scanLocation).trim();

        // Hitung Keccak256 hash off-chain untuk query pencarian di blockchain
        const productIdHash = ethers.solidityPackedKeccak256(["string"], [cleanSerialNumber]);
        const cacheKey = `${REDIS_VALIDATE_PREFIX}${productIdHash}`;

        // A. JALUR INTERSEPTOR REDIS CACHE (Anti-Counterfeiting Fast Lane)
        let cachedValidation = await redisClient.get(cacheKey);
        if (cachedValidation) {
            console.log(`[Redis API] 🟢 Cache HIT! Produk terindikasi PALSU / DUPLIKASI STIKER.`);
            return res.status(400).json({
                success: false,
                error: {
                    code: "ALREADY_VALIDATED",
                    message: "This product has already been validated. It may be counterfeit.",
                    data: JSON.parse(cachedValidation).data
                }
            });
        }

        console.log(`[Redis API] 🔴 Cache MISS! Membaca data real-time dari Blockchain Hardhat...`);

        // B. QUERY REAL-TIME KE BLOCKCHAIN SMART CONTRACT
        const details = await oilValidatorContract.getProductDetails(productIdHash);
        const statusEnum = Number(details[3]);
        const currentStatus = STATUS_MAP[statusEnum];

        if (currentStatus === "UNREGISTERED") {
            return res.status(404).json({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Nomor seri produk tidak terdaftar di sistem pabrik." } });
        }

        if (currentStatus === "REVOKED") {
            return res.status(400).json({ success: false, error: { code: "PRODUCT_REVOKED", message: "Identitas produk ini telah diblokir secara resmi oleh admin." } });
        }

        // Jika status on-chain kedapatan "USED" tetapi lolos dari Redis cache (misal Redis habis dibersihkan/restart)
        if (currentStatus === "USED") {
            const fallbackPayload = {
                status: "USED",
                productId: productIdHash,
                serialNumber: cleanSerialNumber,
                firstValidatedAt: new Date(Number(details[2]) * 1000).toISOString(),
                firstScanLocation: details[4],
                variant: { brand: details[5], oilType: details[6] }
            };
            // Kunci ulang ke Redis cache agar mengamankan kembali request berikutnya
            await redisClient.set(cacheKey, JSON.stringify({ data: fallbackPayload }));

            return res.status(400).json({
                success: false,
                error: { code: "ALREADY_VALIDATED", message: "This product has already been validated on-chain.", data: fallbackPayload }
            });
        }

        // C. PROSES EKSEKUSI VALIDASI OLI ASLI (Status == "NEW")
        if (currentStatus === "NEW") {
            console.log(`[Gas Relayer] Memproses tanda validasi perdana untuk: ${cleanSerialNumber}`);
            
            const tx = await oilValidatorContract.validateProduct(productIdHash, cleanLocation);
            await tx.wait();

            const currentTimestamp = new Date().toISOString();
            const successPayload = {
                status: "VALID",
                productId: productIdHash,
                serialNumber: cleanSerialNumber,
                scanLocation: cleanLocation,
                validatedAt: currentTimestamp,
                txHash: tx.hash,
                variant: { brand: details[5], oilType: details[6] }
            };

            // SINKRONISASI 1: Tulis Riwayat ke database Audit Log lokal SQLite Admin
            try {
                await ScanLog.create({
                    productId: productIdHash,
                    serialNumber: cleanSerialNumber,
                    scanLocation: cleanLocation,
                    txHash: tx.hash,
                    scannedAt: currentTimestamp
                });
                console.log("[SQLite DB] 💾 Berhasil mengamankan data riwayat scan ke database lokal admin.");
            } catch (sqliteErr) {
                console.error("[SQLite DB Error] Gagal mencatat scan log:", sqliteErr.message);
            }

            // SINKRONISASI 2: Kunci status di Redis Cache (Set permanen tanpa TTL karena status USED di blockchain abadi)
            const payloadForCache = {
                status: "USED",
                productId: productIdHash,
                serialNumber: cleanSerialNumber,
                firstValidatedAt: currentTimestamp,
                firstScanLocation: cleanLocation,
                variant: { brand: details[5], oilType: details[6] }
            };
            await redisClient.set(cacheKey, JSON.stringify({ data: payloadForCache }));
            console.log("[Redis Cache] 💾 Status produk sukses dikunci di dalam memori Redis.");

            return res.status(200).json({ success: true, data: successPayload });
        }

    } catch (error) {
        console.error("❌ Validation Endpoint Critical Error:", error);
        return res.status(500).json({ success: false, error: { code: "VALIDATION_FAILED", message: error.message } });
    }
});

// ─── 2. GET /products/:serialNumber (PUBLIC CHECK DETAILS DATA OLI) ───────────
router.get('/:serialNumber', async (req, res) => {
    try {
        const { serialNumber } = req.params;
        if (!serialNumber || String(serialNumber).trim() === "") {
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Nomor seri wajib diisi." } });
        }

        const cleanSerialNumber = String(serialNumber).trim();
        const productIdHash = ethers.solidityPackedKeccak256(["string"], [cleanSerialNumber]);

        console.log(`[Public API] Mengambil detail on-chain untuk produk: ${cleanSerialNumber}`);
        const details = await oilValidatorContract.getProductDetails(productIdHash);
        
        const statusEnum = Number(details[3]);
        if (statusEnum === 0) { // UNREGISTERED
            return res.status(404).json({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Nomor seri tidak dikenali oleh sistem." } });
        }

        return res.status(200).json({
            success: true,
            data: {
                productId: productIdHash,
                serialNumber: cleanSerialNumber,
                registeredAt: Number(details[1]) === 0 ? null : new Date(Number(details[1]) * 1000).toISOString(),
                validatedAt: Number(details[2]) === 0 ? null : new Date(Number(details[2]) * 1000).toISOString(),
                status: STATUS_MAP[statusEnum],
                scanLocation: details[4] || null,
                variant: {
                    variantId: Number(details[0]),
                    brand: details[5],
                    oilType: details[6]
                }
            }
        });
    } catch (error) {
        console.error("❌ Get Product Details Critical Error:", error);
        return res.status(500).json({ success: false, error: { code: "FETCH_FAILED", message: error.message } });
    }
});

module.exports = router;