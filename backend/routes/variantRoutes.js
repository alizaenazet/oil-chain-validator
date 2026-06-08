// routes/variantRoutes.js
const express = require('express');
const { ethers } = require('ethers');
const router = express.Router();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
// ABI untuk memanggil fungsi getter otomatis dari mapping public 'variants'
const contractABI = [
    "function variants(uint32) external view returns (string memory brand, string memory oilType)"
];
const oilValidatorContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);

// ─── GET /variants/:variantId (REAL BLOCKCHAIN READ) ─────────────────────────
router.get('/:variantId', async (req, res) => {
    try {
        const { variantId } = req.params;
        
        if (!variantId || isNaN(variantId) || Number(variantId) <= 0) {
            return res.status(400).json({
                success: false,
                error: { code: "VALIDATION_ERROR", message: "Variant ID harus berupa angka positif." }
            });
        }

        console.log(`[Blockchain RPC] Mengambil data master Variant ID: ${variantId}`);
        
        // Memanggil mapping public variants(uint32) langsung dari contract temanmu
        const variantData = await oilValidatorContract.variants(Number(variantId));

        // Jika brand kosong, berarti variantId tersebut belum terdaftar on-chain
        if (!variantData.brand || variantData.brand.trim() === "") {
            return res.status(404).json({
                success: false,
                error: { code: "VARIANT_NOT_FOUND", message: `Master Variant dengan ID ${variantId} tidak ditemukan.` }
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                variantId: Number(variantId),
                brand: variantData.brand,
                oilType: variantData.oilType
            }
        });

    } catch (error) {
        console.error("❌ Fetch Variant Blockchain Error:", error);
        return res.status(500).json({
            success: false,
            error: { code: "RPC_FETCH_FAILED", message: error.message }
        });
    }
});

module.exports = router;