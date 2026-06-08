// routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// USERNAME & PASSWORD DUMMY UNTUK LOGIN ADMIN
const DUMMY_ADMIN_USER = "admin";
const DUMMY_ADMIN_PASS = "admin123"; // Silakan ganti sesuai selera, Jul

// ─── POST /auth/login ────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Validasi Input Body
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: { code: "VALIDATION_ERROR", message: "Username dan password wajib diisi." }
            });
        }

        // 2. Cocokkan dengan Kredensial Dummy
        if (username !== DUMMY_ADMIN_USER || password !== DUMMY_ADMIN_PASS) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Username atau password salah" }
            });
        }

        // 3. Generate Real JWT Token jika kredensial cocok
        const payload = {
            username: DUMMY_ADMIN_USER,
            role: "admin"
        };

        // Token kedaluwarsa dalam 24 jam
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        return res.status(200).json({
            success: true,
            data: {
                token: token,
                type: "Bearer",
                expiresIn: "24h"
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "AUTH_ERROR", message: error.message }
        });
    }
});

module.exports = router;