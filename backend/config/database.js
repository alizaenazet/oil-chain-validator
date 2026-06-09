// config/database.js
const db = require('../models'); // Menarik konfigurasi jangkar sequelize & models kita

console.log("[SQLite Config] Mencoba menghubungkan ke database lokal...");

// Sinkronisasikan seluruh struktur tabel (ScanLog & Variant) ke file oilchain.db secara otomatis
db.sequelize.sync({ alter: true })
    .then(() => {
        console.log("==================================================");
        console.log("[SQLite Config] 💾 Sukses terhubung & sinkronisasi tabel database!");
        console.log(`[SQLite Path] Database aktif di: ${db.sequelize.options.storage}`);
        console.log("==================================================");
    })
    .catch((err) => {
        console.error("❌ [SQLite Error] Gagal melakukan sinkronisasi tabel:", err.message);
    });

module.exports = db.sequelize;