// routes/statRoutes.js
const express = require('express');
const router = express.Router();
const { publicClient, CONTRACT_ADDRESS, contractABI } = require('../config/viemClient');

// GET /stats
router.get('/', async (req, res) => {
    try {
        const totalVariants = await publicClient.readContract({
            address: CONTRACT_ADDRESS, abi: contractABI, functionName: 'totalVariants'
        });

        return res.status(200).json({
            success: true,
            data: { totalMasterVariantsOnChain: Number(totalVariants) }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: { code: "RPC_ERROR", message: error.message } });
    }
});

module.exports = router;