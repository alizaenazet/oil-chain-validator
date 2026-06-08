// routes/productRoutes.js
const express = require('express');
const { ethers } = require('ethers');
const router = express.Router();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const contractABI = [
    "function getProductDetails(bytes32 productId) external view returns (uint32 variantId, uint64 registeredAt, uint64 validatedAt, uint8 status, string memory scanLocation, string memory brand, string memory oilType)"
];
const oilValidatorContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);

const STATUS_MAP = ["UNREGISTERED", "NEW", "USED", "REVOKED"];

// ─── GET /products/:serialNumber (REAL BLOCKCHAIN READ) ──────────────────────
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
        
        // Hitung Keccak256 hash untuk mencocokkan bytes32 key di mapping contract
        const productIdHash = ethers.solidityPackedKeccak256(["string"], [cleanSerialNumber]);

        console.log(`[Blockchain RPC] Membaca detail on-chain untuk produk: ${cleanSerialNumber}`);
        const details = await oilValidatorContract.getProductDetails(productIdHash);
        
        const statusEnum = Number(details[3]);
        
        // Status 0 artinya UNREGISTERED (Produk Palsu / Tidak Terdaftar)
        if (statusEnum === 0) {
            return res.status(404).json({
                success: false,
                error: { code: "PRODUCT_NOT_FOUND", message: "Nomor seri produk tidak terdaftar di blockchain pabrik." }
            });
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
        console.error("❌ Fetch Product Details Error:", error);
        return res.status(500).json({
            success: false,
            error: { code: "RPC_FETCH_FAILED", message: error.message }
        });
    }
});

module.exports = router;