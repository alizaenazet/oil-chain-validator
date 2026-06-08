// middlewares/auth.js
const jwt = require('jsonwebtoken');

function authenticateAdminJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    
    // 1. TAMPILKAN LOG UNTUK KITA LIHAT DI TERMINAL
    console.log("\n====== [DEBUG MIDDLEWARE AUTH] ======");
    console.log("Header Authorization yang masuk:", authHeader);

    // 2. Cek apakah header dikirim dan berformat 'Bearer <token>'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("❌ REJECTED: Format token salah atau Header Authorization Kosong!");
        return res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Missing or invalid JWT token" }
        });
    }

    // 3. Ekstraksi string token JWT
    const token = authHeader.split(' ')[1];
    console.log("Token yang berhasil dipotong:", token ? token.substring(0, 15) + "..." : "KOSONG");
    console.log("Menggunakan JWT_SECRET dari .env:", process.env.JWT_SECRET ? "TERDETEKSI/ADA" : "KOSONG/TIDAK KEBACA");

    try {
        // 4. Proses verifikasi dengan SECRET KEY dari .env kamu
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ VERIFIKASI JWT SUKSES! Payload Admin:", decoded);
        
        req.admin = decoded; // Menyimpan payload ke dalam request objek
        next(); // Lolos, silahkan lanjut ke adminRoutes.js
    } catch (error) {
        console.log("❌ VERIFIKASI JWT GAGAL! Alasan:", error.message);
        return res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Token is invalid or has expired." }
        });
    }
}

module.exports = authenticateAdminJWT;