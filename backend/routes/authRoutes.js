// routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// ─── POST /auth/login (REAL AUTH MENGGUNAKAN ENV) ────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: { code: "VALIDATION_ERROR", message: "Username dan password wajib diisi." }
            });
        }

        // Memeriksa kredensial dari file .env secara aman
        if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Username atau password salah!" }
            });
        }

        // Buat Token JWT Asli
        const token = jwt.sign(
            { username: username, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            success: true,
            data: { token: token, type: "Bearer", expiresIn: "24h" }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "AUTH_ERROR", message: error.message }
        });
    }
});

module.exports = router;