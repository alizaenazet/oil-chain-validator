// routes/variantRoutes.js
const express = require('express');
const router = express.Router();
const { publicClient, CONTRACT_ADDRESS, contractABI } = require('../config/viemClient');
const db = require('../models'); // 🔥 1. IMPORT MODEL SEQUELIZE/SQLITE KAMU

// ─────────────────────────────────────────────────────────────────────────────
// 🔥 ENDPOINT BARU: GET /variants (Membaca SEMUA Variant dari SQLite Lokal)
// Digunakan oleh Dashboard dan Tabel List Variant di Frontend
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        // Ambil semua data variant yang tersimpan di SQLite lokal
        const localVariants = await db.Variant.findAll({
            order: [['id', 'ASC']]
        });

        // Format datanya agar serasi dengan kebutuhan frontend React
        const formattedVariants = localVariants.map(v => ({
            variantId: v.id,
            brand: v.brand,
            oilType: v.oilType
        }));

        console.log(`[SQLite Sync] Successfully fetched ${formattedVariants.length} variants for frontend.`);

        return res.status(200).json({
            success: true,
            source: "SQLite Local Database",
            data: formattedVariants // Array ini yang dibaca .length oleh React
        });
    } catch (error) {
        console.error("❌ Gagal mengambil data SQLite:", error);
        return res.status(500).json({ 
            success: false, 
            error: { code: "DB_ERROR", message: error.message } 
        });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// 🔒 ENDPOINT LAMA: GET /variants/:id (Membaca Per-ID dari Blockchain)
// Tetap dipertahankan untuk kebutuhan halaman detail/verify konsumen
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const variantId = req.params.id;
        
        const totalVariants = await publicClient.readContract({ 
            address: CONTRACT_ADDRESS, 
            abi: contractABI, 
            functionName: 'totalVariants' 
        });
        
        if (Number(variantId) <= 0 || Number(variantId) > Number(totalVariants)) {
            return res.status(404).json({ 
                success: false, 
                error: { code: "VARIANT_NOT_FOUND", message: "Variant ID does not exist on-chain." } 
            });
        }

        const variantData = await publicClient.readContract({
            address: CONTRACT_ADDRESS, 
            abi: contractABI, 
            functionName: 'variants', 
            args: [BigInt(variantId)]
        });

        return res.status(200).json({
            success: true,
            source: "Blockchain Node",
            data: { 
                variantId: Number(variantId), 
                brand: variantData[0], 
                oilType: variantData[1] 
            }
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: { code: "RPC_ERROR", message: error.message } 
        });
    }
});

module.exports = router;