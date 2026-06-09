// routes/validationRoutes.js
const express = require('express');
const router = express.Router();
const { ScanLog } = require('../models');
const { keccak256, toHex } = require('viem');
const { publicClient, walletClient, CONTRACT_ADDRESS, contractABI } = require('../config/viemClient');

const STATUS_MAPPING = ["UNREGISTERED", "NEW", "VALIDATED", "REVOKED"];

// POST /validate/:serialNumber
router.post('/:serialNumber', async (req, res) => {
    try {
        const cleanSerial = String(req.params.serialNumber).trim();
        const { scanLocation } = req.body;

        if (!scanLocation) {
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "scanLocation is required." } });
        }

        const productIdHash = keccak256(toHex(cleanSerial));

        // 1. Ambil info status produk on-chain saat ini
        const productData = await publicClient.readContract({
            address: CONTRACT_ADDRESS, abi: contractABI, functionName: 'products', args: [productIdHash]
        });

        const statusEnum = Number(productData[3]);

        // JIKA UNREGISTERED ATAU REVOKED
        if (statusEnum === 0) {
            return res.status(404).json({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Product does not exist." } });
        }
        if (statusEnum === 3) {
            return res.status(409).json({ success: false, data: { status: "REVOKED", alert: "COUNTERFEIT WARNING! This product has been compromised." } });
        }

        // 2. Kirim transaksi perubahan status verifikasi pelumas ke blockchain via Viem
        console.log(`[Viem Validation] Memperbarui mutasi status validasi produk on-chain...`);
        const hash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS, abi: contractABI, functionName: 'validateProduct', args: [productIdHash, String(scanLocation)],
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // 3. Simpan riwayat jejak audit scan ke tabel ScanLogs SQLite lokal laptopmu
        console.log(`[SQLite DB] Mencatat bukti scan konsumen ke tabel ScanLogs...`);
        await ScanLog.create({
            productId: productIdHash,
            serialNumber: cleanSerial,
            scanLocation: String(scanLocation),
            txHash: hash
        });

        return res.status(200).json({
            success: true,
            message: "Produk berhasil divalidasi keasliannya.",
            data: { txHash: hash, previousStatus: STATUS_MAPPING[statusEnum], currentStatus: "VALIDATED" }
        });

    } catch (error) {
        console.error("❌ Validation Endpoint Error:", error);
        return res.status(500).json({ success: false, error: { code: "BLOCKCHAIN_TX_FAILED", message: error.message } });
    }
});

module.exports = router;