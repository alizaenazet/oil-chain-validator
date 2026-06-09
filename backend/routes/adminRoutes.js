// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const authenticateAdminJWT = require('../middlewares/auth');
const { Variant } = require('../models'); 
const { keccak256, toHex, isAddress } = require('viem');
const { publicClient, walletClient, CONTRACT_ADDRESS, contractABI } = require('../config/viemClient');

// 1. POST /admin/variants
router.post('/variants', authenticateAdminJWT, async (req, res) => {
    try {
        const { brand, oilType } = req.body;
        if (!brand || !oilType || String(brand).trim() === "" || String(oilType).trim() === "") {
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Fields required." } });
        }
        const cleanBrand = String(brand).trim();
        const cleanOilType = String(oilType).trim();

        const existingVariant = await Variant.findOne({ where: { brand: cleanBrand, oilType: cleanOilType } });
        if (existingVariant) {
            return res.status(400).json({ success: false, error: { code: "DUPLICATE_VARIANT", message: "Variant already exists in SQLite." } });
        }

        const hash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS, abi: contractABI, functionName: 'addVariant', args: [cleanBrand, cleanOilType],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        await Variant.create({ brand: cleanBrand, oilType: cleanOilType, txHash: hash });

        return res.status(201).json({ success: true, data: { txHash: hash, blockNumber: Number(receipt.blockNumber), variant: { brand: cleanBrand, oilType: cleanOilType } } });
    } catch (error) {
        return res.status(500).json({ success: false, error: { code: "BLOCKCHAIN_TX_FAILED", message: error.message } });
    }
});

// 2. POST /admin/batches
router.post('/batches', authenticateAdminJWT, async (req, res) => {
    try {
        const { variantId, serialNumbers } = req.body;
        if (!variantId || !serialNumbers || !Array.isArray(serialNumbers) || serialNumbers.length === 0) {
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Bad format data." } });
        }

        const totalVariantsOnChain = await publicClient.readContract({ address: CONTRACT_ADDRESS, abi: contractABI, functionName: 'totalVariants' });
        if (Number(variantId) <= 0 || Number(variantId) > Number(totalVariantsOnChain)) {
            return res.status(404).json({ success: false, error: { code: "VARIANT_NOT_FOUND", message: "VariantId doesn't exist." } });
        }

        const hashedProductIds = [];
        const conflictingIds = [];

        for (const serial of serialNumbers) {
            const cleanSerial = String(serial).trim();
            const productIdHash = keccak256(toHex(cleanSerial));
            const productData = await publicClient.readContract({ address: CONTRACT_ADDRESS, abi: contractABI, functionName: 'products', args: [productIdHash] });
            
            if (Number(productData[3]) !== 0) { conflictingIds.push(cleanSerial); } 
            else { hashedProductIds.push(productIdHash); }
        }

        if (conflictingIds.length > 0) {
            return res.status(409).json({ success: false, error: { code: "PRODUCT_ALREADY_EXISTS", conflictingIds } });
        }

        const hash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS, abi: contractABI, functionName: 'registerProductBatch', args: [hashedProductIds, BigInt(variantId)],
        });
        await publicClient.waitForTransactionReceipt({ hash });

        return res.status(202).json({ success: true, data: { variantId: Number(variantId), registered: hashedProductIds.length, txHash: hash, productIds: hashedProductIds } });
    } catch (error) {
        return res.status(500).json({ success: false, error: { code: "BLOCKCHAIN_TX_FAILED", message: error.message } });
    }
});

// 3. POST /admin/emergency-revoke
router.post('/emergency-revoke', authenticateAdminJWT, async (req, res) => {
    try {
        const { serialNumbers, reason } = req.body;
        if (!serialNumbers || !Array.isArray(serialNumbers) || serialNumbers.length === 0) {
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Array required." } });
        }

        const hashedCompromisedIds = serialNumbers.map(serial => keccak256(toHex(String(serial).trim())));

        for (const productId of hashedCompromisedIds) {
            const productData = await publicClient.readContract({ address: CONTRACT_ADDRESS, abi: contractABI, functionName: 'products', args: [productId] });
            if (Number(productData[3]) === 0) return res.status(404).json({ success: false, error: { code: "PRODUCT_NOT_FOUND" } });
            if (Number(productData[3]) === 3) return res.status(409).json({ success: false, error: { code: "ALREADY_REVOKED" } });
        }

        const hash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS, abi: contractABI, functionName: 'emergencyRevoke', args: [hashedCompromisedIds],
        });
        await publicClient.waitForTransactionReceipt({ hash });

        return res.status(200).json({ success: true, data: { revoked: hashedCompromisedIds.length, txHash: hash, revokedIds: hashedCompromisedIds } });
    } catch (error) {
        return res.status(500).json({ success: false, error: { code: "BLOCKCHAIN_TX_FAILED", message: error.message } });
    }
});

// 4. POST /admin/transfer-ownership
router.post('/transfer-ownership', authenticateAdminJWT, async (req, res) => {
    try {
        const { newAdminAddress } = req.body;

        if (!newAdminAddress || !isAddress(newAdminAddress)) {
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "A valid newAdminAddress is required." } });
        }

        // Baca admin saat ini on-chain agar tidak transfer ke address yang sama
        const currentAdmin = await publicClient.readContract({ address: CONTRACT_ADDRESS, abi: contractABI, functionName: 'admin' });
        if (String(currentAdmin).toLowerCase() === String(newAdminAddress).toLowerCase()) {
            return res.status(409).json({ success: false, error: { code: "ALREADY_ADMIN", message: "The provided address is already the admin." } });
        }

        const hash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS, abi: contractABI, functionName: 'transferOwnership', args: [newAdminAddress],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        return res.status(200).json({
            success: true,
            data: {
                previousAdmin: currentAdmin,
                newAdmin: newAdminAddress,
                txHash: hash,
                blockNumber: Number(receipt.blockNumber)
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: { code: "BLOCKCHAIN_TX_FAILED", message: error.message } });
    }
});

module.exports = router;