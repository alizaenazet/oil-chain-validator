// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { keccak256, toHex } = require('viem');
const { publicClient, CONTRACT_ADDRESS, contractABI } = require('../config/viemClient');

const STATUS_MAPPING = ["UNREGISTERED", "NEW", "VALIDATED", "REVOKED"];

// GET /products/:serialNumber
router.get('/:serialNumber', async (req, res) => {
    try {
        const cleanSerial = String(req.params.serialNumber).trim();
        const productIdHash = keccak256(toHex(cleanSerial));

        const productData = await publicClient.readContract({
            address: CONTRACT_ADDRESS, abi: contractABI, functionName: 'products', args: [productIdHash]
        });

        const statusEnum = Number(productData[3]);

        if (statusEnum === 0) {
            return res.status(404).json({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Product is unregistered on-chain." } });
        }

        return res.status(200).json({
            success: true,
            data: {
                productId: productIdHash,
                serialNumber: cleanSerial,
                variantId: Number(productData[0]),
                registeredAt: Number(productData[1]),
                validatedAt: Number(productData[2]),
                status: STATUS_MAPPING[statusEnum],
                lastScanLocation: productData[4]
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: { code: "RPC_ERROR", message: error.message } });
    }
});

module.exports = router;