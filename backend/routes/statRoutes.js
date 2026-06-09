// routes/statRoutes.js
const express = require('express');
const router = express.Router();
// 🔥 1. Import models Sequelize kamu untuk mengakses SQLite
const db = require('../models'); 

// GET /stats
router.get('/', async (req, res) => {
    try {
        // 🔥 2. Hitung jumlah baris data yang ada di tabel Variant database SQLite lokal
        const sqliteCount = await db.Variant.count();

        console.log(`[SQLite Stats] Dashboard requesting stats. Found: ${sqliteCount} variants.`);

        return res.status(200).json({
            success: true,
            // Properti ini tetap dijaga namanya agar frontend React kamu tidak pecah/crash
            data: { totalMasterVariantsOnChain: Number(sqliteCount) }
        });
    } catch (error) {
        console.error("❌ Gagal mengambil statistik dari SQLite:", error);
        return res.status(500).json({ 
            success: false, 
            error: { code: "DB_ERROR", message: error.message } 
        });
    }
});

module.exports = router;