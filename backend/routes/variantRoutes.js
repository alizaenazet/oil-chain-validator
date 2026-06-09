// routes/variantRoutes.js
const express = require('express');
const router = express.Router();
const { publicClient, CONTRACT_ADDRESS, contractABI } = require('../config/viemClient');

// GET /variants/:id
router.get('/:id', async (req, res) => {
    try {
        const variantId = req.params.id;
        
        const totalVariants = await publicClient.readContract({ address: CONTRACT_ADDRESS, abi: contractABI, functionName: 'totalVariants' });
        if (Number(variantId) <= 0 || Number(variantId) > Number(totalVariants)) {
            return res.status(404).json({ success: false, error: { code: "VARIANT_NOT_FOUND", message: "Variant ID does not exist on-chain." } });
        }

        const variantData = await publicClient.readContract({
            address: CONTRACT_ADDRESS, abi: contractABI, functionName: 'variants', args: [BigInt(variantId)]
        });

        return res.status(200).json({
            success: true,
            data: { variantId: Number(variantId), brand: variantData[0], oilType: variantData[1] }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: { code: "RPC_ERROR", message: error.message } });
    }
});

module.exports = router;